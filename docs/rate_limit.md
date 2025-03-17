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
- Rate limiting protection for database calls
- User-based or IP-based rate limiting
- Graceful error handling with informative messages

## Rate Limiting

### How it Works

Rate limiting is implemented using [Upstash RateLimit](https://github.com/upstash/ratelimit), a Redis-based rate limiting library. The system limits how many requests a user can make within a specified time period, protecting the database from excessive calls.

In production environments, the system identifies users by:
1. User ID for authenticated users
2. IP address for anonymous users

When a user exceeds their allowed request quota, the API returns a structured error response with a `RATE_LIMIT_EXCEEDED` code and a message indicating when they can try again.

### Configuration

The current rate limit configuration uses a sliding window approach:

```typescript
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(4, '20 s'),
    analytics: true,
    prefix: '@upstash/ratelimit',
});
```

This configuration allows:
- 4 requests per 20-second window
- Analytics enabled for monitoring
- Redis credentials loaded from environment variables

### Sliding Window Algorithm

The sliding window algorithm provides a more accurate rate limiting approach compared to fixed windows:
- It tracks requests over a continuous time period that "slides" forward
- Prevents request spikes that can occur at fixed window boundaries
- Offers a smoother user experience while still providing protection
