# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Sistema de usuarios y autenticación
- Dashboard de administración
- Exportación a Excel/CSV
- API REST completa
- Tests automatizados

## [2.0.0] - 2025-01-30

### Added - Funcionalidades Principales
- ✨ **Sistema de Colaboración en Tiempo Real**: Talleres colaborativos con WebSockets
- 🔍 **Búsqueda Automática de Políticas**: Integración con OpenAI para encontrar casos latinoamericanos
- 💾 **Repositorio de Buenas Prácticas**: 18+ casos específicos documentados con métricas verificadas
- 🎯 **Interpretaciones Contextuales**: Análisis automático de resultados con recomendaciones
- 📄 **Exportación PDF Avanzada**: Reportes completos con gráficos capturados
- 🌐 **Sistema Multiidioma**: Soporte completo español/inglés con selector dinámico

### Added - Casos Específicos de Perú
- **MineduLAB**: Laboratorio de innovación educativa (14 innovaciones, Premio 2018)
- **TUKUY RIKUY**: Sistema de alerta energética (90.5% reducción tiempos, 1.5M beneficiarios)
- **Siembra y Cosecha de Agua**: Gestión hídrica ancestral (S/743M invertidos, ratio 2.8)
- **Registro Civil Bilingüe**: 12 lenguas originarias (780 oficinas, 5M beneficiarios)
- **Saberes Productivos**: Inclusión adulto mayor (95.5% satisfacción)
- **Sistema MasiGas**: Masificación gas natural (102% incremento instaladores)
- **Convenio Marco**: Contrataciones digitales (41 catálogos electrónicos)

### Added - Funcionalidades Técnicas
- 📊 **Gráficos de Medidores**: Visualización de riesgo, impacto y urgencia para alertas
- 🛠️ **Editor de Estructura**: Capacidad de modificar criterios y elementos
- 🎲 **Completado Aleatorio**: Herramienta de testing para demostración
- 🏷️ **Sistema de Tags**: Organización y filtrado de buenas prácticas
- 📈 **Cálculos Mejorados**: Algoritmos precisos para puntajes y alertas

### Enhanced - Mejoras Existentes
- 🎨 **UI/UX Mejorada**: Interfaz más intuitiva y responsive
- ⚡ **Performance**: Optimizaciones en carga y rendering
- 🔒 **Validación**: Validación robusta con Zod en frontend y backend
- 📱 **Responsive**: Compatibilidad completa con dispositivos móviles

### Fixed - Correcciones
- 🐛 **Cálculos de Radar**: Lógica corregida para máximo 100% en ejes
- 💾 **Persistencia**: Mejoras en guardado automático de evaluaciones
- 🔄 **Sincronización**: Correcciones en tiempo real para talleres colaborativos
- 📊 **Gráficos**: Resolución de problemas de escalado y colores

## [1.5.0] - 2024-12-15

### Added
- 🎨 **Alertas Personalizadas**: Editor para crear alertas basadas en umbrales específicos
- 📊 **Visualización de Riesgo Bajo**: Medidores que muestran condiciones favorables
- 🌍 **Casos Internacionales**: Ampliación con casos de Estonia, Brasil, Colombia, Chile

### Enhanced
- 🔍 **Algoritmo de Búsqueda**: Mejoras en matching semántico para criterios
- 📈 **Sistema de Alertas**: 8 tipos diferentes de alertas estratégicas
- 🎯 **Indicadores Visuales**: Elementos ausentes destacados en rojo

## [1.0.0] - 2024-11-01

### Added - Lanzamiento Inicial
- 📋 **Evaluación TOPP Básica**: Implementación completa de metodología ILPES-CEPAL
- 📊 **Gráficos de Radar**: Visualización por dimensiones
- 📈 **Gráficos de Barras**: Comparación por criterios
- ⚠️ **Sistema de Alertas**: Detección automática de riesgos
- 💾 **Persistencia**: Almacenamiento en PostgreSQL/memoria
- 🏗️ **Arquitectura Full-Stack**: React + TypeScript + Express + Drizzle

### Technical Foundation
- 🛠️ **Stack Tecnológico**: React 18, TypeScript, Express.js, PostgreSQL
- 🎨 **Sistema de Diseño**: shadcn/ui + Tailwind CSS
- 📦 **Build System**: Vite con HMR
- 🗃️ **ORM**: Drizzle para gestión de base de datos

## [0.5.0] - 2024-09-15

### Added - Beta Inicial
- 🏁 **MVP Funcional**: Primera versión con funcionalidad básica
- 📝 **Formularios Dinámicos**: Generación automática basada en modelos
- 💾 **Almacenamiento Local**: Sistema básico de persistencia
- 📊 **Visualización Básica**: Gráficos simples de resultados

## Tipos de Cambios

- `Added` para nuevas funcionalidades
- `Changed` para cambios en funcionalidades existentes
- `Deprecated` para funcionalidades que serán removidas
- `Removed` para funcionalidades removidas
- `Fixed` para corrección de bugs
- `Security` para mejoras de seguridad
- `Enhanced` para mejoras significativas

## Categorías por Emoji

- ✨ Nuevas funcionalidades principales
- 🐛 Corrección de bugs
- 📝 Documentación
- 🎨 UI/UX y diseño
- ⚡ Performance
- 🔒 Seguridad
- 🌐 Internacionalización
- 📊 Visualizaciones y gráficos
- 💾 Base de datos y persistencia
- 🛠️ Herramientas y configuración
- 📱 Responsive y móvil
- 🔍 Búsqueda y filtros
- 👥 Colaboración
- 📄 Exportación y reportes
- 🎯 Funcionalidades específicas

---

Para más detalles sobre cada versión, consulta los [releases](https://github.com/usuario/planbarometro/releases) en GitHub.