# Frontend and Backend Folder Structure Guide

## Overview

JoblyAI is a monorepo managed by Nx containing a NestJS backend API and Next.js web application.

---

## Backend Structure (`apps/backend`)

### Root Level Files

```
apps/backend/
├── Dockerfile                 # Docker configuration for backend deployment
├── package.json              # Backend-specific dependencies
├── tsconfig.app.json         # TypeScript configuration for the app
├── tsconfig.json             # Base TypeScript configuration
├── webpack.config.js         # Webpack configuration for bundling
├── eslint.config.mjs         # ESLint configuration
└── src/
```

### Source Code Structure (`src/`)

```
src/
├── main.ts                   # Application entry point
│                             # - Initializes NestJS application
│                             # - Sets up Passport authentication
│                             # - Configures Swagger API documentation
│
├── app/                      # Core application modules
│   ├── app.module.ts         # Root NestJS module
│   ├── app.controller.ts     # Root controller handling main routes
│   ├── app.service.ts        # Root service with business logic
│   │
│   ├── auth/                 # Authentication module
│   │   ├── auth.module.ts    # Auth module definition
│   │   ├── auth.controller.ts # Auth routes (login, logout, etc.)
│   │   ├── auth.service.ts   # Auth business logic
│   │   ├── auth.guard.ts     # Authentication guard for protected routes
│   │   └── ...               # Additional auth-related files
│   │
│   ├── account/              # User account management module
│   │   ├── account.module.ts # Account module definition
│   │   ├── account.controller.ts # Account endpoints
│   │   ├── account.service.ts # Account business logic
│   │   └── dto/              # Data Transfer Objects
│   │       └── ...           # Account-related DTOs
│   │
│   ├── common/               # Shared utilities and common services
│   │   └── ...               # Decorators, filters, pipes, etc.
│   │
│   ├── middleware/           # Custom middleware
│   │   └── ...               # Request/response middleware
│   │
│   ├── utils/                # Utility functions
│   │   └── ...               # Helper functions for backend logic
│   │
│   └── generated/            # Auto-generated code (DO NOT EDIT)
│       └── prisma/           # Prisma client and types
│           ├── client.js     # Generated Prisma client
│           ├── client.d.ts   # Type definitions
│           └── ...           # Other generated files
│
└── assets/
    └── openapi.yaml          # OpenAPI specification for Swagger docs
```

### Backend Features & Architecture

- **Framework**: NestJS
- **Database ORM**: Prisma
- **Authentication**: Passport.js with OpenID Connect (OIDC) strategy
- **API Documentation**: Swagger/OpenAPI
- **Session Management**: Express-session

---

## Frontend Structure

### Web App (`apps/web`)

#### Root Level Files

```
apps/web/
├── Dockerfile                # Docker configuration for web deployment
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── package.json              # Web-specific dependencies
├── tsconfig.json             # TypeScript configuration
├── eslint.config.mjs         # ESLint configuration
├── index.d.ts                # Global type definitions
├── next-env.d.ts             # Next.js auto-generated types
├── public/                   # Static assets
└── src/
```

#### Source Code Structure (`src/`)

```
src/
├── providers.tsx             # Root providers wrapper (context, theme, etc.)
│
├── app/                      # Next.js app directory (App Router)
│   ├── layout.tsx            # Root layout wrapper for all pages
│   ├── page.tsx              # Home page (index route)
│   ├── global.css            # Global styles
│   ├── style.css             # Additional styling
│   │
│   ├── api/                  # API routes (backend integration) for API calls
│   │   └── ...               # API route handlers
│   │
│   ├── login/                # Login page and related routes (Next JS sees this and )
│   │   ├── page.tsx          # Login page
│   │   └── ...               # Login-specific files
│   │
│   └── signup/               # Signup page and related routes
│       ├── page.tsx          # Signup page
│       └── ...               # Signup-specific files
│
├── components/               # Reusable React components
│   ├── ui/                   # UI component library
│   │   ├── button.tsx        # Button component
│   │   └── ...               # Other UI components
│   │
│   └── auth/                 # Authentication-related components
│       └── ...               # Auth component parts (LoginForm, SignupForm, etc.)
│
├── features/                 # Feature-specific modules and screens
│   ├── login/                # Login feature
│   │   └── ...               # Login-specific components and logic
│   │
│   └── signup/               # Signup feature
│       └── ...               # Signup-specific components and logic
│
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts            # Authentication hook
│   ├── useUser.ts            # User data hook
│   └── ...                   # Other custom hooks
│
└── lib/
    └── utils.ts              # Utility functions and helpers
```

### Web App Features & Architecture

- **Framework**: Next.js (React 18+)
- **Styling**: Tailwind CSS with PostCSS
- **Routing**: Next.js App Router
- **API Client**: Fetch-based or HTTP client for backend communication

---

## Root Level Configuration

```
/
├── nx.json                   # Nx workspace configuration
├── pnpm-workspace.yaml       # pnpm monorepo configuration
├── pnpm-lock.yaml            # Lock file for dependencies
├── tsconfig.base.json        # Base TypeScript configuration for all projects
├── tsconfig.json             # Root TypeScript configuration
├── vitest.workspace.ts       # Vitest testing framework config
├── eslint.config.mjs         # Root ESLint configuration
├── package.json              # Root package with scripts and shared dependencies
│
├── docker-compose.yml        # Docker Compose setup for local development
├── docker-compose.override.yml # Override settings for local development
├── nginx.conf/               # Nginx configuration for reverse proxy
│
├── README.md                 # Main project documentation
├── CLAUDE.md                 # Claude AI assistant setup guide
├── AGENTS.md                 # AI agents configuration
└── FOLDER_STRUCTURE.md       # This file
```

---

## File Organization Best Practices

### Backend (NestJS)

- **Modules**: Group related functionality by feature (Auth, Account, etc.)
  - Each module has its own `.module.ts`, `.controller.ts`, `.service.ts`
  - Example: `auth/`, `account/` modules
- **Controllers**: Handle HTTP requests and route them to services
- **Services**: Contain business logic and database interactions
- **Guards**: Protect routes with authentication and authorization logic
- **DTOs**: Define request/response data contracts in `dto/` folders
- **Utils**: Helper functions in `utils/` directory for common logic
- **Middleware**: Request processing middleware in `middleware/` directory
- **Common**: Shared decorators, pipes, filters, exception handlers

### Web (Next.js)

- **App Directory**: Use file-based routing in `app/`
  - Pages: `login/page.tsx`, `signup/page.tsx`, etc.
  - Nested routing with folder structure
- **Components**: Organize by type
  - `ui/`: Reusable UI components (Button, Input, Modal, etc.)
  - `auth/`: Authentication-specific components
- **Features**: Feature-specific modules
  - `login/`, `signup/` for feature-specific logic
  - Keep feature logic separate from shared components
- **Hooks**: Custom React hooks for state management
  - `useAuth.ts`: Authentication state and methods
  - `useUser.ts`: User data management
- **Utils/Lib**: Shared utilities and helper functions
- **Providers**: Root context providers in `providers.tsx`

---

## Deployment Structure

The Dockerfile exists at the root of both `backend` and `web` apps, allowing containerized deployment:

- Backend container runs the NestJS API server
- Web container serves the Next.js application
- Both can be orchestrated with Docker Compose

---

## Related Documentation

- Backend Details: See `apps/backend/` for NestJS-specific setup
- Frontend Details: See `apps/web/` for Next.js configuration
- Main README: See [README.md](README.md) for overall project information
