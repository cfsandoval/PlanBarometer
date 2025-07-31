# Planbarómetro - Government Planning Capacity Assessment Tool

## Overview

This is a full-stack web application for evaluating government planning capacities using the TOPP (Technical, Operational, Political, Prospective) framework. The system allows users to assess planning capabilities across multiple dimensions and generate strategic insights and alerts based on evaluation patterns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Charts**: Recharts for data visualization (radar charts, bar charts)
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful JSON API
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Storage**: PostgreSQL-based sessions with connect-pg-simple
- **Development**: In-memory storage fallback for development

### Database Schema
- **users**: Basic user authentication (id, username, password)
- **evaluations**: Evaluation records with JSON storage for responses and scores
- **Schema Management**: Drizzle Kit for migrations and schema management

## Key Components

### Data Models
1. **Evaluation Framework**:
   - Multiple assessment models (TOPP, Nacional, Subnacional)
   - Hierarchical structure: Models → Dimensions → Criteria → Elements
   - Binary scoring system (0 = Absent, 1 = Present)

2. **Scoring Engine**:
   - Calculates percentages at criterion, dimension, and overall levels
   - Generates comparative scores across dimensions
   - Real-time score updates as users respond

3. **Strategic Alerts System**:
   - Pattern recognition for identifying governance risks
   - Severity-based categorization (high, medium, low)
   - Automated recommendations for capacity building

### Core Features
1. **Model Selection**: Choose between different evaluation frameworks
2. **Interactive Assessment**: Progressive evaluation with real-time scoring
3. **Data Visualization**: Radar charts and bar charts for results analysis
4. **Strategic Insights**: Automated alert generation and recommendations
5. **Persistence**: Save and load evaluations with PostgreSQL storage

## Data Flow

1. **Assessment Flow**:
   - User selects evaluation model → Interactive form renders dimensions/criteria → User provides binary responses → Real-time score calculation → Strategic alerts generation

2. **Storage Flow**:
   - Evaluation data serialized to JSON → Stored in PostgreSQL via Drizzle ORM → Retrieved for analysis and continuation

3. **Visualization Flow**:
   - Scores calculated from responses → Data transformed for charts → Recharts renders radar and bar visualizations

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, TypeScript
- **UI Components**: Radix UI primitives, shadcn/ui components
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod validation

### Backend Dependencies
- **Server**: Express.js, Node.js
- **Database**: Drizzle ORM, Neon Database client, PostgreSQL
- **Validation**: Zod schema validation
- **Session Management**: Express sessions with PostgreSQL store

### Development Dependencies
- **Build Tools**: Vite, esbuild
- **Development**: tsx for TypeScript execution
- **Linting/Typing**: TypeScript compiler
- **Replit Integration**: Cartographer and error overlay plugins

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Database**: In-memory storage with fallback to PostgreSQL
- **Session Management**: Memory store for development

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Full PostgreSQL with Neon Database
- **Deployment**: Single process serving both API and static files

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string for production
- **NODE_ENV**: Environment detection for development/production modes
- **Session Configuration**: Secure session management with PostgreSQL persistence

### Recent Changes (January 2025)

1. **PDF Export System**: Replaced JSON export with PDF generation using jsPDF and html2canvas, now includes chart capture
2. **Enhanced Strategic Alerts**: Added 8 different alert types including specific alerts for unanswered elements
3. **Gauge Chart Visualizations**: Implemented circular gauge charts showing risk level, impact, and urgency metrics for each alert
4. **Form Validation**: Added visual indicators for absent elements with red highlighting and warning labels
5. **Completion Requirements**: Gráficos and alerts now require complete evaluation before displaying content
6. **Exercise and Group Codes**: Added optional fields for organizing evaluations by exercise and group identifiers
7. **Random Testing Tool**: Implemented "Completar Aleatoriamente" button for automated testing of evaluation forms
8. **Structure Editing**: Added full editing capabilities for criteria and elements with add/remove functionality
9. **Custom Model Support**: Evaluations can now use custom-modified structures stored with the evaluation data
10. **Custom Alerts System**: Implemented editor for creating custom alerts based on specific criteria thresholds
11. **Low-Risk Visualization**: Added gauge charts showing favorable conditions when no alerts are detected
12. **English Translation**: Complete internationalization system with English as default language, including language selector and full UI translation
13. **Real-time Collaborative Workshops**: Full WebSocket-based collaboration system with participant tracking and live response synchronization
14. **Radar Chart Corrections**: Fixed calculation logic to properly compute criterion scores based on individual element responses with 100% maximum axis values
15. **Contextual Interpretations**: Added comprehensive interpretation sections under each dimension radar chart with performance analysis and specific recommendations
16. **Smart Policy Search**: Automatic search for Latin American public policies and strategies targeting weak criteria (< 50%) with real source links and verified documentation
17. **Expanded Best Practices Repository**: Comprehensive database with 18+ specific documented cases including 7 concrete Peruvian cases with quantified results and verified metrics
18. **Complete GitHub Documentation**: Full suite of documentation files including README.md, CONTRIBUTING.md, SECURITY.md, DEPLOYMENT.md, LICENSE, CHANGELOG.md, CI/CD workflows, and environment templates for professional open-source project management
19. **RT Delphi Multi-User System**: Complete collaborative evaluation system with user roles (admin, coordinator, user), group management, and real-time studies
20. **Member Management**: Full CRUD functionality for managing group members with role-based permissions and email invitations
21. **Admin Users Interface**: Comprehensive user administration page with create, edit, delete, and search capabilities for system administrators
22. **Visual Membership Heatmap**: Interactive matrix visualization showing user-group relationships with color-coded membership status (green=member, blue=coordinator, gray=not member), hover tooltips, and comprehensive statistics dashboard
23. **Study-Specific Expert Assignment**: Granular participant management allowing coordinators to invite specific experts to individual studies with expertise areas, separate from group membership
24. **Complete Study Dashboard**: Comprehensive individual study interface with tabbed navigation (Overview, Participants, Evaluation, Results) including metrics, progress tracking, and participant management
25. **Route Resolution**: Fixed 404 errors for study URLs (/delphi/studies/:id) with proper frontend routing and authentication handling
26. **Personalized Expert Feedback Mechanism**: Advanced feedback system providing individualized performance analysis, deviation patterns (aligned/optimistic/conservative/outlier), personalized learning insights, skill development recommendations, and expert progression tracking with achievement levels

### Key Architectural Decisions

1. **Full-Stack TypeScript**: Ensures type safety across client-server boundary with shared schema definitions
2. **JSON Storage for Flexible Data**: Evaluation responses and scores stored as JSON for schema flexibility
3. **Component-Based UI**: Modular React components with shadcn/ui for consistent design system
4. **Real-Time Calculations**: Client-side scoring engine for immediate feedback during assessments
5. **Progressive Enhancement**: Works with basic functionality, enhanced with JavaScript for rich interactions
6. **PDF Export Integration**: Comprehensive reporting system with chart capture and detailed analysis