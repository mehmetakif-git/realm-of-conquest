-- ============================================================
-- REALM OF CONQUEST - DATABASE SCHEMA
-- Migration 005: Fishing, Mining, Prison, Pet & Mount Systems
-- ============================================================

-- ============================================================
-- SECTION 11: FISHING SYSTEM
-- ============================================================

-- 11.1 Balık Noktaları
CREATE TABLE fishing_spots (
    id SERIAL PRIMARY KEY,
    map_id INTEGER NOT NULL REFERENCES maps(id),
    name VARCHAR(100) NOT NULL,
    
    -- Konum
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    radius INTEGER DEFAULT 50,
    
    -- Tip
    zone_type VARCHAR(20) DEFAULT 'safe', -- 'safe', 'contested', 'wild', 'dark'
    pvp_attacker_debuff DECIMAL(4,2) DEFAULT 0.40, -- %40 debuff
    
    -- Balık kalitesi
    min_rarity item_rarity DEFAULT 'common',
    max_rarity item_rarity DEFAULT 'rare',
    rare_chance_bonus DECIMAL(4,2) DEFAULT 0.00,
    
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_fishing_spots_map ON fishing_spots(map_id);

-- 11.2 Balık Tanımları
CREATE TABLE fish_definitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    
    rarity item_rarity DEFAULT 'common',
    
    -- Balık tutma
    required_fishing_level INTEGER DEFAULT 1,
    base_catch_time_seconds INTEGER DEFAULT 10,
    
    -- Değer
    sell_price INTEGER DEFAULT 0,
    
    -- Yemek yapımı için
    is_cookable BOOLEAN DEFAULT TRUE,
    buff_type VARCHAR(50),
    buff_value INTEGER,
    buff_duration_minutes INTEGER,
    
    -- Hangi bölgelerde
    spawn_zones VARCHAR(20)[] DEFAULT ARRAY['safe'], -- ['safe', 'contested', 'wild', 'dark']
    
    is_active BOOLEAN DEFAULT TRUE
);

-- 11.3 Karakter Balıkçılık Durumu
CREATE TABLE character_fishing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID UNIQUE NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    fishing_level INTEGER DEFAULT 1,
    fishing_exp INTEGER DEFAULT 0,
    
    -- Ekipman
    equipped_rod_id UUID REFERENCES character_inventory(id),
    equipped_bait_id UUID REFERENCES character_inventory(id),
    
    -- İstatistikler
    total_fish_caught INTEGER DEFAULT 0,
    rare_fish_caught INTEGER DEFAULT 0,
    legendary_fish_caught INTEGER DEFAULT 0,
    
    -- Aktif balık tutma
    is_fishing BOOLEAN DEFAULT FALSE,
    current_spot_id INTEGER REFERENCES fishing_spots(id),
    fishing_started_at TIMESTAMPTZ,
    next_catch_at TIMESTAMPTZ,
    
    -- AFK
    afk_fish_caught_today INTEGER DEFAULT 0,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11.4 Balık Tutma Geçmişi
CREATE TABLE fishing_catches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    fish_id INTEGER NOT NULL REFERENCES fish_definitions(id),
    spot_id INTEGER NOT NULL REFERENCES fishing_spots(id),
    
    quantity INTEGER DEFAULT 1,
    was_mini_game_bonus BOOLEAN DEFAULT FALSE,
    
    caught_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fishing_catches_character ON fishing_catches(character_id);
CREATE INDEX idx_fishing_catches_date ON fishing_catches(caught_at);

-- ============================================================
-- SECTION 12: MINING SYSTEM
-- ============================================================

-- 12.1 Maden Noktaları
CREATE TABLE mining_nodes (
    id SERIAL PRIMARY KEY,
    map_id INTEGER NOT NULL REFERENCES maps(id),
    name VARCHAR(100) NOT NULL,
    
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    radius INTEGER DEFAULT 30,
    
    -- Tip
    zone_type VARCHAR(20) DEFAULT 'safe',
    pvp_attacker_debuff DECIMAL(4,2) DEFAULT 0.40,
    
    -- Cevher kalitesi
    min_rarity item_rarity DEFAULT 'common',
    max_rarity item_rarity DEFAULT 'rare',
    rare_chance_bonus DECIMAL(4,2) DEFAULT 0.00,
    
    -- Respawn
    respawn_time_seconds INTEGER DEFAULT 300,
    current_resources INTEGER DEFAULT 100,
    max_resources INTEGER DEFAULT 100,
    
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_mining_nodes_map ON mining_nodes(map_id);

-- 12.2 Cevher Tanımları
CREATE TABLE ore_definitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    
    rarity item_rarity DEFAULT 'common',
    
    required_mining_level INTEGER DEFAULT 1,
    base_mine_time_seconds INTEGER DEFAULT 15,
    
    sell_price INTEGER DEFAULT 0,
    
    -- Craft için
    is_smeltable BOOLEAN DEFAULT TRUE,
    smelts_into_id INTEGER REFERENCES item_definitions(id),
    smelt_quantity INTEGER DEFAULT 1,
    
    spawn_zones VARCHAR(20)[] DEFAULT ARRAY['safe'],
    
    is_active BOOLEAN DEFAULT TRUE
);

