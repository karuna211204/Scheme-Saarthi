#!/bin/bash

# Scheme Saarthi Deployment Script
set -e

echo "🚀 Starting Scheme Saarthi deployment..."

# Check if required environment variables are set
if [ -z "$AWS_REGION" ] || [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS credentials not set. Please configure your .env file."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests (if available)
if [ -f "package.json" ] && grep -q "test" package.json; then
    echo "🧪 Running tests..."
    npm test
fi

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t scheme-saarthi:latest .

# Start services
echo "🔄 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check health
echo "🏥 Checking service health..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Scheme Saarthi API is healthy!"
else
    echo "❌ Health check failed!"
    docker-compose logs scheme-saarthi-api
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📱 Access the web interface at: http://localhost:3000"
echo "🔍 API documentation available at: http://localhost:3000/health"

# Show running containers
echo "📊 Running services:"
docker-compose ps