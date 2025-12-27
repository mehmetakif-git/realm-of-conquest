package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"realm-of-conquest/internal/config"
	"realm-of-conquest/internal/database"
	"realm-of-conquest/internal/handlers"
	"realm-of-conquest/internal/middleware"
	"realm-of-conquest/internal/services"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := database.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("Connected to database")

	// Initialize services
	authService := services.NewAuthService(db, cfg.JWTSecret, cfg.JWTExpiry)
	characterService := services.NewCharacterService(db)
	gmService := services.NewGMService(db, cfg.JWTSecret, cfg.JWTExpiry)
	ticketService := services.NewTicketService(db)
	messageService := services.NewMessageService(db)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	characterHandler := handlers.NewCharacterHandler(characterService)
	gmHandler := handlers.NewGMHandler(gmService, ticketService)
	ticketHandler := handlers.NewTicketHandler(ticketService)
	messageHandler := handlers.NewMessageHandler(messageService)

	r := chi.NewRouter()

	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.Timeout(60 * time.Second))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if err := db.Health(r.Context()); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte(`{"status": "unhealthy", "database": "disconnected"}`))
			return
		}
		w.Write([]byte(`{"status": "healthy", "database": "connected"}`))
	})

	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)
		r.Get("/announcements", gmHandler.GetAnnouncements)
		r.Get("/gms/online", gmHandler.GetOnlineGMs) // Public - players can see online GMs

		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth(authService))

			r.Get("/auth/me", authHandler.Me)
			r.Get("/characters/{characterId}/gm-info", gmHandler.GetCharacterGMInfo) // Check if character is GM

			r.Post("/characters", characterHandler.Create)
			r.Get("/characters", characterHandler.List)
			r.Get("/characters/{id}", characterHandler.Get)
			r.Delete("/characters/{id}", characterHandler.Delete)

			r.Post("/tickets", ticketHandler.Create)
			r.Get("/tickets", ticketHandler.List)
			r.Get("/tickets/{id}", ticketHandler.Get)
			r.Post("/tickets/{id}/responses", ticketHandler.AddResponse)
			r.Get("/tickets/{id}/responses", ticketHandler.GetResponses)

			r.Post("/messages", messageHandler.Send)
			r.Get("/messages/inbox", messageHandler.GetInbox)
			r.Get("/messages/sent", messageHandler.GetSent)
			r.Get("/messages/conversation/{userId}", messageHandler.GetConversation)
			r.Get("/messages/unread", messageHandler.GetUnreadCount)
			r.Patch("/messages/{id}/read", messageHandler.MarkAsRead)
			r.Delete("/messages/{id}", messageHandler.Delete)
		})

		r.Route("/gm", func(r chi.Router) {
			r.Post("/login", gmHandler.Login)

			r.Group(func(r chi.Router) {
				r.Use(middleware.GMAuth(gmService))

				r.Get("/me", gmHandler.Me)
				r.Get("/dashboard", gmHandler.Dashboard)
				r.Patch("/duty", gmHandler.SetDutyStatus)

				// Player management (in-game)
				r.Get("/players/{characterId}", gmHandler.GetPlayerProfile)
				r.Post("/players/{characterId}/kick", gmHandler.KickCharacter)
				r.Post("/players/{characterId}/message", gmHandler.SendGMMessage)

				r.Get("/tickets", gmHandler.GetAllTickets)
				r.Get("/tickets/{id}", gmHandler.GetTicket)
				r.Get("/tickets/{id}/responses", gmHandler.GetTicketResponses)
				r.Patch("/tickets/{id}/status", gmHandler.UpdateTicketStatus)
				r.Post("/tickets/{id}/responses", gmHandler.RespondToTicket)

				// Moderator level (2+)
				r.Group(func(r chi.Router) {
					r.Use(middleware.RequireGMLevel(2))
					r.Get("/mutes", gmHandler.GetMutes)
					r.Post("/mutes", gmHandler.MuteCharacter)
					r.Delete("/mutes/{id}", gmHandler.UnmuteCharacter)
				})

				// Game Master level (3+)
				r.Group(func(r chi.Router) {
					r.Use(middleware.RequireGMLevel(3))
					r.Get("/bans", gmHandler.GetBans)
					r.Post("/bans", gmHandler.BanAccount)
					r.Delete("/bans/{id}", gmHandler.UnbanAccount)
				})

				// Admin level (4+)
				r.Group(func(r chi.Router) {
					r.Use(middleware.RequireGMLevel(4))
					r.Post("/announcements", gmHandler.CreateAnnouncement)
					r.Delete("/announcements/{id}", gmHandler.DeactivateAnnouncement)
				})
			})
		})
	})

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("Server starting on port %s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	fmt.Println("Server stopped")
}