-- 12.3 Karakter Madencilik Durumu
CREATE TABLE character_mining (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID UNIQUE NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    mining_level INTEGER DEFAULT 1,
    mining_exp INTEGER DEFAULT 0,
    
    equipped_pickaxe_id UUID REFERENCES character_inventory(id),
    
    total_ore_mined INTEGER DEFAULT 0,
    rare_ore_mined INTEGER DEFAULT 0,
    
    is_mining BOOLEAN DEFAULT FALSE,
    current_node_id INTEGER REFERENCES mining_nodes(id),
    mining_started_at TIMESTAMPTZ,
    next_mine_at TIMESTAMPTZ,
    
    afk_ore_mined_today INTEGER DEFAULT 0,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 13: PRISON SYSTEM
-- ============================================================

-- 13.1 Hapishane Kayıtları
CREATE TABLE prison_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    server_id INTEGER NOT NULL REFERENCES servers(id),
    
    -- Sebep
    reason VARCHAR(50) NOT NULL, -- 'pvp_loss_streak', 'caravan_fail', 'high_infamy', 'city_pvp', 'cheat', 'voluntary'
    reason_details TEXT,
    
    -- Süre
    sentence_minutes INTEGER NOT NULL,
    time_served_minutes INTEGER DEFAULT 0,
    
    -- Zamanlama
    entered_at TIMESTAMPTZ DEFAULT NOW(),
    release_at TIMESTAMPTZ NOT NULL,
    released_at TIMESTAMPTZ,
    
    -- Erken çıkış
    escaped BOOLEAN DEFAULT FALSE,
    escape_attempts INTEGER DEFAULT 0,
    
    -- Karma temizleme
    karma_cleared INTEGER DEFAULT 0
);

CREATE INDEX idx_prison_records_character ON prison_records(character_id);
CREATE INDEX idx_prison_records_active ON prison_records(character_id, released_at) WHERE released_at IS NULL;

-- 13.2 Hapishane Aktiviteleri
CREATE TABLE prison_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    prison_record_id UUID NOT NULL REFERENCES prison_records(id) ON DELETE CASCADE,
    
    activity_type prison_activity NOT NULL,
    
    -- Kazanımlar
    ore_mined INTEGER DEFAULT 0,
    fish_caught INTEGER DEFAULT 0,
    pvp_kills INTEGER DEFAULT 0,
    pvp_deaths INTEGER DEFAULT 0,
    arena_wins INTEGER DEFAULT 0,
    escape_progress INTEGER DEFAULT 0,
    boss_damage BIGINT DEFAULT 0,
    
    -- Ödüller
    items_earned JSONB DEFAULT '[]',
    exp_earned INTEGER DEFAULT 0,
    
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE INDEX idx_prison_activities_character ON prison_activities(character_id);
CREATE INDEX idx_prison_activities_record ON prison_activities(prison_record_id);

-- 13.3 Hapishane PvP Sıralaması
CREATE TABLE prison_pvp_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    
    -- Haftalık sıfırlanır
    week_start DATE NOT NULL,
    
    -- Unvan
    current_rank INTEGER,
    title VARCHAR(50), -- 'Avlu Kralı', 'Gardiyan', 'Kabadayı'
    
    UNIQUE(server_id, character_id, week_start)
);

-- 13.4 Hapishane Kaçış Eventleri
CREATE TABLE prison_escape_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ NOT NULL,
    
    -- Katılımcılar
    total_participants INTEGER DEFAULT 0,
    successful_escapes INTEGER DEFAULT 0
);

-- 13.5 Kaçış Katılımcıları
CREATE TABLE prison_escape_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES prison_escape_events(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id),
    
    -- İlerleme
    stage_reached INTEGER DEFAULT 0, -- 0: Tünel, 1: Engeller, 2: Boss, 3: Çıkış
    
    success BOOLEAN,
    boss_defeated BOOLEAN DEFAULT FALSE,
    
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    UNIQUE(event_id, character_id)
);

-- ============================================================
-- SECTION 14: PET SYSTEM
-- ============================================================

