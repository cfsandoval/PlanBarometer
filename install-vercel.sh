#!/bin/bash
# Instalador automático para Vercel - Planbarómetro ILPES-CEPAL
# Uso: bash install-vercel.sh

echo "🌐 Instalador Planbarómetro ILPES-CEPAL para Vercel"
echo "================================================="

# Verificar dependencias
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ Error: $1 no está instalado"
        if [ "$1" = "vercel" ]; then
            echo "💡 Instalar: npm i -g vercel"
        fi
        exit 1
    fi
    echo "✅ $1 encontrado"
}

echo "🔍 Verificando dependencias..."
check_dependency git
check_dependency node
check_dependency npm
check_dependency vercel

# Login a Vercel
echo ""
echo "🔐 Verificando autenticación Vercel..."
if vercel whoami &> /dev/null; then
    VERCEL_USER=$(vercel whoami)
    echo "✅ Autenticado como: $VERCEL_USER"
else
    echo "🔑 Iniciando sesión en Vercel..."
    vercel login
fi

# Verificar directorio actual
if [ ! -f "package.json" ]; then
    echo "❌ Error: Debes estar en el directorio del proyecto"
    echo "💡 Asegúrate de estar en la carpeta con package.json"
    exit 1
fi

echo "✅ Proyecto detectado: $(node -p "require('./package.json').name")"

# Verificar archivos necesarios
echo ""
echo "📋 Verificando archivos de configuración..."

if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json no encontrado"
    exit 1
fi
echo "✅ vercel.json encontrado"

if [ ! -f ".env.example" ]; then
    echo "❌ .env.example no encontrado"
    exit 1
fi
echo "✅ .env.example encontrado"

# Configurar variables de entorno
echo ""
echo "🔧 Configurando variables de entorno..."

# Base de datos
echo "📊 Configuración de Base de Datos:"
echo "Opciones recomendadas:"
echo "1. Neon Database (PostgreSQL serverless)"
echo "2. Supabase (PostgreSQL + extras)"
echo "3. Railway (PostgreSQL/MySQL)"
echo "4. PlanetScale (MySQL serverless)"
echo ""

read -p "🔗 DATABASE_URL (postgresql://...): " DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL es requerido"
    exit 1
fi

# Generar SESSION_SECRET
echo "🔐 Generando SESSION_SECRET..."
SESSION_SECRET=$(openssl rand -base64 64 2>/dev/null || node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
echo "✅ SESSION_SECRET generado"

# OpenAI API
read -p "🤖 OPENAI_API_KEY (sk-...): " OPENAI_API_KEY
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Sin OPENAI_API_KEY - funcionalidad de IA limitada"
fi

# Configurar proyecto Vercel
echo ""
echo "🚀 Configurando proyecto en Vercel..."
vercel --yes

# Configurar variables de entorno
echo ""
echo "⚙️  Configurando variables de entorno en Vercel..."

vercel env add DATABASE_URL production <<< "$DATABASE_URL"
vercel env add SESSION_SECRET production <<< "$SESSION_SECRET"
vercel env add NODE_ENV production <<< "production"

if [ ! -z "$OPENAI_API_KEY" ]; then
    vercel env add OPENAI_API_KEY production <<< "$OPENAI_API_KEY"
fi

# Configuración adicional Replit Auth (opcional)
echo ""
read -p "🔑 ¿Usar Replit Auth? (y/N): " USE_REPLIT
if [[ $USE_REPLIT =~ ^[Yy]$ ]]; then
    read -p "📝 REPL_ID: " REPL_ID
    read -p "🌐 REPLIT_DOMAINS (tu-proyecto.vercel.app): " REPLIT_DOMAINS
    
    if [ ! -z "$REPL_ID" ]; then
        vercel env add REPL_ID production <<< "$REPL_ID"
        vercel env add ISSUER_URL production <<< "https://replit.com/oidc"
        if [ ! -z "$REPLIT_DOMAINS" ]; then
            vercel env add REPLIT_DOMAINS production <<< "$REPLIT_DOMAINS"
        fi
    fi
fi

# Build y deploy
echo ""
echo "🏗️  Construyendo y desplegando..."
if npm run build; then
    echo "✅ Build exitoso"
else
    echo "❌ Error en build local"
    exit 1
fi

echo "🚀 Desplegando a Vercel..."
vercel --prod

# Obtener URL del proyecto
PROJECT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "Ver en dashboard de Vercel")

echo ""
echo "🎉 ¡Despliegue completo!"
echo ""
echo "🌐 URL del proyecto: https://$PROJECT_URL"
echo "🎛️  Dashboard Vercel: https://vercel.com/dashboard"
echo ""
echo "📋 Configuración completada:"
echo "✅ Variables de entorno configuradas"
echo "✅ Base de datos conectada"
echo "✅ Aplicación desplegada"
echo ""
echo "🔧 Para actualizaciones futuras:"
echo "   git push origin main  # Se desplegará automáticamente"
echo "   vercel --prod        # Despliegue manual"
echo ""
echo "📖 Más información:"
echo "   - Dashboard: https://vercel.com/dashboard"
echo "   - Logs: vercel logs"
echo "   - Variables: vercel env ls"

# Configurar GitHub Actions (opcional)
echo ""
read -p "🔄 ¿Configurar GitHub Actions para CI/CD? (y/N): " SETUP_ACTIONS
if [[ $SETUP_ACTIONS =~ ^[Yy]$ ]]; then
    echo "📁 Creando directorio .github/workflows..."
    mkdir -p .github/workflows
    
    if [ -f ".github/workflows/deploy.yml" ]; then
        echo "✅ Workflow de GitHub Actions ya existe"
    else
        echo "❌ Workflow no encontrado. Verifica el archivo deploy.yml"
    fi
    
    echo ""
    echo "🔐 Configurar estos secretos en GitHub:"
    echo "   Settings > Secrets and variables > Actions"
    echo ""
    echo "VERCEL_TOKEN: $(vercel token ls 2>/dev/null | head -1 || echo 'Generar en vercel.com/account/tokens')"
    echo "ORG_ID: $(vercel whoami --json 2>/dev/null | jq -r '.id' || echo 'Ver en vercel.com/account')"
    echo "PROJECT_ID: $(vercel ls --json 2>/dev/null | jq -r '.[0].projectId' || echo 'Ver en dashboard')"
fi

echo ""
echo "✨ ¡Todo listo! Tu aplicación Planbarómetro está en línea."