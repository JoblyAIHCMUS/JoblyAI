# Better Auth Setup

This backend now uses [Better Auth](https://better-auth.com) for authentication with Prisma and Redis session caching.

## Features

- ✅ Email & Password authentication
- ✅ Session management with Redis caching
- ✅ Prisma database adapter
- ✅ Type-safe authentication
- ✅ Ready for social providers (Google, GitHub, etc.)

## Environment Variables

Add these to your `.env` file:

```env
# Database
DATABASE_URL="postgres://jobly:jobly@localhost:5432/jobly_db"

# Redis
REDIS_URL="redis://localhost:6379"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"

# CORS
APP_URL="http://localhost:3000"
WEB_URL="http://localhost:5173"
```

## Setup

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Generate Prisma client**:

   ```bash
   pnpm --filter @jobly/backend exec prisma generate
   ```

3. **Run migrations**:

   ```bash
   pnpm --filter @jobly/backend exec prisma migrate dev
   ```

4. **Start the server**:
   ```bash
   pnpm --filter @jobly/backend run start:dev
   ```

## API Endpoints

Better Auth automatically provides these endpoints at `/api/auth/*`:

### Sign Up

```bash
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

### Sign In

```bash
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Get Session

```bash
GET /api/auth/session
Cookie: better-auth.session_token=<token>
```

### Sign Out

```bash
POST /api/auth/sign-out
Cookie: better-auth.session_token=<token>
```

## Protecting Routes

Use the `@UseGuards(AuthGuard)` decorator:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';

@Controller('protected')
export class ProtectedController {
  @Get('data')
  @UseGuards(AuthGuard)
  getProtectedData(@Req() req) {
    // req.user contains the authenticated user
    return { message: 'Protected data', user: req.user };
  }
}
```

## Session Caching

Sessions are automatically cached in Redis for 5 minutes to reduce database queries. The cache is automatically invalidated when:

- User signs out
- Session expires
- Session is manually invalidated

## Database Schema

The Prisma schema includes these models:

- `User` - User accounts
- `Session` - Active sessions
- `Account` - OAuth provider accounts
- `Verification` - Email verification tokens

## Adding Social Providers

Edit `apps/backend/src/lib/auth.ts`:

```typescript
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
}
```

## Migration from Logto/Passport

All Logto and Passport code has been removed:

- ❌ `@nestjs/passport`
- ❌ `passport`
- ❌ `passport-openidconnect`
- ❌ `openid-client`
- ❌ Logto Docker service
- ✅ Better Auth with Prisma + Redis

## Troubleshooting

### Session not persisting

Make sure cookies are enabled and CORS is configured correctly with `credentials: true`.

### Redis connection errors

Verify Redis is running:

```bash
docker-compose up redis -d
```

### Prisma client errors

Regenerate the Prisma client:

```bash
pnpm --filter @jobly/backend exec prisma generate
```
