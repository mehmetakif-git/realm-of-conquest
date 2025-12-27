package middleware

import (
	"context"
	"net/http"
	"strings"

	"realm-of-conquest/internal/services"

	"github.com/google/uuid"
)

type contextKey string

const AccountIDKey contextKey = "accountID"

func Auth(authService *services.AuthService) func(http.Handler) http.Handler {
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

			accountID, err := authService.ValidateToken(parts[1])
			if err != nil {
				http.Error(w, `{"error": "invalid token"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), AccountIDKey, accountID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetAccountID(ctx context.Context) (uuid.UUID, bool) {
	id, ok := ctx.Value(AccountIDKey).(uuid.UUID)
	return id, ok
}
