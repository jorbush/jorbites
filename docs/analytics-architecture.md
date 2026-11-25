# Cookieless Interaction Analytics Architecture

Jorbites tracks strictly anonymous, aggregated feature usage and navigation metrics without setting cookies or reading/writing browser storage (`localStorage` / `sessionStorage`).

## Data Flow

1. **Client (`app/lib/analytics/client.ts` & `app/components/analytics/AnalyticsTracker.tsx`)**:
   - Buffers interactions in memory (max 10 events or 8s interval) and flushes via `navigator.sendBeacon('/api/analytics', ...)` on `visibilitychange` / `pagehide` (with `credentials: 'omit'` `fetch` fallback).
   - Respects `navigator.doNotTrack`.
2. **Ingestion API (`app/api/analytics/route.ts`)**:
   - Rejects bots/crawlers (`204`), enforces payload size (16 KB) & batch size (25 events), applies Upstash rate limiting (`analyticsRatelimit`), strips any disallowed/PII keys, normalizes dynamic routes (e.g. `/recipes/[id]`), extracts coarse device class & `x-vercel-ip-country` without ever storing IP addresses, and produces a single Kafka batch inside Next.js `after()`.
3. **Server Events (`app/lib/analytics/server.ts`)**:
   - Emits anonymous domain events (`recipe_published`, `recipe_forked`, `cooksnap_created`, `search_executed`, `vote_cast`, `certificate_issued`) inside `after()` to the same `analytics-events` Aiven Kafka topic.
4. **Consumer (`kafkaroni` — Rust on Raspberry Pi 3B)**:
   - Consumes `analytics-events` over mTLS using `rskafka` + `rustls`, re-sanitizes payloads defensively, and commits `raw_events` (90-day retention), `daily_*_rollups`, and `kafka_offsets` in a single atomic Turso transaction.
5. **Dashboard (`gastroscope` — Astro 7 SSR)**:
   - Private, HMAC-cookie-authenticated dashboard reading pre-aggregated rollups from Turso.

## Adding a New Tracked Feature

1. Add the event name to `ALLOWED_ANALYTICS_EVENTS` and `AnalyticsEventName` in `app/types/analytics.ts` (and the matching allowlist in `kafkaroni/src/model/event.rs`).
2. Emit from client components with `trackAnalyticsEvent('feature', 'my_event', { key: 'value' })` or from server routes with `after(() => emitServerAnalyticsEvent({ ... }))`.
3. Never include `userId`, emails, IPs, or free-form user input in `props`.

## Environment Variables

- `KAFKA_BROKER`, `KAFKA_SSL_KEY`, `KAFKA_SSL_CERT`, `KAFKA_SSL_CA` (shared with existing Aiven Kafka configuration)
- `KAFKA_ANALYTICS_TOPIC` (optional, defaults to `analytics-events`)
- `NEXT_PUBLIC_ANALYTICS_DEBUG=true` (optional, enables client event sending in local dev)
