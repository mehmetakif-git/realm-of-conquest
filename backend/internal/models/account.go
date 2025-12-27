package models

import (
	"time"

	"github.com/google/uuid"
)

type Account struct {
	ID             uuid.UUID  `json:"id"`
	Email          string     `json:"email"`
	Username       string     `json:"username"`
	PasswordHash   string     `json:"-"`
	IsVerified     bool       `json:"is_verified"`
	IsBanned       bool       `json:"is_banned"`
	BanReason      *string    `json:"ban_reason,omitempty"`
	TrustScore     int        `json:"trust_score"`
	PremiumUntil   *time.Time `json:"premium_until,omitempty"`
	LastLoginAt    *time.Time `json:"last_login_at,omitempty"`
	LastLoginIP    *string    `json:"-"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token   string   `json:"token"`
	Account *Account `json:"account"`
}
