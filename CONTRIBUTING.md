# Guía de Contribución - Planbarómetro

¡Gracias por tu interés en contribuir al proyecto Planbarómetro! Esta guía te ayudará a comenzar.

## 🚀 Cómo Contribuir

### 1. Configuración del Entorno de Desarrollo

```bash
# Fork y clonar el repositorio
git clone https://github.com/tu-usuario/planbarometro.git
cd planbarometro

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

### 2. Flujo de Trabajo

1. **Crear Issue**: Describe el bug o funcionalidad que quieres agregar
2. **Fork**: Haz un fork del repositorio
3. **Crear Rama**: `git checkout -b feature/descripcion-breve`
4. **Desarrollar**: Implementa los cambios siguiendo las convenciones
5. **Testear**: Asegúrate de que los tests pasen
6. **Commit**: Usa conventional commits
7. **Pull Request**: Describe claramente los cambios

### 3. Convenciones de Código

#### TypeScript
- Usa tipado estricto
- Evita `any`, prefiere tipos específicos
- Documenta funciones complejas con JSDoc

#### React Components
```typescript
// ✅ Correcto
interface Props {
  title: string;
  onSave: (data: EvaluationData) => void;
}

export function EvaluationForm({ title, onSave }: Props) {
  // Implementación
}

// ❌ Incorrecto
export function EvaluationForm(props: any) {
  // Implementación
}
```

#### Estructura de Archivos
```
src/
├── components/
│   ├── ui/           # Componentes base de shadcn/ui
│   ├── forms/        # Componentes de formularios
│   ├── charts/       # Componentes de gráficos
│   └── layout/       # Componentes de layout
├── pages/            # Páginas de la aplicación
├── hooks/            # Custom hooks
├── lib/              # Utilidades y configuración
└── types/            # Definiciones de tipos
```

### 4. Commits Convencionales

Usa el formato: `tipo(scope): descripción`

```bash
# Ejemplos
git commit -m "feat(evaluations): add PDF export functionality"
git commit -m "fix(charts): resolve radar chart scaling issue"
git commit -m "docs(readme): update installation instructions"
```

Tipos válidos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Documentación
- `style`: Cambios de formato
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Mantenimiento

### 5. Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Cobertura
npm run test:coverage
```

#### Escribir Tests
```typescript
// Ejemplo de test para componente
import { render, screen } from '@testing-library/react';
import { EvaluationCard } from './EvaluationCard';

describe('EvaluationCard', () => {
  it('renders evaluation title', () => {
    render(<EvaluationCard title="Test Evaluation" />);
    expect(screen.getByText('Test Evaluation')).toBeInTheDocument();
  });
});
```

### 6. Áreas de Contribución

#### 🐛 Reportar Bugs
- Usa el template de issue para bugs
- Incluye pasos para reproducir
- Especifica navegador y versión
- Adjunta screenshots si es necesario

#### ✨ Nuevas Funcionalidades
- Discute primero en un issue
- Sigue el diseño existente
- Incluye tests
- Actualiza documentación

#### 📚 Documentación
- Mantén el README actualizado
- Agrega comentarios en código complejo
- Actualiza CHANGELOG.md

#### 🎨 UI/UX
- Sigue el sistema de diseño existente
- Usa componentes de shadcn/ui
- Mantén accesibilidad (WCAG AA)
- Testea en diferentes dispositivos

### 7. Revisión de Código

#### Checklist para Pull Requests
- [ ] Tests pasan localmente
- [ ] Código sigue convenciones
- [ ] Documentación actualizada
- [ ] No hay warnings de TypeScript
- [ ] Accesibilidad verificada
- [ ] Performance considerado

#### Template de Pull Request
```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Cambio que rompe compatibilidad
- [ ] Actualización de documentación

## Testing
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests manuales

## Screenshots
(Si aplica, incluir screenshots o GIFs)

## Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado una auto-revisión del código
- [ ] He comentado áreas complejas
- [ ] Los tests pasan
```

### 8. Configuración de Desarrollo

#### Variables de Entorno
```env
# .env.example
DATABASE_URL="postgresql://user:pass@localhost:5432/planbarometro"
OPENAI_API_KEY="sk-..."
NODE_ENV="development"
```

#### Herramientas Recomendadas
- **VSCode** con extensiones:
  - TypeScript Hero
  - Prettier
  - ESLint
  - Tailwind CSS IntelliSense
- **Git GUI**: GitKraken, SourceTree, o GitHub Desktop

### 9. Directrices Específicas

#### Componentes de UI
- Usa shadcn/ui como base
- Implementa modo oscuro desde el inicio
- Considera responsive design
- Incluye props para customización

#### API Endpoints
- Sigue RESTful conventions
- Valida input con Zod
- Maneja errores apropiadamente
- Documenta con JSDoc

#### Base de Datos
- Usa Drizzle ORM
- Migra con `drizzle-kit`
- Mantén esquemas tipados
- Considera performance

### 10. Comunidad

#### Comunicación
- **Issues**: Para bugs y solicitudes de funcionalidades
- **Discussions**: Para preguntas y ideas generales
- **Wiki**: Para documentación extendida

#### Código de Conducta
- Sé respetuoso y profesional
- Ayuda a otros desarrolladores
- Acepta feedback constructivo
- Mantén conversaciones enfocadas

### 11. Recursos Útiles

#### Documentación Técnica
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

#### Metodología
- [ILPES-CEPAL Planificación](https://www.cepal.org/es/areas-de-trabajo/planificacion-para-el-desarrollo)
- [TOPP Methodology](https://www.cepal.org/sites/default/files/publication/files/44906/S1800809_es.pdf)

### 12. Reconocimientos

Los contribuidores serán reconocidos en:
- Sección de Contributors en README
- CHANGELOG.md para cambios significativos
- About page de la aplicación

¡Gracias por contribuir al desarrollo de herramientas para mejorar la planificación gubernamental en América Latina! 🚀