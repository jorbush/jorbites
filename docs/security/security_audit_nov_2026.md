# Jorbites Security Audit & Remediation Report (November 2026)

**Date:** November 19, 2026
**Scope:** Full-stack security audit and remediation across `jorbites` (v3.8.0), `jorbites-cms-auth`, `jorbites-notifier`, and `badge_forge`.

---

## Executive Summary

All **Critical** and **High** findings plus core **Medium** and **Low** hardening items identified during the November 2026 audit have been remediated, covered with automated regression tests, and verified across all four repositories.

| ID  | Severity | Repo                                           | Finding                                                                                                                                  | Status         |
| --- | -------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| C-1 | Critical | `jorbites`                                     | Full `User` record (password hash, 2FA secret, reset token) exposed on no-op `POST /api/recipe/[recipeId]`                               | Fixed & Tested |
| C-2 | Critical | `jorbites`                                     | Same-origin XSS & SSRF via `/api/image-proxy` wildcard R2 domains / unfiltered `Content-Type` + SVG uploads in `/api/upload/r2`          | Fixed & Tested |
| C-3 | Critical | `jorbites-cms-auth`                            | GitHub OAuth access token theft via wildcard `*.github.io` `postMessage` origin & arbitrary OAuth scope                                  | Fixed & Tested |
| H-1 | High     | `jorbites`                                     | Cross-user deletion of arbitrary Cloudinary & R2 media assets (IDOR)                                                                     | Fixed & Tested |
| H-2 | High     | `jorbites`                                     | Plaintext password reset URLs/tokens logged to Axiom via `sendNotification`                                                              | Fixed & Tested |
| H-3 | High     | `jorbites`                                     | Path traversal (`.md` file read) in `getBlogById` and `getEventBySlug`                                                                   | Fixed & Tested |
| H-4 | High     | `jorbites`                                     | Broken access control on private workshops (`/workshops/[workshopId]`) and saved private meal plans                                      | Fixed & Tested |
| H-5 | High     | `jorbites`, `jorbites-notifier`                | Blind SSRF via unvalidated Web Push subscription endpoints                                                                               | Fixed & Tested |
| M-1 | Medium   | `jorbites`                                     | Missing rate limiting on password login, password change, and Axiom proxy                                                                | Fixed & Tested |
| M-2 | Medium   | `jorbites`, `badge_forge`, `jorbites-notifier` | Hardcoded `"default_key"` fallback in `badge_forge`, missing `INDEXNOW_SECRET` undefined guard, and non-constant-time secret comparisons | Fixed & Tested |
| M-3 | Medium   | `jorbites`                                     | Missing application-wide `Content-Security-Policy` headers                                                                               | Fixed          |
| M-4 | Medium   | `jorbites-notifier`                            | HTML injection in notification emails via `text/template`                                                                                | Fixed & Tested |
| L-1 | Low      | `jorbites`                                     | Client-spoofable `userId` in Kafka tracking server actions                                                                               | Fixed & Tested |
| L-2 | Low      | `jorbites`                                     | Unbounded pagination/batch ID queries on quests, chefs, recipes/multiple, users/multiple                                                 | Fixed & Tested |

---

## Key Remediations Implemented

### 1. Data Exposure & Credential Protection (`C-1`, `H-2`, `M-2`)

- Narrowed `prisma.recipe.findUnique` in `app/api/recipe/[recipeId]/route.ts` (and `comments`, `cooksnaps`, `favorites`, `recipes`) from `include: { user: true }` to `select: { id: true, email: true }`, and stripped the `user` object from `POST /api/recipe/[recipeId]` no-op responses.
- Redacted `params.resetUrl` to `'[REDACTED]'` before logging in `app/actions/sendNotification.ts`.
- Introduced timing-safe secret comparison (`app/utils/cryptoUtils.ts`, `crypto/subtle.ConstantTimeCompare` in Go, `constant_time_eq` in Rust), added missing-secret fail-closed guards in `app/api/indexnow/route.ts`, and removed the `"default_key"` fallback in `badge_forge/src/middleware/auth.rs`.

### 2. XSS, SSRF & Upload Hardening (`C-2`, `C-3`, `H-5`, `M-3`, `M-4`)

