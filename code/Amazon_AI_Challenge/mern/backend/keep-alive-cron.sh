#!/bin/bash
# Cron script to keep backend server alive by pinging health endpoint
# Add to crontab: */5 * * * * /path/to/keep-alive-cron.sh

# Replace with your actual backend URL
BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"

# Ping the health endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/health")

if [ "$response" == "200" ]; then
    echo "[$(date)] ✅ Backend is healthy (HTTP $response)"
else
    echo "[$(date)] ⚠️ Backend returned HTTP $response"
    
    # Try ping endpoint as fallback
    ping_response=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/ping")
    echo "[$(date)] 🔄 Ping returned HTTP $ping_response"
fi
