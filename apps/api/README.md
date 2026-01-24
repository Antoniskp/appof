# News Superapp API

## Overview
Backend API for the News Superapp, built with Fastify and PostgreSQL.

## Features

### Authentication System
- **Email/Password Authentication**: Secure user registration and login
- **JWT Access Tokens**: Short-lived access tokens (15 minutes default)
- **Refresh Tokens**: Long-lived refresh tokens (14 days default) stored securely
- **OAuth Support**: Google, GitHub, and Facebook authentication
- **Password Security**: Argon2 hashing with strong password requirements
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Zod-based schema validation

### Security Features
- CORS configuration with domain whitelisting
- Secure HTTP-only cookies
- Rate limiting on authentication endpoints
- Password strength requirements
- Input validation and sanitization
- Session revocation on logout

See [SECURITY.md](./SECURITY.md) for detailed security documentation.

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe" // optional
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Response:**
```json
{
  "accessToken": "eyJhbG...",
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### POST /auth/login
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbG...",
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### POST /auth/refresh
Refresh an access token using the refresh token cookie.

**Response:**
```json
{
  "accessToken": "eyJhbG...",
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### POST /auth/logout
Logout and revoke the current session.

**Response:**
```json
{
  "status": "ok"
}
```

#### GET /me
Get the current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "id": "clx123...",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "providers": ["google", "github"]
}
```

### OAuth

#### GET /auth/oauth/google
Start Google OAuth flow

#### GET /auth/oauth/github
Start GitHub OAuth flow

#### GET /auth/oauth/facebook
Start Facebook OAuth flow

### Health

#### GET /health
Check API health status.

**Response:**
```json
{
  "status": "ok"
}
```

## Development

### Prerequisites
- Node.js 20+
- PostgreSQL
- pnpm

### Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables (copy `.env.example` to `.env`):
```bash
cp .env.example .env
```

3. Configure the database URL and other required variables in `.env`

4. Run database migrations:
```bash
pnpm prisma migrate dev
```

5. Generate Prisma client:
```bash
pnpm prisma generate
```

### Running

Development mode with auto-reload:
```bash
pnpm dev
```

Build for production:
```bash
pnpm build
```

Run in production:
```bash
pnpm start
```

### Testing

Run tests:
```bash
pnpm test
```

Type checking:
```bash
pnpm typecheck
```

## Environment Variables

See `.env.example` for all required and optional environment variables.

**Required:**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for signing JWT tokens
- `COOKIE_SECRET`: Secret for signing cookies

**Optional:**
- `API_PORT`: Port to run the API on (default: 4000)
- `API_HOST`: Host to bind to (default: 0.0.0.0)
- `API_BASE_URL`: Base URL of the API (default: http://localhost:4000)
- `WEB_BASE_URL`: Base URL of the web app for CORS (default: http://localhost:3000)
- `ACCESS_TOKEN_TTL_MINUTES`: Access token lifetime in minutes (default: 15)
- `REFRESH_TOKEN_TTL_DAYS`: Refresh token lifetime in days (default: 14)
- `NODE_ENV`: Environment (development/production)

**OAuth (Optional):**
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`

## Database Schema

The API uses Prisma ORM with PostgreSQL. See `prisma/schema.prisma` for the complete schema.

Key models:
- **User**: User accounts with email/password or OAuth
- **RefreshSession**: Refresh token sessions
- **OAuthAccount**: OAuth provider account links
- **Article**: News articles
- **Poll**: User polls
- **EducationContent**: Educational content

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Global**: 100 requests per 15 minutes per IP
- **Registration**: 5 requests per 15 minutes per IP
- **Login**: 10 requests per 15 minutes per IP

## Security

See [SECURITY.md](./SECURITY.md) for comprehensive security documentation.

## License

Private repository - all rights reserved.
