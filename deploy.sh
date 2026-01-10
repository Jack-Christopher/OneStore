#!/bin/bash

###############################################################################
# OneStore Production Deployment Script
# 
# This script automates the deployment process for OneStore in production.
# It handles: git pull, docker rebuild, migrations, health checks, and rollback.
###############################################################################

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
BACKUP_DIR="backups"
LOG_FILE="deploy.log"
MAX_WAIT_HEALTH=120  # Maximum seconds to wait for health checks
API_CONTAINER="onestore_api"
FRONTEND_CONTAINER="onestore_frontend"
DB_CONTAINER="onestore_db"
BACKEND_PORT="${BACKEND_PORT:-4000}"
FRONTEND_PORT="${FRONTEND_PORT:-80}"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1" | tee -a "$LOG_FILE"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    local missing=0
    
    if ! command_exists docker; then
        error "Docker is not installed"
        missing=1
    fi
    
    if ! command_exists docker-compose; then
        error "Docker Compose is not installed"
        missing=1
    fi
    
    if ! command_exists git; then
        error "Git is not installed"
        missing=1
    fi
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "Docker Compose file not found: $COMPOSE_FILE"
        missing=1
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        warning ".env file not found. Make sure environment variables are set."
    fi
    
    if [ $missing -eq 1 ]; then
        error "Prerequisites check failed. Please install missing dependencies."
        exit 1
    fi
    
    success "All prerequisites met"
}

# Check if .env file has required variables
check_env_vars() {
    log "Checking environment variables..."
    
    if [ -f "$ENV_FILE" ]; then
        source "$ENV_FILE"
    fi
    
    local missing=0
    
    if [ -z "${JWT_SECRET:-}" ]; then
        error "JWT_SECRET is not set"
        missing=1
    fi
    
    if [ -z "${MONGO_INITDB_ROOT_PASSWORD:-}" ]; then
        error "MONGO_INITDB_ROOT_PASSWORD is not set"
        missing=1
    fi
    
    if [ -z "${VITE_API_URL:-}" ]; then
        warning "VITE_API_URL is not set. Frontend may not connect to API correctly."
    fi
    
    if [ $missing -eq 1 ]; then
        error "Required environment variables are missing. Please check your .env file."
        exit 1
    fi
    
    success "Environment variables validated"
}

# Get current git commit for rollback
save_current_version() {
    log "Saving current version for potential rollback..."
    local current_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    echo "$current_commit" > .last_deployed_commit
    success "Current version saved: $current_commit"
}

# Pull latest code
pull_latest_code() {
    log "Pulling latest code from repository..."
    
    if ! git fetch origin; then
        error "Failed to fetch from repository"
        exit 1
    fi
    
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    local remote_commit=$(git rev-parse origin/$current_branch)
    local local_commit=$(git rev-parse HEAD)
    
    if [ "$remote_commit" == "$local_commit" ]; then
        warning "No new changes detected. Already up to date."
        return 1
    fi
    
    if ! git pull origin "$current_branch"; then
        error "Failed to pull latest code"
        exit 1
    fi
    
    success "Code updated from $local_commit to $remote_commit"
    return 0
}

# Backup current images (optional)
backup_current_images() {
    log "Creating backup of current images..."
    
    mkdir -p "$BACKUP_DIR"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    # Save image IDs for potential rollback
    docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}" | grep -E "(onestore|one-store)" > "$BACKUP_DIR/images_${timestamp}.txt" || true
    
    success "Current images backed up to $BACKUP_DIR/images_${timestamp}.txt"
}

# Stop containers gracefully
stop_containers() {
    log "Stopping containers..."
    
    if docker-compose -f "$COMPOSE_FILE" ps -q | grep -q .; then
        docker-compose -f "$COMPOSE_FILE" stop
        success "Containers stopped"
    else
        info "No running containers found"
    fi
}

# Rebuild and start containers
rebuild_containers() {
    log "Rebuilding and starting containers..."
    
    if ! docker-compose -f "$COMPOSE_FILE" build --no-cache; then
        error "Failed to build Docker images"
        exit 1
    fi
    
    if ! docker-compose -f "$COMPOSE_FILE" up -d; then
        error "Failed to start containers"
        exit 1
    fi
    
    success "Containers rebuilt and started"
}

# Wait for container to be healthy
wait_for_health() {
    local container_name=$1
    local max_wait=${2:-$MAX_WAIT_HEALTH}
    local elapsed=0
    
    log "Waiting for $container_name to be healthy (max ${max_wait}s)..."
    
    while [ $elapsed -lt $max_wait ]; do
        local health=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "none")
        
        if [ "$health" == "healthy" ]; then
            success "$container_name is healthy"
            return 0
        elif [ "$health" == "unhealthy" ]; then
            warning "$container_name is unhealthy. Checking logs..."
            docker logs --tail 50 "$container_name" || true
        fi
        
        sleep 5
        elapsed=$((elapsed + 5))
        echo -n "."
    done
    
    echo ""
    error "$container_name did not become healthy within ${max_wait}s"
    return 1
}

