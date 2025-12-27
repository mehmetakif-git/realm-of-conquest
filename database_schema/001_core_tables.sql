-- ============================================================
-- REALM OF CONQUEST - DATABASE SCHEMA
-- Migration 001: Core Tables (Users, Characters, Classes)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE class_type AS ENUM ('warrior', 'archer', 'mage', 'healer', 'ninja');
CREATE TYPE specialization_type AS ENUM (
    'berserker', 'paladin',           -- Warrior
    'sharpshooter', 'trapper',        -- Archer
    'dark_mage', 'elementalist',      -- Mage
    'druid', 'priest',                -- Healer
    'assassin', 'shadow_dancer'       -- Ninja
);
CREATE TYPE flag_type AS ENUM ('red', 'blue');
CREATE TYPE item_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic');
CREATE TYPE item_type AS ENUM ('weapon', 'armor', 'accessory', 'consumable', 'material', 'gem', 'pet_item', 'mount_item', 'cosmetic');
CREATE TYPE equipment_slot AS ENUM ('weapon', 'offhand', 'helmet', 'chest', 'gloves', 'boots', 'necklace', 'ring1', 'ring2', 'belt', 'cape');
CREATE TYPE guild_specialization AS ENUM (
    'warrior_guild', 'protector_guild', 'bandit_guild', 'dungeon_guild', 
    'fisher_guild', 'miner_guild', 'crafter_guild', 'merchant_guild',
    'peace_guild', 'prisoner_guild'
);
CREATE TYPE guild_relation_type AS ENUM ('ally', 'enemy');
CREATE TYPE trade_status AS ENUM ('pending', 'completed', 'cancelled', 'expired');
CREATE TYPE caravan_status AS ENUM ('preparing', 'traveling', 'under_attack', 'completed', 'failed', 'destroyed');
CREATE TYPE dungeon_difficulty AS ENUM ('normal', 'hard', 'nightmare', 'hell');
CREATE TYPE prison_activity AS ENUM ('mining', 'fishing', 'pvp', 'arena', 'escape', 'boss');

-- ============================================================
-- SECTION 1: USER & ACCOUNT TABLES
-- ============================================================

-- 1.1 Ana Hesap Tablosu
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    
    -- Doğrulama
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    phone_verified_at TIMESTAMPTZ,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    
    -- Güvenlik
    trust_score INTEGER DEFAULT 200 CHECK (trust_score >= 0 AND trust_score <= 1000),
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    ban_expires_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    
    -- Premium
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMPTZ,
    total_spent_cents INTEGER DEFAULT 0,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_username ON accounts(username);
CREATE INDEX idx_accounts_trust ON accounts(trust_score);
CREATE INDEX idx_accounts_banned ON accounts(is_banned) WHERE is_banned = TRUE;

-- 1.2 Oturum Tablosu
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    
    device_fingerprint VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_account ON sessions(account_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_active ON sessions(is_active) WHERE is_active = TRUE;

-- 1.3 Cihaz Takip Tablosu
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    
    fingerprint VARCHAR(255) NOT NULL,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    screen_resolution VARCHAR(20),
    timezone VARCHAR(50),
    language VARCHAR(10),
    
    is_trusted BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(account_id, fingerprint)
);

CREATE INDEX idx_devices_fingerprint ON devices(fingerprint);
CREATE INDEX idx_devices_account ON devices(account_id);

-- 1.4 IP Geçmişi
CREATE TABLE ip_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    
    ip_address INET NOT NULL,
    is_vpn BOOLEAN DEFAULT FALSE,
    is_proxy BOOLEAN DEFAULT FALSE,
    country_code VARCHAR(2),
    city VARCHAR(100),
    isp VARCHAR(255),
    
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    login_count INTEGER DEFAULT 1
);

CREATE INDEX idx_ip_history_account ON ip_history(account_id);
CREATE INDEX idx_ip_history_ip ON ip_history(ip_address);

-- 1.5 Günlük Giriş Ödülleri
CREATE TABLE daily_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID UNIQUE NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_claim_date DATE,
    total_claims INTEGER DEFAULT 0,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 2: SERVER & MAP TABLES
-- ============================================================

-- 2.1 Sunucular
CREATE TABLE servers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    region VARCHAR(50) NOT NULL,
    
    max_players INTEGER DEFAULT 5000,
    current_players INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    is_maintenance BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Haritalar
