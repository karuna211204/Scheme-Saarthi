# 🚀 EC2 Deployment Guide - Fix Backend Stopping Issue

## Problem
Backend server stops after being idle on EC2 due to:
- ❌ No process manager (crashes not auto-restarted)
- ❌ MongoDB connection timeouts (no keepAlive)
- ❌ Uncaught exceptions terminating process
- ❌ Memory leaks accumulating

## Solution

### 1. Updated Backend Code (Already Applied)
The `index.js` file now includes:
- ✅ MongoDB connection pooling and keepAlive
- ✅ Automatic reconnection on disconnect
- ✅ Graceful shutdown handling
- ✅ Uncaught exception/rejection handlers
- ✅ Server timeout configurations
- ✅ Enhanced health check endpoint

### 2. Install PM2 Process Manager (REQUIRED)

#### On EC2 Instance:

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to backend directory
cd /path/to/your/backend

# Install PM2
npm install -g pm2

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save process list
pm2 save

# Setup auto-start on system reboot
pm2 startup
# Copy and run the command it outputs

# Verify it's running
pm2 list
pm2 logs
```

### 3. Verify Installation

```bash
# Check if backend is running
pm2 list

# View logs
pm2 logs scheme-saarthi-backend

# Monitor in real-time
pm2 monit

# Check health endpoint
curl http://localhost:5000/health
```

### 4. Setup Keep-Alive Cron (Optional but Recommended)

```bash
# Make script executable
chmod +x keep-alive-cron.sh

# Edit crontab
crontab -e

# Add this line (pings every 5 minutes)
*/5 * * * * /path/to/backend/keep-alive-cron.sh >> /var/log/backend-keepalive.log 2>&1

# Or use external service like UptimeRobot to ping:
# https://uptimerobot.com - Free tier monitors every 5 minutes
```

### 5. PM2 Management Commands

```bash
# Restart backend
pm2 restart scheme-saarthi-backend

# Stop backend
pm2 stop scheme-saarthi-backend

# Delete process from PM2
pm2 delete scheme-saarthi-backend

# View detailed info
pm2 show scheme-saarthi-backend

# View logs (last 100 lines)
pm2 logs scheme-saarthi-backend --lines 100

# Clear logs
pm2 flush

# Restart all processes
pm2 restart all

# Check PM2 startup status
pm2 status
```

### 6. EC2 Configuration

#### Increase Memory Swap (if low memory causes crashes)
```bash
# Check current swap
sudo swapon --show

# Create 2GB swap file (adjust size as needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

#### Setup CloudWatch Logs (Optional)
```bash
# Install CloudWatch agent
sudo yum install amazon-cloudwatch-agent

# Configure to send PM2 logs to CloudWatch
# See: https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/
```

### 7. Security Group Settings

Ensure your EC2 security group allows:
- **Inbound**: Port 5000 (backend) from your IP or 0.0.0.0/0
- **Outbound**: Port 27017 (MongoDB) if using external DB
- **Outbound**: Port 443 (HTTPS) for external APIs

### 8. Environment Variables

Create `.env` file in backend directory:
```bash
# On EC2
cd /path/to/backend
nano .env

# Add your environment variables:
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
LIVEKIT_URL=your_livekit_url
# ... other variables
```

### 9. Monitoring & Alerts

#### PM2 Plus (Recommended)
```bash
# Link to PM2 Plus for monitoring (free tier available)
pm2 link <secret_key> <public_key>

# Dashboard: https://app.pm2.io
```

#### UptimeRobot
1. Create account at https://uptimerobot.com
2. Add monitor for `http://your-ec2-ip:5000/health`
3. Set interval: 5 minutes
4. Get alerts when backend goes down

### 10. Troubleshooting

#### Backend Still Stopping?
```bash
# Check PM2 logs
pm2 logs --err

# Check system logs
journalctl -u pm2-ubuntu -n 50

# Check memory usage
free -h
pm2 monit

# Check if MongoDB connection is stable
mongo --eval "db.adminCommand('ping')"

# Restart with increased memory limit
pm2 delete scheme-saarthi-backend
pm2 start ecosystem.config.js --env production --max-memory-restart 1G
pm2 save
```

#### MongoDB Connection Issues?
```bash
# Test connection from EC2
mongosh "your_mongodb_uri"

# Check if IP is whitelisted in MongoDB Atlas
# Add EC2 public IP or 0.0.0.0/0 (not recommended for production)
```

#### Port Already in Use?
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill it
sudo kill -9 <PID>

# Or change PORT in .env
```

### 11. Automatic Deployment Script

Create `deploy.sh`:
```bash
#!/bin/bash
cd /path/to/backend
git pull origin main
npm install
pm2 restart scheme-saarthi-backend
pm2 save
echo "✅ Deployment complete!"
```

Make executable:
```bash
chmod +x deploy.sh
```

Use:
```bash
./deploy.sh
```

---

## Quick Fix Summary

If your backend keeps stopping, run these commands on EC2:

```bash
# 1. Install PM2
npm install -g pm2

# 2. Start backend with PM2
cd /path/to/backend
pm2 start ecosystem.config.js --env production

# 3. Save and setup auto-start
pm2 save
pm2 startup
# Run the command it outputs

# 4. Verify
pm2 list
pm2 logs

# Done! Backend will now auto-restart on crashes
```

---

## Expected Behavior After Fix

✅ Backend auto-restarts on crash
✅ MongoDB reconnects automatically on disconnect  
✅ Server survives idle periods
✅ Graceful handling of errors
✅ Daily restart at 3 AM (prevents memory leaks)
✅ Memory limit enforcement (500MB default)
✅ Detailed logs in `logs/` directory

---

## Support

If issues persist:
1. Check PM2 logs: `pm2 logs scheme-saarthi-backend --lines 200`
2. Check EC2 system logs: `journalctl -xe`
3. Verify MongoDB connection from EC2
4. Check EC2 instance health (CPU, memory, disk)
5. Consider upgrading EC2 instance size if memory is insufficient
