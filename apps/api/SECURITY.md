# Authentication System Security Documentation

## Overview
This document outlines the security measures implemented in the authentication system for the `Antoniskp/appof` repository.

## Security Features Implemented

### 1. Password Security
- **Hashing Algorithm**: Argon2 (industry-standard, memory-hard hashing algorithm)
- **Password Strength Requirements**:
  - Minimum length: 8 characters
  - Must contain at least one uppercase letter (A-Z)
  - Must contain at least one lowercase letter (a-z)
  - Must contain at least one number (0-9)
  - Must contain at least one special character (!@#$%^&*, etc.)

### 2. Input Validation
- **Email Validation**: Using Zod schema validation to ensure proper email format
- **Data Sanitization**: All email inputs are trimmed and converted to lowercase
- **Type Safety**: TypeScript with Zod ensures type-safe input validation

### 3. Rate Limiting
- **Global Rate Limit**: 100 requests per 15 minutes per IP
- **Registration Endpoint**: 5 requests per 15 minutes per IP
- **Login Endpoint**: 10 requests per 15 minutes per IP
- **Purpose**: Prevents brute force attacks and DDoS

### 4. Token Management

#### Access Tokens (JWT)
- **Algorithm**: HS256 (HMAC with SHA-256)
- **TTL**: 15 minutes (configurable via `ACCESS_TOKEN_TTL_MINUTES`)
- **Secret**: Stored in environment variable `JWT_SECRET`
- **Payload**: Contains user ID, email, and role
- **Transmission**: Bearer token in Authorization header

#### Refresh Tokens
- **Storage**: Hashed in database (SHA-256)
- **TTL**: 14 days (configurable via `REFRESH_TOKEN_TTL_DAYS`)
- **Rotation**: New refresh token issued on each refresh
- **Revocation**: Old tokens are marked as revoked in database
- **Transmission**: Secure HTTP-only cookies

### 5. Cookie Security
- **httpOnly**: Prevents JavaScript access to cookies
- **secure**: Enabled in production (HTTPS only)
- **sameSite**: Set to 'lax' to prevent CSRF attacks
- **path**: Scoped to root path
- **expiration**: Matches refresh token TTL

### 6. CORS Configuration
- **Origin Whitelisting**: Only requests from `WEB_BASE_URL` are allowed
- **Credentials**: Enabled to allow cookie transmission
- **Method**: Restrictive CORS policy

### 7. Session Management
- **Database-backed**: All refresh sessions stored in PostgreSQL
- **Expiration Tracking**: Sessions have explicit expiration timestamps
- **Revocation**: Sessions can be revoked (logout functionality)
- **Validation**: On refresh, system checks for:
  - Token hash existence
  - Non-revoked status
  - Non-expired status

### 8. OAuth Security
- **Providers**: Google, GitHub, Facebook
- **OAuth 2.0 Flow**: Authorization Code Flow
- **Token Storage**: OAuth access tokens stored securely in database
- **Account Linking**: Supports linking multiple OAuth providers to one account

### 9. Error Handling
- **Generic Error Messages**: Authentication failures return generic "Invalid credentials" messages
- **No User Enumeration**: Same error message for non-existent users and wrong passwords
- **Validation Errors**: Detailed validation errors only for format issues (not security-sensitive)

## Environment Variables

The following environment variables must be configured securely:

```env
# Critical Security Variables
JWT_SECRET=<strong-random-secret>          # For signing JWTs
COOKIE_SECRET=<strong-random-secret>       # For signing cookies
DATABASE_URL=<postgresql-connection-url>   # Database connection

# Token TTL Configuration
ACCESS_TOKEN_TTL_MINUTES=15                # Access token lifetime
REFRESH_TOKEN_TTL_DAYS=14                  # Refresh token lifetime

# Application URLs
API_BASE_URL=<api-url>                     # API base URL
WEB_BASE_URL=<web-app-url>                 # Web app URL (for CORS)

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
GITHUB_CLIENT_ID=<github-client-id>
GITHUB_CLIENT_SECRET=<github-client-secret>
FACEBOOK_CLIENT_ID=<facebook-client-id>
FACEBOOK_CLIENT_SECRET=<facebook-client-secret>
```

## OWASP Compliance

This implementation follows OWASP guidelines:

1. **A01: Broken Access Control**: JWT-based access control with role-based authorization
2. **A02: Cryptographic Failures**: Argon2 password hashing, secure token generation
3. **A03: Injection**: Input validation with Zod schemas
4. **A04: Insecure Design**: Secure session management with database-backed tokens
5. **A05: Security Misconfiguration**: Secure cookie settings, CORS configuration
6. **A07: Identification and Authentication Failures**: Strong password policy, rate limiting, secure token management

## Testing

Comprehensive unit tests cover:
- Password validation rules
- Email validation
- Token hash consistency
- Refresh token generation
- JWT and refresh token expiration calculations

## Recommendations for Production

1. **Use Strong Secrets**: Generate cryptographically secure random strings for JWT_SECRET and COOKIE_SECRET
2. **Enable HTTPS**: Set NODE_ENV=production to enable secure cookies
3. **Database Security**: Ensure PostgreSQL uses encrypted connections
4. **Monitoring**: Implement logging for failed authentication attempts
5. **Regular Updates**: Keep dependencies updated, especially security-critical ones (argon2, jsonwebtoken, fastify)
6. **Consider Additional Features**:
   - Email verification for new registrations
   - Two-factor authentication (2FA)
   - Account lockout after multiple failed login attempts
   - Password reset functionality
   - Security audit logs

## Security Incident Response

In case of a security breach:
1. Revoke all refresh sessions in the database
2. Rotate JWT_SECRET and COOKIE_SECRET
3. Force all users to re-authenticate
4. Analyze logs for unauthorized access patterns
5. Notify affected users if necessary
