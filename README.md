# Realm of Conquest

Browser tabanlı, turn-based MMORPG oyunu.

## Teknoloji Stack

### Backend
- **Go (Golang)** - Chi Router + pgx
- **PostgreSQL** - Supabase
- **JWT** - Authentication

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management
- **PixiJS** - 2D rendering (yakında)
- **Rive** - Animasyonlar (yakında)

## Kurulum

### Backend

```bash
cd backend

# .env dosyasını düzenle
cp .env.example .env
# DATABASE_URL'i Supabase connection string ile güncelle

# Bağımlılıkları indir
go mod download

# Sunucuyu başlat
go run cmd/server/main.go
```

### Frontend

```bash
cd frontend

# Bağımlılıkları indir
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Kayıt ol
- `POST /api/v1/auth/login` - Giriş yap
- `GET /api/v1/auth/me` - Mevcut kullanıcı bilgisi

### Characters
- `GET /api/v1/characters` - Karakterleri listele
- `POST /api/v1/characters` - Karakter oluştur
- `GET /api/v1/characters/:id` - Karakter detayı
- `DELETE /api/v1/characters/:id` - Karakter sil

## Sınıflar

| Sınıf | Rol | HP | MP | Kritik |
|-------|-----|----|----|--------|
| ⚔️ Savaşçı | Tank/Melee DPS | 120 | 40 | %5 |
| 🏹 Okçu | Ranged DPS | 80 | 60 | %15 |
| 🔮 Büyücü | Burst/AoE | 60 | 120 | %10 |
| ✨ Şifacı | Support/Heal | 90 | 100 | %5 |
| 🗡️ Ninja | Assassin | 70 | 70 | %25 |

## Proje Yapısı

```
realm-of-conquest/
├── backend/
│   ├── cmd/server/main.go
│   └── internal/
│       ├── config/
│       ├── database/
│       ├── handlers/
│       ├── middleware/
│       ├── models/
│       └── services/
├── frontend/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── stores/
│       └── types/
└── Game-Design-Document.md
```

## Lisans

Tüm hakları saklıdır.
