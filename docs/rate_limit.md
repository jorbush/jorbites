# Recipe API with Upstash RateLimit Protection

This project implements a NextJS API with built-in rate limiting protection using Upstash RateLimit to safeguard database calls from excessive usage.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Rate Limiting](#rate-limiting)
  - [How it Works](#how-it-works)
  - [Configuration](#configuration)
  - [Protected Endpoints](#protected-endpoints)
  - [Sliding Window Algorithm](#sliding-window-algorithm)

## Overview

This NextJS application provides a recipe API with built-in protection against excessive requests. It uses Prisma for database operations and Upstash RateLimit to prevent API abuse.

## Features

- Recipe browsing with pagination and filtering
- Real-time search with debounced queries
- Rate limiting protection for database calls
- **Per-user rate limiting** with higher limits for authenticated users
- User-based (for authenticated) or IP-based (for anonymous) rate limiting
- Graceful error handling with informative messages

## Rate Limiting

### How it Works

Rate limiting is implemented using [Upstash RateLimit](https://github.com/upstash/ratelimit), a Redis-based rate limiting library. The system limits how many requests a user can make within a specified time period, protecting the database from excessive calls.

In production environments, the system identifies users by:
1. User ID for authenticated users
2. IP address for anonymous users

When a user exceeds their allowed request quota, the API returns a structured error response with a `RATE_LIMIT_EXCEEDED` code and a message indicating when they can try again.

### Configuration

The rate limit configuration uses a sliding window approach with different limits for different operations:

**General Browsing - Authenticated Users:**
```typescript
export const authenticatedRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(30, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit/authenticated',
});
```

**General Browsing - Unauthenticated Users:**
```typescript
export const unauthenticatedRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(15, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit/unauthenticated',
});
```

**Registration (Strict):**
```typescript
export const registrationRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
    prefix: '@upstash/ratelimit/registration',
});
```

**Password Reset (Strict):**
```typescript
export const passwordResetRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, '15 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/password-reset',
});
```

**Content Creation (Comments, Recipes):**
```typescript
export const contentCreationRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/content-creation',
});
```

This tiered configuration allows:
- **Authenticated users (browsing)**: 30 requests per 10-second window (180 requests/minute)
  - Higher limits to support search functionality with 1-second debounce
  - Better experience for registered users
- **Unauthenticated users (browsing)**: 15 requests per 10-second window (90 requests/minute)
  - Moderate limits to prevent abuse while still allowing search
  - Sufficient for normal browsing and searching
- **Registration**: 5 requests per hour per IP
  - Prevents mass account creation/spam
- **Password Reset**: 3 requests per 15 minutes per IP
  - Prevents email bombing while allowing retries
- **Content Creation**: 10 requests per minute per user
  - Prevents spam while allowing normal usage
- Analytics enabled for monitoring
- Redis credentials loaded from environment variables
- Separate prefixes for tracking different operations

### Protected Endpoints

The following endpoints are protected with rate limiting:

| Endpoint | Rate Limit | Identifier |
|----------|-----------|------------|
| `GET /api/recipes` (via getRecipes) | Authenticated: 30/10s, Unauth: 15/10s | User ID or IP |
| `POST /api/register` | 5/hour | IP address |
| `POST /api/password-reset/request` | 3/15min | IP address |
| `POST /api/password-reset/reset` | 3/15min | IP address |
| `POST /api/comments` | 10/min | User ID |
| `POST /api/recipes` | 10/min | User ID |

### Sliding Window Algorithm

The sliding window algorithm provides a more accurate rate limiting approach compared to fixed windows:
- It tracks requests over a continuous time period that "slides" forward
- Prevents request spikes that can occur at fixed window boundaries
- Offers a smoother user experience while still providing protection
