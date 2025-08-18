# ⚡ Inicio Rápido - Planbarómetro CEPAL

## 🚀 1 Comando, 3 Opciones

### Opción A: GitHub + Desarrollo Local
```bash
bash <(curl -sSL https://raw.githubusercontent.com/tu-usuario/planbarometro-cepal/main/install-github.sh)
```

### Opción B: Vercel + Producción
```bash
bash <(curl -sSL https://raw.githubusercontent.com/tu-usuario/planbarometro-cepal/main/install-vercel.sh)
```

### Opción C: Docker Local
```bash
bash <(curl -sSL https://raw.githubusercontent.com/tu-usuario/planbarometro-cepal/main/scripts/deploy-local.sh)
```

## 🏃‍♂️ ¿Tienes 2 minutos?

```bash
# Clonar
git clone https://github.com/tu-usuario/planbarometro-cepal.git
cd planbarometro-cepal

# Instalar
npm install

# Configurar (editar con tus datos)
cp .env.example .env

# Base de datos
npm run db:push

# ¡Listo!
npm run dev
```

**Abrir**: http://localhost:5000

## 🔑 Solo necesitas

1. **Base de datos PostgreSQL**
   - Neon Database (gratuito): https://neon.tech
   - O local: `createdb planbarometro`

2. **Variable DATABASE_URL** en `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@host:port/db"
   ```

## 📋 Funciones principales

- ✅ **Evaluación TOPP**: Técnica, Operativa, Política, Prospectiva
- ✅ **Multi-usuario RT Delphi**: Colaboración en tiempo real
- ✅ **Banco de Buenas Prácticas**: 6 repositorios oficiales
- ✅ **Web Scraping CEPAL/BID**: Extracción automática
- ✅ **Alertas Estratégicas**: Análisis inteligente
- ✅ **Exportación PDF**: Reportes profesionales

## 🆘 ¿Problemas?

### Error de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de base de datos
```bash
# Verificar conexión
npm run db:push
```

### Error de build
```bash
npm run build
```

---

**📖 Documentación completa**: [INSTALL.md](./INSTALL.md) • [DEPLOYMENT.md](./DEPLOYMENT.md)

**🏛️ ILPES-CEPAL** - Instituto Latinoamericano y del Caribe de Planificación Económica y Social