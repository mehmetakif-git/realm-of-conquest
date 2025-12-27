# 🗄️ REALM OF CONQUEST - DATABASE ŞEMASI

## 📋 Genel Bakış

Bu doküman, Realm of Conquest oyununun veritabanı yapısını açıklar.

**Teknoloji:** PostgreSQL (Supabase)  
**Toplam Tablo:** 75+  
**Toplam Satır:** ~2,800 SQL satırı

---

## 📁 Migration Dosyaları

| Dosya | İçerik | Tablo Sayısı |
|-------|--------|--------------|
| `001_core_tables.sql` | Kullanıcı, Sunucu, Karakter | 12 |
| `002_items_inventory.sql` | Item, Envanter, Craft | 10 |
| `003_guild_system.sql` | Lonca, Bölge Kontrolü, Savaş | 14 |
| `004_dungeon_caravan_trade.sql` | Dungeon, Kervan, Ticaret, Taksi | 18 |
| `005_fishing_mining_prison_pets.sql` | Balık, Maden, Hapishane, Pet, Mount, Ev, Battle Pass | 20 |
| `006_social_classes_logs.sql` | Sosyal, Sınıf Data, Log | 15+ |

---

## 🏗️ Tablo Kategorileri

### 1️⃣ Kullanıcı & Hesap (5 tablo)
```
accounts              - Ana hesap bilgileri
sessions              - Aktif oturumlar
devices               - Cihaz parmak izleri
ip_history            - IP geçmişi
daily_rewards         - Günlük giriş ödülleri
```

### 2️⃣ Sunucu & Harita (3 tablo)
```
servers               - Sunucu listesi
maps                  - Harita tanımları
map_zones             - Kontrol edilebilir bölgeler
```

### 3️⃣ Karakter (5 tablo)
```
characters            - Ana karakter bilgileri
character_skills      - Karakter skill'leri
character_stats       - İstatistikler (achievement için)
character_cooldowns   - Günlük limitler
character_equipment   - Ekipman slotları (hızlı erişim)
```

### 4️⃣ Item & Envanter (8 tablo)
```
item_definitions      - Item tanımları (master data)
item_sets             - Set bonusları
gem_definitions       - Gem tanımları
character_inventory   - Karakter envanteri
character_equipment   - Ekipman
account_storage       - Hesap deposu
upgrade_history       - +Basma geçmişi
craft_recipes         - Craft tarifleri
```

### 5️⃣ Lonca (12 tablo)
```
guilds                        - Lonca bilgileri
guild_members                 - Üyeler
guild_relations               - Dost/Düşman ilişkileri
guild_applications            - Başvurular
guild_quests                  - Lonca görevleri
guild_quest_contributions     - Görev katkıları
zone_control                  - Bölge kontrolü
guild_wars                    - Lonca savaşları
guild_war_participants        - Savaş katılımcıları
guild_storage                 - Lonca deposu
guild_logs                    - Lonca log
guild_specialization_bonuses  - Uzmanlık bonusları
```

### 6️⃣ Dungeon (6 tablo)
```
dungeon_definitions    - Dungeon tanımları
dungeon_bosses         - Boss tanımları
loot_tables            - Loot tabloları
loot_table_entries     - Loot içerikleri
dungeon_instances      - Aktif instance'lar
dungeon_participants   - Katılımcılar
```

### 7️⃣ Kervan & Ticaret (10 tablo)
```
caravan_routes         - Rota tanımları
caravan_types          - Kervan tipleri
caravans               - Aktif kervanlar
caravan_guards         - Koruyucular
caravan_attacks        - Saldırı kayıtları
guard_listings         - Koruyucu panosu
market_listings        - Pazar ilanları
player_trades          - Oyuncu ticareti
price_history          - Fiyat geçmişi
taxi_listings          - Taksi ilanları
```

### 8️⃣ Balık & Maden (6 tablo)
```
fishing_spots          - Balık noktaları
fish_definitions       - Balık tanımları
character_fishing      - Balıkçılık durumu
mining_nodes           - Maden noktaları
ore_definitions        - Cevher tanımları
character_mining       - Madencilik durumu
```

### 9️⃣ Hapishane (5 tablo)
```
prison_records              - Mahkumiyet kayıtları
prison_activities           - Aktiviteler
prison_pvp_rankings         - PvP sıralaması
prison_escape_events        - Kaçış eventleri
prison_escape_participants  - Kaçış katılımcıları
```

### 🔟 Pet & Mount (4 tablo)
```
pet_definitions        - Pet tanımları
character_pets         - Karakter petleri
mount_definitions      - Mount tanımları
character_mounts       - Karakter mountları
```

### 1️⃣1️⃣ Ev Sistemi (3 tablo)
```
house_types            - Ev tipleri
character_houses       - Karakter evleri
house_furniture        - Mobilyalar
```

