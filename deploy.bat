@echo off
REM SeeNotify Deployment Script for Windows
REM This script automates the deployment of the SeeNotify application

setlocal enabledelayedexpansion

REM Colors for output (Windows 10+)
set "BLUE=[94m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Check if Docker is installed
:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not installed. Please install Docker Desktop first."
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit /b 1
)

call :print_success "Docker and Docker Compose are installed"
goto :eof

REM Check if required files exist
:check_files
if not exist "docker-compose.yml" (
    call :print_error "Required file docker-compose.yml not found"
    exit /b 1
)
if not exist "seenotify_backend\Dockerfile" (
    call :print_error "Required file seenotify_backend\Dockerfile not found"
    exit /b 1
)
if not exist "backend\Dockerfile" (
    call :print_error "Required file backend\Dockerfile not found"
    exit /b 1
)
if not exist "nginx.conf" (
    call :print_error "Required file nginx.conf not found"
    exit /b 1
)

call :print_success "All required files found"
goto :eof

REM Create SSL certificates for development
:create_ssl_certs
if not exist "ssl" (
    call :print_status "Creating SSL directory..."
    mkdir ssl
)

if not exist "ssl\cert.pem" (
    call :print_status "Generating self-signed SSL certificates for development..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl\key.pem -out ssl\cert.pem -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    call :print_success "SSL certificates generated"
) else (
    call :print_status "SSL certificates already exist"
)
goto :eof

REM Create MongoDB initialization script
:create_mongo_init
if not exist "mongo-init.js" (
    call :print_status "Creating MongoDB initialization script..."
    (
        echo db = db.getSiblingDB^('seenotify'^);
        echo.
        echo // Create collections
        echo db.createCollection^('users'^);
        echo db.createCollection^('notifications'^);
        echo db.createCollection^('spam_reports'^);
        echo.
        echo // Create indexes
        echo db.users.createIndex^({ "email": 1 }, { unique: true }^);
        echo db.notifications.createIndex^({ "userId": 1, "createdAt": -1 }^);
        echo db.spam_reports.createIndex^({ "notificationId": 1 }^);
        echo.
        echo print^('MongoDB initialization completed'^);
    ) > mongo-init.js
    call :print_success "MongoDB initialization script created"
) else (
    call :print_status "MongoDB initialization script already exists"
)
goto :eof

REM Build and start services
:deploy_services
call :print_status "Building and starting services..."

REM Stop existing containers
docker-compose down --remove-orphans

REM Build images
call :print_status "Building Docker images..."
docker-compose build --no-cache

REM Start services
call :print_status "Starting services..."
docker-compose up -d

call :print_success "Services started successfully"
goto :eof

REM Wait for services to be ready
:wait_for_services
call :print_status "Waiting for services to be ready..."

REM Wait for MongoDB
call :print_status "Waiting for MongoDB..."
:wait_mongo
docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto wait_mongo
)
call :print_success "MongoDB is ready"

REM Wait for Node.js backend
call :print_status "Waiting for Node.js backend..."
:wait_node
curl -f http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto wait_node
)
call :print_success "Node.js backend is ready"

REM Wait for Django backend
call :print_status "Waiting for Django backend..."
:wait_django
curl -f http://localhost:8000/health/ >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto wait_django
)
call :print_success "Django backend is ready"
goto :eof

REM Show service status
:show_status
call :print_status "Service Status:"
echo.
docker-compose ps
echo.

call :print_status "Service URLs:"
echo   Node.js Backend: http://localhost:5000
echo   Django Backend:  http://localhost:8000
echo   Nginx Proxy:     https://localhost ^(SSL^)
echo.

call :print_status "Health Check URLs:"
echo   Node.js Health:  http://localhost:5000/health
echo   Django Health:   http://localhost:8000/health/
echo.
goto :eof

REM Show logs
:show_logs
call :print_status "Recent logs from all services:"
docker-compose logs --tail=20
goto :eof

REM Cleanup function
:cleanup
call :print_status "Cleaning up..."
docker-compose down --volumes --remove-orphans
call :print_success "Cleanup completed"
goto :eof

REM Main deployment function
:main
call :print_status "Starting SeeNotify deployment..."
echo.

REM Check prerequisites
call :check_docker
call :check_files

REM Create necessary files
call :create_ssl_certs
call :create_mongo_init

REM Deploy services
call :deploy_services

REM Wait for services
call :wait_for_services

REM Show status
call :show_status

call :print_success "Deployment completed successfully!"
echo.
call :print_status "You can now access your SeeNotify application at:"
echo   https://localhost
echo.
call :print_warning "For production deployment, please:"
echo   1. Update environment variables in docker-compose.yml
echo   2. Replace self-signed SSL certificates with real ones
echo   3. Configure proper domain names
echo   4. Set up monitoring and logging
echo.
goto :eof

REM Handle command line arguments
if "%1"=="" goto deploy
if "%1"=="deploy" goto deploy
if "%1"=="status" goto status
if "%1"=="logs" goto logs
if "%1"=="cleanup" goto cleanup
if "%1"=="restart" goto restart

echo Usage: %0 {deploy^|status^|logs^|cleanup^|restart}
echo.
echo Commands:
echo   deploy   - Deploy the entire application ^(default^)
echo   status   - Show service status and URLs
echo   logs     - Show recent logs from all services
echo   cleanup  - Stop and remove all containers and volumes
echo   restart  - Restart all services
exit /b 1

:deploy
call :main
goto :eof

:status
call :show_status
goto :eof

:logs
call :show_logs
goto :eof

:cleanup
call :cleanup
goto :eof

:restart
call :print_status "Restarting services..."
docker-compose restart
call :show_status
goto :eof 