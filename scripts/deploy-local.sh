#!/bin/bash
# Script de despliegue local con Docker - Planbarómetro CEPAL

echo "🐳 Desplegando Planbarómetro CEPAL con Docker"
echo "============================================="

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "💡 Instalar: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    echo "💡 Instalar: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker encontrado"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOF
# Variables para Docker Compose
OPENAI_API_KEY=tu-clave-openai-aqui
DATABASE_URL=postgresql://planbarometro:planbarometro_password@postgres:5432/planbarometro
SESSION_SECRET=desarrollo-session-secret-muy-larga-y-segura-para-docker
NODE_ENV=development
EOF
    echo "✅ Archivo .env creado"
    echo "⚠️  Configura OPENAI_API_KEY en .env para funcionalidad completa"
fi

# Crear directorio de scripts si no existe
mkdir -p scripts

# Crear script de inicialización de DB
cat > scripts/init.sql << 'EOF'
-- Script de inicialización para PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear usuario adicional para desarrollo
CREATE USER developer WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE planbarometro TO developer;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO developer;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO developer;

-- Configuraciones de rendimiento
ALTER DATABASE planbarometro SET shared_preload_libraries = 'pg_stat_statements';
ALTER DATABASE planbarometro SET log_statement = 'all';
EOF

echo "✅ Script de inicialización creado"

# Limpiar contenedores previos
echo "🧹 Limpiando contenedores previos..."
docker-compose down --volumes --remove-orphans 2>/dev/null || true

# Construir e iniciar servicios
echo "🏗️  Construyendo contenedores..."
docker-compose build --no-cache

echo "🚀 Iniciando servicios..."
docker-compose up -d postgres

echo "⏳ Esperando a que PostgreSQL esté listo..."
until docker-compose exec postgres pg_isready -U planbarometro; do
    sleep 2
done

echo "✅ PostgreSQL listo"

echo "📊 Inicializando schema de base de datos..."
docker-compose run --rm app npm run db:push

echo "🌐 Iniciando aplicación web..."
docker-compose up -d app

# Esperar a que la aplicación esté lista
echo "⏳ Esperando a que la aplicación esté lista..."
timeout=60
counter=0
while ! curl -s http://localhost:5000/api/health &>/dev/null; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -ge $timeout ]; then
        echo "❌ Timeout esperando la aplicación"
        docker-compose logs app
        exit 1
    fi
done

echo ""
echo "🎉 ¡Despliegue exitoso!"
echo ""
echo "🌐 Aplicación: http://localhost:5000"
echo "🗄️  Base de datos: localhost:5432"
echo "   Usuario: planbarometro"
echo "   Contraseña: planbarometro_password"
echo ""
echo "📊 PgAdmin (opcional): docker-compose --profile admin up -d pgadmin"
echo "   URL: http://localhost:8080"
echo "   Email: admin@planbarometro.org"
echo "   Contraseña: admin123"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs: docker-compose logs -f"
echo "   Parar: docker-compose down"
echo "   Rebuild: docker-compose build --no-cache"
echo "   Shell DB: docker-compose exec postgres psql -U planbarometro"
echo "   Shell App: docker-compose exec app sh"
echo ""
echo "📖 Más información en DEPLOYMENT.md"