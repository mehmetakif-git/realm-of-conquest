package models

import (
	"time"

	"github.com/google/uuid"
)

// GM Roles - matches database enum
type GMRole string

const (
	GMRoleHelper     GMRole = "helper"
	GMRoleModerator  GMRole = "moderator"
	GMRoleGameMaster GMRole = "game_master"
	GMRoleAdmin      GMRole = "admin"
	GMRoleOwner      GMRole = "owner"
)

// GMRole to level for permission checks
func (r GMRole) Level() int {
	switch r {
	case GMRoleHelper:
		return 1
	case GMRoleModerator:
		return 2
	case GMRoleGameMaster:
		return 3
	case GMRoleAdmin:
		return 4
	case GMRoleOwner:
		return 5
	default:
		return 0
	}
}

// GM Permissions - stored as JSONB
type GMPermissions struct {
	CanBan               bool `json:"can_ban"`
	CanMute              bool `json:"can_mute"`
	CanJail              bool `json:"can_jail"`
	CanKick              bool `json:"can_kick"`
	CanTeleport          bool `json:"can_teleport"`
	CanSpawnItems        bool `json:"can_spawn_items"`
	CanModifyGold        bool `json:"can_modify_gold"`
	CanViewTickets       bool `json:"can_view_tickets"`
	CanSendAnnouncements bool `json:"can_send_announcements"`
	CanViewPlayerData    bool `json:"can_view_player_data"`
	CanModifyPlayerData  bool `json:"can_modify_player_data"`
	CanAccessMarketFree  bool `json:"can_access_market_free"`
	CanInvisible         bool `json:"can_invisible"`
	CanGodMode           bool `json:"can_god_mode"`
}

// GM Account - linked to accounts table via account_id
type GMAccount struct {
	ID           uuid.UUID      `json:"id"`
	AccountID    uuid.UUID      `json:"account_id"`
	GMRole       GMRole         `json:"gm_role"`
	GMName       string         `json:"gm_name"`
	Permissions  *GMPermissions `json:"permissions,omitempty"`
	IsActive     bool           `json:"is_active"`
	IsVisible    bool           `json:"is_visible"`
	IsOnDuty     bool           `json:"is_on_duty"`
	CreatedAt    time.Time      `json:"created_at"`
	LastActionAt *time.Time     `json:"last_action_at,omitempty"`
}

// GM login uses normal account credentials
type GMLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type GMAuthResponse struct {
	Token     string     `json:"token"`
	GMAccount *GMAccount `json:"gm_account"`
}

