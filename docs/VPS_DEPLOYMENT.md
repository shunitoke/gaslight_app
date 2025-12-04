# VPS Deployment Guide

## Overview

This guide covers deploying the Gaslight Detection App on a VPS (Virtual Private Server). On a VPS, the in-memory stores (`progressStore`, `jobStore`) will work correctly since all requests are handled by a single Node.js process.

## Prerequisites

- VPS with Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ installed
- PM2 or similar process manager (recommended)
- Nginx or similar reverse proxy (optional but recommended)

## Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (optional)
sudo apt install nginx
```

### 2. Clone and Setup Project

```bash
# Clone your repository
git clone <your-repo-url>
cd gaslight_app/gaslight_detector

# Install dependencies
npm install

# Create .env file
cp .env.example .env.local
# Edit .env.local with your configuration
nano .env.local
```

### 3. Environment Variables

Create `.env.local` with:

```env
# Required
OPENROUTER_API_KEY=your-api-key-here

# Optional
GASLIGHT_TEXT_MODEL=x-ai/grok-4.1-fast:free
GASLIGHT_VISION_MODEL=openai/gpt-4o-mini
MAX_UPLOAD_SIZE_MB=25
ANALYSIS_TIMEOUT_MS=120000

# Base URL (your VPS domain/IP)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 4. Build Application

```bash
# Build for production
npm run build
```

### 5. Start with PM2

```bash
# Start application with PM2
pm2 start npm --name "gaslight-app" -- start

# Or use ecosystem file (recommended)
# Create ecosystem.config.js:
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'gaslight-app',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/gaslight_detector',
    instances: 1, // IMPORTANT: Use 1 instance for in-memory stores
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

Then start:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable PM2 on boot
```

### 6. Configure Nginx (Optional but Recommended)

Create `/etc/nginx/sites-available/gaslight-app`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS (if using SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for long-running analysis
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/gaslight-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL Certificate (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## Important Notes for VPS Deployment

### Single Process Requirement

**CRITICAL**: The in-memory stores (`progressStore`, `jobStore`) only work with a **single Node.js process**. 

- ✅ **Correct**: `instances: 1` in PM2
- ❌ **Wrong**: Multiple instances or cluster mode

If you need to scale horizontally, you'll need to:
1. Use Redis for shared state
2. Use a database for job storage
3. Or use sticky sessions with a load balancer

### Memory Management

- Monitor memory usage: `pm2 monit`
- Set `max_memory_restart` in PM2 config to prevent memory leaks
- The app processes large chat exports, so ensure sufficient RAM (2GB+ recommended)

### Performance Optimization

1. **Enable Gzip compression** in Nginx:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

2. **Increase file upload limits** in Nginx:
```nginx
client_max_body_size 50M;
```

3. **Set appropriate timeouts** for long-running analysis:
```nginx
proxy_read_timeout 300s;
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
```

## Monitoring

```bash
# View logs
pm2 logs gaslight-app

# Monitor resources
pm2 monit

# View status
pm2 status

# Restart application
pm2 restart gaslight-app

# Stop application
pm2 stop gaslight-app
```

## Troubleshooting

### Analysis Results Not Appearing

On VPS, this should **not** be an issue since all requests are handled by the same process. If you still see problems:

1. Check PM2 is running only 1 instance: `pm2 list`
2. Check logs: `pm2 logs gaslight-app`
3. Verify environment variables: `pm2 env gaslight-app`

### High Memory Usage

- Check for memory leaks: `pm2 monit`
- Restart PM2 if needed: `pm2 restart gaslight-app`
- Consider increasing VPS RAM

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

## Scaling Beyond Single VPS

If you need to scale to multiple servers:

1. **Use Redis** for `progressStore` and `jobStore`
2. **Use a database** (PostgreSQL/MySQL) for job storage
3. **Use a load balancer** with sticky sessions
4. **Consider serverless** with external storage (Vercel KV, etc.)

See `docs/RATE_LIMITING_VPS.md` for Redis implementation example.

## Security Considerations

1. **Firewall**: Only expose ports 80/443
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **Keep system updated**: `sudo apt update && sudo apt upgrade`

3. **Use strong passwords** or SSH keys

4. **Regular backups** of your code and configuration

5. **Monitor logs** for suspicious activity

## Backup Strategy

```bash
# Backup code
tar -czf backup-$(date +%Y%m%d).tar.gz /path/to/gaslight_detector

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 /backup/location/
```

## Next Steps

After deployment:
1. Test analysis functionality
2. Monitor performance and memory usage
3. Set up log rotation
4. Configure automated backups
5. Set up monitoring/alerting (optional)


