@echo off
echo Setting up Docker environment for IPBB project...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker compose version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker Compose is not available
    echo Please ensure Docker Desktop is running
    pause
    exit /b 1
)

echo Docker is available!

REM Create backend .env file if it doesn't exist
if not exist backend\.env (
    echo Creating backend/.env file from template...
    copy backend\.env.example backend\.env
    echo Please edit backend/.env file with your actual configuration.
) else (
    echo backend/.env file already exists.
)

REM Create frontend .env file if it doesn't exist
if not exist frontend\.env (
    echo Creating frontend/.env file from template...
    copy frontend\.env.example frontend\.env
    echo Please edit frontend/.env file with your actual configuration.
) else (
    echo frontend/.env file already exists.
)

REM Check if MySQL is running (optional check)
echo Checking MySQL connection...
netstat -an | findstr :3306 >nul
if errorlevel 1 (
    echo Warning: No service detected on port 3306
    echo Please ensure MySQL is running on localhost:3306
    echo.
) else (
    echo MySQL service detected on port 3306
)

echo.
echo Setup complete! You can now run:
echo   docker compose up --build
echo.
echo Or use the Makefile commands:
echo   make up      (start services)
echo   make logs    (view logs)
echo   make down    (stop services)
echo.

pause