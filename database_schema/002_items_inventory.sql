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