-- 14.1 Pet Tanımları
CREATE TABLE pet_definitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    model_id VARCHAR(100),
    
    rarity item_rarity DEFAULT 'common',
    
    -- Base bonuslar
    exp_bonus DECIMAL(5,2) DEFAULT 0.00,
    drop_bonus DECIMAL(5,2) DEFAULT 0.00,
    gold_bonus DECIMAL(5,2) DEFAULT 0.00,
    
    -- Statlar
    bonus_attack INTEGER DEFAULT 0,
    bonus_defense INTEGER DEFAULT 0,
    bonus_hp INTEGER DEFAULT 0,
    
    -- Skill
    passive_skill_id INTEGER,
    active_skill_id INTEGER,
    
    -- Evrim
    can_evolve BOOLEAN DEFAULT FALSE,
    evolves_into_id INTEGER REFERENCES pet_definitions(id),
    evolution_level INTEGER,
    evolution_material_id INTEGER REFERENCES item_definitions(id),
    
    -- Elde etme
    obtainable_from VARCHAR(50), -- 'drop', 'craft', 'event', 'shop'
    
    is_active BOOLEAN DEFAULT TRUE
);

-- 14.2 Karakter Petleri
CREATE TABLE character_pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    pet_definition_id INTEGER NOT NULL REFERENCES pet_definitions(id),
    
    nickname VARCHAR(50),
    
    -- Seviye
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    
    -- Açlık
    hunger INTEGER DEFAULT 100 CHECK (hunger >= 0 AND hunger <= 100),
    last_fed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Mutluluk
    happiness INTEGER DEFAULT 100 CHECK (happiness >= 0 AND happiness <= 100),
    
    -- Durum
    is_active BOOLEAN DEFAULT FALSE, -- Aktif pet mi
    is_summoned BOOLEAN DEFAULT FALSE,
    
    obtained_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_character_pets_character ON character_pets(character_id);
CREATE INDEX idx_character_pets_active ON character_pets(character_id, is_active) WHERE is_active = TRUE;

-- ============================================================
-- SECTION 15: MOUNT SYSTEM
-- ============================================================

-- 15.1 Mount Tanımları
CREATE TABLE mount_definitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    model_id VARCHAR(100),
    
    rarity item_rarity DEFAULT 'common',
    
    -- Hız bonusu
    speed_bonus DECIMAL(5,2) DEFAULT 20.00,
    
    -- Statlar
    bonus_hp INTEGER DEFAULT 0,
    bonus_defense INTEGER DEFAULT 0,
    
    -- Özel yetenek
    can_fly BOOLEAN DEFAULT FALSE,
    special_skill_id INTEGER,
    
    -- Elde etme
    obtainable_from VARCHAR(50),
    
    is_active BOOLEAN DEFAULT TRUE
);

-- 15.2 Karakter Mountları
CREATE TABLE character_mounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    mount_definition_id INTEGER NOT NULL REFERENCES mount_definitions(id),
    
    nickname VARCHAR(50),
    
    -- Seviye
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    
    -- Ekipman
    armor_id UUID REFERENCES character_inventory(id),
    saddle_id UUID REFERENCES character_inventory(id),
    
    -- Durum
    is_active BOOLEAN DEFAULT FALSE,
    is_mounted BOOLEAN DEFAULT FALSE,
    
    -- Dayanıklılık
    stamina INTEGER DEFAULT 100,
    
    obtained_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_character_mounts_character ON character_mounts(character_id);
CREATE INDEX idx_character_mounts_active ON character_mounts(character_id, is_active) WHERE is_active = TRUE;

-- ============================================================
-- SECTION 16: HOUSING SYSTEM
-- ============================================================

-- 16.1 Ev Tipleri
CREATE TABLE house_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    price INTEGER DEFAULT 0,
    
    -- Slot sayısı
    furniture_slots INTEGER DEFAULT 5,
    storage_slots INTEGER DEFAULT 10,
    
    -- Özellikler
    has_workshop BOOLEAN DEFAULT FALSE,
    has_garden BOOLEAN DEFAULT FALSE,
    has_training_dummy BOOLEAN DEFAULT FALSE,
    has_trophy_room BOOLEAN DEFAULT FALSE,
    
    -- Bonuslar
    rested_exp_bonus DECIMAL(4,2) DEFAULT 0.00,
    offline_exp_per_hour INTEGER DEFAULT 0
);

-- Başlangıç verisi
INSERT INTO house_types (name, price, furniture_slots, storage_slots, has_workshop, has_garden, rested_exp_bonus) VALUES
('Kulübe', 0, 5, 10, FALSE, FALSE, 0.05),
('Ev', 10000, 15, 25, FALSE, FALSE, 0.10),
('Malikane', 100000, 30, 50, TRUE, TRUE, 0.15),
('Şato', 1000000, 50, 100, TRUE, TRUE, 0.20),
('Saray', 10000000, 100, 200, TRUE, TRUE, 0.25);

