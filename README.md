# Lear(n)alie — Personal Video Tutorial Platform

> **"Learn something new, your way."**

Lear(n)alie adalah platform website untuk mengumpulkan, mengatur, dan mengakses video tutorial dari YouTube dalam satu tempat terpusat. Video dikelompokkan secara hierarkis berdasarkan kategori dan subkategori, dengan akses yang dilindungi secara ketat berdasarkan role pengguna.

---

## 🚀 Fitur Utama

- **Penyimpanan Metadata YouTube & Embed Aman:** Mendukung URL standar `youtube.com/watch?v=...`, short URL `youtu.be/...`, dan `youtube.com/shorts/...`. Memanfaatkan player YouTube Embed resmi tanpa menyimpan video fisik (arsitektur Rp0/bulan).
- **Sistem Role & Status Akun Dinamis:**
  - Status Akun: `PENDING` (menunggu persetujuan admin), `ACTIVE` (aktif), `SUSPENDED` (ditangguhkan).
  - Role Bawaan: `ADMIN`, `EDUCATION`, `GAMING`, serta kemampuan membuat role kustom tanpa batas melalui panel admin.
- **Isolasi Konten Berdasarkan Role:** Pengguna hanya dapat melihat dan mencari video `PUBLISHED` yang diizinkan untuk role mereka. Video berstatus `DRAFT` hanya dapat diakses oleh admin.
- **Dashboard Admin Lengkap:**
  - Statistik platform (ringkasan video, pengguna aktif/pending/suspended, kategori, role).
  - Manajemen persetujuan akun baru dan penetapan role.
  - CRUD Kategori & Subkategori hierarkis.
  - CRUD Video dengan live preview YouTube thumbnail.
  - CRUD Role & proteksi role sistem.
- **Desain Modern & Responsif:** Dibangun dengan React 18, Vite, Tailwind CSS, Lucide Icons, glassmorphism, dan tipografi Plus Jakarta Sans.

---

## 🛠️ Tech Stack

| Komponen | Teknologi | Target Layanan ($0/Bulan) |
|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS + React Router | **Netlify Free** |
| **Backend** | Node.js (ES Modules) + Express + Zod Validation | **Render Free** |
| **Database** | PostgreSQL + Prisma ORM | **Supabase Free** |
| **Video** | YouTube Embed Iframe API | YouTube Free CDN |

---

## 📁 Struktur Direktori

```text
Lear(n)alie/
├── backend/
│   ├── prisma/
│   │   ├── migrations/         # PostgreSQL DDL migrations
│   │   ├── schema.prisma       # Schema User, Role, Category, Video, VideoRole
│   │   └── seed.js             # Data awal role, kategori, dan Super Admin
│   ├── src/
│   │   ├── config/             # Environment & Prisma client instance
│   │   ├── controllers/        # Auth, Video, Category, Role, User, Dashboard
│   │   ├── middleware/         # JWT Auth, Role Guard, Zod Validate, Error Handlers
│   │   ├── routes/             # REST API Endpoints
│   │   ├── utils/              # YouTube ID parser, slug generator, response formatter
│   │   ├── app.js              # Express app & middleware
│   │   └── server.js           # Server entry point
│   ├── test/                   # Automated unit tests
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, VideoCard, YouTubeEmbed, ProtectedRoute, AdminLayout
│   │   ├── context/            # AuthContext (login, register, logout, status checkers)
│   │   ├── pages/              # Landing, Login, Register, Pending, Dashboard, VideoDetail, Admin Pages
│   │   ├── services/           # Axios client dengan JWT interceptor
│   │   ├── App.jsx             # React Router routing
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## 💻 Panduan Instalasi Lokal

### 1. Prasyarat
- **Node.js**: v18 atau v20+ (diuji pada Node.js v22)
- **PostgreSQL**: Lokal (Port 5432) atau Database PostgreSQL gratis dari [Supabase](https://supabase.com).

### 2. Setup Backend
Masuk ke direktori `backend`:
```bash
cd backend
npm install
```

Salin file lingkungan:
```bash
cp .env.example .env
```

Sesuaikan konfigurasi pada `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/learnalie?schema=public"
AUTH_SECRET="ganti_dengan_random_secret_minimal_32_karakter"
FRONTEND_ORIGIN="http://localhost:5173"

