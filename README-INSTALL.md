# 🛠️ Instalación Rápida - Planbarómetro CEPAL

## Métodos de Instalación

### 🚀 Instalación Automática

#### Para GitHub + Desarrollo Local
```bash
curl -sSL https://raw.githubusercontent.com/tu-usuario/planbarometro-cepal/main/install-github.sh | bash
```

#### Para Vercel + Producción
```bash
curl -sSL https://raw.githubusercontent.com/tu-usuario/planbarometro-cepal/main/install-vercel.sh | bash
```

#### Para Docker Local
```bash
curl -sSL https://raw.githubusercontent.com/tu-usuario/planbarometro-cepal/main/scripts/deploy-local.sh | bash
```

### 📋 Instalación Manual

#### 1. Clonar y Configurar
```bash
git clone https://github.com/tu-usuario/planbarometro-cepal.git
cd planbarometro-cepal
npm install
cp .env.example .env
```

#### 2. Base de Datos
```bash
# PostgreSQL local
createdb planbarometro
npm run db:push

# O usar Docker
docker-compose up -d postgres
```

#### 3. Iniciar Aplicación
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 🌐 URLs por Defecto

- **Aplicación**: http://localhost:5000
- **Base de datos**: localhost:5432
- **Admin DB**: http://localhost:8080 (si usas Docker con pgAdmin)

## 🔐 Variables Requeridas

```env
DATABASE_URL="postgresql://user:pass@host:port/db"
SESSION_SECRET="clave-larga-y-segura"
OPENAI_API_KEY="sk-..." # Opcional pero recomendado
```

## 📞 Soporte

- 📖 Documentación completa: [INSTALL.md](./INSTALL.md)
- 🚀 Guía de despliegue: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Reportar problemas: [GitHub Issues](https://github.com/tu-usuario/planbarometro-cepal/issues)

---

**Instituto Latinoamericano y del Caribe de Planificación Económica y Social (ILPES-CEPAL)**