-- 16.2 Karakter Evleri
CREATE TABLE character_houses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    house_type_id INTEGER NOT NULL REFERENCES house_types(id),
    
    -- Özelleştirme
    custom_name VARCHAR(100),
    
    -- Ziyaret
    is_public BOOLEAN DEFAULT FALSE,
    total_visitors INTEGER DEFAULT 0,
    
    -- Bahçe
    garden_plots JSONB DEFAULT '[]', -- [{"slot": 1, "plant_id": 5, "planted_at": "...", "harvest_at": "..."}]
    
    -- Eğitim kuklası
    dummy_exp_generated INTEGER DEFAULT 0,
    last_dummy_claim_at TIMESTAMPTZ,
    
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(character_id)
);

-- 16.3 Ev Mobilyaları
CREATE TABLE house_furniture (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID NOT NULL REFERENCES character_houses(id) ON DELETE CASCADE,
    furniture_item_id INTEGER NOT NULL REFERENCES item_definitions(id),
    
    slot_number INTEGER NOT NULL,
    position_x INTEGER,
    position_y INTEGER,
    rotation INTEGER DEFAULT 0,
    
    placed_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(house_id, slot_number)
);

-- ============================================================
-- SECTION 17: BATTLE PASS & SEASON
-- ============================================================

-- 17.1 Sezonlar
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    theme VARCHAR(100),
    description TEXT,
    
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    
    -- Battle Pass
    max_level INTEGER DEFAULT 100,
    premium_price INTEGER DEFAULT 0, -- Premium currency
    
    is_active BOOLEAN DEFAULT FALSE
);

-- 17.2 Battle Pass Ödülleri
CREATE TABLE battle_pass_rewards (
    id SERIAL PRIMARY KEY,
    season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    
    level INTEGER NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    
    -- Ödül
    reward_type VARCHAR(50) NOT NULL, -- 'item', 'gold', 'exp', 'title', 'cosmetic'
    reward_id INTEGER, -- item_definition_id veya başka ID
    reward_quantity INTEGER DEFAULT 1,
    
    UNIQUE(season_id, level, is_premium)
);

CREATE INDEX idx_bp_rewards_season ON battle_pass_rewards(season_id);

-- 17.3 Karakter Battle Pass İlerlemesi
CREATE TABLE character_battle_pass (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    season_id INTEGER NOT NULL REFERENCES seasons(id),
    
    current_level INTEGER DEFAULT 1,
    current_exp INTEGER DEFAULT 0,
    
    is_premium BOOLEAN DEFAULT FALSE,
    premium_purchased_at TIMESTAMPTZ,
    
    -- Claim edilmiş ödüller
    claimed_free_levels INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    claimed_premium_levels INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    
    UNIQUE(character_id, season_id)
);

-- 17.4 Sezon Görevleri
CREATE TABLE season_quests (
    id SERIAL PRIMARY KEY,
    season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    
    quest_type VARCHAR(20) DEFAULT 'daily', -- 'daily', 'weekly', 'season'
    
    description TEXT NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- 'kill_monsters', 'complete_dungeons', etc.
    target_count INTEGER NOT NULL,
    
    exp_reward INTEGER NOT NULL,
    
    is_active BOOLEAN DEFAULT TRUE
);

-- 17.5 Karakter Sezon Görev İlerlemesi
CREATE TABLE character_season_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    quest_id INTEGER NOT NULL REFERENCES season_quests(id),
    
    current_count INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    is_claimed BOOLEAN DEFAULT FALSE,
    
    -- Günlük/Haftalık reset için
    reset_date DATE,
    
    UNIQUE(character_id, quest_id, reset_date)
);

-- ============================================================
-- SECTION 18: ACHIEVEMENTS
-- ============================================================

-- 18.1 Achievement Tanımları
CREATE TABLE achievement_definitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    
    category VARCHAR(50) NOT NULL, -- 'combat', 'economy', 'dungeon', 'social', 'profession'
    
    -- Hedef
    target_type VARCHAR(50) NOT NULL,
    target_count INTEGER NOT NULL,
    
    -- Kademeli mi
    tier INTEGER DEFAULT 1, -- 1, 2, 3, 4, 5
    previous_tier_id INTEGER REFERENCES achievement_definitions(id),
    
    -- Ödül
    reward_title VARCHAR(100),
    reward_stat_type VARCHAR(50),
    reward_stat_value INTEGER,
    reward_item_id INTEGER REFERENCES item_definitions(id),
    
    achievement_points INTEGER DEFAULT 10,
    
    is_hidden BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- 18.2 Karakter Achievementları
CREATE TABLE character_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievement_definitions(id),
    
    current_count INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    is_claimed BOOLEAN DEFAULT FALSE,
    
    completed_at TIMESTAMPTZ,
    
    UNIQUE(character_id, achievement_id)
);

CREATE INDEX idx_char_achievements_character ON character_achievements(character_id);
