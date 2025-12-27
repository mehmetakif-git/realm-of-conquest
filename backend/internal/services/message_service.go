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
	ErrMessageNotFound = errors.New("message not found")
	ErrCannotMessage   = errors.New("cannot send message to this character")
)

type MessageService struct {
	db *database.DB
}

func NewMessageService(db *database.DB) *MessageService {
	return &MessageService{db: db}
}

// Send message between characters
func (s *MessageService) Send(ctx context.Context, senderID uuid.UUID, req *models.SendMessageRequest, isGMMessage bool) (*models.PrivateMessage, error) {
	// Check if recipient character exists
	var exists bool
	err := s.db.Pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM characters WHERE id = $1 AND deleted_at IS NULL)", req.RecipientID).Scan(&exists)
	if err != nil || !exists {
		return nil, ErrCannotMessage
	}

	// Check if sender is muted (unless it's a GM message)
	if !isGMMessage {
		var isMuted bool
		s.db.Pool.QueryRow(ctx, `
			SELECT EXISTS(SELECT 1 FROM mutes WHERE character_id = $1 AND is_active = true AND expires_at > NOW() AND mute_type IN ('all', 'whisper'))
		`, senderID).Scan(&isMuted)
		if isMuted {
			return nil, errors.New("you are muted and cannot send messages")
		}
	}

	message := &models.PrivateMessage{
		ID:          uuid.New(),
		SenderID:    senderID,
		RecipientID: req.RecipientID,
		Message:     req.Message,
		IsRead:      false,
		IsGMMessage: isGMMessage,
		CreatedAt:   time.Now(),
	}

	_, err = s.db.Pool.Exec(ctx, `
		INSERT INTO private_messages (id, sender_id, recipient_id, message, is_read, is_gm_message, deleted_by_sender, deleted_by_recipient, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, false, false, $7)
	`, message.ID, message.SenderID, message.RecipientID, message.Message, message.IsRead, message.IsGMMessage, message.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to send message: %w", err)
	}

	return message, nil
}

