package middleware

import (
	"context"
	"net/http"
	"strings"

	"realm-of-conquest/internal/models"
	"realm-of-conquest/internal/services"

	"github.com/google/uuid"
)

type gmContextKey string

const (
	GMIDKey    gmContextKey = "gmID"
	GMRoleKey  gmContextKey = "gmRole"
	GMLevelKey gmContextKey = "gmLevel"
)

func GMAuth(gmService *services.GMService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, `{"error": "missing authorization header"}`, http.StatusUnauthorized)
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, `{"error": "invalid authorization header"}`, http.StatusUnauthorized)
				return
			}

			gmID, gmRole, gmLevel, err := gmService.ValidateGMToken(parts[1])
			if err != nil {
				http.Error(w, `{"error": "invalid or expired token"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), GMIDKey, gmID)
			ctx = context.WithValue(ctx, GMRoleKey, gmRole)
			ctx = context.WithValue(ctx, GMLevelKey, gmLevel)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireGMLevel checks if the GM has at least the specified level (1-5)
func RequireGMLevel(minLevel int) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			level, ok := r.Context().Value(GMLevelKey).(int)
			if !ok || level < minLevel {
				http.Error(w, `{"error": "insufficient permissions"}`, http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// RequireGMRole checks if the GM has at least the specified role
func RequireGMRole(minRole models.GMRole) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, ok := r.Context().Value(GMRoleKey).(models.GMRole)
			if !ok || role.Level() < minRole.Level() {
				http.Error(w, `{"error": "insufficient permissions"}`, http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func GetGMID(ctx context.Context) (uuid.UUID, bool) {
	id, ok := ctx.Value(GMIDKey).(uuid.UUID)
	return id, ok
}

func GetGMRole(ctx context.Context) (models.GMRole, bool) {
	role, ok := ctx.Value(GMRoleKey).(models.GMRole)
	return role, ok
}

func GetGMLevel(ctx context.Context) (int, bool) {
	level, ok := ctx.Value(GMLevelKey).(int)
	return level, ok
}
