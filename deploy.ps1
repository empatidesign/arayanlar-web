# Arayanvar Web Deploy Script for Windows
Write-Host "🚀 Starting Arayanvar Web deployment..." -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build application" -ForegroundColor Red
    exit 1
}

# Install serve globally if not exists
Write-Host "📦 Installing serve globally..." -ForegroundColor Yellow
npm install -g serve

# Create logs directory
if (!(Test-Path -Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
    Write-Host "📁 Created logs directory" -ForegroundColor Green
}

# Stop existing PM2 process if running
Write-Host "🛑 Stopping existing PM2 process..." -ForegroundColor Yellow
pm2 stop arayanvar-web 2>$null
pm2 delete arayanvar-web 2>$null

# Start with PM2
Write-Host "🚀 Starting application with PM2..." -ForegroundColor Yellow
pm2 start ecosystem.config.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start application with PM2" -ForegroundColor Red
    exit 1
}

# Save PM2 configuration
Write-Host "💾 Saving PM2 configuration..." -ForegroundColor Yellow
pm2 save

# Setup PM2 startup
Write-Host "⚙️ Setting up PM2 startup..." -ForegroundColor Yellow
pm2 startup

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "📊 Application status:" -ForegroundColor Cyan
pm2 status

Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "  View logs: pm2 logs arayanvar-web" -ForegroundColor White
Write-Host "  Restart: pm2 restart arayanvar-web" -ForegroundColor White
Write-Host "  Stop: pm2 stop arayanvar-web" -ForegroundColor White
Write-Host "  Status: pm2 status" -ForegroundColor White

Write-Host ""
Write-Host "🌐 Application should be running on http://localhost:3000" -ForegroundColor Green