# Multi-stage build para Planbarómetro CEPAL
FROM node:18-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache git python3 make g++

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY drizzle.config.ts ./

# Instalar dependencias
RUN npm ci --only=production && npm ci --only=development

# Copiar código fuente
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY components.json ./

# Build de la aplicación
RUN npm run build

# Imagen de producción
FROM node:18-alpine AS production

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S planbarometro -u 1001

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de producción
COPY --from=builder --chown=planbarometro:nodejs /app/dist ./dist
COPY --from=builder --chown=planbarometro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=planbarometro:nodejs /app/package*.json ./
COPY --from=builder --chown=planbarometro:nodejs /app/drizzle.config.ts ./

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Exponer puerto
EXPOSE 5000

# Cambiar a usuario no-root
USER planbarometro

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "http.get('http://localhost:5000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Comando de inicio
CMD ["npm", "start"]