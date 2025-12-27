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
-- ============================================================
-- REALM OF CONQUEST - DATABASE SCHEMA
-- Migration 002: Items, Equipment & Inventory
-- ============================================================

-- ============================================================
-- SECTION 4: ITEM DEFINITIONS (Static Data)
-- ============================================================

-- 4.1 Item Tanımları (Master Data)
CREATE TABLE item_definitions (
    id SERIAL PRIMARY KEY,
    
    -- Temel Bilgiler
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    
    -- Tip ve Nadirlik
    item_type item_type NOT NULL,
    rarity item_rarity DEFAULT 'common',
    
    -- Ekipman ise
    equipment_slot equipment_slot,
    required_level INTEGER DEFAULT 1,
    required_class class_type[],
    
    -- Base Statlar
    base_attack INTEGER DEFAULT 0,
    base_defense INTEGER DEFAULT 0,
    base_magic_attack INTEGER DEFAULT 0,
    base_magic_defense INTEGER DEFAULT 0,
    base_hp INTEGER DEFAULT 0,
    base_mp INTEGER DEFAULT 0,
    base_speed INTEGER DEFAULT 0,
    base_crit_rate DECIMAL(5,2) DEFAULT 0,
    base_crit_damage DECIMAL(5,2) DEFAULT 0,
    base_dodge_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Upgrade
    max_upgrade_level INTEGER DEFAULT 15,
    max_gem_slots INTEGER DEFAULT 0,
    is_upgradeable BOOLEAN DEFAULT TRUE,
    
    -- Tüketim
    is_consumable BOOLEAN DEFAULT FALSE,
    consumable_effect JSONB, -- {"type": "heal_hp", "value": 100}
    
    -- Stack
    is_stackable BOOLEAN DEFAULT FALSE,
    max_stack INTEGER DEFAULT 1,
    
    -- Ticaret
    is_tradeable BOOLEAN DEFAULT TRUE,
    is_sellable BOOLEAN DEFAULT TRUE,
    sell_price INTEGER DEFAULT 0,
    buy_price INTEGER DEFAULT 0,
    
    -- Binding
    binds_on_pickup BOOLEAN DEFAULT FALSE,
    binds_on_equip BOOLEAN DEFAULT FALSE,
    
    -- Set Parçası
    set_id INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_item_definitions_type ON item_definitions(item_type);
CREATE INDEX idx_item_definitions_rarity ON item_definitions(rarity);
CREATE INDEX idx_item_definitions_slot ON item_definitions(equipment_slot) WHERE equipment_slot IS NOT NULL;

-- 4.2 Item Set Tanımları
CREATE TABLE item_sets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Set Bonusları (JSONB)
    bonus_2pc JSONB, -- {"attack": 10, "defense": 5}
    bonus_3pc JSONB,
    bonus_4pc JSONB,
    bonus_5pc JSONB,
    bonus_6pc JSONB
);

-- 4.3 Gem Tanımları
CREATE TABLE gem_definitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    
    gem_type VARCHAR(50) NOT NULL, -- 'ruby', 'sapphire', 'emerald', 'topaz', 'diamond', 'onyx'
    gem_level INTEGER DEFAULT 1 CHECK (gem_level >= 1 AND gem_level <= 5),
    
    -- Verdiği stat
    stat_type VARCHAR(50) NOT NULL, -- 'attack', 'defense', 'hp', 'mp', 'crit_rate', etc.
    stat_value INTEGER NOT NULL,
    
    -- Birleştirme
    combines_into INTEGER REFERENCES gem_definitions(id),
    combine_count INTEGER DEFAULT 3
);

-- ============================================================
-- SECTION 5: PLAYER INVENTORY & EQUIPMENT
-- ============================================================

-- 5.1 Karakter Envanteri
CREATE TABLE character_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    item_definition_id INTEGER NOT NULL REFERENCES item_definitions(id),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    
    -- Ekipman Durumu
    upgrade_level INTEGER DEFAULT 0,
    current_durability INTEGER,
    max_durability INTEGER,
    
    -- Gem Slotları
    gem_slot_1 INTEGER REFERENCES gem_definitions(id),
    gem_slot_2 INTEGER REFERENCES gem_definitions(id),
    gem_slot_3 INTEGER REFERENCES gem_definitions(id),
    gem_slot_4 INTEGER REFERENCES gem_definitions(id),
    
    -- Binding
    is_bound BOOLEAN DEFAULT FALSE,
    bound_at TIMESTAMPTZ,
    
    -- Envanter Konumu
    slot_number INTEGER,
    is_equipped BOOLEAN DEFAULT FALSE,
    equipped_slot equipment_slot,
    
    -- Özel Statlar (crafted items için)
    bonus_stats JSONB,
    
    -- Kilitleme
    is_locked BOOLEAN DEFAULT FALSE,
    
    obtained_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(character_id, slot_number) -- Her slot'ta sadece 1 item
);

CREATE INDEX idx_inventory_character ON character_inventory(character_id);
CREATE INDEX idx_inventory_item ON character_inventory(item_definition_id);
CREATE INDEX idx_inventory_equipped ON character_inventory(character_id, is_equipped) WHERE is_equipped = TRUE;

-- 5.2 Karakter Ekipman (Hızlı erişim için ayrı tablo)
CREATE TABLE character_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID UNIQUE NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    weapon_id UUID REFERENCES character_inventory(id),
    offhand_id UUID REFERENCES character_inventory(id),
    helmet_id UUID REFERENCES character_inventory(id),
    chest_id UUID REFERENCES character_inventory(id),
    gloves_id UUID REFERENCES character_inventory(id),
    boots_id UUID REFERENCES character_inventory(id),
    necklace_id UUID REFERENCES character_inventory(id),
    ring1_id UUID REFERENCES character_inventory(id),
    ring2_id UUID REFERENCES character_inventory(id),
    belt_id UUID REFERENCES character_inventory(id),
    cape_id UUID REFERENCES character_inventory(id),
    
    -- Kozmetik Override
    costume_id UUID REFERENCES character_inventory(id),
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.3 Depo (Hesap geneli)
CREATE TABLE account_storage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    server_id INTEGER NOT NULL REFERENCES servers(id),
    
    item_definition_id INTEGER NOT NULL REFERENCES item_definitions(id),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    
    -- Ekipman Durumu (envanter ile aynı)
    upgrade_level INTEGER DEFAULT 0,
    gem_slot_1 INTEGER REFERENCES gem_definitions(id),
    gem_slot_2 INTEGER REFERENCES gem_definitions(id),
    gem_slot_3 INTEGER REFERENCES gem_definitions(id),
    gem_slot_4 INTEGER REFERENCES gem_definitions(id),
    is_bound BOOLEAN DEFAULT FALSE,
    bonus_stats JSONB,
    
    slot_number INTEGER NOT NULL,
    
    deposited_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(account_id, server_id, slot_number)
);

CREATE INDEX idx_storage_account ON account_storage(account_id, server_id);

