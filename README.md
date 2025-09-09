# Proyek IPBB

Aplikasi web full-stack dengan backend FastAPI dan frontend Next.js, menggunakan database MySQL dan reverse proxy Traefik.

## 🏗️ Arsitektur

- **Backend**: FastAPI dengan Python 3.12, menggunakan package manager uv
- **Frontend**: Next.js dengan React 19 dan TypeScript
- **Database**: MySQL 8.0
- **Reverse Proxy**: Traefik v3.0
- **Kontainerisasi**: Docker & Docker Compose

## 📋 Prasyarat

### Untuk Development (Lokal)

- [Python 3.12](https://www.python.org/downloads/)
- [uv](https://docs.astral.sh/uv/getting-started/installation/) - Python package manager
- [Node.js 20+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- [MySQL 8.0](https://dev.mysql.com/downloads/mysql/) (opsional, bisa menggunakan Docker)

### Untuk Docker (Direkomendasikan)

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🚀 Memulai Cepat dengan Docker (Direkomendasikan)

### 1. Clone dan Setup

```bash
git clone <repository-url>
cd ipbb
cp .env.example .env
```

### 2. Menjalankan Environment Development

```bash
# Menjalankan semua service (frontend, backend, database, traefik)
docker-compose up --build

# Atau jalankan dalam mode detached
docker-compose up -d --build
```

### 3. Mengakses Aplikasi

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Dokumentasi API**: http://localhost/docs
- **Dashboard Traefik**: http://localhost:8080
- **MySQL**: localhost:3306

### 4. Menghentikan Service

```bash
docker-compose down
```

## 🛠️ Setup Development Lokal

### Setup Backend

1. **Masuk ke direktori backend**:

   ```bash
   cd backend
   ```

2. **Install uv** (jika belum terinstall):

   ```bash
   # Windows (PowerShell)
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

   # macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

3. **Install dependencies**:

   ```bash
   uv sync
   ```

4. **Setup database** (jika menggunakan MySQL lokal):

   - Install MySQL 8.0
   - Buat database: `ipbb_db`
   - Buat user: `ipbb_user` dengan password: `ipbb_password`
   - Update `DATABASE_URL` di environment

5. **Jalankan migrasi database**:

   ```bash
   uv run alembic upgrade head
   ```

6. **Menjalankan backend server**:

   ```bash
   uv run fastapi dev
   ```

   Atau gunakan script yang disediakan:

   ```bash
   # Windows
   ..\start-backend.bat

   # Unix/Linux/macOS
   ../start-backend.sh
   ```

Backend akan tersedia di: http://localhost:8000

### Setup Frontend

1. **Masuk ke direktori frontend**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Menjalankan development server**:

   ```bash
   npm run dev
   ```

   Atau gunakan script yang disediakan:

   ```bash
   # Windows
   ..\start-frontend.bat

   # Unix/Linux/macOS
   ../start-frontend.sh
   ```

Frontend akan tersedia di: http://localhost:3000

## 🐳 Perintah Docker

### Development

```bash
# Menjalankan semua service
docker-compose up --build

# Menjalankan service tertentu
docker-compose up backend
docker-compose up frontend

# Melihat logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Eksekusi perintah di container yang berjalan
docker-compose exec backend bash
docker-compose exec frontend sh

# Rebuild service tertentu
docker-compose build backend
docker-compose build frontend
```

### Manajemen Database

```bash
# Akses MySQL shell
docker-compose exec mysql mysql -u ipbb_user -p ipbb_db

# Backup database
docker-compose exec mysql mysqldump -u ipbb_user -p ipbb_db > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u ipbb_user -p ipbb_db < backup.sql
```

## 🚀 Deployment Production

### 1. Konfigurasi Environment

```bash
# Copy dan edit file environment
cp .env.example .env

# Edit .env dengan nilai production
DOMAIN=namadomain.com
MYSQL_ROOT_PASSWORD=password-root-yang-aman
MYSQL_PASSWORD=password-yang-aman
```

### 2. Deploy dengan Docker Compose

```bash
# Menjalankan service production
docker-compose -f docker-compose.prod.yml up -d --build

# Melihat logs production
docker-compose -f docker-compose.prod.yml logs -f

# Menghentikan service production
docker-compose -f docker-compose.prod.yml down
```

### 3. Fitur Production

- **SSL/TLS**: Sertifikat Let's Encrypt otomatis
- **HTTP ke HTTPS**: Redirect otomatis
- **Security Headers**: Middleware keamanan yang ditingkatkan
- **Health Checks**: Monitoring database dan service
- **Restart Policies**: Recovery container otomatis

### 4. Setup Domain

1. Arahkan domain Anda ke IP server
2. Update `DOMAIN` di file `.env`
3. Restart service untuk generasi sertifikat SSL

## 📁 Struktur Proyek

```
ipbb/
├── backend/                    # Backend FastAPI
│   ├── app/                   # Kode aplikasi
│   ├── alembic/              # Migrasi database
│   ├── pyproject.toml        # Dependencies Python
│   └── uv.lock              # Lock file
├── frontend/                  # Frontend Next.js
│   ├── app/                  # Halaman app router
│   ├── components/           # Komponen React
│   ├── lib/                  # Utilities
│   └── package.json         # Dependencies Node
├── docker-compose.yml        # Setup development
├── docker-compose.prod.yml   # Setup production
├── Dockerfile.backend        # Container backend
├── Dockerfile.frontend       # Container frontend
├── traefik.yml              # Konfigurasi Traefik
├── start-backend.sh/.bat    # Script startup backend
├── start-frontend.sh/.bat   # Script startup frontend
└── .env.example             # Template environment
```

## 🔧 Konfigurasi

### Environment Variables

#### Database

- `MYSQL_ROOT_PASSWORD`: Password root MySQL
- `MYSQL_DATABASE`: Nama database (default: ipbb_db)
- `MYSQL_USER`: User database (default: ipbb_user)
- `MYSQL_PASSWORD`: Password database
- `DATABASE_URL`: String koneksi database lengkap

#### Aplikasi

- `DOMAIN`: Nama domain Anda (untuk production)
- `NEXT_PUBLIC_API_URL`: Endpoint API frontend
- `ENVIRONMENT`: Environment aplikasi (development/production)

### Konfigurasi Traefik

Traefik dikonfigurasi untuk:

- Route permintaan frontend ke Next.js (port 3000)
- Route permintaan `/api/*` ke FastAPI (port 8000)
- Route `/docs`, `/openapi.json`, `/redoc` ke FastAPI
- Menyediakan sertifikat SSL otomatis di production
- Menawarkan dashboard web untuk monitoring

## 🧪 Workflow Development

### Menjalankan Test

```bash
# Test backend
cd backend
uv run pytest

# Test frontend (jika dikonfigurasi)
cd frontend
npm test
```

### Migrasi Database

```bash
# Buat migrasi baru
cd backend
uv run alembic revision --autogenerate -m "deskripsi"

# Apply migrasi
uv run alembic upgrade head

# Downgrade migrasi
uv run alembic downgrade -1
```

### Kualitas Kode

```bash
# Linting backend
cd backend
uv run ruff check
uv run mypy .

# Linting frontend
cd frontend
npm run lint
```

## 🐛 Troubleshooting

### Masalah Umum

#### Permission Docker Socket (Linux/macOS)

```bash
sudo chmod 666 /var/run/docker.sock
```

#### Port Sudah Digunakan

```bash
# Cek apa yang menggunakan port
netstat -tulpn | grep :80
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Kill proses yang menggunakan port
kill -9 <PID>
```

#### Masalah Koneksi Database

```bash
# Cek logs MySQL
docker-compose logs mysql

# Reset database
docker-compose down -v
docker-compose up -d mysql
```

#### Traefik Tidak Routing

```bash
# Cek dashboard Traefik
http://localhost:8080

# Verifikasi label container
docker inspect <nama_container>
```

### Health Check Service

```bash
# Cek status semua service
docker-compose ps

# Cek logs service tertentu
docker-compose logs -f <nama_service>

# Restart service tertentu
docker-compose restart <nama_service>
```

## 📚 Dokumentasi API

Ketika berjalan, dokumentasi API tersedia di:

- **Swagger UI**: http://localhost/docs (development) atau https://namadomain.com/docs (production)
- **ReDoc**: http://localhost/redoc (development) atau https://namadomain.com/redoc (production)
- **OpenAPI JSON**: http://localhost/openapi.json

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch: `git checkout -b nama-fitur`
3. Buat perubahan Anda
4. Jalankan test: `npm test` dan `pytest`
5. Commit perubahan: `git commit -am 'Tambah fitur'`
6. Push ke branch: `git push origin nama-fitur`
7. Submit pull request

## 📄 Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file LICENSE untuk detail.

## 📞 Dukungan

Untuk dukungan dan pertanyaan:

- Buka issue di GitHub
- Cek bagian troubleshooting di atas
- Review logs: `docker-compose logs`

---

### Referensi Perintah Cepat

```bash
# Development
docker-compose up --build          # Jalankan semua service
docker-compose down                # Hentikan semua service
docker-compose logs -f             # Lihat semua logs

# Production
docker-compose -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.prod.yml down

# Service individual
docker-compose up backend          # Jalankan hanya backend
docker-compose up frontend         # Jalankan hanya frontend
docker-compose restart mysql       # Restart database
```
