package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"realm-of-conquest/internal/middleware"
	"realm-of-conquest/internal/models"
	"realm-of-conquest/internal/services"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type GMHandler struct {
	gmService     *services.GMService
	ticketService *services.TicketService
}

func NewGMHandler(gmService *services.GMService, ticketService *services.TicketService) *GMHandler {
	return &GMHandler{
		gmService:     gmService,
		ticketService: ticketService,
	}
}

// Authentication - GM uses email (regular account) + password
func (h *GMHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.GMLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	if req.Email == "" || req.Password == "" {
		BadRequest(w, "email and password are required")
		return
	}

	resp, err := h.gmService.Login(r.Context(), &req)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrInvalidCredentials):
			Unauthorized(w, "invalid credentials")
		case errors.Is(err, services.ErrGMInactive):
			Unauthorized(w, "gm account is inactive")
		case errors.Is(err, services.ErrGMNotFound):
			Unauthorized(w, "no gm account found for this user")
		default:
			InternalError(w, "login failed")
		}
		return
	}

	Success(w, resp)
}

func (h *GMHandler) Me(w http.ResponseWriter, r *http.Request) {
	gmID, ok := middleware.GetGMID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	gm, err := h.gmService.GetGMByID(r.Context(), gmID)
	if err != nil {
		NotFound(w, "gm account not found")
		return
	}

	Success(w, gm)
}

// Dashboard
func (h *GMHandler) Dashboard(w http.ResponseWriter, r *http.Request) {
	stats, err := h.gmService.GetDashboardStats(r.Context())
	if err != nil {
		InternalError(w, "failed to get stats")
		return
	}

	Success(w, stats)
}

// Ban Management - account level
func (h *GMHandler) BanAccount(w http.ResponseWriter, r *http.Request) {
	gmID, _ := middleware.GetGMID(r.Context())

	var req models.BanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	if req.AccountID == uuid.Nil || req.Reason == "" {
		BadRequest(w, "account_id and reason are required")
		return
	}

	ban, err := h.gmService.BanAccount(r.Context(), gmID, &req)
	if err != nil {
		InternalError(w, "failed to ban account")
		return
	}

	Created(w, ban)
}