-- 5.4 Upgrade Geçmişi
CREATE TABLE upgrade_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL,
    
    from_level INTEGER NOT NULL,
    to_level INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    
    -- Kullanılan malzemeler
    used_protection_scroll BOOLEAN DEFAULT FALSE,
    used_destruction_scroll BOOLEAN DEFAULT FALSE,
    used_luck_stone BOOLEAN DEFAULT FALSE,
    
    -- Sonuç
    item_destroyed BOOLEAN DEFAULT FALSE,
    gold_spent INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_upgrade_history_character ON upgrade_history(character_id);
CREATE INDEX idx_upgrade_history_date ON upgrade_history(created_at);

-- ============================================================
-- SECTION 6: CRAFTING SYSTEM
-- ============================================================

-- 6.1 Craft Tarifleri
CREATE TABLE craft_recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Sonuç
    result_item_id INTEGER NOT NULL REFERENCES item_definitions(id),
    result_quantity INTEGER DEFAULT 1,
    
    -- Gereksinimler
    required_craft_level INTEGER DEFAULT 1,
    required_class class_type[],
    
    -- Başarı oranı
    base_success_rate DECIMAL(5,2) DEFAULT 100.00,
    
    -- Süre (saniye)
    craft_time_seconds INTEGER DEFAULT 0,
    
    -- Gold maliyeti
    gold_cost INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE
);

-- 6.2 Craft Malzemeleri
CREATE TABLE craft_recipe_materials (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES craft_recipes(id) ON DELETE CASCADE,
    
    item_definition_id INTEGER NOT NULL REFERENCES item_definitions(id),
    quantity INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_craft_materials_recipe ON craft_recipe_materials(recipe_id);

-- 6.3 Karakter Craft Seviyeleri
CREATE TABLE character_craft_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID UNIQUE NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    blacksmith_level INTEGER DEFAULT 1,
    blacksmith_exp INTEGER DEFAULT 0,
    
    alchemy_level INTEGER DEFAULT 1,
    alchemy_exp INTEGER DEFAULT 0,
    
    cooking_level INTEGER DEFAULT 1,
    cooking_exp INTEGER DEFAULT 0,
    
    jewelcrafting_level INTEGER DEFAULT 1,
    jewelcrafting_exp INTEGER DEFAULT 0,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================================
-- REALM OF CONQUEST - DATABASE SCHEMA
-- Migration 003: Guild System
-- ============================================================

-- ============================================================
-- SECTION 7: GUILD TABLES
-- ============================================================

-- 7.1 Loncalar
CREATE TABLE guilds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    
    name VARCHAR(50) NOT NULL,
    description TEXT,
    emblem_url VARCHAR(255),
    
    -- Uzmanlık (sunucu başına 1 tane)
    specialization guild_specialization NOT NULL,
    
    -- Seviye
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 10),
    exp BIGINT DEFAULT 0,
    
    -- Üye Limiti (seviyeye göre)
    max_members INTEGER DEFAULT 20,
    current_members INTEGER DEFAULT 0,
    
    -- Kasa
    gold_treasury BIGINT DEFAULT 0,
    
    -- Lider
    leader_id UUID NOT NULL,
    leader_changed_at TIMESTAMPTZ,
    
    -- İttifak
    ally_guild_id UUID REFERENCES guilds(id),
    ally_since TIMESTAMPTZ,
    ally_locked_until TIMESTAMPTZ, -- 30 gün değiştirilemez
    
    -- Ayarlar
    is_recruiting BOOLEAN DEFAULT TRUE,
    min_level_requirement INTEGER DEFAULT 1,
    auto_accept BOOLEAN DEFAULT FALSE,
    
    -- İstatistikler
    total_zones_controlled INTEGER DEFAULT 0,
    total_wars_won INTEGER DEFAULT 0,
    total_wars_lost INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(server_id, name),
    UNIQUE(server_id, specialization) -- Her sunucuda 1 uzmanlıktan 1 lonca
);

CREATE INDEX idx_guilds_server ON guilds(server_id);
CREATE INDEX idx_guilds_spec ON guilds(specialization);
CREATE INDEX idx_guilds_leader ON guilds(leader_id);

-- 7.2 Lonca Üyeleri
CREATE TABLE guild_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    rank VARCHAR(50) DEFAULT 'member', -- 'leader', 'officer', 'veteran', 'member', 'recruit'
    rank_order INTEGER DEFAULT 100, -- Sıralama için
    
    -- Katkılar
    weekly_contribution INTEGER DEFAULT 0,
    total_contribution BIGINT DEFAULT 0,
    
    -- Aktivite
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- İzinler (JSONB)
    permissions JSONB DEFAULT '{}',
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(character_id) -- Bir karakter sadece 1 loncada
);

CREATE INDEX idx_guild_members_guild ON guild_members(guild_id);
CREATE INDEX idx_guild_members_character ON guild_members(character_id);

-- 7.3 Lonca İlişkileri (Düşmanlık)
CREATE TABLE guild_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    target_guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    
    relation_type guild_relation_type NOT NULL, -- 'enemy'
    
    -- Oylama
    votes_for INTEGER DEFAULT 0,
    votes_required INTEGER DEFAULT 0,
    is_confirmed BOOLEAN DEFAULT FALSE,
    
    -- Kilitleme
    locked_until TIMESTAMPTZ, -- 14 gün değiştirilemez
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    
    UNIQUE(guild_id, target_guild_id)
);

CREATE INDEX idx_guild_relations_guild ON guild_relations(guild_id);

-- 7.4 Lonca Başvuruları
CREATE TABLE guild_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'cancelled'
    
    reviewed_by UUID REFERENCES characters(id),
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(guild_id, character_id)
);

-- 7.5 Lonca Görevleri
CREATE TABLE guild_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    
    quest_type VARCHAR(50) NOT NULL, -- 'kill_monsters', 'complete_dungeons', 'caravan_protect', etc.
    target_count INTEGER NOT NULL,
    current_count INTEGER DEFAULT 0,
    
    -- Ödüller
    reward_exp INTEGER DEFAULT 0,
    reward_gold INTEGER DEFAULT 0,
    
    -- Süre
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    
    is_weekly BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_guild_quests_guild ON guild_quests(guild_id);
CREATE INDEX idx_guild_quests_active ON guild_quests(guild_id, expires_at) WHERE completed_at IS NULL;

-- 7.6 Lonca Görev Katkıları
CREATE TABLE guild_quest_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES guild_quests(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    contribution_count INTEGER DEFAULT 0,
    
    UNIQUE(quest_id, character_id)
);

-- 7.7 Bölge Kontrolü
CREATE TABLE zone_control (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id INTEGER NOT NULL REFERENCES map_zones(id),
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    
    -- Kontrol süresi
    controlled_since TIMESTAMPTZ DEFAULT NOW(),
    control_expires_at TIMESTAMPTZ, -- Haftalık yenileme
    
    -- Vergi
    tax_rate DECIMAL(4,2) DEFAULT 5.00, -- Yüzde
    total_tax_collected BIGINT DEFAULT 0,
    
    -- Savunma
    defense_bonus INTEGER DEFAULT 0,
    
    UNIQUE(zone_id) -- Bir bölge tek loncaya ait
);

CREATE INDEX idx_zone_control_guild ON zone_control(guild_id);

