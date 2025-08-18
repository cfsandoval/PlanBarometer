#!/bin/bash
# Instalador automático para GitHub - Planbarómetro ILPES-CEPAL
# Uso: bash install-github.sh

echo "🚀 Instalador Planbarómetro ILPES-CEPAL para GitHub"
echo "=================================================="

# Verificar dependencias
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ Error: $1 no está instalado"
        exit 1
    fi
    echo "✅ $1 encontrado"
}

echo "🔍 Verificando dependencias..."
check_dependency git
check_dependency node
check_dependency npm

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ $NODE_VERSION -lt 18 ]; then
    echo "❌ Error: Node.js versión 18+ requerida (actual: $NODE_VERSION)"
    exit 1
fi
echo "✅ Node.js versión $NODE_VERSION OK"

# Solicitar información del repositorio
read -p "📝 URL del repositorio GitHub: " REPO_URL
read -p "📁 Nombre del directorio local (opcional): " DIR_NAME

if [ -z "$DIR_NAME" ]; then
    DIR_NAME=$(basename $REPO_URL .git)
fi

echo ""
echo "📥 Clonando repositorio..."
if git clone $REPO_URL $DIR_NAME; then
    cd $DIR_NAME
    echo "✅ Repositorio clonado exitosamente"
else
    echo "❌ Error clonando repositorio"
    exit 1
fi

echo ""
echo "📦 Instalando dependencias npm..."
if npm install; then
    echo "✅ Dependencias instaladas"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo ""
echo "🔧 Configurando variables de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Archivo .env creado desde .env.example"
    echo "⚠️  IMPORTANTE: Configura las variables en el archivo .env"
else
    echo "ℹ️  Archivo .env ya existe"
fi

# Verificar PostgreSQL
echo ""
echo "🗄️  Verificando PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL encontrado"
    
    read -p "📝 Nombre de la base de datos (planbarometro): " DB_NAME
    if [ -z "$DB_NAME" ]; then
        DB_NAME="planbarometro"
    fi
    
    read -p "🔐 Usuario PostgreSQL: " DB_USER
    read -s -p "🔑 Contraseña PostgreSQL: " DB_PASSWORD
    echo ""
    
    # Crear base de datos
    echo "📊 Creando base de datos..."
    PGPASSWORD=$DB_PASSWORD createdb -h localhost -U $DB_USER $DB_NAME 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Base de datos '$DB_NAME' creada"
    else
        echo "ℹ️  Base de datos ya existe o error en creación"
    fi
    
    # Actualizar .env con configuración de DB
    sed -i.bak "s/usuario/$DB_USER/g; s/password/$DB_PASSWORD/g; s/planbarometro/$DB_NAME/g" .env
    echo "✅ Configuración de DB actualizada en .env"
    
else
    echo "⚠️  PostgreSQL no encontrado. Instálalo antes de continuar."
    echo "   Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "   MacOS: brew install postgresql"
    echo "   Windows: https://www.postgresql.org/download/windows/"
fi

echo ""
echo "🗃️  Inicializando esquema de base de datos..."
if npm run db:push; then
    echo "✅ Esquema de base de datos inicializado"
else
    echo "⚠️  Error inicializando DB. Verifica la configuración en .env"
fi

echo ""
echo "🧪 Ejecutando build de prueba..."
if npm run build; then
    echo "✅ Build exitoso"
else
    echo "❌ Error en build"
fi

echo ""
echo "🎉 ¡Instalación completa!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura las variables en .env (especialmente OPENAI_API_KEY)"
echo "2. Ejecuta 'npm run dev' para desarrollo"
echo "3. Visita http://localhost:5000"
echo ""
echo "📖 Documentación: README.md"
echo "🆘 Soporte: INSTALL.md"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   cd $DIR_NAME"
echo "   npm run dev"