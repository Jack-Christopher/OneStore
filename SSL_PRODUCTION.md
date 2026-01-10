# SSL Setup for Production - Self-Signed Certificate

## ✅ Changes Applied

All necessary changes have been applied for self-signed SSL certificate support:

1. ✅ `frontend/nginx.conf` - Configured for HTTPS (port 443) with HTTP to HTTPS redirect
2. ✅ `docker-compose.yml` - Added port 443 and SSL volumes mount
3. ✅ `frontend/Dockerfile` - Updated for SSL support (nginx as root, SSL directory)
4. ✅ `ssl-certs/` - Self-signed certificate created for IP `51.161.8.135`
5. ✅ `.gitignore` - SSL certificates excluded from git

## 📋 Production Server Deployment

**Production Path:** `/home/ubuntu/OneStore`

### Step 1: Deploy Code to Production

Copy all changes to production server:
```bash
# On production server (/home/ubuntu/OneStore)
git pull origin main  # or your branch
```

### Step 2: Create SSL Certificate (if not already created)

**Option A: Use the script (recommended)**
```bash
cd /home/ubuntu/OneStore
./scripts/create-self-signed-ssl.sh
```

**Option B: Copy from development**
```bash
# Copy ssl-certs directory to production
scp -r ssl-certs/ ubuntu@your-server:/home/ubuntu/OneStore/
```

### Step 3: Ensure Directory Structure

```bash
cd /home/ubuntu/OneStore
mkdir -p ssl-certs
```

Make sure you have:
- `ssl-certs/fullchain.pem` (certificate)
- `ssl-certs/privkey.pem` (private key)

### Step 4: Rebuild and Start Containers

```bash
cd /home/ubuntu/OneStore

# Stop existing containers
docker compose down

# Rebuild frontend with SSL support
docker compose build --no-cache onestore-frontend

# Start all containers
docker compose up -d

# Check status
docker compose ps
docker compose logs onestore-frontend
```

### Step 5: Verify SSL is Working

```bash
# Check HTTPS connection
curl -k https://51.161.8.135/health

# Verify certificate (from server)
openssl s_client -connect localhost:443 -servername 51.161.8.135
```

### Step 6: Access Your Site

- **HTTP (auto-redirects to HTTPS):** http://51.161.8.135
- **HTTPS:** https://51.161.8.135

**⚠️ IMPORTANT:** Browsers will show a security warning because it's a self-signed certificate. Users need to:
1. Click "Advanced" or "Show Details"
2. Click "Proceed to 51.161.8.135" (unsafe) or "Accept the Risk and Continue"

## 🔒 Certificate Details

- **IP Address:** 51.161.8.135
- **Validity:** 365 days (from creation date)
- **Type:** Self-signed (X.509)
- **Key Size:** 2048 bits
- **Algorithm:** RSA with SHA-256

## 🔄 Certificate Renewal

Self-signed certificates are valid for 365 days. To renew:

```bash
cd /home/ubuntu/OneStore
./scripts/create-self-signed-ssl.sh
# Answer 'y' when asked to regenerate

# Restart containers to load new certificate
docker compose restart onestore-frontend
```

## 🛠️ Troubleshooting

### Certificate not found
```bash
# Check if certificates exist
ls -la /home/ubuntu/OneStore/ssl-certs/

# Check permissions
chmod 644 ssl-certs/fullchain.pem
chmod 600 ssl-certs/privkey.pem
```

### Nginx can't read certificates
```bash
# Check if volume is mounted
docker exec onestore_frontend ls -la /etc/nginx/ssl/

# Should show fullchain.pem and privkey.pem
```

### Port 443 not accessible
```bash
# Check if port 443 is exposed
docker compose ps
# Should show 0.0.0.0:443->443/tcp

# Check firewall (if applicable)
sudo ufw allow 443/tcp
sudo ufw reload
```

### SSL connection fails
```bash
# Check nginx logs
docker logs onestore_frontend

# Test SSL locally
openssl s_client -connect localhost:443 -servername 51.161.8.135

# Reload nginx configuration
docker exec onestore_frontend nginx -s reload
```

## 📝 Notes

1. **Self-signed certificates** are suitable for production if browser warnings are acceptable
2. **Certificate location:** `/home/ubuntu/OneStore/ssl-certs/`
3. **Certificate expires:** After 365 days (check with `openssl x509 -in ssl-certs/fullchain.pem -noout -dates`)
4. **Security:** The private key (`privkey.pem`) should never be committed to git or shared
5. **For production without warnings:** Consider using a domain name with Let's Encrypt instead

## 🚀 Quick Commands

```bash
# Create certificate
./scripts/create-self-signed-ssl.sh

# Rebuild and restart
docker compose down && docker compose build --no-cache onestore-frontend && docker compose up -d

# Check certificate expiry
openssl x509 -in ssl-certs/fullchain.pem -noout -enddate

# View certificate details
openssl x509 -in ssl-certs/fullchain.pem -text -noout

# Test HTTPS connection
curl -k -I https://51.161.8.135

# Reload nginx without restart
docker exec onestore_frontend nginx -s reload
```