-- 7.8 Lonca Savaşları
CREATE TABLE guild_wars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    attacker_guild_id UUID NOT NULL REFERENCES guilds(id),
    defender_guild_id UUID NOT NULL REFERENCES guilds(id),
    zone_id INTEGER NOT NULL REFERENCES map_zones(id),
    
    -- Zamanlama
    declared_at TIMESTAMPTZ DEFAULT NOW(),
    scheduled_at TIMESTAMPTZ NOT NULL, -- Cumartesi 20:00
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    
    -- Sonuç
    winner_guild_id UUID REFERENCES guilds(id),
    attacker_score INTEGER DEFAULT 0,
    defender_score INTEGER DEFAULT 0,
    
    -- Katılımcılar
    attacker_participants INTEGER DEFAULT 0,
    defender_participants INTEGER DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'scheduled' -- 'scheduled', 'in_progress', 'completed', 'cancelled'
);

CREATE INDEX idx_guild_wars_attacker ON guild_wars(attacker_guild_id);
CREATE INDEX idx_guild_wars_defender ON guild_wars(defender_guild_id);
CREATE INDEX idx_guild_wars_scheduled ON guild_wars(scheduled_at) WHERE status = 'scheduled';

-- 7.9 Lonca Savaş Katılımcıları
CREATE TABLE guild_war_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    war_id UUID NOT NULL REFERENCES guild_wars(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id),
    guild_id UUID NOT NULL REFERENCES guilds(id),
    
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    damage_dealt BIGINT DEFAULT 0,
    healing_done BIGINT DEFAULT 0,
    capture_time_seconds INTEGER DEFAULT 0,
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(war_id, character_id)
);

-- 7.10 Lonca Deposu
CREATE TABLE guild_storage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    
    item_definition_id INTEGER NOT NULL REFERENCES item_definitions(id),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    
    upgrade_level INTEGER DEFAULT 0,
    gem_slot_1 INTEGER REFERENCES gem_definitions(id),
    gem_slot_2 INTEGER REFERENCES gem_definitions(id),
    gem_slot_3 INTEGER REFERENCES gem_definitions(id),
    gem_slot_4 INTEGER REFERENCES gem_definitions(id),
    bonus_stats JSONB,
    
    slot_number INTEGER NOT NULL,
    
    deposited_by UUID REFERENCES characters(id),
    deposited_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Çekim izni
    min_rank_to_withdraw VARCHAR(50) DEFAULT 'officer',
    
    UNIQUE(guild_id, slot_number)
);

CREATE INDEX idx_guild_storage_guild ON guild_storage(guild_id);

-- 7.11 Lonca Log
CREATE TABLE guild_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    
    action_type VARCHAR(50) NOT NULL, -- 'member_join', 'member_leave', 'promotion', 'donation', 'war_declare', etc.
    actor_id UUID REFERENCES characters(id),
    target_id UUID,
    
    details JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guild_logs_guild ON guild_logs(guild_id);
CREATE INDEX idx_guild_logs_date ON guild_logs(created_at);

-- 7.12 Lonca Uzmanlık Bonusları (Statik)
CREATE TABLE guild_specialization_bonuses (
    specialization guild_specialization PRIMARY KEY,
    
    -- Level 1 bonusları
    bonus_level_1 JSONB NOT NULL,
    -- Level 5 bonusları
    bonus_level_5 JSONB NOT NULL,
    -- Level 10 bonusları
    bonus_level_10 JSONB NOT NULL,
    
    description TEXT
);

-- Başlangıç verisi
INSERT INTO guild_specialization_bonuses VALUES
('warrior_guild', 
 '{"pvp_damage": 3, "pvp_defense": 2}',
 '{"pvp_damage": 8, "pvp_defense": 5}',
 '{"pvp_damage": 15, "pvp_defense": 10, "arena_points": 25}',
 'PvP odaklı lonca'),
('protector_guild',
 '{"protection_fee": 5, "bandit_damage": 5}',
 '{"protection_fee": 12, "bandit_damage": 12}',
 '{"protection_fee": 25, "bandit_damage": 20, "caravan_defense": 15}',
 'Kervan koruma odaklı lonca'),
('bandit_guild',
 '{"raid_loot": 5, "infamy_reduction": 5}',
 '{"raid_loot": 12, "infamy_reduction": 12}',
 '{"raid_loot": 25, "infamy_reduction": 25, "escape_speed": 15}',
 'Kervan saldırısı odaklı lonca'),
('dungeon_guild',
 '{"dungeon_exp": 5, "boss_damage": 3}',
 '{"dungeon_exp": 12, "boss_damage": 8, "loot_chance": 8}',
 '{"dungeon_exp": 25, "boss_damage": 15, "loot_chance": 15, "extra_entries": 3}',
 'PvE odaklı lonca'),
('fisher_guild',
 '{"fishing_speed": 5, "rare_fish_chance": 3}',
 '{"fishing_speed": 12, "rare_fish_chance": 8, "fish_sell_price": 12}',
 '{"fishing_speed": 25, "rare_fish_chance": 15, "fish_sell_price": 20, "fishing_exp": 50}',
 'Balıkçılık odaklı lonca'),
('miner_guild',
 '{"mining_speed": 5, "rare_ore_chance": 3}',
 '{"mining_speed": 12, "rare_ore_chance": 8, "ore_sell_price": 12}',
 '{"mining_speed": 25, "rare_ore_chance": 15, "ore_sell_price": 20, "mining_exp": 50}',
 'Madencilik odaklı lonca'),
('crafter_guild',
 '{"craft_success": 3, "material_saving": 5}',
 '{"craft_success": 8, "material_saving": 12, "craft_exp": 25}',
 '{"craft_success": 15, "material_saving": 20, "craft_exp": 50, "special_recipes": 10}',
 'Craft odaklı lonca'),
('merchant_guild',
 '{"caravan_profit": 5, "market_fee_reduction": 3}',
 '{"caravan_profit": 12, "market_fee_reduction": 8, "npc_prices": 5}',
 '{"caravan_profit": 25, "market_fee_reduction": 15, "npc_prices": 10, "trade_exp": 50}',
 'Ticaret odaklı lonca'),
('peace_guild',
 '{"party_exp": 5, "healing_power": 3}',
 '{"party_exp": 12, "healing_power": 8, "buff_duration": 25}',
 '{"party_exp": 25, "healing_power": 15, "buff_duration": 50, "social_points": 50}',
 'Sosyal odaklı lonca'),
('prisoner_guild',
 '{"prison_farm": 10, "prison_time_reduction": 5}',
 '{"prison_farm": 25, "prison_time_reduction": 12, "escape_chance": 8}',
 '{"prison_farm": 50, "prison_time_reduction": 25, "escape_chance": 15, "prison_drop": 25}',
 'Hapishane odaklı lonca');
-- ============================================================
-- REALM OF CONQUEST - DATABASE SCHEMA
-- Migration 004: Dungeon, Caravan & Trade Systems
-- ============================================================

-- ============================================================
-- SECTION 8: DUNGEON SYSTEM
-- ============================================================

