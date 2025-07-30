# Guía de Deployment - Planbarómetro

Esta guía proporciona instrucciones detalladas para desplegar Planbarómetro en diferentes entornos de producción.

## 📋 Tabla de Contenidos

- [Preparación para Producción](#preparación-para-producción)
- [Replit Deployment](#replit-deployment)
- [Vercel](#vercel)
- [Heroku](#heroku)
- [Railway](#railway)
- [DigitalOcean App Platform](#digitalocean-app-platform)
- [AWS](#aws)
- [Docker](#docker)
- [Servidor Propio (VPS)](#servidor-propio-vps)
- [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Variables de Entorno](#variables-de-entorno)
- [Monitoreo y Logs](#monitoreo-y-logs)

## 🚀 Preparación para Producción

### 1. Build del Proyecto

```bash
# Instalar dependencias
npm ci

# Ejecutar tests
npm test

# Build para producción
npm run build

# Verificar que el build funciona
npm start
```

### 2. Configuración de Seguridad

```env
# Variables críticas para producción
NODE_ENV=production
SESSION_SECRET="generated-secure-random-key-minimum-32-characters"
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
```

### 3. Optimizaciones

- ✅ Minificación de assets
- ✅ Compresión gzip habilitada
- ✅ Cache headers configurados
- ✅ CDN para assets estáticos (opcional)

## 🔄 Replit Deployment (Recomendado)

### Configuración Automática

El proyecto está optimizado para Replit Deployments:

1. **Configurar Secrets**:
   ```
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   SESSION_SECRET=your-secure-key
   ```

2. **Deploy**:
   - Usar el botón "Deploy" en Replit
   - Se asigna automáticamente dominio `.replit.app`
   - SSL/TLS configurado automáticamente

3. **Configuración Automática**:
   - Build process: `npm run build`
   - Start command: `npm start`
   - Port detection: Automático

### Ventajas de Replit
- ✅ Zero-config deployment
- ✅ SSL automático
- ✅ Scaling automático
- ✅ Integrated database options
- ✅ Environment management

## ☁️ Vercel

### 1. Configuración del Proyecto

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/**/*",
      "use": "@vercel/static-build",
      "config": {
        "buildCommand": "npm run build:client",
        "outputDirectory": "dist/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. Deployment

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3. Variables de Entorno

Configurar en Vercel Dashboard:
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `SESSION_SECRET`

## 🚀 Heroku

### 1. Preparación

```bash
# Instalar Heroku CLI
# macOS
brew tap heroku/brew && brew install heroku

# Crear aplicación
heroku create planbarometro-app

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:mini
```

### 2. Configuración

```json
// Procfile
web: npm start
```

```json
// package.json - scripts adicionales
{
  "scripts": {
    "heroku-postbuild": "npm run build"
  }
}
```

### 3. Variables de Entorno

```bash
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET="your-secure-key"
heroku config:set OPENAI_API_KEY="sk-..."
```

### 4. Deploy

```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## 🚂 Railway

### 1. Configuración

```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"

[[deploy.environmentVariables]]
name = "NODE_ENV"
value = "production"
```

### 2. Deployment

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Crear proyecto
railway init

# Deploy
railway up
```

### 3. Base de Datos

```bash
# Agregar PostgreSQL
railway add postgresql

# La DATABASE_URL se configura automáticamente
```

## 🌊 DigitalOcean App Platform

### 1. Configuración

```yaml
# .do/app.yaml
name: planbarometro
services:
- name: web
  source_dir: /
  github:
    repo: tu-usuario/planbarometro
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: professional-xs
  env:
  - key: NODE_ENV
    value: production
  - key: SESSION_SECRET
    value: ${SESSION_SECRET}
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}

databases:
- engine: PG
  name: db
  num_nodes: 1
  size: db-s-dev-database
  version: "14"
```

### 2. Deploy

1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Deploy automático desde main branch

## ☁️ AWS

### Usando AWS Amplify

```yaml
# amplify.yml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci
        - npm run build
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build:client
  artifacts:
    baseDirectory: dist/public
    files:
      - '**/*'
```

### Usando Elastic Beanstalk

```json
// .ebextensions/nodecommand.config
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
    NodeVersion: 18.x
```

## 🐳 Docker

### 1. Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000

USER node

CMD ["npm", "start"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/planbarometro
      - SESSION_SECRET=your-secure-key
    depends_on:
      - db

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=planbarometro
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 3. Build y Deploy

```bash
# Build
docker build -t planbarometro .

# Run con Docker Compose
docker-compose up -d

# Logs
docker-compose logs -f app
```

## 🖥️ Servidor Propio (VPS)

### 1. Preparación del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Instalar PM2
sudo npm install -g pm2
```

### 2. Configuración de Base de Datos

```bash
# Crear usuario y base de datos
sudo -u postgres psql
CREATE USER planbarometro WITH PASSWORD 'secure_password';
CREATE DATABASE planbarometro OWNER planbarometro;
GRANT ALL PRIVILEGES ON DATABASE planbarometro TO planbarometro;
\q
```

### 3. Deploy de la Aplicación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/planbarometro.git
cd planbarometro

# Instalar dependencias
npm ci

# Configurar variables de entorno
cp .env.example .env
# Editar .env con valores de producción

# Build
npm run build

# Configurar PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Configuración de Nginx

```nginx
# /etc/nginx/sites-available/planbarometro
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Auto-renewal
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🗄️ Configuración de Base de Datos

### PostgreSQL en la Nube

#### Supabase
```bash
# URL de conexión
DATABASE_URL="postgresql://username:password@db.xxxxx.supabase.co:5432/postgres"
```

#### PlanetScale
```bash
# Configuración
DATABASE_URL="mysql://username:password@host.psdb.cloud/planbarometro?sslaccept=strict"
```

#### Neon
```bash
# Configuración
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/planbarometro?sslmode=require"
```

### Migración de Datos

```bash
# Ejecutar migraciones
npm run db:push

# Poblar datos iniciales
npm run seed

# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## ⚙️ Variables de Entorno por Ambiente

### Desarrollo
```env
NODE_ENV=development
DATABASE_URL="postgresql://localhost:5432/planbarometro_dev"
SESSION_SECRET="dev-secret-key"
COOKIE_SECURE=false
DEBUG_MODE=true
```

### Staging
```env
NODE_ENV=staging
DATABASE_URL="postgresql://staging-db/planbarometro_staging"
SESSION_SECRET="staging-secure-key"
COOKIE_SECURE=true
DEBUG_MODE=false
```

### Producción
```env
NODE_ENV=production
DATABASE_URL="postgresql://prod-db/planbarometro"
SESSION_SECRET="production-super-secure-key"
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
DEBUG_MODE=false
```

## 📊 Monitoreo y Logs

### Health Check Endpoint

```typescript
// Implementado en server/routes.ts
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV
  });
});
```

### Logging en Producción

```javascript
// Configuración de logs
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Monitoreo de Performance

```bash
# PM2 Monitoring
pm2 monitor

# Logs en tiempo real
pm2 logs --lines 100

# Métricas
pm2 monit
```

## 🔧 Troubleshooting

### Problemas Comunes

#### Error de Conexión a Base de Datos
```bash
# Verificar conectividad
psql $DATABASE_URL -c "SELECT 1"

# Verificar variables
echo $DATABASE_URL
```

#### Problemas de Memoria
```bash
# Aumentar límite de memoria Node.js
node --max-old-space-size=4096 dist/index.js

# Configurar en PM2
pm2 start ecosystem.config.js --node-args="--max-old-space-size=4096"
```

#### SSL/HTTPS Issues
```bash
# Verificar certificados
openssl s_client -connect tu-dominio.com:443

# Renovar certificados Let's Encrypt
sudo certbot renew
```

### Logs de Debugging

```bash
# Logs de aplicación
tail -f combined.log

# Logs de sistema
sudo journalctl -f -u nginx
sudo journalctl -f -u postgresql
```

## 📈 Optimizaciones de Producción

### Performance
- ✅ Compresión gzip
- ✅ Cache headers
- ✅ CDN para assets
- ✅ Database indexing
- ✅ Connection pooling

### Seguridad
- ✅ HTTPS obligatorio
- ✅ Security headers
- ✅ Rate limiting
- ✅ Input validation
- ✅ Regular security updates

### Escalabilidad
- ✅ Load balancing
- ✅ Database read replicas
- ✅ Caching (Redis)
- ✅ Horizontal scaling
- ✅ Auto-scaling configurado

---

Para soporte adicional en deployment, consulta la [documentación técnica](./README.md) o abre un [issue](https://github.com/usuario/planbarometro/issues).