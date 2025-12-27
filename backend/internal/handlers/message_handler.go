package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"realm-of-conquest/internal/middleware"
	"realm-of-conquest/internal/models"
	"realm-of-conquest/internal/services"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type MessageHandler struct {
	messageService *services.MessageService
}

func NewMessageHandler(messageService *services.MessageService) *MessageHandler {
	return &MessageHandler{messageService: messageService}
}

// Helper to get character ID from request header
func getCharacterID(r *http.Request) (uuid.UUID, bool) {
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

func (h *MessageHandler) Send(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characterID, ok := getCharacterID(r)
	if !ok {
		BadRequest(w, "X-Character-ID header is required")
		return
	}

	var req models.SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	if req.RecipientID == uuid.Nil || req.Message == "" {
		BadRequest(w, "recipient_id and message are required")
		return
	}

	if req.RecipientID == characterID {
		BadRequest(w, "cannot send message to yourself")
		return
	}

	message, err := h.messageService.Send(r.Context(), characterID, &req, false)
	if err != nil {
		BadRequest(w, err.Error())
		return
	}

	Created(w, message)
}

func (h *MessageHandler) GetInbox(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characterID, ok := getCharacterID(r)
	if !ok {
		BadRequest(w, "X-Character-ID header is required")
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	messages, err := h.messageService.GetInbox(r.Context(), characterID, limit, offset)
	if err != nil {
		InternalError(w, "failed to get messages")
		return
	}

	if messages == nil {
		messages = []*models.MessageWithNames{}
	}

	Success(w, messages)
}

func (h *MessageHandler) GetSent(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characterID, ok := getCharacterID(r)
	if !ok {
		BadRequest(w, "X-Character-ID header is required")
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	messages, err := h.messageService.GetSent(r.Context(), characterID, limit, offset)
	if err != nil {
		InternalError(w, "failed to get messages")
		return
	}

	if messages == nil {
		messages = []*models.MessageWithNames{}
	}

	Success(w, messages)
}

func (h *MessageHandler) GetConversation(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characterID, ok := getCharacterID(r)
	if !ok {
		BadRequest(w, "X-Character-ID header is required")
		return
	}

	otherIDStr := chi.URLParam(r, "recipientId")
	otherID, err := uuid.Parse(otherIDStr)
	if err != nil {
		BadRequest(w, "invalid recipient id")
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	messages, err := h.messageService.GetConversation(r.Context(), characterID, otherID, limit, offset)
	if err != nil {
		InternalError(w, "failed to get conversation")
		return
	}

	if messages == nil {
		messages = []*models.MessageWithNames{}
	}

	Success(w, messages)
}

func (h *MessageHandler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characterID, ok := getCharacterID(r)
	if !ok {
		BadRequest(w, "X-Character-ID header is required")
		return
	}

	messageIDStr := chi.URLParam(r, "id")
	messageID, err := uuid.Parse(messageIDStr)
	if err != nil {
		BadRequest(w, "invalid message id")
		return
	}

	if err := h.messageService.MarkAsRead(r.Context(), characterID, messageID); err != nil {
		BadRequest(w, err.Error())
		return
	}

	Success(w, map[string]bool{"read": true})
}

func (h *MessageHandler) Delete(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characterID, ok := getCharacterID(r)
	if !ok {
		BadRequest(w, "X-Character-ID header is required")
		return
	}

	messageIDStr := chi.URLParam(r, "id")
	messageID, err := uuid.Parse(messageIDStr)
	if err != nil {
		BadRequest(w, "invalid message id")
		return
	}

	if err := h.messageService.Delete(r.Context(), characterID, messageID); err != nil {
		BadRequest(w, err.Error())
		return
	}

	Success(w, map[string]bool{"deleted": true})
}

func (h *MessageHandler) GetUnreadCount(w http.ResponseWriter, r *http.Request) {
	_, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characterID, ok := getCharacterID(r)
	if !ok {
		BadRequest(w, "X-Character-ID header is required")
		return
	}

	count, err := h.messageService.GetUnreadCount(r.Context(), characterID)
	if err != nil {
		InternalError(w, "failed to get unread count")
		return
	}

	Success(w, map[string]int{"unread_count": count})
}
