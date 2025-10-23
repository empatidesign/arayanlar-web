# Arayanvar Web Deployment Guide

Bu rehber, Arayanvar web uygulamasını sunucuya deploy etmek ve PM2 ile çalıştırmak için gerekli adımları içerir.

## Gereksinimler

- Node.js (v16 veya üzeri)
- npm veya yarn
- PM2 (`npm install -g pm2`)

## Dosyalar

- `ecosystem.config.js` - PM2 konfigürasyon dosyası
- `deploy.sh` - Linux/Mac için deploy script'i
- `deploy.ps1` - Windows PowerShell için deploy script'i
- `.env.production` - Production environment değişkenleri

## Hızlı Deploy

### Windows (PowerShell)
```powershell
.\deploy.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x deploy.sh
./deploy.sh
```

## Manuel Deploy Adımları

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Production Build Oluştur
```bash
npm run build
# veya
npm run build:prod
```

### 3. Serve Paketini Global Olarak Yükle
```bash
npm install -g serve
```

### 4. PM2 ile Başlat
```bash
pm2 start ecosystem.config.js
```

## PM2 Komutları

### Uygulama Durumu
```bash
npm run pm2:status
# veya
pm2 status
```

### Logları Görüntüle
```bash
npm run pm2:logs
# veya
pm2 logs arayanvar-web
```

### Uygulamayı Yeniden Başlat
```bash
npm run pm2:restart
# veya
pm2 restart arayanvar-web
```

### Uygulamayı Durdur
```bash
npm run pm2:stop
# veya
pm2 stop arayanvar-web
```

### PM2 Konfigürasyonunu Kaydet
```bash
pm2 save
```

### Sistem Başlangıcında Otomatik Başlatma
```bash
pm2 startup
```

## Konfigürasyon

### Environment Değişkenleri (.env.production)
- `NODE_ENV=production`
- `REACT_APP_API_URL` - Backend API URL'i
- `REACT_APP_SOCKET_URL` - Socket.IO URL'i

### PM2 Konfigürasyonu (ecosystem.config.js)
- **Port**: 3000
- **Instances**: 1
- **Memory Limit**: 1GB
- **Auto Restart**: Aktif
- **Log Files**: `./logs/` dizininde

## Erişim

Uygulama başarıyla deploy edildikten sonra:
- **URL**: http://localhost:3000
- **Logs**: `./logs/` dizininde

## Sorun Giderme

### Port Zaten Kullanımda
```bash
# Port 3000'i kullanan process'i bul
netstat -ano | findstr :3000
# Process'i sonlandır
taskkill /PID <PID> /F
```

### PM2 Process'i Temizle
```bash
pm2 delete arayanvar-web
pm2 kill
```

### Build Hatası
```bash
# Cache'i temizle
npm run build -- --reset-cache
# veya
rm -rf node_modules package-lock.json
npm install
```

## Güvenlik

- Production ortamında `.env` dosyalarını güvenli tutun
- API URL'lerini production sunucu adresleriyle güncelleyin
- HTTPS kullanmayı unutmayın

## Monitoring

PM2 ile monitoring:
```bash
pm2 monit
```

Web tabanlı monitoring için PM2 Plus kullanabilirsiniz:
```bash
pm2 plus
```