-- 8.1 Dungeon Tanımları
CREATE TABLE dungeon_definitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Gereksinimler
    min_level INTEGER DEFAULT 1,
    min_gear_score INTEGER DEFAULT 0,
    
    -- Zorluk seviyeleri
    has_normal BOOLEAN DEFAULT TRUE,
    has_hard BOOLEAN DEFAULT TRUE,
    has_nightmare BOOLEAN DEFAULT TRUE,
    has_hell BOOLEAN DEFAULT FALSE,
    
    -- Grup
    required_players INTEGER DEFAULT 5,
    requires_all_classes BOOLEAN DEFAULT TRUE,
    
    -- Giriş limiti
    daily_entries INTEGER DEFAULT 3,
    weekly_entries INTEGER,
    
    -- Süre
    time_limit_minutes INTEGER DEFAULT 60,
    
    -- Ödüller (baz değerler)
    base_exp_reward INTEGER DEFAULT 0,
    base_gold_reward INTEGER DEFAULT 0,
    
    -- Cross-server
    is_cross_server BOOLEAN DEFAULT FALSE,
    
    map_id INTEGER REFERENCES maps(id),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.2 Dungeon Boss Tanımları
CREATE TABLE dungeon_bosses (
    id SERIAL PRIMARY KEY,
    dungeon_id INTEGER NOT NULL REFERENCES dungeon_definitions(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Base statlar (Normal zorluk)
    base_hp BIGINT NOT NULL,
    base_attack INTEGER NOT NULL,
    base_defense INTEGER NOT NULL,
    base_speed INTEGER DEFAULT 10,
    
    -- Boss sırası
    boss_order INTEGER DEFAULT 1, -- 1 = ilk boss, son = final boss
    is_final_boss BOOLEAN DEFAULT FALSE,
    
    -- Loot tablosu ID
    loot_table_id INTEGER
);

CREATE INDEX idx_dungeon_bosses_dungeon ON dungeon_bosses(dungeon_id);

-- 8.3 Loot Tabloları
CREATE TABLE loot_tables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 8.4 Loot Tablosu İçeriği
CREATE TABLE loot_table_entries (
    id SERIAL PRIMARY KEY,
    loot_table_id INTEGER NOT NULL REFERENCES loot_tables(id) ON DELETE CASCADE,
    
    item_definition_id INTEGER NOT NULL REFERENCES item_definitions(id),
    
    drop_chance DECIMAL(6,3) NOT NULL, -- 0.001 - 100.000
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER DEFAULT 1,
    
    -- Zorluk bonus
    normal_multiplier DECIMAL(3,2) DEFAULT 1.00,
    hard_multiplier DECIMAL(3,2) DEFAULT 1.50,
    nightmare_multiplier DECIMAL(3,2) DEFAULT 2.00,
    hell_multiplier DECIMAL(3,2) DEFAULT 3.00
);

CREATE INDEX idx_loot_entries_table ON loot_table_entries(loot_table_id);

-- 8.5 Aktif Dungeon Instance'ları
CREATE TABLE dungeon_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dungeon_id INTEGER NOT NULL REFERENCES dungeon_definitions(id),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    
    difficulty dungeon_difficulty DEFAULT 'normal',
    
    -- Durum
    status VARCHAR(20) DEFAULT 'forming', -- 'forming', 'in_progress', 'completed', 'failed', 'abandoned'
    
    -- Zamanlama
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- İlerleme
    current_boss_order INTEGER DEFAULT 0,
    bosses_defeated INTEGER DEFAULT 0,
    total_bosses INTEGER NOT NULL,
    
    -- Parti lideri
    leader_id UUID REFERENCES characters(id),
    
    -- Cross-server
    is_cross_server BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_dungeon_instances_dungeon ON dungeon_instances(dungeon_id);
CREATE INDEX idx_dungeon_instances_status ON dungeon_instances(status) WHERE status IN ('forming', 'in_progress');

-- 8.6 Dungeon Katılımcıları
CREATE TABLE dungeon_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID NOT NULL REFERENCES dungeon_instances(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id),
    
    -- Rol
    role VARCHAR(20), -- 'tank', 'dps', 'healer', 'support'
    class class_type NOT NULL,
    
    -- İstatistikler
    damage_dealt BIGINT DEFAULT 0,
    healing_done BIGINT DEFAULT 0,
    damage_taken BIGINT DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    
    -- Loot
    items_received INTEGER DEFAULT 0,
    gold_received INTEGER DEFAULT 0,
    exp_received INTEGER DEFAULT 0,
    
    -- Durum
    is_active BOOLEAN DEFAULT TRUE,
    left_at TIMESTAMPTZ,
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(instance_id, character_id)
);

CREATE INDEX idx_dungeon_participants_instance ON dungeon_participants(instance_id);
CREATE INDEX idx_dungeon_participants_character ON dungeon_participants(character_id);

-- ============================================================
-- SECTION 9: CARAVAN SYSTEM
-- ============================================================

-- 9.1 Kervan Rotaları
CREATE TABLE caravan_routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    
    start_map_id INTEGER NOT NULL REFERENCES maps(id),
    end_map_id INTEGER NOT NULL REFERENCES maps(id),
    
    -- Gereksinimler
    min_level INTEGER DEFAULT 30,
    
    -- Süre ve mesafe
    base_duration_minutes INTEGER NOT NULL,
    danger_level INTEGER DEFAULT 1 CHECK (danger_level >= 1 AND danger_level <= 5),
    
    -- Bonus
    profit_multiplier DECIMAL(4,2) DEFAULT 1.00,
    
    is_active BOOLEAN DEFAULT TRUE
);

-- 9.2 Kervan Tipleri
CREATE TABLE caravan_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    
    -- Maliyet ve kazanç
    investment_cost INTEGER NOT NULL,
    success_reward INTEGER NOT NULL,
    profit_percentage DECIMAL(5,2) NOT NULL,
    
    -- Dayanıklılık
    base_hp INTEGER NOT NULL,
    base_defense INTEGER DEFAULT 0,
    
    -- Guard limit
    max_guards INTEGER DEFAULT 1,
    
    -- Gereksinim
    min_level INTEGER DEFAULT 30,
    
    icon VARCHAR(255)
);

-- Başlangıç verisi
INSERT INTO caravan_types (name, investment_cost, success_reward, profit_percentage, base_hp, max_guards, min_level) VALUES
('Bronz Kervan', 1000, 1500, 50.00, 5000, 1, 30),
('Gümüş Kervan', 5000, 8000, 60.00, 15000, 2, 40),
('Altın Kervan', 20000, 36000, 80.00, 40000, 3, 50),
('Elmas Kervan', 100000, 200000, 100.00, 100000, 4, 70),
('Kraliyet Kervanı', 500000, 1250000, 150.00, 250000, 5, 90);

-- 9.3 Aktif Kervanlar
CREATE TABLE caravans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    
    owner_id UUID NOT NULL REFERENCES characters(id),
    caravan_type_id INTEGER NOT NULL REFERENCES caravan_types(id),
    route_id INTEGER NOT NULL REFERENCES caravan_routes(id),
    
    -- Durum
    status caravan_status DEFAULT 'preparing',
    
    -- HP
    current_hp INTEGER NOT NULL,
    max_hp INTEGER NOT NULL,
    
    -- Konum (yüzde olarak ilerleme)
    progress_percent DECIMAL(5,2) DEFAULT 0.00,
    current_map_id INTEGER REFERENCES maps(id),
    position_x INTEGER,
    position_y INTEGER,
    
    -- Zamanlama
    started_at TIMESTAMPTZ,
    estimated_arrival TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Saldırı altında mı
    under_attack BOOLEAN DEFAULT FALSE,
    last_attack_at TIMESTAMPTZ,
    
    -- Sigorta
    is_insured BOOLEAN DEFAULT FALSE,
    insurance_cost INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_caravans_server ON caravans(server_id);
