package services

import (
	"context"
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
	ErrEmailExists       = errors.New("email already exists")
	ErrUsernameExists    = errors.New("username already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrAccountBanned     = errors.New("account is banned")
)

type AuthService struct {
	db        *database.DB
	jwtSecret string
	jwtExpiry time.Duration
}

func NewAuthService(db *database.DB, jwtSecret string, jwtExpiry time.Duration) *AuthService {
	return &AuthService{
		db:        db,
		jwtSecret: jwtSecret,
		jwtExpiry: jwtExpiry,
	}
}

func (s *AuthService) Register(ctx context.Context, req *models.RegisterRequest) (*models.AuthResponse, error) {
	// Check if email exists
	var exists bool
	err := s.db.Pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM accounts WHERE email = $1)", req.Email).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("failed to check email: %w", err)
	}
	if exists {
		return nil, ErrEmailExists
	}

	// Check if username exists
	err = s.db.Pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM accounts WHERE username = $1)", req.Username).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("failed to check username: %w", err)
	}
	if exists {
		return nil, ErrUsernameExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create account
	account := &models.Account{
		ID:           uuid.New(),
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
		TrustScore:   500, // Default trust score
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	_, err = s.db.Pool.Exec(ctx, `
		INSERT INTO accounts (id, email, username, password_hash, trust_score, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, account.ID, account.Email, account.Username, account.PasswordHash, account.TrustScore, account.CreatedAt, account.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create account: %w", err)
	}

	// Generate token
	token, err := s.generateToken(account.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &models.AuthResponse{
		Token:   token,
		Account: account,
	}, nil
}

func (s *AuthService) Login(ctx context.Context, req *models.LoginRequest) (*models.AuthResponse, error) {
	var account models.Account
	err := s.db.Pool.QueryRow(ctx, `
		SELECT id, email, username, password_hash, email_verified, is_banned, ban_reason, trust_score,
		       premium_expires_at, last_login_at, created_at, updated_at
		FROM accounts WHERE email = $1
	`, req.Email).Scan(
		&account.ID, &account.Email, &account.Username, &account.PasswordHash,
		&account.IsVerified, &account.IsBanned, &account.BanReason, &account.TrustScore,
		&account.PremiumUntil, &account.LastLoginAt, &account.CreatedAt, &account.UpdatedAt,
	)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(account.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	// Check if banned
	if account.IsBanned {
		return nil, ErrAccountBanned
	}

	// Update last login
	now := time.Now()
	_, _ = s.db.Pool.Exec(ctx, "UPDATE accounts SET last_login_at = $1 WHERE id = $2", now, account.ID)
	account.LastLoginAt = &now

	// Generate token
	token, err := s.generateToken(account.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &models.AuthResponse{
		Token:   token,
		Account: &account,
	}, nil
}

func (s *AuthService) generateToken(accountID uuid.UUID) (string, error) {
	claims := jwt.MapClaims{
		"sub": accountID.String(),
		"exp": time.Now().Add(s.jwtExpiry).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *AuthService) ValidateToken(tokenString string) (uuid.UUID, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})
	if err != nil {
		return uuid.Nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		sub, ok := claims["sub"].(string)
		if !ok {
			return uuid.Nil, errors.New("invalid token claims")
		}
		return uuid.Parse(sub)
	}

	return uuid.Nil, errors.New("invalid token")
}

func (s *AuthService) GetAccountByID(ctx context.Context, id uuid.UUID) (*models.Account, error) {
	var account models.Account
	err := s.db.Pool.QueryRow(ctx, `
		SELECT id, email, username, email_verified, is_banned, ban_reason, trust_score,
		       premium_expires_at, last_login_at, created_at, updated_at
		FROM accounts WHERE id = $1
	`, id).Scan(
		&account.ID, &account.Email, &account.Username,
		&account.IsVerified, &account.IsBanned, &account.BanReason, &account.TrustScore,
		&account.PremiumUntil, &account.LastLoginAt, &account.CreatedAt, &account.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &account, nil
}
