package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"realm-of-conquest/internal/middleware"
	"realm-of-conquest/internal/models"
	"realm-of-conquest/internal/services"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type CharacterHandler struct {
	characterService *services.CharacterService
}

func NewCharacterHandler(characterService *services.CharacterService) *CharacterHandler {
	return &CharacterHandler{characterService: characterService}
}

func (h *CharacterHandler) Create(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	var req models.CreateCharacterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		BadRequest(w, "invalid request body")
		return
	}

	if req.Name == "" {
		BadRequest(w, "name is required")
		return
	}
	if req.Class == "" {
		BadRequest(w, "class is required")
		return
	}

	character, err := h.characterService.Create(r.Context(), accountID, &req)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrCharacterNameExists):
			BadRequest(w, "character name already exists")
		case errors.Is(err, services.ErrInvalidCharacterName):
			BadRequest(w, "invalid character name (3-16 alphanumeric characters)")
		case errors.Is(err, services.ErrInvalidClass):
			BadRequest(w, "invalid class")
		case errors.Is(err, services.ErrMaxCharacters):
			BadRequest(w, "maximum characters reached (5)")
		default:
			InternalError(w, "failed to create character")
		}
		return
	}

	Created(w, character)
}

func (h *CharacterHandler) List(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characters, err := h.characterService.GetByAccountID(r.Context(), accountID)
	if err != nil {
		InternalError(w, "failed to get characters")
		return
	}

	if characters == nil {
		characters = []*models.Character{}
	}

	Success(w, characters)
}

func (h *CharacterHandler) Get(w http.ResponseWriter, r *http.Request) {
	characterIDStr := chi.URLParam(r, "id")
	characterID, err := uuid.Parse(characterIDStr)
	if err != nil {
		BadRequest(w, "invalid character id")
		return
	}

	character, err := h.characterService.GetByID(r.Context(), characterID)
	if err != nil {
		if errors.Is(err, services.ErrCharacterNotFound) {
			NotFound(w, "character not found")
		} else {
			InternalError(w, "failed to get character")
		}
		return
	}

	Success(w, character)
}

func (h *CharacterHandler) Delete(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		Unauthorized(w, "unauthorized")
		return
	}

	characterIDStr := chi.URLParam(r, "id")
	characterID, err := uuid.Parse(characterIDStr)
	if err != nil {
		BadRequest(w, "invalid character id")
		return
	}

	if err := h.characterService.Delete(r.Context(), accountID, characterID); err != nil {
		if errors.Is(err, services.ErrCharacterNotFound) {
			NotFound(w, "character not found")
		} else {
			InternalError(w, "failed to delete character")
		}
		return
	}

	Success(w, map[string]bool{"deleted": true})
}
