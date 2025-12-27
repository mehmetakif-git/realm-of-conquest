package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"realm-of-conquest/internal/database"
	"realm-of-conquest/internal/models"

	"github.com/google/uuid"
)

var (
	ErrTicketNotFound = errors.New("ticket not found")
)

type TicketService struct {
	db *database.DB
}

func NewTicketService(db *database.DB) *TicketService {
	return &TicketService{db: db}
}

// Create ticket - reporter_id is the character ID of the player creating the ticket
func (s *TicketService) Create(ctx context.Context, characterID uuid.UUID, serverID int, req *models.CreateTicketRequest) (*models.Ticket, error) {
	ticket := &models.Ticket{
		ID:                 uuid.New(),
		ServerID:           serverID,
		ReporterID:         characterID,
		Category:           req.Category,
		Priority:           req.Priority,
		Subject:            req.Subject,
		Description:        req.Description,
		RelatedCharacterID: req.RelatedCharacterID,
		Status:             "open",
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	_, err := s.db.Pool.Exec(ctx, `
		INSERT INTO tickets (id, server_id, reporter_id, category, priority, subject, description, related_character_id, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, ticket.ID, ticket.ServerID, ticket.ReporterID, ticket.Category, ticket.Priority, ticket.Subject,
		ticket.Description, ticket.RelatedCharacterID, ticket.Status, ticket.CreatedAt, ticket.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create ticket: %w", err)
	}

	return ticket, nil
}

func (s *TicketService) GetByID(ctx context.Context, id uuid.UUID) (*models.Ticket, error) {
	var t models.Ticket
	err := s.db.Pool.QueryRow(ctx, `
		SELECT id, server_id, reporter_id, category, priority, subject, description, related_character_id,
		       status, assigned_to, assigned_at, resolution, resolved_by, resolved_at, created_at, updated_at
		FROM tickets WHERE id = $1
	`, id).Scan(
		&t.ID, &t.ServerID, &t.ReporterID, &t.Category, &t.Priority, &t.Subject, &t.Description,
		&t.RelatedCharacterID, &t.Status, &t.AssignedTo, &t.AssignedAt, &t.Resolution,
		&t.ResolvedBy, &t.ResolvedAt, &t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		return nil, ErrTicketNotFound
	}
	return &t, nil
}

// GetByCharacterID - get tickets created by a specific character
func (s *TicketService) GetByCharacterID(ctx context.Context, characterID uuid.UUID) ([]*models.Ticket, error) {
	rows, err := s.db.Pool.Query(ctx, `
		SELECT id, server_id, reporter_id, category, priority, subject, description, related_character_id,
		       status, assigned_to, assigned_at, resolution, resolved_by, resolved_at, created_at, updated_at
		FROM tickets WHERE reporter_id = $1
		ORDER BY created_at DESC
	`, characterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tickets []*models.Ticket
	for rows.Next() {
		var t models.Ticket
		if err := rows.Scan(&t.ID, &t.ServerID, &t.ReporterID, &t.Category, &t.Priority, &t.Subject, &t.Description,
			&t.RelatedCharacterID, &t.Status, &t.AssignedTo, &t.AssignedAt, &t.Resolution,
			&t.ResolvedBy, &t.ResolvedAt, &t.CreatedAt, &t.UpdatedAt); err != nil {
			continue
		}
		tickets = append(tickets, &t)
	}
	return tickets, nil
}

func (s *TicketService) GetAll(ctx context.Context, status string, limit, offset int) ([]*models.Ticket, error) {
	query := `
		SELECT id, server_id, reporter_id, category, priority, subject, description, related_character_id,
		       status, assigned_to, assigned_at, resolution, resolved_by, resolved_at, created_at, updated_at
		FROM tickets
	`
	args := []interface{}{}
	argIndex := 1

	if status != "" {
		query += fmt.Sprintf(" WHERE status = $%d", argIndex)
		args = append(args, status)
		argIndex++
	}

	query += " ORDER BY CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, created_at ASC"
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, limit, offset)

	rows, err := s.db.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tickets []*models.Ticket
	for rows.Next() {
		var t models.Ticket
		if err := rows.Scan(&t.ID, &t.ServerID, &t.ReporterID, &t.Category, &t.Priority, &t.Subject, &t.Description,
			&t.RelatedCharacterID, &t.Status, &t.AssignedTo, &t.AssignedAt, &t.Resolution,
			&t.ResolvedBy, &t.ResolvedAt, &t.CreatedAt, &t.UpdatedAt); err != nil {
			continue
		}
		tickets = append(tickets, &t)
	}
	return tickets, nil
}

func (s *TicketService) AssignTicket(ctx context.Context, ticketID, gmID uuid.UUID) error {
	now := time.Now()
	result, err := s.db.Pool.Exec(ctx, `
		UPDATE tickets SET status = 'in_progress', assigned_to = $1, assigned_at = $2, updated_at = $2
		WHERE id = $3 AND status = 'open'
	`, gmID, now, ticketID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrTicketNotFound
	}
	return nil
}

func (s *TicketService) ResolveTicket(ctx context.Context, ticketID, gmID uuid.UUID, resolution string) error {
	now := time.Now()
	result, err := s.db.Pool.Exec(ctx, `
		UPDATE tickets SET status = 'resolved', resolution = $1, resolved_by = $2, resolved_at = $3, updated_at = $3
		WHERE id = $4 AND status IN ('open', 'in_progress')
	`, resolution, gmID, now, ticketID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrTicketNotFound
	}
	return nil
}

func (s *TicketService) CloseTicket(ctx context.Context, ticketID uuid.UUID) error {
	now := time.Now()
	result, err := s.db.Pool.Exec(ctx, `
		UPDATE tickets SET status = 'closed', updated_at = $1
		WHERE id = $2
	`, now, ticketID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrTicketNotFound
	}
	return nil
}

// Add message to ticket - uses ticket_messages table
func (s *TicketService) AddMessage(ctx context.Context, ticketID uuid.UUID, senderType string, senderCharacterID, senderGMID *uuid.UUID, message string, isInternal bool) (*models.TicketMessage, error) {
	msg := &models.TicketMessage{
		ID:                uuid.New(),
		TicketID:          ticketID,
		SenderType:        senderType,
		SenderCharacterID: senderCharacterID,
		SenderGMID:        senderGMID,
		Message:           message,
		IsInternal:        isInternal,
		CreatedAt:         time.Now(),
	}

	_, err := s.db.Pool.Exec(ctx, `
		INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_character_id, sender_gm_id, message, is_internal, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, msg.ID, msg.TicketID, msg.SenderType, msg.SenderCharacterID, msg.SenderGMID, msg.Message, msg.IsInternal, msg.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to add message: %w", err)
	}

	// Update ticket updated_at
	_, _ = s.db.Pool.Exec(ctx, "UPDATE tickets SET updated_at = $1 WHERE id = $2", time.Now(), ticketID)

	return msg, nil
}

// Get messages for a ticket - isGM determines if internal messages are included
func (s *TicketService) GetMessages(ctx context.Context, ticketID uuid.UUID, includeInternal bool) ([]*models.TicketMessage, error) {
	query := `
		SELECT id, ticket_id, sender_type, sender_character_id, sender_gm_id, message, is_internal, created_at
		FROM ticket_messages WHERE ticket_id = $1
	`
	if !includeInternal {
		query += " AND is_internal = false"
	}
	query += " ORDER BY created_at ASC"

	rows, err := s.db.Pool.Query(ctx, query, ticketID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*models.TicketMessage
	for rows.Next() {
		var m models.TicketMessage
		if err := rows.Scan(&m.ID, &m.TicketID, &m.SenderType, &m.SenderCharacterID, &m.SenderGMID, &m.Message, &m.IsInternal, &m.CreatedAt); err != nil {
			continue
		}
		messages = append(messages, &m)
	}
	return messages, nil
}

// Player adds a response to their ticket
func (s *TicketService) AddPlayerResponse(ctx context.Context, ticketID, characterID uuid.UUID, message string) (*models.TicketMessage, error) {
	// Verify the ticket belongs to this character
	var reporterID uuid.UUID
	err := s.db.Pool.QueryRow(ctx, "SELECT reporter_id FROM tickets WHERE id = $1", ticketID).Scan(&reporterID)
	if err != nil {
		return nil, ErrTicketNotFound
	}
	if reporterID != characterID {
		return nil, errors.New("not authorized to respond to this ticket")
	}

	return s.AddMessage(ctx, ticketID, "player", &characterID, nil, message, false)
}

// GM adds a response to a ticket
func (s *TicketService) AddGMResponse(ctx context.Context, ticketID, gmID uuid.UUID, message string, isInternal bool) (*models.TicketMessage, error) {
	return s.AddMessage(ctx, ticketID, "gm", nil, &gmID, message, isInternal)
}
