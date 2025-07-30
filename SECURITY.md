# Política de Seguridad

## Versiones Soportadas

Actualmente brindamos soporte de seguridad para las siguientes versiones:

| Versión | Soporte           |
| ------- | ----------------- |
| 2.0.x   | ✅ Soportada      |
| 1.5.x   | ✅ Soportada      |
| 1.0.x   | ⚠️ Soporte limitado |
| < 1.0   | ❌ No soportada   |

## Reportar Vulnerabilidades

### Canales de Reporte

Si descubres una vulnerabilidad de seguridad, por favor repórtala de manera responsable:

1. **Email**: Envía un reporte detallado a `security@planbarometro.org`
2. **GitHub Security Advisory**: Usa el sistema de [Security Advisories](https://github.com/usuario/planbarometro/security/advisories/new) (recomendado)

### Información a Incluir

Por favor incluye la siguiente información en tu reporte:

- **Descripción detallada** de la vulnerabilidad
- **Pasos para reproducir** el problema
- **Impacto potencial** de la vulnerabilidad
- **Versión afectada** del software
- **Capturas de pantalla** si son relevantes
- **Propuesta de solución** si tienes alguna

### Proceso de Respuesta

1. **Confirmación**: Confirmaremos la recepción en 24 horas
2. **Evaluación inicial**: Evaluaremos la vulnerabilidad en 72 horas
3. **Investigación**: Investigaremos y desarrollaremos una solución
4. **Coordinación**: Coordinaremos la divulgación contigo
5. **Parche**: Lanzaremos un parche de seguridad
6. **Divulgación**: Publicaremos un advisory de seguridad

### Tiempo de Respuesta Esperado

- **Crítica**: 24-48 horas
- **Alta**: 72 horas
- **Media**: 1 semana
- **Baja**: 2 semanas

### Política de Divulgación

- **Divulgación coordinada**: Trabajamos contigo para un timing apropiado
- **90 días máximo**: Divulgación pública después de 90 días máximo
- **Crédito**: Te daremos crédito por el descubrimiento (si lo deseas)

## Medidas de Seguridad Implementadas

### Aplicación Web

#### Autenticación y Autorización
- ✅ Sesiones seguras con PostgreSQL
- ✅ Cookies con flags `httpOnly` y `secure`
- ✅ Protección CSRF
- ✅ Rate limiting en endpoints sensibles

#### Validación de Datos
- ✅ Validación de entrada con Zod
- ✅ Sanitización de datos
- ✅ Validación tanto frontend como backend
- ✅ Protección contra inyección SQL (ORM)

#### Comunicación
- ✅ HTTPS en producción
- ✅ Secure WebSocket connections (WSS)
- ✅ Headers de seguridad apropiados
- ✅ Política de Content Security Policy (CSP)

#### Base de Datos
- ✅ Consultas parametrizadas (Drizzle ORM)
- ✅ Principio de menor privilegio
- ✅ Encriptación de datos sensibles
- ✅ Backups seguros y encriptados

### Infraestructura

#### Servidor
- ✅ Actualizaciones automáticas de seguridad
- ✅ Firewall configurado
- ✅ Logs de seguridad
- ✅ Monitoreo de intrusions

#### Dependencias
- ✅ Auditoría regular de dependencias
- ✅ Actualizaciones automáticas de seguridad
- ✅ Análisis de vulnerabilidades en CI/CD
- ✅ Lock files para dependencias

### Configuración Segura

#### Variables de Entorno
```bash
# ✅ Buenas prácticas
SESSION_SECRET="generated-secure-random-key"
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
NODE_ENV=production

# ❌ Evitar
SESSION_SECRET="default-key"
DEBUG_MODE=true  # en producción
```

#### Headers de Seguridad
```javascript
// Implementados automáticamente
{
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Content-Security-Policy": "default-src 'self'"
}
```

## Mejores Prácticas para Desarrolladores

### Código Seguro

#### Validación de Entrada
```typescript
// ✅ Correcto
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const validatedData = schema.parse(input);
```

#### Manejo de Errores
```typescript
// ✅ Correcto - No revelar información sensible
catch (error) {
  console.error('Database error:', error); // Solo en logs
  res.status(500).json({ message: 'Internal server error' });
}

// ❌ Incorrecto
catch (error) {
  res.status(500).json({ error: error.message }); // Revela detalles
}
```

#### Consultas de Base de Datos
```typescript
// ✅ Correcto - Usando ORM
const user = await db.select().from(users).where(eq(users.id, userId));

// ❌ Incorrecto - SQL crudo
const query = `SELECT * FROM users WHERE id = ${userId}`;
```

### Configuración Segura

#### Sesiones
```typescript
// ✅ Configuración segura
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));
```

## Vulnerabilidades Conocidas

### Historial de Vulnerabilidades

Mantenemos un registro público de vulnerabilidades resueltas:

#### [CVE-2024-XXXX] - Ejemplo (Resuelto en v2.0.1)
- **Severidad**: Media
- **Descripción**: Vulnerabilidad XSS en campo de comentarios
- **Solución**: Sanitización mejorada de entrada
- **Fecha de resolución**: 2024-12-15

### Dependencias con Vulnerabilidades Conocidas

Monitoreamos activamente las dependencias y actualizamos cuando hay vulnerabilidades:

```bash
# Verificar vulnerabilidades
npm audit

# Aplicar correcciones automáticas
npm audit fix
```

## Contacto de Seguridad

### Equipo de Seguridad
- **Email principal**: security@planbarometro.org
- **PGP Key**: [Disponible aquí](./security/pgp-key.asc)
- **Respuesta**: 24 horas para issues críticos

### Recursos Adicionales
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)

## Actualizaciones de Seguridad

### Notificaciones
- **GitHub Security Advisories**: Notificaciones automáticas
- **Email**: Lista de correo para actualizaciones críticas
- **RSS Feed**: Feed de seguridad disponible

### Proceso de Actualización
1. **Identificación** de vulnerabilidad
2. **Desarrollo** de parche
3. **Testing** en entorno aislado
4. **Release** de versión de seguridad
5. **Notificación** a usuarios
6. **Documentación** en changelog

---

**Última actualización**: Enero 2025  
**Próxima revisión**: Abril 2025