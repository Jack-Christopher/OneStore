#!/bin/bash

###############################################################################
# Self-Signed SSL Certificate Creation Script for OneStore Production
# 
# This script creates a self-signed SSL certificate for production use.
# Production server path: /home/ubuntu/OneStore
# IP Address: 51.161.8.135
#
# Usage:
#   ./scripts/create-self-signed-ssl.sh
#
# NOTE: Browsers will show a security warning for self-signed certificates.
# This is suitable for production if you can accept browser warnings.
###############################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Production configuration
PROJECT_DIR="/home/ubuntu/OneStore"
SSL_CERTS_DIR="$PROJECT_DIR/ssl-certs"
IP_ADDRESS="51.161.8.135"

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if openssl is installed
if ! command -v openssl &> /dev/null; then
    error "openssl is not installed. Installing..."
    sudo apt update
    sudo apt install -y openssl
    success "openssl installed"
fi

# Create SSL directory if it doesn't exist
log "Creating SSL certificates directory..."
mkdir -p "$SSL_CERTS_DIR"
success "Directory created: $SSL_CERTS_DIR"

# Check if certificates already exist
if [ -f "$SSL_CERTS_DIR/fullchain.pem" ] && [ -f "$SSL_CERTS_DIR/privkey.pem" ]; then
    warning "SSL certificates already exist at $SSL_CERTS_DIR/"
    read -p "Do you want to regenerate them? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Skipping certificate generation. Using existing certificates."
        exit 0
    fi
    # Backup existing certificates
    BACKUP_DIR="$SSL_CERTS_DIR/backup-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp "$SSL_CERTS_DIR/fullchain.pem" "$BACKUP_DIR/" 2>/dev/null || true
    cp "$SSL_CERTS_DIR/privkey.pem" "$BACKUP_DIR/" 2>/dev/null || true
    info "Existing certificates backed up to $BACKUP_DIR"
fi

# Create certificate
log "Creating self-signed certificate for IP: $IP_ADDRESS"
warning "Browsers will show a security warning for self-signed certificates!"

# Generate private key (2048 bits)
if openssl genrsa -out "$SSL_CERTS_DIR/privkey.pem" 2048; then
    success "Private key generated (2048 bits)"
else
    error "Failed to generate private key"
    exit 1
fi

# Create certificate signing request config
CERT_CONF=$(mktemp)
cat > "$CERT_CONF" <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
CN = $IP_ADDRESS
O = OneStore
OU = Production
C = US
ST = Production
L = Server

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names

[alt_names]
IP.1 = $IP_ADDRESS
DNS.1 = $IP_ADDRESS
DNS.2 = localhost
EOF

# Generate self-signed certificate (valid for 365 days)
if openssl req -new -x509 -key "$SSL_CERTS_DIR/privkey.pem" \
    -out "$SSL_CERTS_DIR/fullchain.pem" \
    -days 365 \
    -config "$CERT_CONF" \
    -extensions v3_req; then
    
    success "Self-signed certificate created (valid for 365 days)"
    rm -f "$CERT_CONF"
else
    error "Failed to create certificate"
    rm -f "$CERT_CONF"
    exit 1
fi

# Set proper permissions (restrictive for security)
chmod 644 "$SSL_CERTS_DIR/fullchain.pem"
chmod 600 "$SSL_CERTS_DIR/privkey.pem"

# Verify certificate
if openssl x509 -in "$SSL_CERTS_DIR/fullchain.pem" -text -noout > /dev/null 2>&1; then
    success "Certificate verified successfully"
    
    # Show certificate details
    info "Certificate details:"
    openssl x509 -in "$SSL_CERTS_DIR/fullchain.pem" -noout -subject -dates -fingerprint -sha256 | sed 's/^/  /'
else
    warning "Certificate verification failed, but files were created"
fi

echo ""
success "Self-signed SSL certificates created successfully!"
info "Certificate location: $SSL_CERTS_DIR/"
info "  - fullchain.pem (certificate)"
info "  - privkey.pem (private key)"
info ""
warning "IMPORTANT: Self-signed certificates will show browser security warnings!"
info ""
info "Next steps:"
info "  1. Ensure containers are stopped: docker compose down"
info "  2. Rebuild frontend container: docker compose build --no-cache onestore-frontend"
info "  3. Start containers: docker compose up -d"
info "  4. Access your site at: https://$IP_ADDRESS"
info "  5. Accept the browser security warning (click 'Advanced' -> 'Proceed')"
info ""
info "To test the certificate:"
info "  openssl s_client -connect $IP_ADDRESS:443 -servername $IP_ADDRESS"

