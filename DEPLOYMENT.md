# 🚀 Guía de Despliegue - Planbarómetro ILPES-CEPAL

Esta guía cubre todas las opciones de despliegue para la aplicación Planbarómetro.

## 🎯 Opciones de Despliegue

### 1. 🌐 Vercel (Recomendado)
**Mejor para**: Aplicaciones web con tráfico variable, fácil escalabilidad

**Ventajas**:
- Despliegue automático desde GitHub
- CDN global integrado
- Escalabilidad automática
- SSL/HTTPS automático
- Dominio personalizado gratuito

**Instalador automático**:
```bash
bash install-vercel.sh
```

### 2. 🐙 GitHub + Vercel
**Mejor para**: Desarrollo colaborativo con CI/CD

**Ventajas**:
- Control de versiones integrado
- Pull requests y revisiones de código
- Actions para testing automático
- Despliegue continuo

**Instalador automático**:
```bash
bash install-github.sh
```

### 3. ☁️ Otras Plataformas Cloud

#### Netlify
```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist/public"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

#### Railway
```bash
# railway.json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

#### Render
```bash
# render.yaml
services:
  - type: web
    name: planbarometro
    env: node
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

## 🗄️ Configuración de Base de Datos

### Opciones de PostgreSQL

#### 1. Neon Database (Recomendado)
```bash
# Crear cuenta en neon.tech
# Crear nueva base de datos
# Copiar connection string

DATABASE_URL="postgresql://usuario:password@host.neon.tech:5432/planbarometro?sslmode=require"
```

#### 2. Supabase
```bash
# Crear proyecto en supabase.com
# Ir a Settings > Database
# Copiar connection string

DATABASE_URL="postgresql://postgres:password@db.host.supabase.co:5432/postgres"
```

#### 3. Railway
```bash
# Crear servicio PostgreSQL en railway.app
# Obtener variables de conexión

DATABASE_URL="postgresql://postgres:password@host.railway.app:5432/railway"
```

#### 4. PlanetScale (MySQL compatible)
```bash
# Crear base de datos en planetscale.com
# Configurar branch principal
# Obtener connection string

DATABASE_URL="mysql://usuario:password@host.planetscale.com/planbarometro?sslmode=require"
```

## 🔐 Variables de Entorno

### Variables Obligatorias
```env
DATABASE_URL="postgresql://..."
SESSION_SECRET="clave-super-secreta-larga"
NODE_ENV="production"
```

### Variables Opcionales
```env
# OpenAI para búsqueda inteligente
OPENAI_API_KEY="sk-..."

# Replit Auth (si se usa)
REPL_ID="tu-repl-id"
ISSUER_URL="https://replit.com/oidc"
REPLIT_DOMAINS="tu-dominio.vercel.app"

# Web scraping
SCRAPING_DELAY="2000"
MAX_CONCURRENT_REQUESTS="3"
USER_AGENT="PlanbarometroCEPAL/2.0"
```

## 🔧 Configuración por Plataforma

### Vercel
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist/public" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server/index.ts" },
    { "src": "/(.*)", "dest": "/dist/public/$1" }
  ]
}
```

### Netlify
```toml
[build]
  command = "npm run build"
  publish = "dist/public"

[build.environment]
  NODE_VERSION = "18"

[[functions]]
  directory = "netlify/functions/"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Render
```yaml
services:
  - type: web
    name: planbarometro-cepal
    env: node
    region: oregon
    plan: starter
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: planbarometro-db
          property: connectionString
    autoDeploy: false

databases:
  - name: planbarometro-db
    databaseName: planbarometro
    user: planbarometro
    region: oregon
    plan: starter
```

## 🔄 CI/CD con GitHub Actions

### Configuración automática
El archivo `.github/workflows/deploy.yml` incluye:

1. **Testing automático**
   - Tests unitarios
   - Verificación de build
   - Validación de schema de DB

2. **Despliegue automático**
   - Deploy a Vercel en push a main
   - Notificaciones de estado
   - Rollback automático en fallo

### Secretos requeridos
```
VERCEL_TOKEN=tu-token-vercel
ORG_ID=tu-org-id-vercel
PROJECT_ID=tu-project-id-vercel
```

## 🌍 Configuración de Dominio

### Dominio personalizado en Vercel
1. Ir a Project Settings > Domains
2. Agregar dominio personalizado
3. Configurar DNS según indicaciones
4. SSL/HTTPS se configurará automáticamente

### Configuración DNS típica
```
# Dominio raíz
A record: @ → 76.76.19.61

# Subdominio
CNAME: www → tu-proyecto.vercel.app
```

## 📊 Monitoreo y Logs

### Vercel
```bash
# Ver logs en tiempo real
vercel logs --follow

# Logs específicos de función
vercel logs --limit=100
```

### Error Tracking
Integrar servicios como:
- Sentry (errores frontend/backend)
- LogRocket (sesiones de usuario)
- DataDog (métricas de performance)

## 🔍 Troubleshooting

### Error de Build
```bash
# Verificar dependencias
npm ci
npm run build

# Limpiar caché
npm run clean
npm run build
```

### Error de Base de Datos
```bash
# Verificar conexión
npm run db:push

# Reset completo
npm run db:reset
npm run db:push
```

### Error de Variables de Entorno
```bash
# Verificar en plataforma
vercel env ls
netlify env:list

# Testear localmente
npm run dev
```

## 🚀 Checklist de Despliegue

### Pre-despliegue
- [ ] Tests pasan localmente
- [ ] Build exitoso
- [ ] Variables de entorno configuradas
- [ ] Base de datos accesible
- [ ] Dominios configurados

### Post-despliegue
- [ ] Aplicación carga correctamente
- [ ] Autenticación funciona
- [ ] Base de datos conectada
- [ ] Scraping funcional
- [ ] Métricas configuradas

### Mantenimiento
- [ ] Backups de DB configurados
- [ ] Monitoreo de errores activo
- [ ] SSL renovación automática
- [ ] Updates de seguridad programadas

## 📞 Soporte de Despliegue

**Problemas de configuración**:
- Revisar logs de la plataforma
- Verificar variables de entorno
- Comprobar conectividad de DB

**Problemas de rendimiento**:
- Optimizar queries de DB
- Configurar CDN
- Implementar caché

**Contacto técnico**: tech@planbarometro.org