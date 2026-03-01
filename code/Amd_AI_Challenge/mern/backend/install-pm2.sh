#!/bin/bash
# Installation script for PM2 process manager on EC2

echo "🚀 Installing PM2 Process Manager..."

# Install PM2 globally
npm install -g pm2

# Create logs directory
mkdir -p logs

# Start the application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup

echo "✅ PM2 installation complete!"
echo ""
echo "📋 Useful PM2 commands:"
echo "   pm2 list              - Show all running processes"
echo "   pm2 logs              - Show logs"
echo "   pm2 restart all       - Restart all processes"
echo "   pm2 stop all          - Stop all processes"
echo "   pm2 delete all        - Delete all processes"
echo "   pm2 monit             - Monitor processes"
echo "   pm2 show scheme-saarthi-backend - Show detailed process info"
echo ""
echo "🔧 Configuration:"
echo "   - Auto-restart on crash: ✅ Enabled"
echo "   - Max memory limit: 500MB"
echo "   - Daily restart: 3:00 AM"
echo "   - Max restarts: 10 within 1 minute"
