# Node.js 18 base image kullan
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./
COPY yarn.lock ./

# Bağımlılıkları kur
RUN yarn install --frozen-lockfile

# Uygulama kodunu kopyala
COPY . .

# Build işlemini gerçekleştir
RUN yarn build

# Nginx ile serve etmek için multi-stage build
FROM nginx:alpine

# Build edilen dosyaları nginx'e kopyala
COPY --from=0 /app/build /usr/share/nginx/html

# Nginx konfigürasyonunu kopyala (eğer varsa)
# COPY nginx.conf /etc/nginx/nginx.conf

# Port 80'i expose et
EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]