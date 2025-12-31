package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"realm-of-conquest/internal/database"
	"realm-of-conquest/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrGMNotFound        = errors.New("gm account not found")
	ErrGMInactive        = errors.New("gm account is inactive")
	ErrInsufficientRole  = errors.New("insufficient gm role")
)

type GMService struct {
	db        *database.DB
	jwtSecret string
	jwtExpiry time.Duration
}

func NewGMService(db *database.DB, jwtSecret string, jwtExpiry time.Duration) *GMService {
	return &GMService{
		db:        db,
		jwtSecret: jwtSecret,
		jwtExpiry: jwtExpiry,
	}
}

// Authentication - GM uses regular account credentials, then we check gm_accounts
func (s *GMService) Login(ctx context.Context, req *models.GMLoginRequest) (*models.GMAuthResponse, error) {
	// First authenticate with regular account credentials
	var accountID uuid.UUID
	var passwordHash string
	err := s.db.Pool.QueryRow(ctx, `
		SELECT id, password_hash FROM accounts WHERE email = $1
	`, req.Email).Scan(&accountID, &passwordHash)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	// Now check if this account has a GM account
	var gm models.GMAccount
	var permissionsJSON []byte
	err = s.db.Pool.QueryRow(ctx, `
		SELECT id, account_id, gm_role, gm_name, permissions, is_active, is_visible, is_on_duty, created_at, last_action_at
		FROM gm_accounts WHERE account_id = $1
	`, accountID).Scan(
		&gm.ID, &gm.AccountID, &gm.GMRole, &gm.GMName, &permissionsJSON,
		&gm.IsActive, &gm.IsVisible, &gm.IsOnDuty, &gm.CreatedAt, &gm.LastActionAt,
	)
	if err != nil {
		return nil, ErrGMNotFound
	}
	if permissionsJSON != nil {
		var perms models.GMPermissions
		if jsonErr := json.Unmarshal(permissionsJSON, &perms); jsonErr == nil {
			gm.Permissions = &perms
		}
	}

	if !gm.IsActive {
		return nil, ErrGMInactive
	}

	// Update last action
	now := time.Now()
	_, _ = s.db.Pool.Exec(ctx, "UPDATE gm_accounts SET last_action_at = $1, is_on_duty = true WHERE id = $2", now, gm.ID)
	gm.LastActionAt = &now
	gm.IsOnDuty = true

	// Generate token with GM info
	token, err := s.generateGMToken(gm.ID, gm.GMRole)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &models.GMAuthResponse{
		Token:     token,
		GMAccount: &gm,
	}, nil
}

func (s *GMService) generateGMToken(gmID uuid.UUID, role models.GMRole) (string, error) {
	claims := jwt.MapClaims{
		"sub":      gmID.String(),
		"gm":       true,
		"gm_role":  string(role),
		"gm_level": role.Level(),
		"exp":      time.Now().Add(s.jwtExpiry).Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *GMService) ValidateGMToken(tokenString string) (uuid.UUID, models.GMRole, int, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})
	if err != nil {
		return uuid.Nil, "", 0, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		isGM, _ := claims["gm"].(bool)
		if !isGM {
			return uuid.Nil, "", 0, errors.New("not a gm token")
		}

		sub, ok := claims["sub"].(string)
		if !ok {
			return uuid.Nil, "", 0, errors.New("invalid token claims")
		}

		role, _ := claims["gm_role"].(string)
		level, _ := claims["gm_level"].(float64)
		id, err := uuid.Parse(sub)
		if err != nil {
			return uuid.Nil, "", 0, err
		}

		return id, models.GMRole(role), int(level), nil
	}

	return uuid.Nil, "", 0, errors.New("invalid token")
}

func (s *GMService) GetGMByID(ctx context.Context, id uuid.UUID) (*models.GMAccount, error) {
	var gm models.GMAccount
	var permissionsJSON []byte
	err := s.db.Pool.QueryRow(ctx, `
		SELECT id, account_id, gm_role, gm_name, permissions, is_active, is_visible, is_on_duty, created_at, last_action_at
		FROM gm_accounts WHERE id = $1
	`, id).Scan(
		&gm.ID, &gm.AccountID, &gm.GMRole, &gm.GMName, &permissionsJSON,
		&gm.IsActive, &gm.IsVisible, &gm.IsOnDuty, &gm.CreatedAt, &gm.LastActionAt,
	)
	if err != nil {
		return nil, ErrGMNotFound
	}
	if permissionsJSON != nil {
		var perms models.GMPermissions
		if jsonErr := json.Unmarshal(permissionsJSON, &perms); jsonErr == nil {
			gm.Permissions = &perms
		}
	}
	return &gm, nil
}

