package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"realm-of-conquest/internal/middleware"
	"realm-of-conquest/internal/models"
	"realm-of-conquest/internal/services"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	// Validate
	if req.Email == "" || req.Username == "" || req.Password == "" {
		BadRequest(w, "email, username and password are required")
		return
	}
	if len(req.Password) < 6 {
		BadRequest(w, "password must be at least 6 characters")
		return
	}
	if len(req.Username) < 3 || len(req.Username) > 20 {
		BadRequest(w, "username must be 3-20 characters")
		return
	}

	resp, err := h.authService.Register(r.Context(), &req)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrEmailExists):
			BadRequest(w, "email already exists")
		case errors.Is(err, services.ErrUsernameExists):
			BadRequest(w, "username already exists")
		default:
			InternalError(w, "failed to register")
		}
		return
	}

	Created(w, resp)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	if req.Email == "" || req.Password == "" {
		BadRequest(w, "email and password are required")
		return
	}

	resp, err := h.authService.Login(r.Context(), &req)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrInvalidCredentials):
			Unauthorized(w, "invalid email or password")
		case errors.Is(err, services.ErrAccountBanned):
			Unauthorized(w, "account is banned")
		default:
			InternalError(w, "failed to login")
		}
		return
	}

	Success(w, resp)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	account, err := h.authService.GetAccountByID(r.Context(), accountID)
	if err != nil {
		NotFound(w, "account not found")
		return
	}

	Success(w, account)
}
