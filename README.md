# JoblyAI Monorepo

Monorepo managed by Nx containing the backend API, web app, React Native mobile app, and shared TypeScript types.

## Contents
- [JoblyAI Monorepo](#joblyai-monorepo)
  - [Contents](#contents)
  - [Requirements](#requirements)
  - [Getting started](#getting-started)
  - [User guide](#user-guide)
  - [Common Nx commands](#common-nx-commands)
  - [Projects](#projects)
    - [Backend API (NestJS)](#backend-api-nestjs)
    - [Web App (Next.js)](#web-app-nextjs)
    - [Mobile App (React Native)](#mobile-app-react-native)
    - [Shared Types](#shared-types)

## Requirements
- Node 22.x and pnpm 9+ (see engines in [package.json](package.json))
- macOS/iOS: Xcode + CocoaPods (`brew install cocoapods`) for native iOS
- Android: Android Studio with an emulator or device connected via `adb`
- Optional: `pnpm dlx nx --version` to confirm Nx CLI availability

## Getting started
1) Clone and enter the repo
```bash
git clone https://github.com/JoblyAIHCMUS/JoblyAI.git
cd JoblyAI
```
2) Install pnpm if needed
```bash
corepack enable
corepack prepare pnpm@latest --activate
```
3) Install workspace dependencies
```bash
pnpm install
```

## User guide
- Start all dev servers (backend, web, mobile web):
	```bash
	pnpm start
	```
	This runs `nx run-many --target=serve --all`.
- Lint everything:
	```bash
	pnpm nx run-many --target=lint --all
	```
- Typecheck everything:
	```bash
	pnpm nx run-many --target=typecheck --all
	```
- Visualize dependency graph:
	```bash
	pnpm nx graph
	```

## Common Nx commands
- Build everything:
	```bash
	pnpm nx run-many --target=build --all
	```
- Check what targets exist:
	```bash
	pnpm nx show project @jobly/backend
	```
- Explore graph visually in the browser:
	```bash
	pnpm nx graph
	```

## Projects

### Backend API (NestJS)
- Path: [apps/backend](apps/backend)
- Dev (watch):
	```bash
	pnpm nx serve @jobly/backend --configuration=development
	```
- Build (production bundle):
	```bash
	pnpm nx build @jobly/backend
	```

### Web App (Next.js)
- Path: [apps/web](apps/web)
- Dev server:
	```bash
	pnpm nx dev @jobly/web
	```
- Production build:
	```bash
	pnpm nx build @jobly/web
	```

### Mobile App (React Native)
- Path: [apps/mobile](apps/mobile)
- Web preview (Vite dev):
	```bash
	pnpm nx dev @jobly/mobile
	```
- Metro bundler (native):
	```bash
	pnpm nx start @jobly/mobile
	```
- iOS setup (once on macOS):
	```bash
	pnpm nx run @jobly/mobile:pod-install
	```
- Run iOS simulator:
	```bash
	pnpm nx run @jobly/mobile:run-ios
	```
- Run Android emulator/device:
	```bash
	pnpm nx run @jobly/mobile:run-android
	```

### Shared Types
- Path: [libs/shared-types](libs/shared-types)
- Build:
	```bash
	pnpm nx build @jobly/shared-types
	```