CREATE INDEX idx_caravans_owner ON caravans(owner_id);
CREATE INDEX idx_caravans_status ON caravans(status) WHERE status IN ('traveling', 'under_attack');
CREATE INDEX idx_caravans_map ON caravans(current_map_id);

-- 9.4 Kervan Koruyucuları
CREATE TABLE caravan_guards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caravan_id UUID NOT NULL REFERENCES caravans(id) ON DELETE CASCADE,
    
    -- Player guard veya NPC guard
    character_id UUID REFERENCES characters(id),
    npc_guard_type INTEGER, -- NPC guard tipi
    
    -- Ücret
    fee_amount INTEGER DEFAULT 0,
    fee_paid BOOLEAN DEFAULT FALSE,
    
    -- Durum
    is_active BOOLEAN DEFAULT TRUE,
    is_afk BOOLEAN DEFAULT FALSE,
    
    -- İstatistikler
    damage_dealt BIGINT DEFAULT 0,
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(caravan_id, character_id)
);

CREATE INDEX idx_caravan_guards_caravan ON caravan_guards(caravan_id);
CREATE INDEX idx_caravan_guards_character ON caravan_guards(character_id);

-- 9.5 Kervan Saldırıları
CREATE TABLE caravan_attacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caravan_id UUID NOT NULL REFERENCES caravans(id) ON DELETE CASCADE,
    
    attacker_id UUID NOT NULL REFERENCES characters(id),
    
    -- Saldırı sonucu
    success BOOLEAN,
    damage_dealt INTEGER DEFAULT 0,
    loot_obtained INTEGER DEFAULT 0,
    
    -- Zamanlama
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    
    -- PvP sonuçları
    guards_killed INTEGER DEFAULT 0,
    attacker_deaths INTEGER DEFAULT 0
);

CREATE INDEX idx_caravan_attacks_caravan ON caravan_attacks(caravan_id);
CREATE INDEX idx_caravan_attacks_attacker ON caravan_attacks(attacker_id);

-- 9.6 Koruyucu Panosu (AFK Koruma Kayıtları)
CREATE TABLE guard_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    server_id INTEGER NOT NULL REFERENCES servers(id),
    
    -- Tercihler
    min_caravan_type INTEGER DEFAULT 1,
    preferred_routes INTEGER[], -- Route ID'leri
    hourly_fee INTEGER NOT NULL,
    
    -- Çalışma saatleri (JSONB)
    available_hours JSONB, -- {"monday": [{"start": "18:00", "end": "22:00"}], ...}
    
    -- İstatistikler
    total_protections INTEGER DEFAULT 0,
    successful_protections INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Durum
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE, -- Şu an müsait mi
    
    -- Puan
    rating DECIMAL(3,2) DEFAULT 5.00,
    rating_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(character_id)
);

CREATE INDEX idx_guard_listings_server ON guard_listings(server_id);
CREATE INDEX idx_guard_listings_active ON guard_listings(is_active, is_available) WHERE is_active = TRUE;

-- ============================================================
-- SECTION 10: TRADE & MARKET SYSTEM
-- ============================================================

-- 10.1 Pazar Listelemeleri
CREATE TABLE market_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    seller_id UUID NOT NULL REFERENCES characters(id),
    
    -- Item bilgisi
    item_definition_id INTEGER NOT NULL REFERENCES item_definitions(id),
    quantity INTEGER DEFAULT 1,
    
    -- Ekipman detayları
    upgrade_level INTEGER DEFAULT 0,
    gem_slot_1 INTEGER REFERENCES gem_definitions(id),
    gem_slot_2 INTEGER REFERENCES gem_definitions(id),
    gem_slot_3 INTEGER REFERENCES gem_definitions(id),
    gem_slot_4 INTEGER REFERENCES gem_definitions(id),
    bonus_stats JSONB,
    
    -- Fiyat
    price_per_unit BIGINT NOT NULL,
    total_price BIGINT NOT NULL,
    
    -- Durum
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'sold', 'cancelled', 'expired'
    
    -- Zamanlama
    listed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    sold_at TIMESTAMPTZ,
    
    -- Alıcı
    buyer_id UUID REFERENCES characters(id)
);

CREATE INDEX idx_market_listings_server ON market_listings(server_id);
CREATE INDEX idx_market_listings_seller ON market_listings(seller_id);
CREATE INDEX idx_market_listings_item ON market_listings(item_definition_id);
CREATE INDEX idx_market_listings_active ON market_listings(server_id, status, item_definition_id) WHERE status = 'active';
CREATE INDEX idx_market_listings_price ON market_listings(total_price) WHERE status = 'active';

-- 10.2 Oyuncu Arası Ticaret
CREATE TABLE player_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    player1_id UUID NOT NULL REFERENCES characters(id),
    player2_id UUID NOT NULL REFERENCES characters(id),
    
    -- Durum
    status trade_status DEFAULT 'pending',
    
    -- Onaylar
    player1_confirmed BOOLEAN DEFAULT FALSE,
    player2_confirmed BOOLEAN DEFAULT FALSE,
    player1_locked BOOLEAN DEFAULT FALSE,
    player2_locked BOOLEAN DEFAULT FALSE,
    
    -- Gold
    player1_gold BIGINT DEFAULT 0,
    player2_gold BIGINT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_player_trades_player1 ON player_trades(player1_id);
CREATE INDEX idx_player_trades_player2 ON player_trades(player2_id);

-- 10.3 Ticaret İtemleri
CREATE TABLE player_trade_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id UUID NOT NULL REFERENCES player_trades(id) ON DELETE CASCADE,
    
    owner_id UUID NOT NULL REFERENCES characters(id),
    inventory_item_id UUID NOT NULL REFERENCES character_inventory(id),
    quantity INTEGER DEFAULT 1
);

CREATE INDEX idx_trade_items_trade ON player_trade_items(trade_id);

-- 10.4 Fiyat Geçmişi (Manipülasyon tespiti için)
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    item_definition_id INTEGER NOT NULL REFERENCES item_definitions(id),
    
    avg_price BIGINT NOT NULL,
    min_price BIGINT NOT NULL,
    max_price BIGINT NOT NULL,
    volume INTEGER NOT NULL,
    
    date DATE NOT NULL,
    
    UNIQUE(server_id, item_definition_id, date)
);

CREATE INDEX idx_price_history_item ON price_history(server_id, item_definition_id, date);

