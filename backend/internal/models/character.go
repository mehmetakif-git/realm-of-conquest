package models

import (
	"time"

	"github.com/google/uuid"
)

type CharacterClass string

const (
	ClassWarrior CharacterClass = "warrior"
	ClassArcher  CharacterClass = "archer"
	ClassMage    CharacterClass = "mage"
	ClassHealer  CharacterClass = "healer"
	ClassNinja   CharacterClass = "ninja"
)

type Specialization string

const (
	// Warrior specs
	SpecBerserker Specialization = "berserker"
	SpecPaladin   Specialization = "paladin"
	// Archer specs
	SpecSharpshooter Specialization = "sharpshooter"
	SpecTrapper      Specialization = "trapper"
	// Mage specs
	SpecDarkMage     Specialization = "dark_mage"
	SpecElementalist Specialization = "elementalist"
	// Healer specs
	SpecDruid  Specialization = "druid"
	SpecPriest Specialization = "priest"
	// Ninja specs
	SpecAssassin     Specialization = "assassin"
	SpecShadowDancer Specialization = "shadow_dancer"
)

type Character struct {
	ID             uuid.UUID       `json:"id"`
	AccountID      uuid.UUID       `json:"account_id"`
	ServerID       int             `json:"server_id"`
	Name           string          `json:"name"`
	Class          CharacterClass  `json:"class"`
	Specialization *Specialization `json:"specialization,omitempty"`
	Gender         string          `json:"gender"`
	Level          int             `json:"level"`
	Experience     int64           `json:"experience"` // DB: exp
	Cap            int             `json:"cap"`        // DB: cap_level

	// HP/MP - DB uses current_hp, current_mp, max_hp, max_mp
	HP    int `json:"hp"`
	MaxHP int `json:"max_hp"`
	MP    int `json:"mp"`
	MaxMP int `json:"max_mp"`

	// Stat Points - DB uses str_points, agi_points, etc.
	StatPoints int `json:"stat_points"`
	STR        int `json:"str"`
	AGI        int `json:"agi"`
	INT        int `json:"int"`
	VIT        int `json:"vit"`
	WIS        int `json:"wis"`

	// Computed Stats - DB uses total_attack, total_defense, etc.
	Attack   int     `json:"attack"`
	Defense  int     `json:"defense"`
	Speed    int     `json:"speed"`
	CritRate float64 `json:"crit_rate"`

	// Position - DB uses current_map_id (INTEGER)
	MapID     int `json:"map_id"`
	PositionX int `json:"position_x"`
	PositionY int `json:"position_y"`

	// Currency
	Gold        int64 `json:"gold"`
	PremiumGems int   `json:"premium_gems"` // DB: premium_currency

	// Status
	IsOnline  bool       `json:"is_online"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

type CreateCharacterRequest struct {
	Name   string         `json:"name"`
	Class  CharacterClass `json:"class"`
	Gender string         `json:"gender,omitempty"`
}

// Base stats for each class
var ClassBaseStats = map[CharacterClass]struct {
	HP       int
	MP       int
	Attack   int
	Defense  int
	Speed    int
	CritRate float64
}{
	ClassWarrior: {HP: 120, MP: 40, Attack: 25, Defense: 30, Speed: 10, CritRate: 5.0},
	ClassArcher:  {HP: 80, MP: 60, Attack: 30, Defense: 15, Speed: 20, CritRate: 15.0},
	ClassMage:    {HP: 60, MP: 120, Attack: 40, Defense: 10, Speed: 12, CritRate: 10.0},
	ClassHealer:  {HP: 90, MP: 100, Attack: 15, Defense: 20, Speed: 15, CritRate: 5.0},
	ClassNinja:   {HP: 70, MP: 70, Attack: 35, Defense: 12, Speed: 30, CritRate: 25.0},
}