CREATE TABLE maps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    min_level INTEGER DEFAULT 1,
    max_level INTEGER DEFAULT 120,
    min_gear_score INTEGER DEFAULT 0,
    
    is_safe_zone BOOLEAN DEFAULT FALSE,
    is_pvp_enabled BOOLEAN DEFAULT TRUE,
    exp_multiplier DECIMAL(3,2) DEFAULT 1.00,
    drop_multiplier DECIMAL(3,2) DEFAULT 1.00,
    
    -- Bölge kontrolü
    is_controllable BOOLEAN DEFAULT FALSE,
    controlling_guild_id UUID,
    tax_rate DECIMAL(4,2) DEFAULT 0.00,
    
    -- Harita boyutu
    width INTEGER DEFAULT 1000,
    height INTEGER DEFAULT 1000,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Harita Bölgeleri (Kontrol Edilebilir)
CREATE TABLE map_zones (
    id SERIAL PRIMARY KEY,
    map_id INTEGER NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    
    zone_type VARCHAR(50), -- 'farm', 'mine', 'fish', 'dungeon_entrance', 'caravan_route'
    
    x_min INTEGER NOT NULL,
    y_min INTEGER NOT NULL,
    x_max INTEGER NOT NULL,
    y_max INTEGER NOT NULL,
    
    is_controllable BOOLEAN DEFAULT FALSE,
    controlling_guild_id UUID,
    
    -- Bölgeye özel oranlar
    bonus_exp DECIMAL(4,2) DEFAULT 0.00,
    bonus_drop DECIMAL(4,2) DEFAULT 0.00
);

CREATE INDEX idx_map_zones_map ON map_zones(map_id);

-- ============================================================
-- SECTION 3: CHARACTER TABLES
-- ============================================================

-- 3.1 Karakterler
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    server_id INTEGER NOT NULL REFERENCES servers(id),
    
    -- Temel Bilgiler
    name VARCHAR(50) NOT NULL,
    class class_type NOT NULL,
    specialization specialization_type,
    gender VARCHAR(10) DEFAULT 'male',
    
    -- Seviye ve EXP
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 120),
    exp BIGINT DEFAULT 0,
    cap_level INTEGER DEFAULT 0,
    
    -- HP/MP
    current_hp INTEGER NOT NULL DEFAULT 100,
    max_hp INTEGER NOT NULL DEFAULT 100,
    current_mp INTEGER NOT NULL DEFAULT 50,
    max_mp INTEGER NOT NULL DEFAULT 50,
    
    -- Dağıtılabilir Stat Puanları
    stat_points INTEGER DEFAULT 0,
    str_points INTEGER DEFAULT 0,
    agi_points INTEGER DEFAULT 0,
    int_points INTEGER DEFAULT 0,
    vit_points INTEGER DEFAULT 0,
    wis_points INTEGER DEFAULT 0,
    
    -- Hesaplanmış Statlar (Cache - trigger ile güncellenir)
    total_attack INTEGER DEFAULT 10,
    total_defense INTEGER DEFAULT 10,
    total_magic_attack INTEGER DEFAULT 10,
    total_magic_defense INTEGER DEFAULT 10,
    total_speed INTEGER DEFAULT 10,
    total_crit_rate DECIMAL(5,2) DEFAULT 5.00,
    total_crit_damage DECIMAL(5,2) DEFAULT 150.00,
    total_dodge_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Skill Puanları
    skill_points INTEGER DEFAULT 0,
    
    -- Ekonomi
    gold BIGINT DEFAULT 100 CHECK (gold >= 0),
    premium_currency INTEGER DEFAULT 0 CHECK (premium_currency >= 0),
    
    -- Konum
    current_map_id INTEGER DEFAULT 1 REFERENCES maps(id),
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    bound_map_id INTEGER REFERENCES maps(id), -- Respawn noktası
    
    -- Puşe Durumu
    flag flag_type,
    flag_started_at TIMESTAMPTZ,
    flag_expires_at TIMESTAMPTZ,
    
    -- Karma ve Infamy
    karma INTEGER DEFAULT 0,
    infamy INTEGER DEFAULT 0,
    
    -- Unvanlar
    title VARCHAR(100),
    title_id INTEGER,
    
    -- Online Durumu
    is_online BOOLEAN DEFAULT FALSE,
    last_online_at TIMESTAMPTZ DEFAULT NOW(),
    total_play_time_minutes INTEGER DEFAULT 0,
    
    -- AFK Durumu
    is_afk_farming BOOLEAN DEFAULT FALSE,
    afk_started_at TIMESTAMPTZ,
    afk_map_id INTEGER REFERENCES maps(id),
    afk_minutes_today INTEGER DEFAULT 0,
    
    -- Gear Score (Cache)
    gear_score INTEGER DEFAULT 0,
    
    -- Prison
    is_in_prison BOOLEAN DEFAULT FALSE,
    prison_release_at TIMESTAMPTZ,
    prison_reason TEXT,
    
    -- Lonca
    guild_id UUID,
    guild_rank VARCHAR(50),
    guild_joined_at TIMESTAMPTZ,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    UNIQUE(server_id, name)
);

