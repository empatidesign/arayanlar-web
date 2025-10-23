#!/bin/bash

# Arayanvar Web Deploy Script
echo "🚀 Starting Arayanvar Web deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Install serve globally if not exists
echo "📦 Installing serve globally..."
npm install -g serve

# Create logs directory
mkdir -p logs

# Stop existing PM2 process if running
echo "🛑 Stopping existing PM2 process..."
pm2 stop arayanvar-web 2>/dev/null || true
pm2 delete arayanvar-web 2>/dev/null || true

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 startup
echo "⚙️ Setting up PM2 startup..."
pm2 startup

echo "✅ Deployment completed successfully!"
echo "📊 Application status:"
pm2 status

echo "📝 To view logs:"
echo "pm2 logs arayanvar-web"

echo "🌐 Application should be running on http://localhost:3000"