// Ban System
type Ban struct {
	ID          uuid.UUID  `json:"id"`
	AccountID   uuid.UUID  `json:"account_id"`
	BanType     string     `json:"ban_type"`
	Reason      string     `json:"reason"`
	BannedBy    uuid.UUID  `json:"banned_by"`
	StartsAt    time.Time  `json:"starts_at"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
	IsActive    bool       `json:"is_active"`
	UnbannedBy  *uuid.UUID `json:"unbanned_by,omitempty"`
	UnbannedAt  *time.Time `json:"unbanned_at,omitempty"`
	UnbanReason *string    `json:"unban_reason,omitempty"`
	BannedIP    *string    `json:"banned_ip,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

type BanRequest struct {
	AccountID uuid.UUID `json:"account_id"`
	BanType   string    `json:"ban_type"`
	Reason    string    `json:"reason"`
	Duration  *int      `json:"duration,omitempty"`
}

// Mute System - character_id based
type Mute struct {
	ID          uuid.UUID `json:"id"`
	CharacterID uuid.UUID `json:"character_id"`
	MuteType    string    `json:"mute_type"`
	Reason      string    `json:"reason"`
	MutedBy     uuid.UUID `json:"muted_by"`
	StartsAt    time.Time `json:"starts_at"`
	ExpiresAt   time.Time `json:"expires_at"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
}

type MuteRequest struct {
	CharacterID uuid.UUID `json:"character_id"`
	MuteType    string    `json:"mute_type"`
	Reason      string    `json:"reason"`
	Duration    int       `json:"duration"`
}

// Announcement System
type Announcement struct {
	ID               uuid.UUID  `json:"id"`
	ServerID         *int       `json:"server_id,omitempty"`
	AnnouncementType string     `json:"announcement_type"`
	Title            *string    `json:"title,omitempty"`
	Message          string     `json:"message"`
	ShowInChat       bool       `json:"show_in_chat"`
	ShowAsPopup      bool       `json:"show_as_popup"`
	ShowInTicker     bool       `json:"show_in_ticker"`
	Color            string     `json:"color"`
	Icon             *string    `json:"icon,omitempty"`
	CreatedBy        *uuid.UUID `json:"created_by,omitempty"`
	StartsAt         time.Time  `json:"starts_at"`
	ExpiresAt        *time.Time `json:"expires_at,omitempty"`
	IsActive         bool       `json:"is_active"`
	CreatedAt        time.Time  `json:"created_at"`
}

type AnnouncementRequest struct {
	ServerID         *int       `json:"server_id,omitempty"`
	AnnouncementType string     `json:"announcement_type"`
	Title            *string    `json:"title,omitempty"`
	Message          string     `json:"message"`
	ShowInChat       bool       `json:"show_in_chat"`
	ShowAsPopup      bool       `json:"show_as_popup"`
	Color            string     `json:"color"`
	ExpiresAt        *time.Time `json:"expires_at,omitempty"`
}

// Ticket System - character based (reporter_id)
type Ticket struct {
	ID                 uuid.UUID  `json:"id"`
	ServerID           int        `json:"server_id"`
	ReporterID         uuid.UUID  `json:"reporter_id"`
	Category           string     `json:"category"`
	Priority           string     `json:"priority"`
	Subject            string     `json:"subject"`
	Description        string     `json:"description"`
	RelatedCharacterID *uuid.UUID `json:"related_character_id,omitempty"`
	Status             string     `json:"status"`
	AssignedTo         *uuid.UUID `json:"assigned_to,omitempty"`
	AssignedAt         *time.Time `json:"assigned_at,omitempty"`
	Resolution         *string    `json:"resolution,omitempty"`
	ResolvedBy         *uuid.UUID `json:"resolved_by,omitempty"`
	ResolvedAt         *time.Time `json:"resolved_at,omitempty"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

type CreateTicketRequest struct {
	ServerID           int        `json:"server_id"`
	Category           string     `json:"category"`
	Priority           string     `json:"priority"`
	Subject            string     `json:"subject"`
	Description        string     `json:"description"`
	RelatedCharacterID *uuid.UUID `json:"related_character_id,omitempty"`
}

// Ticket Message
type TicketMessage struct {
	ID                uuid.UUID  `json:"id"`
	TicketID          uuid.UUID  `json:"ticket_id"`
	SenderType        string     `json:"sender_type"`
	SenderCharacterID *uuid.UUID `json:"sender_character_id,omitempty"`
	SenderGMID        *uuid.UUID `json:"sender_gm_id,omitempty"`
	Message           string     `json:"message"`
	IsInternal        bool       `json:"is_internal"`
	CreatedAt         time.Time  `json:"created_at"`
}

type TicketMessageRequest struct {
	Message    string `json:"message"`
	IsInternal bool   `json:"is_internal,omitempty"`
}

// Private Message - between characters
type PrivateMessage struct {
	ID                 uuid.UUID  `json:"id"`
	SenderID           uuid.UUID  `json:"sender_id"`
	RecipientID        uuid.UUID  `json:"recipient_id"`
	Message            string     `json:"message"`
	IsRead             bool       `json:"is_read"`
	ReadAt             *time.Time `json:"read_at,omitempty"`
	IsGMMessage        bool       `json:"is_gm_message"`
	DeletedBySender    bool       `json:"deleted_by_sender"`
	DeletedByRecipient bool       `json:"deleted_by_recipient"`
	CreatedAt          time.Time  `json:"created_at"`
}

type SendMessageRequest struct {
	RecipientID uuid.UUID `json:"recipient_id"`
	Message     string    `json:"message"`
}

type MessageWithNames struct {
	PrivateMessage
	SenderName    string `json:"sender_name"`
	RecipientName string `json:"recipient_name"`
}

// Dashboard Stats
type DashboardStats struct {
	TotalAccounts    int `json:"total_accounts"`
	OnlineCharacters int `json:"online_characters"`
	ActiveBans       int `json:"active_bans"`
	OpenTickets      int `json:"open_tickets"`
	TotalCharacters  int `json:"total_characters"`
	ActiveMutes      int `json:"active_mutes"`
}
