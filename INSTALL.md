# 🚀 Guía de Instalación - Planbarómetro ILPES-CEPAL

Esta aplicación web implementa la metodología ILPES-CEPAL para evaluación de sistemas de planificación gubernamental con capacidades colaborativas multi-usuario y extracción automática de buenas prácticas.

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 14+
- Cuenta en GitHub
- Cuenta en Vercel (para despliegue automático)

## 🔧 Instalación Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/planbarometro-cepal.git
cd planbarometro-cepal
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb planbarometro

# Configurar variables de entorno
cp .env.example .env
```

### 4. Variables de Entorno (.env)

```env
# Base de Datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/planbarometro"
PGUSER=usuario
PGPASSWORD=password
PGDATABASE=planbarometro
PGHOST=localhost
PGPORT=5432

# Sesiones
SESSION_SECRET="tu-clave-secreta-muy-larga-y-segura"

# OpenAI (para búsqueda inteligente de políticas)
OPENAI_API_KEY="sk-..."

# Replit Auth (si usas Replit)
REPL_ID="tu-repl-id"
ISSUER_URL="https://replit.com/oidc"
REPLIT_DOMAINS="tu-dominio.replit.app"
```

### 5. Inicializar Base de Datos

```bash
npm run db:push
```

### 6. Ejecutar Aplicación

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

La aplicación estará disponible en `http://localhost:5000`

## 🌐 Despliegue en Vercel

### 1. Preparación en GitHub

1. Subir código a GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Configurar Vercel

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Importar proyecto desde GitHub
3. Configurar variables de entorno en Vercel:

```
DATABASE_URL=postgresql://...
SESSION_SECRET=...
OPENAI_API_KEY=sk-...
REPL_ID=...
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=tu-proyecto.vercel.app
```

### 3. Base de Datos en Producción

Opciones recomendadas:
- **Neon Database** (PostgreSQL serverless)
- **Supabase** 
- **Railway**
- **PlanetScale** (MySQL compatible)

### 4. Despliegue Automático

El archivo `.github/workflows/deploy.yml` incluido configura:
- ✅ Tests automáticos
- ✅ Build y despliegue
- ✅ Integración continua

## 🔐 Configuración de Secretos GitHub

En tu repositorio GitHub, ve a `Settings > Secrets and variables > Actions`:

```
VERCEL_TOKEN=tu-token-vercel
ORG_ID=tu-org-id-vercel
PROJECT_ID=tu-project-id-vercel
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm start            # Servidor de producción

# Base de Datos
npm run db:push      # Aplicar cambios de schema
npm run db:studio    # Interface gráfica de DB

# Utilidades
npm test             # Ejecutar tests
npm run lint         # Linter de código
```

## 📊 Características Principales

### Sistema de Evaluación TOPP
- Evaluación técnica, operativa, política y prospectiva
- Cálculo automático de puntajes y alertas estratégicas
- Visualizaciones con gráficos radar y barras

### Colaboración Multi-Usuario
- Sistema RT Delphi para evaluación grupal
- Gestión de roles (admin, coordinador, usuario)
- Consensos y análisis de desviaciones

### Extracción de Buenas Prácticas
- Web scraping automático de 6 repositorios oficiales
- Clasificación TOPP de prácticas institucionales
- Búsqueda inteligente con OpenAI

### Seguridad y Autenticación
- Autenticación con Replit OAuth
- Sesiones seguras con PostgreSQL
- Roles y permisos granulares

## 🔍 Solución de Problemas

### Error de Conexión a Base de Datos
```bash
# Verificar conexión
npm run db:push
```

### Error de Variables de Entorno
```bash
# Verificar archivo .env
cat .env
```

### Error de Dependencias
```bash
# Limpiar e instalar
rm -rf node_modules package-lock.json
npm install
```

## 📞 Soporte

Para reportar problemas o solicitar características:
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/planbarometro-cepal/issues)
- 📧 Email: soporte@planbarometro.org
- 📖 Documentación: [Docs](https://docs.planbarometro.org)

## 🏛️ Créditos

Desarrollado por el **Instituto Latinoamericano y del Caribe de Planificación Económica y Social (ILPES-CEPAL)** para fortalecer las capacidades de planificación gubernamental en América Latina.

---

**Versión**: 2.0.0  
**Última actualización**: Enero 2025  
**Licencia**: MIT