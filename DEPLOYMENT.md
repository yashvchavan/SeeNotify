# 🚀 SeeNotify Deployment Guide

This guide provides comprehensive instructions for deploying SeeNotify to various environments.

## 📋 Table of Contents

1. [Quick Start (Docker)](#quick-start-docker)
2. [Cloud Deployment](#cloud-deployment)
3. [Production Setup](#production-setup)
4. [Mobile App Deployment](#mobile-app-deployment)
5. [Monitoring & Maintenance](#monitoring--maintenance)

## 🐳 Quick Start (Docker)

### Prerequisites
- Docker Desktop installed
- Git installed

### Step 1: Clone and Setup
```bash
git clone https://github.com/yourusername/seenotify.git
cd seenotify
```

### Step 2: Deploy with Docker
**Windows:**
```cmd
deploy.bat
```

**Linux/macOS:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Step 3: Access Your Application
- **Main Application**: https://localhost
- **Node.js Backend**: http://localhost:5000
- **Django Backend**: http://localhost:8000

## ☁️ Cloud Deployment

### Option 1: Heroku

#### Deploy Node.js Backend
```bash
cd seenotify_backend
heroku create seenotify-backend
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set SESSION_SECRET=your-session-secret
heroku config:set NODE_ENV=production
git push heroku main
```

#### Deploy Django Backend
```bash
cd backend
heroku create seenotify-ml-backend
heroku config:set MONGO_URI=your-mongodb-atlas-uri
heroku config:set SECRET_KEY=your-django-secret
heroku config:set DEBUG=False
git push heroku main
```

### Option 2: Railway

#### Deploy Both Backends
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy Node.js Backend
cd seenotify_backend
railway init
railway up

# Deploy Django Backend
cd ../backend
railway init
railway up
```

### Option 3: Render

#### Deploy to Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure environment variables
4. Set build command and start command
5. Deploy

## 🏭 Production Setup

### 1. Environment Configuration

#### Production Environment Variables

**Node.js Backend (.env):**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seenotify
SESSION_SECRET=your-super-secure-session-secret
PORT=5000
CORS_ORIGIN=https://your-domain.com
```

**Django Backend (.env):**
```env
DEBUG=False
SECRET_KEY=your-super-secure-django-secret-key
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com
```

### 2. Database Setup

#### MongoDB Atlas (Recommended)
1. Create MongoDB Atlas account
2. Create a new cluster
3. Set up database access (username/password)
4. Configure network access (IP whitelist or 0.0.0.0/0)
5. Get connection string and update environment variables

#### Local MongoDB (Alternative)
```bash
# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongod
sudo systemctl enable mongod

# macOS
brew install mongodb-community
brew services start mongodb-community
```

### 3. SSL/HTTPS Setup

#### Using Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt-get install certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Configure Nginx with SSL
sudo nano /etc/nginx/sites-available/seenotify
```

#### Using Cloudflare (Recommended)
1. Add your domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption mode
4. Configure proxy settings

### 4. Production Docker Compose

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    restart: unless-stopped
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    networks:
      - seenotify-network

  node-backend:
    build: ./seenotify_backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - SESSION_SECRET=${SESSION_SECRET}
      - PORT=5000
    depends_on:
      - mongodb
    networks:
      - seenotify-network

  django-backend:
    build: ./backend
    restart: unless-stopped
    environment:
      - DEBUG=False
      - SECRET_KEY=${DJANGO_SECRET_KEY}
      - MONGO_URI=${MONGO_URI}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
    depends_on:
      - mongodb
    networks:
      - seenotify-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - node-backend
      - django-backend
    networks:
      - seenotify-network

volumes:
  mongodb_data:

networks:
  seenotify-network:
    driver: bridge
```

## 📱 Mobile App Deployment

### Android (Google Play Store)

#### 1. Generate Signed APK
```bash
cd seenotify
npx react-native run-android --variant=release
```

#### 2. Build AAB for Play Store
```bash
cd android
./gradlew bundleRelease
```

#### 3. Upload to Google Play Console
1. Create a developer account
2. Create a new app
3. Upload the AAB file
4. Configure app details and screenshots
5. Submit for review

### iOS (App Store)

#### 1. Build for Production
```bash
cd seenotify
npx react-native run-ios --configuration Release
```

#### 2. Archive for App Store
```bash
cd ios
xcodebuild -workspace seenotify.xcworkspace -scheme seenotify -configuration Release archive -archivePath seenotify.xcarchive
```

#### 3. Upload to App Store Connect
1. Create an Apple Developer account
2. Create a new app in App Store Connect
3. Upload the archive using Xcode
4. Configure app details and screenshots
5. Submit for review

## 📊 Monitoring & Maintenance

### Application Monitoring

#### PM2 Process Management
```bash
# Install PM2
npm install -g pm2

# Start Node.js backend with PM2
cd seenotify_backend
pm2 start server.js --name "seenotify-backend"

# Monitor processes
pm2 status
pm2 logs
pm2 monit
```

#### Sentry Error Tracking
```bash
# Install Sentry
npm install @sentry/node

# Configure in your Node.js app
const Sentry = require("@sentry/node");
Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

### Database Monitoring

#### MongoDB Atlas Monitoring
- Built-in monitoring dashboard
- Set up alerts for connection issues
- Monitor query performance
- Set up automated backups

#### Local MongoDB Monitoring
```bash
# Check MongoDB status
sudo systemctl status mongod

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Monitor MongoDB performance
mongosh --eval "db.serverStatus()"
```

### Backup Strategy

#### Automated Database Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/seenotify" --out="$BACKUP_DIR/$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"

# Remove uncompressed backup
rm -rf "$BACKUP_DIR/$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/$DATE.tar.gz"
```

#### Application Backups
- Use Git for code version control
- Store environment variables securely
- Backup SSL certificates and configurations
- Document deployment procedures

### Performance Optimization

#### Backend Optimization
```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Implement caching
const cache = require('memory-cache');
app.use(cache('2 minutes', req => {
  return req.method === 'GET';
}));

// Database connection pooling
mongoose.connect(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

#### Mobile App Optimization
```bash
# Enable Hermes engine (Android)
# In android/app/build.gradle
project.ext.react = [
    enableHermes: true
]

# Enable ProGuard for Android
# In android/app/proguard-rules.pro
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
```

## 🔒 Security Checklist

- [ ] **Environment Variables**: All secrets stored securely
- [ ] **HTTPS**: SSL certificates configured
- [ ] **CORS**: Properly configured for production domains
- [ ] **Rate Limiting**: Implemented on all endpoints
- [ ] **Input Validation**: All user inputs validated
- [ ] **Database Security**: MongoDB Atlas with proper access controls
- [ ] **API Security**: Authentication and authorization implemented
- [ ] **Mobile App Security**: Code obfuscation and certificate pinning
- [ ] **Firewall**: Configure firewall rules
- [ ] **Backup**: Automated backup strategy in place
- [ ] **Monitoring**: Application and database monitoring configured
- [ ] **Updates**: Regular security updates and patches

## 🆘 Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Check Docker status
docker --version
docker-compose --version

# Clean up Docker
docker system prune -a
docker volume prune
```

#### Database Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb+srv://username:password@cluster.mongodb.net/seenotify"

# Check network connectivity
ping cluster.mongodb.net
```

#### SSL Certificate Issues
```bash
# Check SSL certificate
openssl x509 -in ssl/cert.pem -text -noout

# Test HTTPS connection
curl -I https://your-domain.com
```

### Getting Help

- **Documentation**: Check the code comments and inline docs
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions for help
- **Logs**: Check application logs for error details

## 📈 Scaling

### Horizontal Scaling
- Use load balancers for multiple backend instances
- Implement database sharding for large datasets
- Use CDN for static assets

### Vertical Scaling
- Increase server resources (CPU, RAM, Storage)
- Optimize database queries and indexes
- Implement caching strategies

---

**Happy Deploying! 🚀**

*For additional support, please refer to the main README.md file.* 