### 1️⃣2️⃣ Battle Pass & Sezon (5 tablo)
```
seasons                    - Sezon tanımları
battle_pass_rewards        - BP ödülleri
character_battle_pass      - Karakter BP ilerlemesi
season_quests              - Sezon görevleri
character_season_quests    - Görev ilerlemesi
```

### 1️⃣3️⃣ Achievement (2 tablo)
```
achievement_definitions    - Achievement tanımları
character_achievements     - Karakter achievementları
```

### 1️⃣4️⃣ Sosyal (7 tablo)
```
friendships            - Arkadaşlık
mail                   - Posta sistemi
chat_messages          - Sohbet (backup)
parties                - Parti
party_members          - Parti üyeleri
mentorships            - Mentor sistemi
player_reports         - Raporlama
```

### 1️⃣5️⃣ World Boss (3 tablo)
```
world_boss_definitions     - Boss tanımları
world_boss_instances       - Aktif bosslar
world_boss_participants    - Katılımcılar
```

### 1️⃣6️⃣ Class & Skill Data (3 tablo)
```
class_definitions          - Sınıf tanımları
specialization_definitions - Uzmanlaşma tanımları
skill_definitions          - Skill tanımları
```

### 1️⃣7️⃣ Log & Analytics (5 tablo)
```
economy_logs               - Ekonomi hareketleri
pvp_logs                   - PvP kayıtları
login_logs                 - Giriş kayıtları
suspicious_activity_logs   - Şüpheli aktiviteler
item_logs                  - Item hareketleri
```

---

## 🔑 Önemli ENUM Tipleri

```sql
class_type: warrior, archer, mage, healer, ninja

specialization_type: berserker, paladin, sharpshooter, trapper,
                     dark_mage, elementalist, druid, priest,
                     assassin, shadow_dancer

flag_type: red, blue

item_rarity: common, uncommon, rare, epic, legendary, mythic

guild_specialization: warrior_guild, protector_guild, bandit_guild,
                      dungeon_guild, fisher_guild, miner_guild,
                      crafter_guild, merchant_guild, peace_guild,
                      prisoner_guild

caravan_status: preparing, traveling, under_attack, completed,
                failed, destroyed

dungeon_difficulty: normal, hard, nightmare, hell
```

---

## 📊 İlişki Diyagramı (Basitleştirilmiş)

```
accounts (1) ─────────────< (N) characters
     │                           │
     │                           ├──< character_skills
     │                           ├──< character_inventory
     │                           ├──< character_stats
     │                           │
     │                           └──> guilds (N:1)
     │                                  │
     └──< sessions                      ├──< guild_members
     └──< devices                       ├──< guild_wars
     └──< ip_history                    └──< zone_control
                                              │
                                              └──> map_zones
                                                      │
                                                      └──> maps
```

---

## 🚀 Kurulum

### 1. Supabase'de yeni proje oluştur

### 2. Migration dosyalarını sırayla çalıştır:
```bash
psql -h <host> -U postgres -d postgres -f 001_core_tables.sql
psql -h <host> -U postgres -d postgres -f 002_items_inventory.sql
psql -h <host> -U postgres -d postgres -f 003_guild_system.sql
psql -h <host> -U postgres -d postgres -f 004_dungeon_caravan_trade.sql
psql -h <host> -U postgres -d postgres -f 005_fishing_mining_prison_pets.sql
psql -h <host> -U postgres -d postgres -f 006_social_classes_logs.sql
```

### Ya da tek dosya olarak:
```bash
psql -h <host> -U postgres -d postgres -f full_database_schema.sql
```

---

## ⚡ Performans İndeksleri

Kritik sorgular için optimize edilmiş indeksler:

| Tablo | İndeks | Amaç |
|-------|--------|------|
| characters | idx_characters_online | Online oyuncuları hızlı bul |
| characters | idx_characters_server_level | Seviye bazlı sıralama |
| market_listings | idx_market_listings_active | Aktif ilanları filtrele |
| caravans | idx_caravans_status | Aktif kervanları bul |
| guild_members | idx_guild_members_guild | Lonca üyelerini listele |

---

## 🔒 Güvenlik Notları

1. **Row Level Security (RLS)**: Supabase'de aktifleştir
2. **Hassas veriler**: password_hash, two_factor_secret şifrelenmiş tutulmalı
3. **Trust Score**: Otomatik trigger ile güncellenir
4. **Log tabloları**: Retention policy uygula (30-90 gün)

---

## 📝 Sonraki Adımlar

1. ✅ Database şeması tamamlandı
2. ⏳ **API Specification** - Tüm endpoint tanımları
3. ⏳ **Proje yapısı** - Go backend + React frontend
4. ⏳ **MVP geliştirme** - İlk çalışan versiyon

---

*Doküman Versiyonu: 1.0*  
*Tarih: Aralık 2024*
