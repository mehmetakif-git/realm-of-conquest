-- ============================================================
-- GM (GAME MASTER) SİSTEMİ
-- ============================================================

-- GM Rolleri
CREATE TYPE gm_role AS ENUM ('helper', 'moderator', 'game_master', 'admin', 'owner');

-- GM Hesapları
CREATE TABLE gm_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID UNIQUE NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    
    gm_role gm_role NOT NULL DEFAULT 'helper',
    gm_name VARCHAR(50) NOT NULL,
    
    permissions JSONB DEFAULT '{
        "can_ban": false,
        "can_mute": false,
        "can_jail": false,
        "can_kick": false,
        "can_teleport": false,
        "can_spawn_items": false,
        "can_modify_gold": false,
        "can_view_tickets": false,
        "can_send_announcements": false,
        "can_view_player_data": false,
        "can_modify_player_data": false,
        "can_access_market_free": false,
        "can_invisible": false,
        "can_god_mode": false
    }',
    
    is_active BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE,
    is_on_duty BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_action_at TIMESTAMPTZ
);

-- GM Aksiyonları Log
CREATE TABLE gm_action_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gm_id UUID NOT NULL REFERENCES gm_accounts(id),
    
    action_type VARCHAR(50) NOT NULL,
    target_account_id UUID REFERENCES accounts(id),
    target_character_id UUID REFERENCES characters(id),
    
    details JSONB NOT NULL,
    reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gm_logs_gm ON gm_action_logs(gm_id);
CREATE INDEX idx_gm_logs_target ON gm_action_logs(target_account_id);
CREATE INDEX idx_gm_logs_date ON gm_action_logs(created_at);

-- Yasaklamalar (Ban)
CREATE TABLE bans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id),
    
    ban_type VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    
    banned_by UUID NOT NULL REFERENCES gm_accounts(id),
    
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    is_active BOOLEAN DEFAULT TRUE,
    unbanned_by UUID REFERENCES gm_accounts(id),
    unbanned_at TIMESTAMPTZ,
    unban_reason TEXT,
    
    banned_ip INET,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bans_account ON bans(account_id);
CREATE INDEX idx_bans_active ON bans(is_active) WHERE is_active = TRUE;

-- Susturmalar (Mute)
CREATE TABLE mutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id),
    
    mute_type VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    
    muted_by UUID NOT NULL REFERENCES gm_accounts(id),
    
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mutes_character ON mutes(character_id);
CREATE INDEX idx_mutes_active ON mutes(is_active, expires_at) WHERE is_active = TRUE;

-- Duyurular
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id INTEGER REFERENCES servers(id),
    
    announcement_type VARCHAR(20) NOT NULL,
    
    title VARCHAR(200),
    message TEXT NOT NULL,
    
    show_in_chat BOOLEAN DEFAULT TRUE,
    show_as_popup BOOLEAN DEFAULT FALSE,
    show_in_ticker BOOLEAN DEFAULT FALSE,
    
    color VARCHAR(7) DEFAULT '#FFD700',
    icon VARCHAR(50),
    
    created_by UUID REFERENCES gm_accounts(id),
    
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_active ON announcements(is_active, starts_at, expires_at);

-- Ticket Sistemi
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id INTEGER NOT NULL REFERENCES servers(id),
    
    reporter_id UUID NOT NULL REFERENCES characters(id),
    
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    screenshots TEXT[],
    related_character_id UUID REFERENCES characters(id),
    
    status VARCHAR(20) DEFAULT 'open',
    
    assigned_to UUID REFERENCES gm_accounts(id),
    assigned_at TIMESTAMPTZ,
    
    resolution TEXT,
    resolved_by UUID REFERENCES gm_accounts(id),
    resolved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_status ON tickets(status) WHERE status IN ('open', 'in_progress');
CREATE INDEX idx_tickets_reporter ON tickets(reporter_id);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_to);

-- Ticket Mesajları
CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    
    sender_type VARCHAR(20) NOT NULL,
    sender_character_id UUID REFERENCES characters(id),
    sender_gm_id UUID REFERENCES gm_accounts(id),
    
    message TEXT NOT NULL,
    
    is_internal BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- Private Mesajlar (Whisper)
CREATE TABLE private_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    sender_id UUID NOT NULL REFERENCES characters(id),
    recipient_id UUID NOT NULL REFERENCES characters(id),
    
    message TEXT NOT NULL,
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    is_gm_message BOOLEAN DEFAULT FALSE,
    
    deleted_by_sender BOOLEAN DEFAULT FALSE,
    deleted_by_recipient BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pm_sender ON private_messages(sender_id);
CREATE INDEX idx_pm_recipient ON private_messages(recipient_id);
CREATE INDEX idx_pm_unread ON private_messages(recipient_id, is_read) WHERE is_read = FALSE;

-- GM Online Durumu
CREATE TABLE gm_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gm_id UUID UNIQUE NOT NULL REFERENCES gm_accounts(id),
    
    is_online BOOLEAN DEFAULT FALSE,
    is_on_duty BOOLEAN DEFAULT FALSE,
    is_invisible BOOLEAN DEFAULT FALSE,
    
    current_server_id INTEGER REFERENCES servers(id),
    current_map_id INTEGER REFERENCES maps(id),
    
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);