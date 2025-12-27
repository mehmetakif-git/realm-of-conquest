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