-- 10.5 Taksi Kayıtları
CREATE TABLE taxi_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    server_id INTEGER NOT NULL REFERENCES servers(id),
    
    -- Şoför bilgisi
    driver_level INTEGER NOT NULL,
    driver_gear_score INTEGER NOT NULL,
    
    -- Tercihler
    available_maps INTEGER[], -- Gidebileceği haritalar
    hourly_fee INTEGER NOT NULL,
    max_passengers INTEGER DEFAULT 4,
    
    -- İstatistikler
    total_rides INTEGER DEFAULT 0,
    total_hours DECIMAL(10,2) DEFAULT 0,
    
    -- Puan
    rating DECIMAL(3,2) DEFAULT 5.00,
    rating_count INTEGER DEFAULT 0,
    
    -- Durum
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    current_passengers INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(driver_id)
);

CREATE INDEX idx_taxi_listings_server ON taxi_listings(server_id);
CREATE INDEX idx_taxi_listings_active ON taxi_listings(is_active, is_available) WHERE is_active = TRUE;

-- 10.6 Taksi Seferleri
CREATE TABLE taxi_rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES taxi_listings(id),
    driver_id UUID NOT NULL REFERENCES characters(id),
    
    -- Zamanlama
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    
    -- Konum
    map_id INTEGER NOT NULL REFERENCES maps(id),
    
    -- Ücret
    total_fee_collected INTEGER DEFAULT 0,
    
    -- Durum
    is_active BOOLEAN DEFAULT TRUE
);

-- 10.7 Taksi Yolcuları
CREATE TABLE taxi_passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES taxi_rides(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES characters(id),
    
    -- Ödeme
    fee_amount INTEGER NOT NULL,
    fee_paid BOOLEAN DEFAULT FALSE,
    
    -- EXP kazanımı
    exp_gained BIGINT DEFAULT 0,
    
    -- Zamanlama
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    
    -- Captcha
    last_captcha_at TIMESTAMPTZ,
    captcha_failures INTEGER DEFAULT 0,
    
    UNIQUE(ride_id, passenger_id)
);

CREATE INDEX idx_taxi_passengers_ride ON taxi_passengers(ride_id);
CREATE INDEX idx_taxi_passengers_passenger ON taxi_passengers(passenger_id);
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
-- ============================================================
-- REALM OF CONQUEST - DATABASE SCHEMA
-- Migration 006: Social Systems, Class Data & Logs
-- ============================================================

-- ============================================================
-- SECTION 19: SOCIAL SYSTEMS
-- ============================================================

-- 19.1 Arkadaşlık
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
    
    -- Kim gönderdi
    requested_by UUID NOT NULL REFERENCES characters(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    
    UNIQUE(character_id, friend_id)
);

CREATE INDEX idx_friendships_character ON friendships(character_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);

-- 19.2 Posta Sistemi
CREATE TABLE mail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    sender_id UUID REFERENCES characters(id) ON DELETE SET NULL,
    recipient_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    -- Sistem postası mı
    is_system_mail BOOLEAN DEFAULT FALSE,
    system_mail_type VARCHAR(50),
    
    subject VARCHAR(200) NOT NULL,
    body TEXT,
    
    -- Ekler
    attached_gold BIGINT DEFAULT 0,
    attached_items JSONB DEFAULT '[]', -- [{"item_id": 1, "quantity": 5, "upgrade_level": 3}]
    
    -- Durum
    is_read BOOLEAN DEFAULT FALSE,
    attachments_claimed BOOLEAN DEFAULT FALSE,
    
    -- Zamanlama
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_mail_recipient ON mail(recipient_id);
CREATE INDEX idx_mail_unread ON mail(recipient_id, is_read) WHERE is_read = FALSE;

-- 19.3 Sohbet Mesajları (Kısa süreli - Redis'te tutulur, burası backup)
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    
    channel_type VARCHAR(20) NOT NULL, -- 'world', 'guild', 'party', 'whisper', 'trade', 'region'
    channel_id VARCHAR(100), -- Guild ID, Party ID vs.
    
    sender_id UUID NOT NULL REFERENCES characters(id),
    sender_name VARCHAR(50) NOT NULL,
    
    message TEXT NOT NULL,
    
    -- Whisper için
    recipient_id UUID REFERENCES characters(id),
    
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_channel ON chat_messages(server_id, channel_type, channel_id, sent_at);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);

-- 19.4 Parti Sistemi
CREATE TABLE parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    
    leader_id UUID NOT NULL REFERENCES characters(id),
    
    -- Ayarlar
    loot_distribution VARCHAR(20) DEFAULT 'free_for_all', -- 'free_for_all', 'round_robin', 'leader'
    min_item_rarity_for_roll item_rarity DEFAULT 'rare',
    
    is_public BOOLEAN DEFAULT FALSE,
    max_members INTEGER DEFAULT 5,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    disbanded_at TIMESTAMPTZ
);

CREATE INDEX idx_parties_server ON parties(server_id);
CREATE INDEX idx_parties_leader ON parties(leader_id);

-- 19.5 Parti Üyeleri
CREATE TABLE party_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    role VARCHAR(20), -- 'tank', 'healer', 'dps'
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(character_id)
);

CREATE INDEX idx_party_members_party ON party_members(party_id);
CREATE INDEX idx_party_members_character ON party_members(character_id);

-- 19.6 Mentor Sistemi
CREATE TABLE mentorships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    mentor_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    
    -- Öğrenci bilgisi
    student_level_at_start INTEGER NOT NULL,
    student_current_level INTEGER NOT NULL,
    
    -- Ödüller
    mentor_rewards_claimed JSONB DEFAULT '[]',
    
    -- Durum
    is_active BOOLEAN DEFAULT TRUE,
    
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ, -- Öğrenci 50 olunca
    
    UNIQUE(student_id)
);

CREATE INDEX idx_mentorships_mentor ON mentorships(mentor_id);
CREATE INDEX idx_mentorships_student ON mentorships(student_id);

-- 19.7 Raporlama Sistemi
CREATE TABLE player_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    reporter_id UUID NOT NULL REFERENCES characters(id),
    reported_id UUID NOT NULL REFERENCES characters(id),
    
    report_type VARCHAR(50) NOT NULL, -- 'harassment', 'cheating', 'bot', 'inappropriate_name', 'scam', 'other'
    description TEXT,
    
    -- Kanıt
    evidence_screenshots TEXT[],
    chat_log_ids UUID[],
    
    -- Durum
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'dismissed'
    
    -- İnceleme
    reviewed_by VARCHAR(100),
    review_notes TEXT,
    action_taken VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_player_reports_reported ON player_reports(reported_id);
CREATE INDEX idx_player_reports_status ON player_reports(status) WHERE status = 'pending';

-- ============================================================
-- SECTION 20: CLASS & SKILL DEFINITIONS (Static Data)
-- ============================================================

-- 20.1 Sınıf Tanımları
CREATE TABLE class_definitions (
    id SERIAL PRIMARY KEY,
    class class_type UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    
    -- Base statlar
    base_hp INTEGER NOT NULL,
    base_mp INTEGER NOT NULL,
    base_attack INTEGER NOT NULL,
    base_defense INTEGER NOT NULL,
    base_magic_attack INTEGER NOT NULL,
    base_magic_defense INTEGER NOT NULL,
    base_speed INTEGER NOT NULL,
    base_crit_rate DECIMAL(5,2) NOT NULL,
    
    -- Seviye başına artış
    hp_per_level INTEGER NOT NULL,
    mp_per_level INTEGER NOT NULL,
    attack_per_level DECIMAL(4,2) NOT NULL,
    defense_per_level DECIMAL(4,2) NOT NULL
);