CREATE INDEX idx_characters_account ON characters(account_id);
CREATE INDEX idx_characters_server ON characters(server_id);
CREATE INDEX idx_characters_server_level ON characters(server_id, level);
CREATE INDEX idx_characters_class ON characters(class);
CREATE INDEX idx_characters_online ON characters(is_online) WHERE is_online = TRUE;
CREATE INDEX idx_characters_map ON characters(current_map_id);
CREATE INDEX idx_characters_guild ON characters(guild_id) WHERE guild_id IS NOT NULL;
CREATE INDEX idx_characters_prison ON characters(is_in_prison) WHERE is_in_prison = TRUE;

-- 3.2 Karakter Skill'leri
CREATE TABLE character_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    skill_id INTEGER NOT NULL,
    skill_level INTEGER DEFAULT 1 CHECK (skill_level >= 1 AND skill_level <= 10),
    slot_number INTEGER CHECK (slot_number >= 1 AND slot_number <= 6),
    
    is_unlocked BOOLEAN DEFAULT TRUE,
    cooldown_ends_at TIMESTAMPTZ,
    
    UNIQUE(character_id, skill_id)
);

CREATE INDEX idx_character_skills_char ON character_skills(character_id);

-- 3.3 Karakter İstatistikleri (Achievements için)
CREATE TABLE character_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID UNIQUE NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    -- Savaş
    total_monsters_killed BIGINT DEFAULT 0,
    total_bosses_killed INTEGER DEFAULT 0,
    total_players_killed INTEGER DEFAULT 0,
    total_deaths INTEGER DEFAULT 0,
    total_damage_dealt BIGINT DEFAULT 0,
    total_damage_taken BIGINT DEFAULT 0,
    total_healing_done BIGINT DEFAULT 0,
    
    -- Dungeon
    dungeons_completed INTEGER DEFAULT 0,
    dungeons_failed INTEGER DEFAULT 0,
    
    -- Kervan
    caravans_completed INTEGER DEFAULT 0,
    caravans_protected INTEGER DEFAULT 0,
    caravans_raided INTEGER DEFAULT 0,
    caravans_lost INTEGER DEFAULT 0,
    
    -- Ekonomi
    total_gold_earned BIGINT DEFAULT 0,
    total_gold_spent BIGINT DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    
    -- Meslek
    total_fish_caught INTEGER DEFAULT 0,
    total_ore_mined INTEGER DEFAULT 0,
    total_items_crafted INTEGER DEFAULT 0,
    
    -- Sosyal
    total_party_time_minutes INTEGER DEFAULT 0,
    total_guild_contributions BIGINT DEFAULT 0,
    
    -- Prison
    total_prison_time_minutes INTEGER DEFAULT 0,
    successful_escapes INTEGER DEFAULT 0,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Karakter Cooldown'ları
CREATE TABLE character_cooldowns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    cooldown_type VARCHAR(50) NOT NULL, -- 'dungeon_entry', 'caravan', 'taxi_driver', 'taxi_passenger', etc.
    reference_id VARCHAR(100), -- Spesifik dungeon ID vs.
    
    uses_today INTEGER DEFAULT 0,
    max_uses_daily INTEGER,
    last_used_at TIMESTAMPTZ,
    resets_at TIMESTAMPTZ,
    
    UNIQUE(character_id, cooldown_type, reference_id)
);

CREATE INDEX idx_character_cooldowns_char ON character_cooldowns(character_id);