func (h *GMHandler) UnbanAccount(w http.ResponseWriter, r *http.Request) {
	gmID, _ := middleware.GetGMID(r.Context())

	banIDStr := chi.URLParam(r, "id")
	banID, err := uuid.Parse(banIDStr)
	if err != nil {
		BadRequest(w, "invalid ban id")
		return
	}

	var req struct {
		Reason string `json:"reason"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	if req.Reason == "" {
		req.Reason = "Unbanned by GM"
	}

	if err := h.gmService.UnbanAccount(r.Context(), gmID, banID, req.Reason); err != nil {
		BadRequest(w, err.Error())
		return
	}

	Success(w, map[string]bool{"unbanned": true})
}

func (h *GMHandler) GetBans(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	bans, err := h.gmService.GetActiveBans(r.Context(), limit, offset)
	if err != nil {
		InternalError(w, "failed to get bans")
		return
	}

	if bans == nil {
		bans = []*models.Ban{}
	}

	Success(w, bans)
}

// Mute Management - character level
func (h *GMHandler) MuteCharacter(w http.ResponseWriter, r *http.Request) {
	gmID, _ := middleware.GetGMID(r.Context())

	var req models.MuteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	if req.CharacterID == uuid.Nil || req.Reason == "" || req.Duration <= 0 {
		BadRequest(w, "character_id, reason and duration are required")
		return
	}

	mute, err := h.gmService.MuteCharacter(r.Context(), gmID, &req)
	if err != nil {
		InternalError(w, "failed to mute character")
		return
	}

	Created(w, mute)
}

func (h *GMHandler) UnmuteCharacter(w http.ResponseWriter, r *http.Request) {
	gmID, _ := middleware.GetGMID(r.Context())

	muteIDStr := chi.URLParam(r, "id")
	muteID, err := uuid.Parse(muteIDStr)
	if err != nil {
		BadRequest(w, "invalid mute id")
		return
	}

	if err := h.gmService.UnmuteCharacter(r.Context(), gmID, muteID); err != nil {
		BadRequest(w, err.Error())
		return
	}

	Success(w, map[string]bool{"unmuted": true})
}

func (h *GMHandler) GetMutes(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	mutes, err := h.gmService.GetActiveMutes(r.Context(), limit, offset)
	if err != nil {
		InternalError(w, "failed to get mutes")
		return
	}

	if mutes == nil {
		mutes = []*models.Mute{}
	}

	Success(w, mutes)
}

// Announcement Management
func (h *GMHandler) CreateAnnouncement(w http.ResponseWriter, r *http.Request) {
	gmID, _ := middleware.GetGMID(r.Context())

	var req models.AnnouncementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	if req.Message == "" {
		BadRequest(w, "message is required")
		return
	}

	announcement, err := h.gmService.CreateAnnouncement(r.Context(), gmID, &req)
	if err != nil {
		InternalError(w, "failed to create announcement")
		return
	}

	Created(w, announcement)
}

func (h *GMHandler) GetAnnouncements(w http.ResponseWriter, r *http.Request) {
	announcements, err := h.gmService.GetActiveAnnouncements(r.Context())
	if err != nil {
		InternalError(w, "failed to get announcements")
		return
	}

	if announcements == nil {
		announcements = []*models.Announcement{}
	}

	Success(w, announcements)
}

func (h *GMHandler) DeactivateAnnouncement(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		BadRequest(w, "invalid announcement id")
		return
	}

	if err := h.gmService.DeactivateAnnouncement(r.Context(), id); err != nil {
		InternalError(w, "failed to deactivate announcement")
		return
	}

	Success(w, map[string]bool{"deactivated": true})
}

// Ticket Management (GM side)
func (h *GMHandler) GetAllTickets(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	tickets, err := h.ticketService.GetAll(r.Context(), status, limit, offset)
	if err != nil {
		InternalError(w, "failed to get tickets")
		return
	}

	if tickets == nil {
		tickets = []*models.Ticket{}
	}

	Success(w, tickets)
}

func (h *GMHandler) GetTicket(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		BadRequest(w, "invalid ticket id")
		return
	}

	ticket, err := h.ticketService.GetByID(r.Context(), id)
	if err != nil {
		NotFound(w, "ticket not found")
		return
	}

	Success(w, ticket)
}

func (h *GMHandler) UpdateTicketStatus(w http.ResponseWriter, r *http.Request) {
	gmID, _ := middleware.GetGMID(r.Context())

	idStr := chi.URLParam(r, "id")
	ticketID, err := uuid.Parse(idStr)
	if err != nil {
		BadRequest(w, "invalid ticket id")
		return
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	switch req.Status {
	case "in_progress":
		err = h.ticketService.AssignTicket(r.Context(), ticketID, gmID)
	case "resolved":
		err = h.ticketService.ResolveTicket(r.Context(), ticketID, gmID, "Resolved by GM")
	case "closed":
		err = h.ticketService.CloseTicket(r.Context(), ticketID)
	default:
		BadRequest(w, "invalid status")
		return
	}

	if err != nil {
		InternalError(w, "failed to update ticket")
		return
	}

	Success(w, map[string]string{"status": req.Status})
}

func (h *GMHandler) RespondToTicket(w http.ResponseWriter, r *http.Request) {
	gmID, _ := middleware.GetGMID(r.Context())

	idStr := chi.URLParam(r, "id")
	ticketID, err := uuid.Parse(idStr)
	if err != nil {
		BadRequest(w, "invalid ticket id")
		return
	}

	var req struct {
		Message    string `json:"message"`
		IsInternal bool   `json:"is_internal"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	if req.Message == "" {
		BadRequest(w, "message is required")
		return
	}

	response, err := h.ticketService.AddGMResponse(r.Context(), ticketID, gmID, req.Message, req.IsInternal)
	if err != nil {
		InternalError(w, "failed to add response")
		return
	}

	Created(w, response)
}

func (h *GMHandler) GetTicketResponses(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	ticketID, err := uuid.Parse(idStr)
	if err != nil {
		BadRequest(w, "invalid ticket id")
		return
	}

	// GMs can see internal messages
	responses, err := h.ticketService.GetMessages(r.Context(), ticketID, true)
	if err != nil {
		InternalError(w, "failed to get responses")
		return
	}

	if responses == nil {
		responses = []*models.TicketMessage{}
	}

	Success(w, responses)
}

// ============== IN-GAME GM ENDPOINTS ==============

// GetOnlineGMs returns list of GMs currently on duty (public endpoint for players)
func (h *GMHandler) GetOnlineGMs(w http.ResponseWriter, r *http.Request) {
	gms, err := h.gmService.GetOnlineGMs(r.Context())
	if err != nil {
		InternalError(w, "failed to get online GMs")
		return
	}

	if gms == nil {
		gms = []*services.OnlineGM{}
	}

	Success(w, map[string]interface{}{
		"gms":   gms,
		"count": len(gms),
	})
}

// GetCharacterGMInfo checks if a character is a GM (public endpoint)
func (h *GMHandler) GetCharacterGMInfo(w http.ResponseWriter, r *http.Request) {
	charIDStr := chi.URLParam(r, "characterId")
	charID, err := uuid.Parse(charIDStr)
	if err != nil {
		BadRequest(w, "invalid character id")
		return
	}

	info, err := h.gmService.GetGMInfoByCharacterID(r.Context(), charID)
	if err != nil {
		InternalError(w, "failed to get GM info")
		return
	}

	Success(w, info)
}

// GetPlayerProfile returns detailed player profile for GM viewing
func (h *GMHandler) GetPlayerProfile(w http.ResponseWriter, r *http.Request) {
	charIDStr := chi.URLParam(r, "characterId")
	charID, err := uuid.Parse(charIDStr)
	if err != nil {
		BadRequest(w, "invalid character id")
		return
	}

	profile, err := h.gmService.GetPlayerDetailedProfile(r.Context(), charID)
	if err != nil {
		NotFound(w, "player not found")
		return
	}

	Success(w, profile)
}

// KickCharacter kicks a player from the game
func (h *GMHandler) KickCharacter(w http.ResponseWriter, r *http.Request) {
	gmID, _ := middleware.GetGMID(r.Context())

	charIDStr := chi.URLParam(r, "characterId")
	charID, err := uuid.Parse(charIDStr)
	if err != nil {
		BadRequest(w, "invalid character id")
		return
	}

	var req struct {
		Reason string `json:"reason"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	if req.Reason == "" {
		req.Reason = "Kicked by GM"
	}

	if err := h.gmService.KickCharacter(r.Context(), gmID, charID, req.Reason); err != nil {
		BadRequest(w, err.Error())
		return
	}

	Success(w, map[string]bool{"kicked": true})
}

// SendGMMessage sends a GM message to a player
func (h *GMHandler) SendGMMessage(w http.ResponseWriter, r *http.Request) {
	gmID, _ := middleware.GetGMID(r.Context())

	charIDStr := chi.URLParam(r, "characterId")
	charID, err := uuid.Parse(charIDStr)
	if err != nil {
		BadRequest(w, "invalid character id")
		return
	}

	var req struct {
		Message          string `json:"message"`
		NotificationType string `json:"notification_type"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	if req.Message == "" {
		BadRequest(w, "message is required")
		return
	}

	if err := h.gmService.SendGMMessage(r.Context(), gmID, charID, req.Message, req.NotificationType); err != nil {
		InternalError(w, "failed to send message")
		return
	}

	Success(w, map[string]bool{"sent": true})
}

// SetDutyStatus updates GM's on-duty status
func (h *GMHandler) SetDutyStatus(w http.ResponseWriter, r *http.Request) {
	gmID, _ := middleware.GetGMID(r.Context())

	var req struct {
		OnDuty bool `json:"on_duty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	if err := h.gmService.SetOnDuty(r.Context(), gmID, req.OnDuty); err != nil {
		InternalError(w, "failed to update duty status")
		return
	}

	Success(w, map[string]bool{"on_duty": req.OnDuty})
}
