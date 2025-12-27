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
