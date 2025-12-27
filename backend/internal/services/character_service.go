package services

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"time"

	"realm-of-conquest/internal/database"
	"realm-of-conquest/internal/models"

	"github.com/google/uuid"
)

var (
	ErrCharacterNameExists  = errors.New("character name already exists")
	ErrInvalidCharacterName = errors.New("invalid character name")
	ErrInvalidClass         = errors.New("invalid class")
	ErrMaxCharacters        = errors.New("maximum characters reached")
	ErrCharacterNotFound    = errors.New("character not found")
)

const MaxCharactersPerAccount = 5
const DefaultServerID = 1

type CharacterService struct {
	db *database.DB
}

func NewCharacterService(db *database.DB) *CharacterService {
	return &CharacterService{db: db}
}

func (s *CharacterService) Create(ctx context.Context, accountID uuid.UUID, req *models.CreateCharacterRequest) (*models.Character, error) {
	// Validate name (3-16 chars, alphanumeric)
	nameRegex := regexp.MustCompile(`^[a-zA-Z0-9_]{3,16}$`)
	if !nameRegex.MatchString(req.Name) {
		return nil, ErrInvalidCharacterName
	}

	// Validate class
	baseStats, ok := models.ClassBaseStats[req.Class]
	if !ok {
		return nil, ErrInvalidClass
	}

	// Check character count
	var count int
	err := s.db.Pool.QueryRow(ctx,
		"SELECT COUNT(*) FROM characters WHERE account_id = $1 AND deleted_at IS NULL",
		accountID,
	).Scan(&count)
	if err != nil {
		return nil, fmt.Errorf("failed to count characters: %w", err)
	}
	if count >= MaxCharactersPerAccount {
		return nil, ErrMaxCharacters
	}

	// Check if name exists
	var exists bool
	err = s.db.Pool.QueryRow(ctx,
		"SELECT EXISTS(SELECT 1 FROM characters WHERE name = $1 AND deleted_at IS NULL)",
		req.Name,
	).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("failed to check name: %w", err)
	}
	if exists {
		return nil, ErrCharacterNameExists
	}

	gender := req.Gender
	if gender == "" {
		gender = "male"
	}

	// Create character with DB column names
	character := &models.Character{
		ID:         uuid.New(),
		AccountID:  accountID,
		ServerID:   DefaultServerID,
		Name:       req.Name,
		Class:      req.Class,
		Gender:     gender,
		Level:      1,
		Experience: 0,
		Cap:        0,
		HP:         baseStats.HP,
		MaxHP:      baseStats.HP,
		MP:         baseStats.MP,
		MaxMP:      baseStats.MP,
		Attack:     baseStats.Attack,
		Defense:    baseStats.Defense,
		Speed:      baseStats.Speed,
		CritRate:   baseStats.CritRate,
		StatPoints: 0,
		STR:        0,
		AGI:        0,
		INT:        0,
		VIT:        0,
		WIS:        0,
		MapID:      1, // Default starting map
		PositionX:  100,
		PositionY:  100,
		Gold:       1000, // Starting gold
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Insert with correct DB column names
	_, err = s.db.Pool.Exec(ctx, `
		INSERT INTO characters (
			id, account_id, server_id, name, class, gender,
			level, exp, cap_level,
			current_hp, max_hp, current_mp, max_mp,
			total_attack, total_defense, total_speed, total_crit_rate,
			stat_points, str_points, agi_points, int_points, vit_points, wis_points,
			current_map_id, position_x, position_y, gold,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6,
			$7, $8, $9,
			$10, $11, $12, $13,
			$14, $15, $16, $17,
			$18, $19, $20, $21, $22, $23,
			$24, $25, $26, $27,
			$28, $29
		)
	`,
		character.ID, character.AccountID, character.ServerID, character.Name, character.Class, character.Gender,
		character.Level, character.Experience, character.Cap,
		character.HP, character.MaxHP, character.MP, character.MaxMP,
		character.Attack, character.Defense, character.Speed, character.CritRate,
		character.StatPoints, character.STR, character.AGI, character.INT, character.VIT, character.WIS,
		character.MapID, character.PositionX, character.PositionY, character.Gold,
		character.CreatedAt, character.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create character: %w", err)
	}

	return character, nil
}

