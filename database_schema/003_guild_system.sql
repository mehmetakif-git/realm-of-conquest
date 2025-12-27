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