- Restricted `app/api/image-proxy/route.ts` to explicit trusted hostnames (removing wildcard `*.r2.dev` / `*.r2.cloudflarestorage.com`), enforced `redirect: 'error'`, validated upstream `Content-Type` against a raster-only allowlist (`jpeg`, `png`, `webp`, `avif`, `gif`), capped response payload size at 15 MB, and enforced `Content-Security-Policy: default-src 'none'; sandbox` + `X-Content-Type-Options: nosniff`.
- Hardened `app/api/upload/r2/route.ts` to allow only raster MIME types and extensions (blocking `image/svg+xml`), enforce a 10 MB max `contentLength`, use `crypto.randomBytes`, and namespace keys by user (`remakes/<userId>/<timestamp>-<hex>.<ext>`).
- Added baseline `Content-Security-Policy` (`object-src 'none'; base-uri 'self'; frame-ancestors 'none'`) in `next.config.js`.
- Enforced exact `ALLOWED_ORIGIN` matching, OAuth scope allowlisting, constant-time state cookie verification with immediate cookie clearing, and safe script escaping in `jorbites-cms-auth/src/index.ts`.
- Added strict HTTPS + Web Push provider domain allowlist validation in both `app/actions/push-notifications.ts` and `jorbites-notifier/internal/push/push.go`.
- Migrated `jorbites-notifier/internal/email/templates.go` from `text/template` to `html/template`.

### 3. Access Control, Media Ownership & Path Safety (`H-1`, `H-3`, `H-4`, `L-1`, `L-2`)

- Replaced database-backed media reference checks with pure **O(1), zero-DB-query ownership verification** in `app/utils/mediaSecurity.ts` (avoiding any impact on Vercel's 10s serverless timeout):
    - **R2 (`remakes/<userId>/<file>`)**: Keys are user-namespaced in `POST /api/upload/r2`; `canDeleteR2Asset` only deletes keys explicitly scoped to the record owner.
    - **Cloudinary (`users/<userId>/<file>`)**: Added signed upload endpoint `POST /api/upload/cloudinary-sign` enforcing `paramsToSign.folder === "users/<currentUser.id>"` and wired `signatureEndpoint="/api/upload/cloudinary-sign"` + `options.folder` into `ChangeUserImage` and `ImageUpload`; `canDeleteCloudinaryAsset` only deletes assets explicitly scoped to the owner (legacy un-namespaced assets are left untouched for offline cleanup).
    - **Deployment note:** `next.config.js` automatically forwards `CLOUDINARY_API_KEY` into `NEXT_PUBLIC_CLOUDINARY_API_KEY` at build time if `NEXT_PUBLIC_CLOUDINARY_API_KEY` is not explicitly set. Ensure `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are configured, and switch `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` to a **Signed** preset in the Cloudinary Dashboard (or leave it empty if using signed default uploads).
    - Added `isR2Url` verification inside `deleteFromR2` / `deleteMultipleFromR2`.
- Restricted blog IDs and event slugs to `/^[a-zA-Z0-9_-]+$/` with resolved path containment checks in `app/utils/blog-utils.ts` and `app/utils/event-utils.ts`.
- Enforced `isPrivate` / `hostId` / `whitelistedUserIds` authorization in `app/workshops/[workshopId]/page.tsx` (`generateMetadata` + `WorkshopPage`), fixed `query.OR` composition in `app/actions/getWorkshops.ts`, blocked saving private plannings in `app/api/saves/[planningId]/route.ts`, and filtered `savedPlannings` visibility in `app/actions/getPlannings.ts`.
- Bound Kafka tracking server actions (`app/actions/tracking.ts`) to `session.user.id` and added pagination/batch ID caps on `quests`, `chefs`, `recipes/multiple`, and `users/multiple`.

### 4. Rate Limiting (`M-1`)

- Added sliding-window rate limiting to `CredentialsProvider.authorize` (`pages/api/auth/[...nextauth].ts`), `PATCH /api/password/[userId]`, and `POST /api/axiom` (plus a 64 KB payload limit).

---

## Remaining Follow-Up Hardening (Planned)

- **Session invalidation on password reset/change:** Add a `tokenVersion` or `passwordChangedAt` claim verified in NextAuth JWT/session callbacks.
- **TOTP replay prevention & step-up auth:** Store last-accepted TOTP step in Redis/DB to prevent reuse within the 90-second window, and require a valid TOTP/backup code to disable 2FA, regenerate backup codes, or delete an account.
- **Course certificate completion verification:** Verify course completion server-side before issuing certificates in `POST /api/certificates`.