-- Başlangıç verisi
INSERT INTO class_definitions (class, name, base_hp, base_mp, base_attack, base_defense, base_magic_attack, base_magic_defense, base_speed, base_crit_rate, hp_per_level, mp_per_level, attack_per_level, defense_per_level) VALUES
('warrior', 'Savaşçı', 120, 40, 25, 30, 10, 15, 10, 5.00, 20, 5, 3.0, 2.5),
('archer', 'Okçu', 80, 60, 30, 15, 15, 12, 20, 15.00, 12, 8, 3.5, 1.5),
('mage', 'Büyücü', 60, 120, 15, 10, 40, 20, 12, 10.00, 8, 15, 2.0, 1.0),
('healer', 'Şifacı', 90, 100, 15, 20, 25, 25, 15, 5.00, 15, 12, 1.5, 2.0),
('ninja', 'Ninja', 70, 70, 35, 12, 20, 15, 30, 25.00, 10, 10, 4.0, 1.2);

-- 20.2 Uzmanlaşma Tanımları
CREATE TABLE specialization_definitions (
    id SERIAL PRIMARY KEY,
    specialization specialization_type UNIQUE NOT NULL,
    class class_type NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    
    -- Puşe uyumu
    preferred_flag flag_type NOT NULL,
    
    -- Stat modifikatörleri
    hp_modifier DECIMAL(4,2) DEFAULT 1.00,
    mp_modifier DECIMAL(4,2) DEFAULT 1.00,
    attack_modifier DECIMAL(4,2) DEFAULT 1.00,
    defense_modifier DECIMAL(4,2) DEFAULT 1.00,
    
    -- Puşe buffları (JSONB)
    correct_flag_buffs JSONB NOT NULL,
    wrong_flag_debuffs JSONB NOT NULL,
    
    -- Kervan bonusları
    caravan_attack_bonus JSONB,
    caravan_defense_bonus JSONB
);

-- Başlangıç verisi
INSERT INTO specialization_definitions (specialization, class, name, preferred_flag, correct_flag_buffs, wrong_flag_debuffs, caravan_attack_bonus, caravan_defense_bonus) VALUES
('berserker', 'warrior', 'Berserker', 'red', 
 '{"damage": 25, "low_hp_damage": 40, "fear_debuff": true}',
 '{"all_stats": -15}',
 '{"caravan_damage": 1.5}', NULL),
('paladin', 'warrior', 'Paladin', 'blue',
 '{"defense": 30, "bandit_damage": 20, "ally_defense_aura": 10}',
 '{"defense": -20, "damage": -10}',
 NULL, '{"caravan_damage_reduction": 0.2}'),
('sharpshooter', 'archer', 'Keskin Nişancı', 'red',
 '{"crit_damage": 30, "first_attack_damage": 50, "def_ignore": 30}',
 '{"accuracy": -20, "crit_rate": -15}',
 '{"guard_damage": 1.25}', NULL),
('trapper', 'archer', 'Tuzakçı', 'blue',
 '{"trap_damage": 40, "bandit_radar": true, "slow_effect": 30}',
 '{"trap_setup_time": 2.0}',
 NULL, '{"auto_trap": true}'),
('dark_mage', 'mage', 'Kara Büyücü', 'red',
 '{"magic_damage": 25, "lifesteal": 20, "dot_damage": 50}',
 '{"magic_damage": -25}',
 '{"aoe_caravan_damage": 1.3}', NULL),
('elementalist', 'mage', 'Elementalist', 'blue',
 '{"magic_resist": 20, "team_barrier": true, "slow_aura": true}',
 '{"spell_fail_chance": 15}',
 NULL, '{"element_shield": true}'),
('druid', 'healer', 'Druid', 'red',
 '{"attack": 20, "reflect_damage": 50, "damage_spells": true}',
 '{"cannot_damage": true}',
 '{"team_hot_buff": true}', NULL),
('priest', 'healer', 'Rahip', 'blue',
 '{"healing": 40, "death_prevention": true, "debuff_reduction": 50}',
 '{"healing": -40, "no_self_heal": true}',
 NULL, '{"caravan_regen": true, "team_full_heal": true}'),
('assassin', 'ninja', 'Suikastçı', 'red',
 '{"stealth_damage": 60, "silent_attack": true, "poison_damage": 2.0}',
 '{"stealth_duration": -50}',
 '{"guard_kill_stealth": 30}', NULL),
('shadow_dancer', 'ninja', 'Gölge Dansçı', 'blue',
 '{"dodge": 30, "ally_dodge_transfer": true, "counter_attack": true}',
 '{"dodge": -20}',
 NULL, '{"caravan_dodge": 25}');

-- 20.3 Skill Tanımları
CREATE TABLE skill_definitions (
    id SERIAL PRIMARY KEY,
    class class_type,
    specialization specialization_type,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    
    -- Açılış
    unlock_level INTEGER DEFAULT 1,
    slot_number INTEGER CHECK (slot_number >= 1 AND slot_number <= 6),
    is_signature BOOLEAN DEFAULT FALSE,
    
    -- Maliyet
    mp_cost INTEGER DEFAULT 0,
    hp_cost INTEGER DEFAULT 0,
    cooldown_turns INTEGER DEFAULT 0,
    
    -- Hasar/Etki
    damage_multiplier DECIMAL(5,2) DEFAULT 0.00,
    healing_multiplier DECIMAL(5,2) DEFAULT 0.00,
    
    -- Hedef
    target_type VARCHAR(20) DEFAULT 'single', -- 'single', 'aoe', 'self', 'ally', 'all_allies', 'all_enemies'
    max_targets INTEGER DEFAULT 1,
    
    -- Özel efektler (JSONB)
    effects JSONB DEFAULT '{}',
    
    -- Level scaling
    scaling_per_level JSONB DEFAULT '{}' -- Her level için artış
);

-- ============================================================
-- SECTION 21: WORLD BOSS & EVENTS
-- ============================================================

-- 21.1 World Boss Tanımları
CREATE TABLE world_boss_definitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Statlar (scale edilecek)
    base_hp BIGINT NOT NULL,
    base_attack INTEGER NOT NULL,
    base_defense INTEGER NOT NULL,
    
    -- Ölçekleme
    hp_per_player INTEGER DEFAULT 10000,
    
    -- Spawn
    spawn_maps INTEGER[], -- Hangi haritalarda spawn olabilir
    spawn_schedule JSONB, -- {"days": ["monday", "wednesday", "friday"], "times": ["12:00", "18:00", "00:00"]}
    
    -- Süre
    despawn_minutes INTEGER DEFAULT 30,
    
    -- Loot
    loot_table_id INTEGER REFERENCES loot_tables(id),
    top_damage_bonus_loot_table_id INTEGER REFERENCES loot_tables(id),
    
    is_active BOOLEAN DEFAULT TRUE
);

