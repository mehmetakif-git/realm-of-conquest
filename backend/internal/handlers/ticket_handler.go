package handlers

import (
	"encoding/json"
	"net/http"

	"realm-of-conquest/internal/middleware"
	"realm-of-conquest/internal/models"
	"realm-of-conquest/internal/services"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type TicketHandler struct {
	ticketService *services.TicketService
}

func NewTicketHandler(ticketService *services.TicketService) *TicketHandler {
	return &TicketHandler{ticketService: ticketService}
}

// Helper to get character ID from request header
func getTicketCharacterID(r *http.Request) (uuid.UUID, bool) {
	charIDStr := r.Header.Get("X-Character-ID")
	if charIDStr == "" {
		return uuid.Nil, false
	}
	charID, err := uuid.Parse(charIDStr)
	if err != nil {
		return uuid.Nil, false
	}
	return charID, true
}

func (h *TicketHandler) Create(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characterID, ok := getTicketCharacterID(r)
	if !ok {
		BadRequest(w, "X-Character-ID header is required")
		return
	}

	var req models.CreateTicketRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	if req.Subject == "" || req.Description == "" {
		BadRequest(w, "subject and description are required")
		return
	}

	// Default server ID to 1 if not provided
	serverID := 1
	if req.ServerID > 0 {
		serverID = req.ServerID
	}

	ticket, err := h.ticketService.Create(r.Context(), characterID, serverID, &req)
	if err != nil {
		InternalError(w, "failed to create ticket")
		return
	}

	Created(w, ticket)
}

func (h *TicketHandler) List(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characterID, ok := getTicketCharacterID(r)
	if !ok {
		BadRequest(w, "X-Character-ID header is required")
		return
	}

	tickets, err := h.ticketService.GetByCharacterID(r.Context(), characterID)
	if err != nil {
		InternalError(w, "failed to get tickets")
		return
	}

	if tickets == nil {
		tickets = []*models.Ticket{}
	}

	Success(w, tickets)
}

func (h *TicketHandler) Get(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characterID, ok := getTicketCharacterID(r)
	if !ok {
		BadRequest(w, "X-Character-ID header is required")
		return
	}

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

	// Ensure user owns this ticket (reporter_id is the character ID)
	if ticket.ReporterID != characterID {
		NotFound(w, "ticket not found")
		return
	}

	Success(w, ticket)
}

func (h *TicketHandler) AddResponse(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characterID, ok := getTicketCharacterID(r)
	if !ok {
		BadRequest(w, "X-Character-ID header is required")
		return
	}

	idStr := chi.URLParam(r, "id")
	ticketID, err := uuid.Parse(idStr)
	if err != nil {
		BadRequest(w, "invalid ticket id")
		return
	}

	var req struct {
		Message string `json:"message"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	if req.Message == "" {
		BadRequest(w, "message is required")
		return
	}

	response, err := h.ticketService.AddPlayerResponse(r.Context(), ticketID, characterID, req.Message)
	if err != nil {
		if err.Error() == "not authorized to respond to this ticket" {
			NotFound(w, "ticket not found")
			return
		}
		InternalError(w, "failed to add response")
		return
	}

	Created(w, response)
}

func (h *TicketHandler) GetResponses(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characterID, ok := getTicketCharacterID(r)
	if !ok {
		BadRequest(w, "X-Character-ID header is required")
		return
	}

	idStr := chi.URLParam(r, "id")
	ticketID, err := uuid.Parse(idStr)
	if err != nil {
		BadRequest(w, "invalid ticket id")
		return
	}

	// Verify ownership
	ticket, err := h.ticketService.GetByID(r.Context(), ticketID)
	if err != nil || ticket.ReporterID != characterID {
		NotFound(w, "ticket not found")
		return
	}

	// Players cannot see internal messages
	responses, err := h.ticketService.GetMessages(r.Context(), ticketID, false)
	if err != nil {
		InternalError(w, "failed to get responses")
		return
	}

	if responses == nil {
		responses = []*models.TicketMessage{}
	}

	Success(w, responses)
}
