# Docker Setup Guide

This project is dockerized with the following services:

- **Backend**: FastAPI application with uv package manager
- **Frontend**: Next.js application
- **Traefik**: Reverse proxy for routing
- **MySQL**: External database (running on host)

## Prerequisites

1. **Docker and Docker Compose** installed
2. **MySQL** running on localhost:3306 with:
   - Username: `root`
   - Password: (none)
   - Database: Create a database named `ipbb_db`

## Quick Start

1. **Clone and navigate to the project**:

   ```bash
   cd /path/to/your/project
   ```

2. **Set up environment variables**:

   ```bash
   # Windows
   setup.bat

   # Unix/Linux/Mac
   chmod +x setup.sh && ./setup.sh
   ```

   This will create `.env` files in both `backend/` and `frontend/` directories from their respective templates.

3. **Edit the environment files**:

   - Edit `backend/.env` with your database credentials and API keys
   - Edit `frontend/.env` with your frontend configuration

4. **Build and run the services**:
   ```bash
   docker compose up --build
   ```

## Service Access

- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:8000
- **Traefik Dashboard**: http://localhost:8080

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (Next.js)     │    │   (FastAPI)     │
│   Port: 3000    │    │   Port: 8000    │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌─────────────────┐
          │    Traefik      │
          │  (Reverse Proxy)│
          │  Frontend: :80  │
          │  Backend: :8000 │
          └─────────────────┘
                     │
          ┌─────────────────┐
          │     MySQL       │
          │ (External Host) │
          │   Port: 3306    │
          └─────────────────┘
```

## Environment Files

### Backend (.env)

Located in `backend/.env`:

- `DATABASE_URL`: MySQL connection string
- `ACCESS_SECRET_KEY`, `REFRESH_SECRET_KEY`: JWT secret keys
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth credentials
- `CORS_ORIGINS`: Allowed origins for CORS

### Frontend (.env)

Located in `frontend/.env`:

- `NEXT_PUBLIC_API_URL`: Backend API URL

## Docker Commands

### Using Make (Recommended)

```bash
make up      # Start all services
make down    # Stop all services
make logs    # View all logs
make build   # Build all images
make clean   # Clean up everything
```

### Using Docker Compose Directly

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild and restart
docker compose up --build
```

## Development

For local development without Docker:

### Backend Development

```bash
cd backend
uv sync
uv run fastapi dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Database Connection

The backend connects to MySQL using:

```
mysql+aiomysql://root@host.docker.internal:3306/ipbb_db
```

- `host.docker.internal` allows containers to connect to services on the host machine
- Make sure your MySQL database is running and accessible
- Create a database named `ipbb_db` in your MySQL instance

## Troubleshooting

1. **Database connection issues**:

   - Ensure MySQL is running on localhost:3306
   - Check if the `ipbb_db` database exists
   - Verify connection credentials in `backend/.env`

2. **Port conflicts**:

   - Make sure ports 80, 8000, and 8080 are available
   - Stop other services using these ports

3. **Build failures**:

   - Check Docker logs: `docker compose logs`
   - Ensure all dependencies are properly specified
   - Try rebuilding: `docker compose build --no-cache`

4. **Environment variables not loading**:
   - Ensure `.env` files exist in `backend/` and `frontend/` directories
   - Check file permissions and formatting

## Production Deployment

For production deployment:

1. Update environment variables in both `.env` files for production
2. Use production-ready database configuration
3. Configure proper SSL certificates in Traefik
4. Set up proper logging and monitoring
5. Use production-optimized Docker images
