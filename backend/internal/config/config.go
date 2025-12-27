package config

import (
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	Env            string
	DatabaseURL    string
	SupabaseURL    string
	SupabaseKey    string
	JWTSecret      string
	JWTExpiry      time.Duration
}

func Load() (*Config, error) {
	// Load .env file if exists
	godotenv.Load()

	expiry, err := time.ParseDuration(getEnv("JWT_EXPIRY", "24h"))
	if err != nil {
		expiry = 24 * time.Hour
	}

	return &Config{
		Port:           getEnv("PORT", "8080"),
		Env:            getEnv("ENV", "development"),
		DatabaseURL:    getEnv("DATABASE_URL", ""),
		SupabaseURL:    getEnv("SUPABASE_URL", ""),
		SupabaseKey:    getEnv("SUPABASE_ANON_KEY", ""),
		JWTSecret:      getEnv("JWT_SECRET", "default-secret-change-me"),
		JWTExpiry:      expiry,
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