func (s *GMService) SetOnDuty(ctx context.Context, gmID uuid.UUID, onDuty bool) error {
	_, err := s.db.Pool.Exec(ctx, "UPDATE gm_accounts SET is_on_duty = $1, last_action_at = $2 WHERE id = $3", onDuty, time.Now(), gmID)
	return err
}

// Ban Management - account level bans
func (s *GMService) BanAccount(ctx context.Context, gmID uuid.UUID, req *models.BanRequest) (*models.Ban, error) {
	var expiresAt *time.Time
	if req.Duration != nil && *req.Duration > 0 {
		t := time.Now().Add(time.Duration(*req.Duration) * time.Hour)
		expiresAt = &t
	}

	ban := &models.Ban{
		ID:        uuid.New(),
		AccountID: req.AccountID,
		BannedBy:  gmID,
		BanType:   req.BanType,
		Reason:    req.Reason,
		StartsAt:  time.Now(),
		ExpiresAt: expiresAt,
		IsActive:  true,
		CreatedAt: time.Now(),
	}

	_, err := s.db.Pool.Exec(ctx, `
		INSERT INTO bans (id, account_id, ban_type, reason, banned_by, starts_at, expires_at, is_active, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, ban.ID, ban.AccountID, ban.BanType, ban.Reason, ban.BannedBy, ban.StartsAt, ban.ExpiresAt, ban.IsActive, ban.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create ban: %w", err)
	}

	// Update account is_banned flag
	_, _ = s.db.Pool.Exec(ctx, "UPDATE accounts SET is_banned = true, ban_reason = $1 WHERE id = $2", req.Reason, req.AccountID)

	// Log GM action
	s.logGMAction(ctx, gmID, "ban", &req.AccountID, nil, fmt.Sprintf("Ban type: %s, Reason: %s", req.BanType, req.Reason))

	return ban, nil
}

func (s *GMService) UnbanAccount(ctx context.Context, gmID uuid.UUID, banID uuid.UUID, reason string) error {
	now := time.Now()

	// Get the ban first
	var accountID uuid.UUID
	err := s.db.Pool.QueryRow(ctx, "SELECT account_id FROM bans WHERE id = $1", banID).Scan(&accountID)
	if err != nil {
		return errors.New("ban not found")
	}

	result, err := s.db.Pool.Exec(ctx, `
		UPDATE bans SET is_active = false, unbanned_by = $1, unbanned_at = $2, unban_reason = $3
		WHERE id = $4 AND is_active = true
	`, gmID, now, reason, banID)
	if err != nil {
		return fmt.Errorf("failed to unban: %w", err)
	}
	if result.RowsAffected() == 0 {
		return errors.New("ban not found or already inactive")
	}

	// Check if there are other active bans
	var count int
	s.db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM bans WHERE account_id = $1 AND is_active = true", accountID).Scan(&count)
	if count == 0 {
		s.db.Pool.Exec(ctx, "UPDATE accounts SET is_banned = false, ban_reason = NULL WHERE id = $1", accountID)
	}

	// Log GM action
	s.logGMAction(ctx, gmID, "unban", &accountID, nil, fmt.Sprintf("Unban reason: %s", reason))

	return nil
}

func (s *GMService) GetActiveBans(ctx context.Context, limit, offset int) ([]*models.Ban, error) {
	rows, err := s.db.Pool.Query(ctx, `
		SELECT id, account_id, ban_type, reason, banned_by, starts_at, expires_at, is_active, created_at
		FROM bans WHERE is_active = true
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bans []*models.Ban
	for rows.Next() {
		var b models.Ban
		if err := rows.Scan(&b.ID, &b.AccountID, &b.BanType, &b.Reason, &b.BannedBy, &b.StartsAt, &b.ExpiresAt, &b.IsActive, &b.CreatedAt); err != nil {
			continue
		}
		bans = append(bans, &b)
	}
	return bans, nil
}

// Mute Management - character level mutes
func (s *GMService) MuteCharacter(ctx context.Context, gmID uuid.UUID, req *models.MuteRequest) (*models.Mute, error) {
	expiresAt := time.Now().Add(time.Duration(req.Duration) * time.Minute)

	mute := &models.Mute{
		ID:          uuid.New(),
		CharacterID: req.CharacterID,
		MuteType:    req.MuteType,
		Reason:      req.Reason,
		MutedBy:     gmID,
		StartsAt:    time.Now(),
		ExpiresAt:   expiresAt,
		IsActive:    true,
		CreatedAt:   time.Now(),
	}

	_, err := s.db.Pool.Exec(ctx, `
		INSERT INTO mutes (id, character_id, mute_type, reason, muted_by, starts_at, expires_at, is_active, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, mute.ID, mute.CharacterID, mute.MuteType, mute.Reason, mute.MutedBy, mute.StartsAt, mute.ExpiresAt, mute.IsActive, mute.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create mute: %w", err)
	}

	// Log GM action
	s.logGMAction(ctx, gmID, "mute", nil, &req.CharacterID, fmt.Sprintf("Mute type: %s, Duration: %d min, Reason: %s", req.MuteType, req.Duration, req.Reason))

	return mute, nil
}

func (s *GMService) UnmuteCharacter(ctx context.Context, gmID uuid.UUID, muteID uuid.UUID) error {
	var characterID uuid.UUID
	err := s.db.Pool.QueryRow(ctx, "SELECT character_id FROM mutes WHERE id = $1", muteID).Scan(&characterID)
	if err != nil {
		return errors.New("mute not found")
	}

	result, err := s.db.Pool.Exec(ctx, `
		UPDATE mutes SET is_active = false
		WHERE id = $1 AND is_active = true
	`, muteID)
	if err != nil {
		return fmt.Errorf("failed to unmute: %w", err)
	}
	if result.RowsAffected() == 0 {
		return errors.New("mute not found or already inactive")
	}

	// Log GM action
	s.logGMAction(ctx, gmID, "unmute", nil, &characterID, "Unmuted")

	return nil
}

func (s *GMService) GetActiveMutes(ctx context.Context, limit, offset int) ([]*models.Mute, error) {
	rows, err := s.db.Pool.Query(ctx, `
		SELECT id, character_id, mute_type, reason, muted_by, starts_at, expires_at, is_active, created_at
		FROM mutes WHERE is_active = true AND expires_at > NOW()
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mutes []*models.Mute
	for rows.Next() {
		var m models.Mute
		if err := rows.Scan(&m.ID, &m.CharacterID, &m.MuteType, &m.Reason, &m.MutedBy, &m.StartsAt, &m.ExpiresAt, &m.IsActive, &m.CreatedAt); err != nil {
			continue
		}
		mutes = append(mutes, &m)
	}
	return mutes, nil
}

func (s *GMService) IsCharacterMuted(ctx context.Context, characterID uuid.UUID, muteType string) bool {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM mutes WHERE character_id = $1 AND is_active = true AND expires_at > NOW()`
	args := []interface{}{characterID}

	if muteType != "" {
		query += ` AND mute_type = $2)`
		args = append(args, muteType)
	} else {
		query += `)`
	}

	s.db.Pool.QueryRow(ctx, query, args...).Scan(&exists)
	return exists
}

// Announcement Management
func (s *GMService) CreateAnnouncement(ctx context.Context, gmID uuid.UUID, req *models.AnnouncementRequest) (*models.Announcement, error) {
	announcement := &models.Announcement{
		ID:               uuid.New(),
		ServerID:         req.ServerID,
		AnnouncementType: req.AnnouncementType,
		Title:            req.Title,
		Message:          req.Message,
		ShowInChat:       req.ShowInChat,
		ShowAsPopup:      req.ShowAsPopup,
		ShowInTicker:     true,
		Color:            req.Color,
		CreatedBy:        &gmID,
		StartsAt:         time.Now(),
		ExpiresAt:        req.ExpiresAt,
		IsActive:         true,
		CreatedAt:        time.Now(),
	}

	_, err := s.db.Pool.Exec(ctx, `
		INSERT INTO announcements (id, server_id, announcement_type, title, message, show_in_chat, show_as_popup, show_in_ticker, color, created_by, starts_at, expires_at, is_active, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`, announcement.ID, announcement.ServerID, announcement.AnnouncementType, announcement.Title, announcement.Message,
		announcement.ShowInChat, announcement.ShowAsPopup, announcement.ShowInTicker, announcement.Color,
		announcement.CreatedBy, announcement.StartsAt, announcement.ExpiresAt, announcement.IsActive, announcement.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create announcement: %w", err)
	}

	// Log GM action
	s.logGMAction(ctx, gmID, "announce", nil, nil, fmt.Sprintf("Type: %s, Title: %s", req.AnnouncementType, *req.Title))

	return announcement, nil
}

func (s *GMService) GetActiveAnnouncements(ctx context.Context) ([]*models.Announcement, error) {
	rows, err := s.db.Pool.Query(ctx, `
		SELECT id, server_id, announcement_type, title, message, show_in_chat, show_as_popup, show_in_ticker, color, icon, created_by, starts_at, expires_at, is_active, created_at
		FROM announcements
		WHERE is_active = true
		AND starts_at <= NOW()
		AND (expires_at IS NULL OR expires_at >= NOW())
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var announcements []*models.Announcement
	for rows.Next() {
		var a models.Announcement
		if err := rows.Scan(&a.ID, &a.ServerID, &a.AnnouncementType, &a.Title, &a.Message, &a.ShowInChat, &a.ShowAsPopup, &a.ShowInTicker, &a.Color, &a.Icon, &a.CreatedBy, &a.StartsAt, &a.ExpiresAt, &a.IsActive, &a.CreatedAt); err != nil {
			continue
		}
		announcements = append(announcements, &a)
	}
	return announcements, nil
}

func (s *GMService) DeactivateAnnouncement(ctx context.Context, id uuid.UUID) error {
	_, err := s.db.Pool.Exec(ctx, "UPDATE announcements SET is_active = false WHERE id = $1", id)
	return err
}

// GM Action Logging
func (s *GMService) logGMAction(ctx context.Context, gmID uuid.UUID, actionType string, targetAccountID, targetCharacterID *uuid.UUID, details string) {
	// Convert details string to JSONB format
	detailsJSON, _ := json.Marshal(map[string]string{"message": details})
	_, _ = s.db.Pool.Exec(ctx, `
		INSERT INTO gm_action_logs (id, gm_id, action_type, target_account_id, target_character_id, details, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, uuid.New(), gmID, actionType, targetAccountID, targetCharacterID, detailsJSON, time.Now())
}

// Statistics
func (s *GMService) GetDashboardStats(ctx context.Context) (*models.DashboardStats, error) {
	stats := &models.DashboardStats{}

	// Total accounts
	s.db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM accounts").Scan(&stats.TotalAccounts)

	// Online characters
	s.db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM characters WHERE is_online = true").Scan(&stats.OnlineCharacters)

	// Active bans
	s.db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM bans WHERE is_active = true").Scan(&stats.ActiveBans)

	// Open tickets
	s.db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM tickets WHERE status IN ('open', 'in_progress')").Scan(&stats.OpenTickets)

	// Total characters
	s.db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM characters WHERE deleted_at IS NULL").Scan(&stats.TotalCharacters)

	// Active mutes
	s.db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM mutes WHERE is_active = true AND expires_at > NOW()").Scan(&stats.ActiveMutes)

	return stats, nil
}

// Player/Character Search
func (s *GMService) SearchPlayers(ctx context.Context, query string, limit int) ([]map[string]interface{}, error) {
	rows, err := s.db.Pool.Query(ctx, `
		SELECT a.id, a.email, a.username, a.is_banned, c.id as char_id, c.name as char_name, c.class, c.level
		FROM accounts a
		LEFT JOIN characters c ON c.account_id = a.id AND c.deleted_at IS NULL
		WHERE a.username ILIKE $1 OR a.email ILIKE $1 OR c.name ILIKE $1
		LIMIT $2
	`, "%"+query+"%", limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var accountID, charID uuid.UUID
		var email, username, charName, class string
		var isBanned bool
		var level int

		if err := rows.Scan(&accountID, &email, &username, &isBanned, &charID, &charName, &class, &level); err != nil {
			continue
		}

		results = append(results, map[string]interface{}{
			"account_id":     accountID,
			"email":          email,
			"username":       username,
			"is_banned":      isBanned,
			"character_id":   charID,
			"character_name": charName,
			"class":          class,
			"level":          level,
		})
	}
	return results, nil
}

// ============== IN-GAME GM FEATURES ==============

// OnlineGM represents a GM that's currently on duty (visible to players)
type OnlineGM struct {
	GMName   string         `json:"gm_name"`
	Role     models.GMRole  `json:"role"`
	IsOnDuty bool           `json:"is_on_duty"`
}

// GetOnlineGMs returns list of GMs currently on duty and visible
func (s *GMService) GetOnlineGMs(ctx context.Context) ([]*OnlineGM, error) {
	rows, err := s.db.Pool.Query(ctx, `
		SELECT gm_name, gm_role, is_on_duty
		FROM gm_accounts
		WHERE is_active = true AND is_visible = true AND is_on_duty = true
		ORDER BY gm_role DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var gms []*OnlineGM
	for rows.Next() {
		var gm OnlineGM
		if err := rows.Scan(&gm.GMName, &gm.Role, &gm.IsOnDuty); err != nil {
			continue
		}
		gms = append(gms, &gm)
	}
	return gms, nil
}

// CharacterGMInfo contains GM info for a character (if they're a GM)
type CharacterGMInfo struct {
	IsGM        bool           `json:"is_gm"`
	GMName      string         `json:"gm_name,omitempty"`
	Role        models.GMRole  `json:"role,omitempty"`
	IsOnDuty    bool           `json:"is_on_duty,omitempty"`
	IsVisible   bool           `json:"is_visible,omitempty"`
}

// GetGMInfoByAccountID checks if an account has GM privileges
func (s *GMService) GetGMInfoByAccountID(ctx context.Context, accountID uuid.UUID) (*CharacterGMInfo, error) {
	var info CharacterGMInfo
	err := s.db.Pool.QueryRow(ctx, `
		SELECT gm_name, gm_role, is_on_duty, is_visible
		FROM gm_accounts
		WHERE account_id = $1 AND is_active = true
	`, accountID).Scan(&info.GMName, &info.Role, &info.IsOnDuty, &info.IsVisible)

	if err != nil {
		// Not a GM, return empty info
		return &CharacterGMInfo{IsGM: false}, nil
	}

	info.IsGM = true
	return &info, nil
}

// GetGMInfoByCharacterID checks if a character belongs to a GM account
func (s *GMService) GetGMInfoByCharacterID(ctx context.Context, characterID uuid.UUID) (*CharacterGMInfo, error) {
	var accountID uuid.UUID
	err := s.db.Pool.QueryRow(ctx, `
		SELECT account_id FROM characters WHERE id = $1
	`, characterID).Scan(&accountID)
	if err != nil {
		return &CharacterGMInfo{IsGM: false}, nil
	}

	return s.GetGMInfoByAccountID(ctx, accountID)
}

// PlayerDetailedProfile contains detailed player info for GM viewing
type PlayerDetailedProfile struct {
	// Account info
	AccountID     uuid.UUID  `json:"account_id"`
	Email         string     `json:"email"`
	Username      string     `json:"username"`
	IsBanned      bool       `json:"is_banned"`
	BanReason     *string    `json:"ban_reason,omitempty"`
	CreatedAt     time.Time  `json:"account_created_at"`
	LastLoginAt   *time.Time `json:"last_login_at,omitempty"`
	LastLoginIP   *string    `json:"last_login_ip,omitempty"`

	// Character info
	CharacterID   uuid.UUID  `json:"character_id"`
	CharacterName string     `json:"character_name"`
	Class         string     `json:"class"`
	Level         int        `json:"level"`
	Gold          int        `json:"gold"`
	IsOnline      bool       `json:"is_online"`

	// Moderation history
	ActiveMutes   int        `json:"active_mutes"`
	TotalBans     int        `json:"total_bans"`
	TotalMutes    int        `json:"total_mutes"`

	// GM info (if applicable)
	GMInfo        *CharacterGMInfo `json:"gm_info,omitempty"`
}

// GetPlayerDetailedProfile gets detailed player info for GM viewing
func (s *GMService) GetPlayerDetailedProfile(ctx context.Context, characterID uuid.UUID) (*PlayerDetailedProfile, error) {
	var profile PlayerDetailedProfile

	// Get character and account info
	err := s.db.Pool.QueryRow(ctx, `
		SELECT
			a.id, a.email, a.username, a.is_banned, a.ban_reason, a.created_at, a.last_login_at, a.last_login_ip,
			c.id, c.name, c.class, c.level, c.gold, c.is_online
		FROM characters c
		JOIN accounts a ON a.id = c.account_id
		WHERE c.id = $1 AND c.deleted_at IS NULL
	`, characterID).Scan(
		&profile.AccountID, &profile.Email, &profile.Username, &profile.IsBanned, &profile.BanReason,
		&profile.CreatedAt, &profile.LastLoginAt, &profile.LastLoginIP,
		&profile.CharacterID, &profile.CharacterName, &profile.Class, &profile.Level, &profile.Gold, &profile.IsOnline,
	)
	if err != nil {
		return nil, fmt.Errorf("character not found: %w", err)
	}

	// Get moderation stats
	s.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM mutes WHERE character_id = $1 AND is_active = true AND expires_at > NOW()
	`, characterID).Scan(&profile.ActiveMutes)

	s.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM bans WHERE account_id = $1
	`, profile.AccountID).Scan(&profile.TotalBans)

	s.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM mutes WHERE character_id = $1
	`, characterID).Scan(&profile.TotalMutes)

	// Check if target is also a GM
	gmInfo, _ := s.GetGMInfoByAccountID(ctx, profile.AccountID)
	if gmInfo != nil && gmInfo.IsGM {
		profile.GMInfo = gmInfo
	}

	return &profile, nil
}

// KickCharacter forcefully disconnects a character (sets is_online = false)
func (s *GMService) KickCharacter(ctx context.Context, gmID uuid.UUID, characterID uuid.UUID, reason string) error {
	// Get character info for logging
	var charName string
	var accountID uuid.UUID
	err := s.db.Pool.QueryRow(ctx, `
		SELECT name, account_id FROM characters WHERE id = $1
	`, characterID).Scan(&charName, &accountID)
	if err != nil {
		return errors.New("character not found")
	}

	// Set character offline
	_, err = s.db.Pool.Exec(ctx, `
		UPDATE characters SET is_online = false WHERE id = $1
	`, characterID)
	if err != nil {
		return fmt.Errorf("failed to kick character: %w", err)
	}

	// Log the action
	s.logGMAction(ctx, gmID, "kick", &accountID, &characterID, fmt.Sprintf("Kicked %s: %s", charName, reason))

	return nil
}

// SendGMMessage sends a system message to a character (stored in gm_notifications)
func (s *GMService) SendGMMessage(ctx context.Context, gmID uuid.UUID, characterID uuid.UUID, message string, notificationType string) error {
	if notificationType == "" {
		notificationType = "message"
	}

	_, err := s.db.Pool.Exec(ctx, `
		INSERT INTO gm_notifications (id, gm_id, character_id, message, notification_type, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
	`, uuid.New(), gmID, characterID, message, notificationType)

	if err != nil {
		return fmt.Errorf("failed to send GM message: %w", err)
	}

	// Log the action
	s.logGMAction(ctx, gmID, "gm_message", nil, &characterID, fmt.Sprintf("Sent GM message: %s", message))

	return nil
}

// GetUnreadGMNotifications gets unread GM notifications for a character
func (s *GMService) GetUnreadGMNotifications(ctx context.Context, characterID uuid.UUID) ([]map[string]interface{}, error) {
	rows, err := s.db.Pool.Query(ctx, `
		SELECT n.id, n.message, n.notification_type, n.created_at, g.gm_name
		FROM gm_notifications n
		JOIN gm_accounts g ON g.id = n.gm_id
		WHERE n.character_id = $1 AND n.is_read = false
		ORDER BY n.created_at DESC
	`, characterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []map[string]interface{}
	for rows.Next() {
		var id uuid.UUID
		var message, notifType, gmName string
		var createdAt time.Time
		if err := rows.Scan(&id, &message, &notifType, &createdAt, &gmName); err != nil {
			continue
		}
		notifications = append(notifications, map[string]interface{}{
			"id":                id,
			"message":           message,
			"notification_type": notifType,
			"gm_name":           gmName,
			"created_at":        createdAt,
		})
	}
	return notifications, nil
}

// MarkGMNotificationRead marks a GM notification as read
func (s *GMService) MarkGMNotificationRead(ctx context.Context, notificationID uuid.UUID) error {
	_, err := s.db.Pool.Exec(ctx, `
		UPDATE gm_notifications SET is_read = true, read_at = NOW() WHERE id = $1
	`, notificationID)
	return err
}

// GetOnlineGMCount returns count of GMs currently on duty
func (s *GMService) GetOnlineGMCount(ctx context.Context) (int, error) {
	var count int
	err := s.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM gm_accounts
		WHERE is_active = true AND is_on_duty = true
	`).Scan(&count)
	return count, err
}
