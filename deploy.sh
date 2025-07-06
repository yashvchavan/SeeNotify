#!/bin/bash

# SeeNotify Deployment Script
# This script automates the deployment of the SeeNotify application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if required files exist
check_files() {
    local required_files=(
        "docker-compose.yml"
        "seenotify_backend/Dockerfile"
        "backend/Dockerfile"
        "nginx.conf"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file $file not found"
            exit 1
        fi
    done
    
    print_success "All required files found"
}

# Create SSL certificates for development
create_ssl_certs() {
    if [ ! -d "ssl" ]; then
        print_status "Creating SSL directory..."
        mkdir -p ssl
    fi
    
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        print_status "Generating self-signed SSL certificates for development..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        print_success "SSL certificates generated"
    else
        print_status "SSL certificates already exist"
    fi
}

# Create MongoDB initialization script
create_mongo_init() {
    if [ ! -f "mongo-init.js" ]; then
        print_status "Creating MongoDB initialization script..."
        cat > mongo-init.js << 'EOF'
db = db.getSiblingDB('seenotify');

// Create collections
db.createCollection('users');
db.createCollection('notifications');
db.createCollection('spam_reports');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.notifications.createIndex({ "userId": 1, "createdAt": -1 });
db.spam_reports.createIndex({ "notificationId": 1 });

print('MongoDB initialization completed');
EOF
        print_success "MongoDB initialization script created"
    else
        print_status "MongoDB initialization script already exists"
    fi
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Stop existing containers
    docker-compose down --remove-orphans
    
    # Build images
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    print_success "Services started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for MongoDB
    print_status "Waiting for MongoDB..."
    until docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
        sleep 2
    done
    print_success "MongoDB is ready"
    
    # Wait for Node.js backend
    print_status "Waiting for Node.js backend..."
    until curl -f http://localhost:5000/health > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Node.js backend is ready"
    
    # Wait for Django backend
    print_status "Waiting for Django backend..."
    until curl -f http://localhost:8000/health/ > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Django backend is ready"
}

# Show service status
show_status() {
    print_status "Service Status:"
    echo ""
    docker-compose ps
    echo ""
    
    print_status "Service URLs:"
    echo "  Node.js Backend: http://localhost:5000"
    echo "  Django Backend:  http://localhost:8000"
    echo "  Nginx Proxy:     https://localhost (SSL)"
    echo ""
    
    print_status "Health Check URLs:"
    echo "  Node.js Health:  http://localhost:5000/health"
    echo "  Django Health:   http://localhost:8000/health/"
    echo ""
}

# Show logs
show_logs() {
    print_status "Recent logs from all services:"
    docker-compose logs --tail=20
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    docker-compose down --volumes --remove-orphans
    print_success "Cleanup completed"
}

# Main deployment function
main() {
    print_status "Starting SeeNotify deployment..."
    echo ""
    
    # Check prerequisites
    check_docker
    check_files
    
    # Create necessary files
    create_ssl_certs
    create_mongo_init
    
    # Deploy services
    deploy_services
    
    # Wait for services
    wait_for_services
    
    # Show status
    show_status
    
    print_success "Deployment completed successfully!"
    echo ""
    print_status "You can now access your SeeNotify application at:"
    echo "  https://localhost"
    echo ""
    print_warning "For production deployment, please:"
    echo "  1. Update environment variables in docker-compose.yml"
    echo "  2. Replace self-signed SSL certificates with real ones"
    echo "  3. Configure proper domain names"
    echo "  4. Set up monitoring and logging"
    echo ""
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "cleanup")
        cleanup
        ;;
    "restart")
        print_status "Restarting services..."
        docker-compose restart
        show_status
        ;;
    *)
        echo "Usage: $0 {deploy|status|logs|cleanup|restart}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy the entire application (default)"
        echo "  status   - Show service status and URLs"
        echo "  logs     - Show recent logs from all services"
        echo "  cleanup  - Stop and remove all containers and volumes"
        echo "  restart  - Restart all services"
        exit 1
        ;;
esac 