-- 21.2 Aktif World Boss Instance'ları
CREATE TABLE world_boss_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boss_definition_id INTEGER NOT NULL REFERENCES world_boss_definitions(id),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    map_id INTEGER NOT NULL REFERENCES maps(id),
    
    -- Statlar
    current_hp BIGINT NOT NULL,
    max_hp BIGINT NOT NULL,
    
    -- Konum
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    
    -- Durum
    is_alive BOOLEAN DEFAULT TRUE,
    
    -- Zamanlama
    spawned_at TIMESTAMPTZ DEFAULT NOW(),
    despawns_at TIMESTAMPTZ NOT NULL,
    killed_at TIMESTAMPTZ
);

CREATE INDEX idx_world_boss_instances_server ON world_boss_instances(server_id);
CREATE INDEX idx_world_boss_instances_alive ON world_boss_instances(is_alive) WHERE is_alive = TRUE;

-- 21.3 World Boss Katılımcıları
CREATE TABLE world_boss_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID NOT NULL REFERENCES world_boss_instances(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id),
    
    damage_dealt BIGINT DEFAULT 0,
    healing_done BIGINT DEFAULT 0,
    
    -- Sıralama (boss öldükten sonra hesaplanır)
    final_rank INTEGER,
    
    -- Ödüller
    loot_received JSONB DEFAULT '[]',
    exp_received INTEGER DEFAULT 0,
    gold_received INTEGER DEFAULT 0,
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(instance_id, character_id)
);

CREATE INDEX idx_wb_participants_instance ON world_boss_participants(instance_id);
CREATE INDEX idx_wb_participants_damage ON world_boss_participants(instance_id, damage_dealt DESC);

-- ============================================================
-- SECTION 22: LOGS & ANALYTICS
-- ============================================================

-- 22.1 Ekonomi Log (Gold hareketleri)
CREATE TABLE economy_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    character_id UUID NOT NULL REFERENCES characters(id),
    
    transaction_type VARCHAR(50) NOT NULL, -- 'monster_drop', 'quest_reward', 'trade_sell', 'trade_buy', 'caravan', 'npc_sell', 'npc_buy', 'guild_tax', etc.
    
    gold_change BIGINT NOT NULL,
    gold_before BIGINT NOT NULL,
    gold_after BIGINT NOT NULL,
    
    reference_type VARCHAR(50), -- 'trade', 'caravan', 'dungeon', etc.
    reference_id UUID,
    
    details JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_economy_logs_character ON economy_logs(character_id);
CREATE INDEX idx_economy_logs_date ON economy_logs(created_at);
CREATE INDEX idx_economy_logs_type ON economy_logs(transaction_type);

-- 22.2 PvP Log
CREATE TABLE pvp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    
    attacker_id UUID NOT NULL REFERENCES characters(id),
    defender_id UUID NOT NULL REFERENCES characters(id),
    
    -- Konum
    map_id INTEGER NOT NULL REFERENCES maps(id),
    
    -- Sonuç
    winner_id UUID REFERENCES characters(id),
    
    -- Detaylar
    attacker_level INTEGER NOT NULL,
    defender_level INTEGER NOT NULL,
    attacker_class class_type NOT NULL,
    defender_class class_type NOT NULL,
    
    -- Puşe durumu
    attacker_flag flag_type,
    defender_flag flag_type,
    
    -- Savaş süresi
    duration_seconds INTEGER,
    total_rounds INTEGER,
    
    -- Ödül/Ceza
    attacker_karma_change INTEGER DEFAULT 0,
    defender_karma_change INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pvp_logs_attacker ON pvp_logs(attacker_id);
CREATE INDEX idx_pvp_logs_defender ON pvp_logs(defender_id);
CREATE INDEX idx_pvp_logs_date ON pvp_logs(created_at);

-- 22.3 Login Log
CREATE TABLE login_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id),
    character_id UUID REFERENCES characters(id),
    
    event_type VARCHAR(20) NOT NULL, -- 'login', 'logout', 'character_select', 'character_create'
    
    ip_address INET,
    device_fingerprint VARCHAR(255),
    user_agent TEXT,
    
    -- Session süresi (logout'ta)
    session_duration_minutes INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_logs_account ON login_logs(account_id);
CREATE INDEX idx_login_logs_date ON login_logs(created_at);

-- 22.4 Şüpheli Aktivite Log
CREATE TABLE suspicious_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id),
    character_id UUID REFERENCES characters(id),
    
    activity_type VARCHAR(50) NOT NULL, -- 'speed_hack', 'gold_anomaly', 'multi_account', 'bot_pattern', 'impossible_action'
    severity VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    
    description TEXT,
    evidence JSONB,
    
    -- Otomatik aksiyon
    auto_action_taken VARCHAR(50),
    
    -- İnceleme
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by VARCHAR(100),
    review_result VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suspicious_logs_account ON suspicious_activity_logs(account_id);
CREATE INDEX idx_suspicious_logs_severity ON suspicious_activity_logs(severity);
CREATE INDEX idx_suspicious_logs_unreviewed ON suspicious_activity_logs(reviewed) WHERE reviewed = FALSE;

-- 22.5 Item Log (Önemli item hareketleri)
CREATE TABLE item_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    character_id UUID NOT NULL REFERENCES characters(id),
    
    action_type VARCHAR(50) NOT NULL, -- 'drop', 'pickup', 'trade_send', 'trade_receive', 'destroy', 'upgrade', 'equip', 'unequip'
    
    item_definition_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    
    -- Ekipman detayları
    upgrade_level INTEGER,
    item_rarity item_rarity,
    
    -- Ticaret için karşı taraf
    other_character_id UUID REFERENCES characters(id),
    
    details JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_item_logs_character ON item_logs(character_id);
CREATE INDEX idx_item_logs_date ON item_logs(created_at);
CREATE INDEX idx_item_logs_rare ON item_logs(item_rarity) WHERE item_rarity IN ('epic', 'legendary', 'mythic');

-- ============================================================
-- SECTION 23: TRIGGERS & FUNCTIONS
-- ============================================================

-- 23.1 Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları uygula
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guilds_updated_at BEFORE UPDATE ON guilds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 23.2 Lonca üye sayısı güncelleme
CREATE OR REPLACE FUNCTION update_guild_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE guilds SET current_members = current_members + 1 WHERE id = NEW.guild_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE guilds SET current_members = current_members - 1 WHERE id = OLD.guild_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_guild_member_count
AFTER INSERT OR DELETE ON guild_members
FOR EACH ROW EXECUTE FUNCTION update_guild_member_count();

-- 23.3 Trust score otomatik düşürme (şüpheli aktivitede)
CREATE OR REPLACE FUNCTION decrease_trust_on_suspicious()
RETURNS TRIGGER AS $$
DECLARE
    penalty INTEGER;
BEGIN
    CASE NEW.severity
        WHEN 'low' THEN penalty := 10;
        WHEN 'medium' THEN penalty := 50;
        WHEN 'high' THEN penalty := 100;
        WHEN 'critical' THEN penalty := 200;
        ELSE penalty := 10;
    END CASE;
    
    UPDATE accounts 
    SET trust_score = GREATEST(0, trust_score - penalty)
    WHERE id = NEW.account_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_decrease_trust
AFTER INSERT ON suspicious_activity_logs
FOR EACH ROW EXECUTE FUNCTION decrease_trust_on_suspicious();