# Check if container is running
check_container_running() {
    local container_name=$1
    
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        return 0
    else
        return 1
    fi
}

# Health check endpoint
check_api_health() {
    log "Checking API health endpoint..."
    
    local max_attempts=12
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -sf "http://localhost:${BACKEND_PORT}/health" > /dev/null 2>&1; then
            success "API health check passed"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep 5
        echo -n "."
    done
    
    echo ""
    error "API health check failed after $max_attempts attempts"
    return 1
}

# Check frontend accessibility
check_frontend() {
    log "Checking frontend accessibility..."
    
    local max_attempts=12
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -sf "http://localhost:${FRONTEND_PORT}/health" > /dev/null 2>&1; then
            success "Frontend is accessible"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep 5
        echo -n "."
    done
    
    echo ""
    error "Frontend is not accessible after $max_attempts attempts"
    return 1
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    if ! check_container_running "$API_CONTAINER"; then
        error "API container is not running. Cannot run migrations."
        return 1
    fi
    
    # Wait a bit for container to be ready
    sleep 10
    
    if docker exec "$API_CONTAINER" npm run migrate:up; then
        success "Database migrations completed"
        return 0
    else
        error "Database migrations failed"
        return 1
    fi
}

# Show container status
show_status() {
    log "Container status:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo ""
    log "Recent logs (last 20 lines):"
    echo "--- API ---"
    docker logs --tail 20 "$API_CONTAINER" 2>&1 || true
    echo ""
    echo "--- Frontend ---"
    docker logs --tail 20 "$FRONTEND_CONTAINER" 2>&1 || true
}

# Cleanup old images
cleanup_old_images() {
    log "Cleaning up unused Docker images..."
    
    local removed=$(docker image prune -af --filter "until=168h" 2>&1 | grep -oP '\K[0-9]+(?=\s+MB)' || echo "0")
    
    if [ "$removed" != "0" ]; then
        success "Cleaned up old images (freed ~${removed}MB)"
    else
        info "No old images to clean up"
    fi
}

# Rollback function
rollback() {
    error "Deployment failed. Attempting rollback..."
    
    if [ -f .last_deployed_commit ]; then
        local last_commit=$(cat .last_deployed_commit)
        warning "Rolling back to commit: $last_commit"
        
        if git checkout "$last_commit"; then
            rebuild_containers
            success "Rollback completed"
        else
            error "Rollback failed. Manual intervention required."
            exit 1
        fi
    else
        error "No previous version found for rollback. Manual intervention required."
        exit 1
    fi
}

# Main deployment function
main() {
    echo "=========================================="
    echo "  OneStore Production Deployment"
    echo "=========================================="
    echo ""
    
    # Trap errors for rollback
    trap rollback ERR
    
    # Step 1: Prerequisites
    check_prerequisites
    
    # Step 2: Environment validation
    check_env_vars
    
    # Step 3: Save current version
    save_current_version
    
    # Step 4: Pull latest code
    if ! pull_latest_code; then
        info "No changes detected. Exiting."
        exit 0
    fi
    
    # Step 5: Backup current state
    backup_current_images
    
    # Step 6: Stop containers
    stop_containers
    
    # Step 7: Rebuild and start
    rebuild_containers
    
    # Step 8: Wait for containers to start
    log "Waiting for containers to initialize..."
    sleep 15
    
    # Step 9: Check container status
    if ! check_container_running "$API_CONTAINER"; then
        error "API container failed to start"
        exit 1
    fi
    
    if ! check_container_running "$FRONTEND_CONTAINER"; then
        error "Frontend container failed to start"
        exit 1
    fi
    
    if ! check_container_running "$DB_CONTAINER"; then
        error "Database container failed to start"
        exit 1
    fi
    
    success "All containers are running"
    
    # Step 10: Run migrations
    if ! run_migrations; then
        error "Migrations failed. Check logs for details."
        exit 1
    fi
    
    # Step 11: Health checks
    if ! wait_for_health "$DB_CONTAINER" 30; then
        warning "Database health check timeout (may be normal if still initializing)"
    fi
    
    if ! check_api_health; then
        error "API health check failed"
        exit 1
    fi
    
    if ! check_frontend; then
        error "Frontend health check failed"
        exit 1
    fi
    
    # Step 12: Cleanup
    cleanup_old_images
    
    # Step 13: Show final status
    show_status
    
    # Clear trap
    trap - ERR
    
    echo ""
    echo "=========================================="
    success "Deployment completed successfully!"
    echo "=========================================="
    echo ""
    info "API: http://localhost:${BACKEND_PORT}"
    info "Frontend: http://localhost:${FRONTEND_PORT}"
    info "Logs saved to: $LOG_FILE"
    echo ""
}

# Run main function
main "$@"