func (s *CharacterService) GetByAccountID(ctx context.Context, accountID uuid.UUID) ([]*models.Character, error) {
	rows, err := s.db.Pool.Query(ctx, `
		SELECT id, account_id, server_id, name, class, specialization, gender,
		       level, exp, cap_level,
		       current_hp, max_hp, current_mp, max_mp,
		       total_attack, total_defense, total_speed, total_crit_rate,
		       stat_points, str_points, agi_points, int_points, vit_points, wis_points,
		       current_map_id, position_x, position_y, gold, premium_currency,
		       is_online, created_at, updated_at
		FROM characters
		WHERE account_id = $1 AND deleted_at IS NULL
		ORDER BY created_at ASC
	`, accountID)
	if err != nil {
		return nil, fmt.Errorf("failed to query characters: %w", err)
	}
	defer rows.Close()

	var characters []*models.Character
	for rows.Next() {
		var c models.Character
		var mapID *int
		err := rows.Scan(
			&c.ID, &c.AccountID, &c.ServerID, &c.Name, &c.Class, &c.Specialization, &c.Gender,
			&c.Level, &c.Experience, &c.Cap,
			&c.HP, &c.MaxHP, &c.MP, &c.MaxMP,
			&c.Attack, &c.Defense, &c.Speed, &c.CritRate,
			&c.StatPoints, &c.STR, &c.AGI, &c.INT, &c.VIT, &c.WIS,
			&mapID, &c.PositionX, &c.PositionY, &c.Gold, &c.PremiumGems,
			&c.IsOnline, &c.CreatedAt, &c.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan character: %w", err)
		}
		if mapID != nil {
			c.MapID = *mapID
		}
		characters = append(characters, &c)
	}

	return characters, nil
}

func (s *CharacterService) GetByID(ctx context.Context, characterID uuid.UUID) (*models.Character, error) {
	var c models.Character
	var mapID *int
	err := s.db.Pool.QueryRow(ctx, `
		SELECT id, account_id, server_id, name, class, specialization, gender,
		       level, exp, cap_level,
		       current_hp, max_hp, current_mp, max_mp,
		       total_attack, total_defense, total_speed, total_crit_rate,
		       stat_points, str_points, agi_points, int_points, vit_points, wis_points,
		       current_map_id, position_x, position_y, gold, premium_currency,
		       is_online, created_at, updated_at
		FROM characters
		WHERE id = $1 AND deleted_at IS NULL
	`, characterID).Scan(
		&c.ID, &c.AccountID, &c.ServerID, &c.Name, &c.Class, &c.Specialization, &c.Gender,
		&c.Level, &c.Experience, &c.Cap,
		&c.HP, &c.MaxHP, &c.MP, &c.MaxMP,
		&c.Attack, &c.Defense, &c.Speed, &c.CritRate,
		&c.StatPoints, &c.STR, &c.AGI, &c.INT, &c.VIT, &c.WIS,
		&mapID, &c.PositionX, &c.PositionY, &c.Gold, &c.PremiumGems,
		&c.IsOnline, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		return nil, ErrCharacterNotFound
	}
	if mapID != nil {
		c.MapID = *mapID
	}
	return &c, nil
}

func (s *CharacterService) Delete(ctx context.Context, accountID, characterID uuid.UUID) error {
	result, err := s.db.Pool.Exec(ctx, `
		UPDATE characters SET deleted_at = $1
		WHERE id = $2 AND account_id = $3 AND deleted_at IS NULL
	`, time.Now(), characterID, accountID)
	if err != nil {
		return fmt.Errorf("failed to delete character: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrCharacterNotFound
	}
	return nil
}
