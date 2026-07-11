# DentAI - Architecture Documentation

## Project Architecture

DentAI is an enterprise Angular 21 application for managing dental clinics. It follows a **Feature-Based Architecture** with clear separation of concerns, built on Angular's standalone APIs and TypeScript.

### Architecture Principles

- **Feature-Based**: Features are self-contained, independent modules
- **Clean Architecture**: Clear boundaries between layers (core, shared, features)
- **SOLID Principles**: Single responsibility, loose coupling, high cohesion
- **Scalability**: Designed for team scaling and multi-sprint development
- **Maintainability**: Consistent patterns across all features

---

## Core Module (`app/core/`)

**Purpose**: Application-wide infrastructure and singletons that are instantiated once and never destroyed.

### Core Responsibilities

- **config/**: Application configuration, environment settings
- **constants/**: Application-wide constants and enums
- **guards/**: Route guards (auth, role-based access, etc.)
- **interceptors/**: HTTP interceptors for auth, error handling, logging
- **models/**: Global data models and interfaces
- **services/**: Singleton services (auth, API, state management)
- **tokens/**: Dependency injection tokens (InjectionToken instances)
- **types/**: Global TypeScript types and interfaces
- **utils/**: Utility functions and helpers

### Guidelines

- Create only ONE instance per service
- Never inject feature-specific services
- Use dependency injection for all services
- Keep services focused and single-purpose

---

## Shared Module (`app/shared/`)

**Purpose**: Reusable code used across multiple features. Shared components, directives, pipes, validators, and UI elements.

### Shared Responsibilities

- **components/**: Reusable presentational components (buttons, modals, tables, etc.)
- **ui/**: UI library components (design tokens, theme components)
- **directives/**: Custom Angular directives (e.g., permission directives, scroll directives)
- **pipes/**: Custom Angular pipes (transformations, formatting)
- **validators/**: Custom form validators for reactive and template forms
- **types/**: Shared types and interfaces used across features

### Guidelines

- No business logic - only presentational/utility code
- Feature-agnostic - reusable across all features
- Declare FormsModule, CommonModule as needed
- Keep components stateless when possible

---

## Layouts Module (`app/layouts/`)

**Purpose**: Application layout containers and shells.

### Layouts

- **auth-layout/**: Layout for authentication pages (login, signup, password reset)
- **dashboard-layout/**: Layout for authenticated pages (navbar, sidebar, main content area)

### Guidelines

- Layouts contain structural elements (headers, sidebars, footers)
- Use shared/ui components inside layouts
- Layouts are typically used as parent routes

---

## Features Module (`app/features/`)

**Purpose**: Feature-specific, self-contained modules representing distinct business domains.

### Features

- **auth**: Authentication and authorization (login, signup, token management)
- **dashboard**: Dashboard and overview pages
- **patients**: Patient management (CRUD, profiles, medical records)
- **appointments**: Appointment scheduling and management
- **inventory**: Medical inventory and supply management
- **reports**: Reporting and analytics
- **ai**: AI-assisted features (diagnostics, suggestions)
- **settings**: Application settings and configuration

### Feature Structure (Identical for Every Feature)

Each feature contains the same internal structure:

```
features/
  {feature-name}/
    ├── components/        # Feature-specific components
    ├── pages/             # Feature pages/containers
    ├── services/          # Feature business logic services
    ├── models/            # Feature data models and types
    ├── interfaces/        # Feature-specific interfaces/contracts
    └── routes/            # Feature routing configuration
```

### Feature Responsibilities

- **components/**: Feature-specific UI components (not shared with other features)
- **pages/**: Smart components connected to services and routes
- **services/**: Feature business logic, API calls, state management
- **models/**: Feature data types and interfaces
- **interfaces/**: Feature-specific contracts and abstractions
- **routes/**: Feature routing configuration and route definitions

### Guidelines

- Features are independent and loosely coupled
- Features should not import from other features
- Use core services for global functionality
- Use shared components for UI elements
- Each feature manages its own state

---

## Styles Module (`src/styles/`)

**Purpose**: Global and theme-specific stylesheets.

### Styles Responsibilities

- **base/**: Base styles, resets, normalization (Tailwind base layer)
- **components/**: Component-specific styles (Tailwind components layer)
- **themes/**: Theme variables and theme-specific styles (light, dark modes)
- **utilities/**: Custom utility classes (Tailwind utilities layer)
- **vendors/**: Third-party library styles and overrides

### Guidelines

- Use Tailwind CSS for utility-first styling
- Organize by ITCSS layers (base → components → utilities)
- Keep vendor styles isolated

---

## Folder Naming Conventions

### Feature Folders

- **components/**: Plural (components, not component)
- **pages/**: Plural (pages, not page)
- **services/**: Plural (services, not service)
- **models/**: Plural (models, not model)
- **interfaces/**: Plural (interfaces, not interface)
- **routes/**: Plural (routes, not route)

### File Naming

- **Components**: `feature.component.ts` (kebab-case prefix, .component suffix)
  - Example: `patient-list.component.ts`
- **Services**: `feature.service.ts` (kebab-case prefix, .service suffix)
  - Example: `patient.service.ts`
- **Models**: `feature.model.ts` (kebab-case, .model suffix)
  - Example: `patient.model.ts`
- **Guards**: `feature.guard.ts` (kebab-case prefix, .guard suffix)
  - Example: `auth.guard.ts`
- **Interceptors**: `feature.interceptor.ts` (kebab-case prefix, .interceptor suffix)
  - Example: `error.interceptor.ts`

---

## Dependencies Between Modules

```
features/ ──> shared/ ──┐
   ↓                    │
services ──> core/ ────┘
   ↓
models

features/ (X) features/  ← No cross-feature dependencies
```

### Valid Dependencies

- ✅ Features → Shared
- ✅ Features → Core
- ✅ Shared → Core
- ✅ Core → nothing (isolated)
- ❌ Features → Features (prohibited)
- ❌ Shared → Features (prohibited)

---

## Project Structure Overview

```
src/
├── app/
│   ├── core/              # Application infrastructure (singletons)
│   ├── shared/            # Reusable components and utilities
│   ├── layouts/           # Layout components and shells
│   ├── features/          # Feature modules (independent domains)
│   └── app.ts             # Root component
├── styles/                # Global stylesheets
├── assets/                # Static assets
├── environments/          # Environment configurations
├── index.html             # HTML entry point
├── main.ts                # TypeScript entry point
└── styles.css             # Global styles

docs/
└── architecture.md        # This file
```

---

## Development Guidelines

### When Adding New Code

1. **Is it app-wide infrastructure?** → `core/`
2. **Can it be used in multiple features?** → `shared/`
3. **Is it specific to a feature?** → `features/{name}/`

### When Adding a New Feature

1. Create the feature folder in `features/`
2. Create all required subfolders: `components/`, `pages/`, `services/`, `models/`, `interfaces/`, `routes/`
3. Keep the feature independent and self-contained
4. Use core services for global functionality
5. Use shared components for UI
6. Define routes in `routes/` folder
7. Never import from other features

### Code Quality Standards

- Follow Angular style guide
- Use TypeScript strict mode
- Use reactive programming patterns (RxJS)
- Use type safety throughout
- Keep functions pure and testable
- Write unit tests for services
- Use dependency injection

---

## Technology Stack

- **Framework**: Angular 21 (Standalone APIs)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP**: HttpClient (REST API)
- **Forms**: Reactive Forms
- **State**: RxJS
- **Authentication**: JWT tokens
- **Backend**: FastAPI + PostgreSQL

---

## Related Documentation

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Angular Standalone Components](https://angular.io/guide/standalone-components)
- [RxJS Documentation](https://rxjs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

*Last Updated: 2026-07-06*
