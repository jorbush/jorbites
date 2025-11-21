# Recipe API with Upstash RateLimit Protection

This project implements a NextJS API with built-in rate limiting protection using Upstash RateLimit to safeguard database calls from excessive usage.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Rate Limiting](#rate-limiting)
  - [How it Works](#how-it-works)
  - [Configuration](#configuration)
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

The rate limit configuration uses a sliding window approach with different limits for authenticated and unauthenticated users:

**Authenticated Users:**
```typescript
export const authenticatedRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(30, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit/authenticated',
});
```

**Unauthenticated Users:**
```typescript
export const unauthenticatedRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(15, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit/unauthenticated',
});
```

This tiered configuration allows:
- **Authenticated users**: 30 requests per 10-second window (180 requests/minute)
  - Higher limits to support search functionality with 1-second debounce
  - Better experience for registered users
- **Unauthenticated users**: 15 requests per 10-second window (90 requests/minute)
  - Moderate limits to prevent abuse while still allowing search
  - Sufficient for normal browsing and searching
- Analytics enabled for monitoring
- Redis credentials loaded from environment variables
- Separate prefixes for tracking different user types

### Sliding Window Algorithm

The sliding window algorithm provides a more accurate rate limiting approach compared to fixed windows:
- It tracks requests over a continuous time period that "slides" forward
- Prevents request spikes that can occur at fixed window boundaries
- Offers a smoother user experience while still providing protection
