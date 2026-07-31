# Password Reset Workflow & Security Policy Documentation

## Overview

This document describes the security policies and architectural workflow for user password management and password reset operations in Jorbites.

## Password Security Policy

1. **Minimum Length**: All user passwords must be at least **8 characters** long.
2. **Storage**: Passwords are hashed using `bcrypt` with a salt round / cost factor of `12` before being persisted to the database.
3. **Reset Tokens**:
   - Reset tokens are generated using cryptographically secure random bytes (`crypto.randomBytes`).
   - Only SHA-256 hashed versions of tokens (`crypto.createHash('sha256')`) are stored in the database.
   - Tokens expire after 1 hour.
4. **Token Validation Route**:
   - Token validation is handled via `POST /api/password-reset/validate/[token]` to prevent CSRF risks and unintended browser prefetching side-effects associated with `GET` requests.

---

## Workflow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Next.js Client
    participant API as Next.js API Routes
    participant DB as Prisma Database
    participant Notif as Notification Service

    Note over User, Notif: Step 1: Request Password Reset
    User->>Frontend: Click "Forgot Password" & enter email
    Frontend->>API: POST /api/password-reset/request { email }
    API->>DB: Find user by email
    alt User Found
        API->>API: Generate random token & SHA-256 hash
        API->>DB: Store hashed resetToken & expiry (1h)
        API->>Notif: Send reset link with raw token
    end
    API-->>Frontend: 200 OK { success: true }

    Note over User, Notif: Step 2: Validate Token on Page Load
    User->>Frontend: Navigate to /reset-password/[token]
    Frontend->>API: POST /api/password-reset/validate/[token]
    API->>API: Hash provided token (SHA-256)
    API->>DB: Query user where resetToken == hash AND expiry > NOW
    alt Valid Token
        API-->>Frontend: 200 OK { valid: true }
        Frontend-->>User: Render Reset Password Form
    else Invalid / Expired Token
        API-->>Frontend: 200 OK { valid: false }
        Frontend-->>User: Render "Invalid or Expired Link" Error
    end

    Note over User, Notif: Step 3: Submit New Password
    User->>Frontend: Enter new password (min 8 chars) & confirm
    Frontend->>API: POST /api/password-reset/reset { token, password }
    API->>API: Verify password.length >= 8
    API->>API: Hash provided token (SHA-256)
    API->>DB: Query user with active resetToken
    alt Valid Token & Valid Password
        API->>API: Hash new password with bcrypt (cost 12)
        API->>DB: Update hashedPassword, clear resetToken & expiry
        API-->>Frontend: 200 OK { success: true }
        Frontend-->>User: Show success toast & redirect to Login
    else Validation Failed / Expired
        API-->>Frontend: 400 Bad Request { error }
        Frontend-->>User: Display error message
    end
```

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Rate Limit |
| :--- | :--- | :--- | :--- |
| `/api/register` | `POST` | User registration (enforces min 8 char password) | 5 / 15 min |
| `/api/password-reset/request` | `POST` | Request password reset token via email | 3 / 15 min |
| `/api/password-reset/validate/[token]` | `POST` | Validate reset token validity | 10 / 15 min |
| `/api/password-reset/reset` | `POST` | Complete password reset with new 8+ char password | 3 / 15 min |
| `/api/password/[userId]` | `PATCH` | Authenticated password change (enforces min 8 char new password) | Standard API rate limit |