INITIAL_ADMIN_EMAIL="admin@learnalie.com"
INITIAL_ADMIN_NAME="Learnalie Administrator"
INITIAL_ADMIN_PASSWORD="AdminLearnalie123!"
```

Jalankan generate Prisma client dan migrasi:
```bash
# Generate client
npm run prisma:generate

# Eksekusi migrasi skema ke database
npx prisma migrate deploy
# atau
npm run prisma:push

# Jalankan seeder (Roles, Kategori awal, dan akun Super Admin)
npm run prisma:seed
```

Jalankan backend development server:
```bash
npm run dev
# Server berjalan di http://localhost:5000
```

### 3. Setup Frontend
Buka terminal baru dan masuk ke direktori `frontend`:
```bash
cd frontend
npm install
```

Salin file konfigurasi:
```bash
cp .env.example .env
```

Pastikan `frontend/.env` terarah ke backend lokal:
```env
VITE_API_BASE_URL="http://localhost:5000/api"
```

Jalankan frontend:
```bash
npm run dev
# Web app berjalan di http://localhost:5173
```

---

## 🔑 Kredensial Super Admin Bawaan (Hasil Seeder)

Setelah menjalankan `npm run prisma:seed`, Anda dapat langsung login menggunakan:

- **Email:** `admin@learnalie.com` *(atau sesuai `INITIAL_ADMIN_EMAIL` di `.env`)*
- **Password:** `AdminLearnalie123!` *(atau sesuai `INITIAL_ADMIN_PASSWORD` di `.env`)*
- **Role:** `ADMIN` (Akses penuh ke `/admin`)

---

## 🧪 Menjalankan Pengujian (Testing)

Suite pengujian unit otomatis telah disiapkan untuk memverifikasi keamanan ekstraksi URL YouTube, slug generator, dan skema validasi Zod:

```bash
cd backend
npm test
```

Untuk menguji build bundle frontend:
```bash
cd frontend
npm run build
```

---

## 🌐 Panduan Deployment Gratis (Rp0 / Bulan)

### 1. Database (Supabase PostgreSQL)
1. Buat proyek baru di [Supabase.com](https://supabase.com) (Pilih Free Tier).
2. Salin *Connection String URI* (Mode `Transaction` atau `Session`).
3. Dari komputer lokal Anda, jalankan migrasi ke Supabase:
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" npx prisma db push
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" npm run prisma:seed
   ```

### 2. Backend (Render Free Web Service)
1. Buat Web Service baru di [Render.com](https://render.com).
2. Hubungkan repository GitHub ini, atur **Root Directory** ke `backend`.
3. Atur **Build Command**: `npm install && npm run prisma:generate`
4. Atur **Start Command**: `npm start`
5. Tambahkan Environment Variables di dashboard Render:
   - `DATABASE_URL`: URI PostgreSQL Supabase Anda.
   - `AUTH_SECRET`: String acak aman (minimal 32 karakter).
   - `FRONTEND_ORIGIN`: Domain frontend Netlify Anda (contoh: `https://learnalie.netlify.app`).
   - `NODE_ENV`: `production`

### 3. Frontend (Netlify Free)
1. Buat site baru di [Netlify.com](https://netlify.com) dari GitHub.
2. Atur **Base Directory**: `frontend`
3. Atur **Build Command**: `npm run build`
4. Atur **Publish Directory**: `frontend/dist`
5. Tambahkan Environment Variable:
   - `VITE_API_BASE_URL`: URL backend Render Anda (contoh: `https://learnalie-backend.onrender.com/api`).
6. Siapkan `_redirects` di public folder untuk Single Page Application routing jika diperlukan:
   ```text
   /*    /index.html   200
   ```

---

## 📄 Lisensi
Lear(n)alie dikembangkan untuk kebutuhan pribadi dan komunitas belajar tertutup. Hak cipta dilindungi.