// GetInbox - messages received by this character
func (s *MessageService) GetInbox(ctx context.Context, characterID uuid.UUID, limit, offset int) ([]*models.MessageWithNames, error) {
	rows, err := s.db.Pool.Query(ctx, `
		SELECT pm.id, pm.sender_id, pm.recipient_id, pm.message, pm.is_read, pm.read_at, pm.is_gm_message, pm.created_at,
		       sender.name as sender_name, recipient.name as recipient_name
		FROM private_messages pm
		JOIN characters sender ON pm.sender_id = sender.id
		JOIN characters recipient ON pm.recipient_id = recipient.id
		WHERE pm.recipient_id = $1 AND pm.deleted_by_recipient = false
		ORDER BY pm.created_at DESC
		LIMIT $2 OFFSET $3
	`, characterID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*models.MessageWithNames
	for rows.Next() {
		var m models.MessageWithNames
		if err := rows.Scan(&m.ID, &m.SenderID, &m.RecipientID, &m.Message, &m.IsRead, &m.ReadAt, &m.IsGMMessage, &m.CreatedAt,
			&m.SenderName, &m.RecipientName); err != nil {
			continue
		}
		messages = append(messages, &m)
	}
	return messages, nil
}

// GetSent - messages sent by this character
func (s *MessageService) GetSent(ctx context.Context, characterID uuid.UUID, limit, offset int) ([]*models.MessageWithNames, error) {
	rows, err := s.db.Pool.Query(ctx, `
		SELECT pm.id, pm.sender_id, pm.recipient_id, pm.message, pm.is_read, pm.read_at, pm.is_gm_message, pm.created_at,
		       sender.name as sender_name, recipient.name as recipient_name
		FROM private_messages pm
		JOIN characters sender ON pm.sender_id = sender.id
		JOIN characters recipient ON pm.recipient_id = recipient.id
		WHERE pm.sender_id = $1 AND pm.deleted_by_sender = false
		ORDER BY pm.created_at DESC
		LIMIT $2 OFFSET $3
	`, characterID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*models.MessageWithNames
	for rows.Next() {
		var m models.MessageWithNames
		if err := rows.Scan(&m.ID, &m.SenderID, &m.RecipientID, &m.Message, &m.IsRead, &m.ReadAt, &m.IsGMMessage, &m.CreatedAt,
			&m.SenderName, &m.RecipientName); err != nil {
			continue
		}
		messages = append(messages, &m)
	}
	return messages, nil
}

// GetConversation - messages between two characters
func (s *MessageService) GetConversation(ctx context.Context, characterID, otherID uuid.UUID, limit, offset int) ([]*models.MessageWithNames, error) {
	rows, err := s.db.Pool.Query(ctx, `
		SELECT pm.id, pm.sender_id, pm.recipient_id, pm.message, pm.is_read, pm.read_at, pm.is_gm_message, pm.created_at,
		       sender.name as sender_name, recipient.name as recipient_name
		FROM private_messages pm
		JOIN characters sender ON pm.sender_id = sender.id
		JOIN characters recipient ON pm.recipient_id = recipient.id
		WHERE (
			(pm.sender_id = $1 AND pm.recipient_id = $2 AND pm.deleted_by_sender = false) OR
			(pm.sender_id = $2 AND pm.recipient_id = $1 AND pm.deleted_by_recipient = false)
		)
		ORDER BY pm.created_at DESC
		LIMIT $3 OFFSET $4
	`, characterID, otherID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*models.MessageWithNames
	for rows.Next() {
		var m models.MessageWithNames
		if err := rows.Scan(&m.ID, &m.SenderID, &m.RecipientID, &m.Message, &m.IsRead, &m.ReadAt, &m.IsGMMessage, &m.CreatedAt,
			&m.SenderName, &m.RecipientName); err != nil {
			continue
		}
		messages = append(messages, &m)
	}
	return messages, nil
}

func (s *MessageService) MarkAsRead(ctx context.Context, characterID, messageID uuid.UUID) error {
	now := time.Now()
	result, err := s.db.Pool.Exec(ctx, `
		UPDATE private_messages SET is_read = true, read_at = $1
		WHERE id = $2 AND recipient_id = $3 AND is_read = false
	`, now, messageID, characterID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrMessageNotFound
	}
	return nil
}

// Delete marks message as deleted for the character (soft delete)
func (s *MessageService) Delete(ctx context.Context, characterID, messageID uuid.UUID) error {
	// First check if user is sender or recipient
	var senderID, recipientID uuid.UUID
	err := s.db.Pool.QueryRow(ctx, `
		SELECT sender_id, recipient_id FROM private_messages WHERE id = $1
	`, messageID).Scan(&senderID, &recipientID)
	if err != nil {
		return ErrMessageNotFound
	}

	if characterID == senderID {
		_, err = s.db.Pool.Exec(ctx, `
			UPDATE private_messages SET deleted_by_sender = true WHERE id = $1
		`, messageID)
	} else if characterID == recipientID {
		_, err = s.db.Pool.Exec(ctx, `
			UPDATE private_messages SET deleted_by_recipient = true WHERE id = $1
		`, messageID)
	} else {
		return errors.New("not authorized to delete this message")
	}

	return err
}

func (s *MessageService) GetUnreadCount(ctx context.Context, characterID uuid.UUID) (int, error) {
	var count int
	err := s.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM private_messages
		WHERE recipient_id = $1 AND is_read = false AND deleted_by_recipient = false
	`, characterID).Scan(&count)
	return count, err
}

// GM sends a message to a character (appears as system/GM message)
func (s *MessageService) SendGMMessage(ctx context.Context, gmCharacterID, recipientID uuid.UUID, message string) (*models.PrivateMessage, error) {
	return s.Send(ctx, gmCharacterID, &models.SendMessageRequest{
		RecipientID: recipientID,
		Message:     message,
	}, true)
}
