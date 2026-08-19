# Collaborative Cooking Feature Documentation

## Overview

The **Collaborative Cooking** feature allows multiple co-authors (`coCooksIds`) to create or edit recipes together in real-time without edit collisions, race conditions, or unauthorized modifications. It leverages:

- **Early Co-Cook Invitation & Shareable Links**: Direct tokenized links that allow users to join a shared draft regardless of whether their notifications are enabled.
- **Upstash Redis Shared Draft Storage & Sets**: Real-time shared state for recipe drafts before publishing, managed with atomic Redis Sets.
- **Section Soft-Locking with Redis**: Section-level locking preventing concurrent edits on the same step or field while co-cooking, with atomic Lua releases and fast heartbeat renewals.
- **In-App Active Shared Draft Banners**: Real-time indicators in the Navbar notifying users when they are part of active co-cooking drafts.
- **Dedicated DraftService Abstraction**: Centralized domain service with field allowlisting, token privacy masking, and automatic cleanup.

---

## Workflows & Architecture Diagram

### 1. Collaborative Draft & Co-Authoring Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Recipe Owner (User A)
    actor CoCook as Co-Cook (User B)
    participant Modal as RecipeModal UI (Step 0 / Header)
    participant API as Jorbites API / Next.js
    participant DS as DraftService
    participant Redis as Redis (ioredis)
    participant DB as MongoDB (Prisma)

    Owner->>Modal: Open RecipeModal (Post a Recipe)
    Owner->>Modal: Click "+ Add Co-Cook" or "Copy Invite Link 🔗"
    Modal->>API: POST /api/draft/invite (generates draftId & secure token)
    API->>DS: DraftService.saveSharedDraft(draftId, payload, Owner)
    DS->>Redis: SET draft:shared:<draftId> (TTL 7 days)
    DS->>Redis: SADD user:drafts:<OwnerId> <draftId> (TTL 30 days)
    API-->>Owner: Returns share URL https://jorbites.com/recipes/new?draft=<id>&token=<token>

    Owner->>CoCook: Shares Link via WhatsApp / Telegram / Chat
    CoCook->>API: Opens Share Link (GET /api/draft/join?draft=<id>&token=<token>)
    API->>DS: DraftService.joinSharedDraft(draftId, token, CoCook)
    DS->>Redis: Append User B to coCooksIds & SADD user:drafts:<CoCookId>
    API-->>CoCook: Redirects & Opens RecipeModal with Shared Draft!

    Note over Owner,CoCook: Concurrent Editing with Fast-Heartbeat Redis Soft-Locking
    Owner->>API: Focus Step 1 (POST /api/recipes/[id]/lock?field=step:1)
    API->>Redis: SET lock:recipe:<id>:step:1 = UserA (TTL 30s) NX
    CoCook->>API: Poll / Lock Status check (GET /api/recipes/[id]/lock via mget)
    API-->>CoCook: Step 1 LOCKED by @UserA (renders 🔒 UI banner & disables Step 1 input)

    CoCook->>API: Focus Step 3 (POST /api/recipes/[id]/lock?field=step:3)
    API->>Redis: SET lock:recipe:<id>:step:3 = UserB (TTL 30s) NX

    Note over Owner,CoCook: Heartbeat Renewal (Fast Path - No Database Query)
    Owner->>API: Heartbeat renewal every 10s
    API->>Redis: Check isLockHeldByUser -> Renew TTL immediately (Zero DB queries)

    Owner->>API: Click "Publish Recipe"
    API->>DB: Save Recipe { userId: UserA, coCooksIds: [UserB] }
    API->>DS: DraftService.cleanUpDraftOnPublish(draftId)
    DS->>Redis: DEL draft:shared:<draftId> & DEL locks
    DS->>Redis: SREM user:drafts:<OwnerId> & SREM user:drafts:<CoCookId>
```

---

## Redis Key Structure & TTL

| Key Format                                | Purpose                        | TTL                                               | Content / Structure                                                              |
| ----------------------------------------- | ------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| `draft:user:<userId>`                     | Single-user draft storage      | Persistent until publish/delete                   | Recipe draft JSON                                                                |
| `draft:shared:<draftId>`                  | Multi-user collaborative draft | **7 Days** (`DRAFT_TTL_SECONDS = 604800`)         | Sanitized shared draft JSON `{ draftId, inviteToken, ownerId, coCooksIds, ... }` |
| `user:drafts:<userId>`                    | Active draft index per user    | **30 Days** (`USER_DRAFTS_TTL_SECONDS = 2592000`) | **Redis Set** of draft IDs (atomically updated via `SADD`/`SREM`)                |
| `lock:recipe:<targetId>:field:<fieldKey>` | Section/field soft lock        | **30 Seconds** (`LOCK_TTL_SECONDS = 30`)          | JSON `{ userId, userName, userAvatar, timestamp }`                               |

---

## Architecture & System Design Highlights

### 1. Atomic Draft List Management (Redis Sets)

To eliminate read-modify-write race conditions when multiple concurrent sessions invite or delete drafts, user draft tracking uses atomic **Redis Sets** (`SADD` and `SREM`) with a 30-day rolling expiration. Backward compatibility is maintained for legacy JSON arrays.

### 2. Fast Heartbeat Renewal without DB Queries

Soft locks expire after 30 seconds and are renewed every 10 seconds. On heartbeat renewal requests:

- The system executes a fast `isLockHeldByUser` Redis check.
- If the lock is already held by the requester, TTL is renewed immediately **without executing any database queries**.
- Full Prisma/MongoDB authorization checks are only performed on initial lock acquisition.

### 3. Atomic Lock Release (Lua Script)

To avoid Time-of-Check to Time-of-Use (TOCTOU) race conditions where a lock could expire and be acquired by another cook right before a `DEL` command, `releaseLock` uses an atomic Lua script that compares the lock owner ID and deletes only if held by the caller.

### 4. Token Privacy & Security Boundary

- `inviteToken` is only visible to the draft owner (`draft.ownerId`).
- When co-cooks fetch draft data via `GET /api/draft` or `GET /api/draft/active`, `DraftService` automatically sanitizes and removes the `inviteToken`.
- Non-owners cannot regenerate invite tokens (`POST /api/draft/invite` returns 403 Forbidden).
- Co-cooks cannot modify privileged fields such as recipe ownership or co-cook lists on `PATCH /api/recipe/[recipeId]`.

### 5. Field Allowlisting & Pollution Prevention

All incoming draft payloads are strictly filtered against `ALLOWED_DRAFT_FIELDS` before persistence in Redis, preventing prototype pollution or arbitrary payload injection.

### 6. Batch Lock Retrieval (`MGET`)

`getActiveLocks` retrieves all active field locks for a recipe or draft in a single batch `redis.mget` call, eliminating N+1 round-trips.

---

### 7. Smart Non-Destructive Draft Merging

When co-cooks work on different steps concurrently (e.g. User A on Step 1: Ingredients and User B on Step 3: Description), `DraftService.saveDraft` non-destructively merges incoming field updates with existing Redis draft data rather than replacing the entire object. This prevents partial step saves from overwriting fields authored by other co-cooks.

### 8. Real-Time State Synchronization & Background SWR Polling

- **Background Polling & Endpoint Binding**: Active shared drafts in `RecipeModal` poll `GET /api/draft?draftId=<draftId>` every 3 seconds via SWR (`refreshInterval: 3000`, `revalidateOnFocus: true`). When the owner generates an invite link, both owner and co-cook clients immediately bind to the shared draft endpoint.
- **Selective Form State Sync**: `useRecipeFormState` non-destructively syncs incoming draft updates:
    - On initial draft load (`isInitialSync = true`).
    - For all steps other than the active user's current step (`step !== stepIndex`).
    - On the active user's current step when it is locked by another co-cook (`lock.isLockedByOther('step:' + stepIndex)`), allowing the user to see real-time updates as the other co-cook edits without overwriting local inputs when holding the lock.
- **Modal Lifecycle & URL Cleanliness**: Tracks auto-open state so `?draft=` in the URL opens the modal once, and cleans up query parameters (`window.history.replaceState`) on modal close to prevent re-opening loops.
- **Immediate Navigation Sync & Persistence**: Step transitions trigger `mutateDraft?.()` on `onNext()` and `onBack()`, and auto-save draft state in production (`NODE_ENV === 'production'`).

### 9. Collaborative Step Validation Handling

- While co-cooking, step inputs are marked required only when `!isCurrentStepLocked`. If a step is actively locked by another collaborator, other co-cooks can advance past that step without triggering false form validation errors.
- Final recipe completeness and data integrity validation remains 100% strictly enforced upon recipe submission at `STEPS.IMAGES` and on backend recipe creation.

---

## Centralized Constants Reference

| Constant                        | Value               | Description                                          |
| ------------------------------- | ------------------- | ---------------------------------------------------- |
| `MAX_CO_COOKS`                  | `4`                 | Maximum number of co-cooks per recipe                |
| `MAX_LINKED_RECIPES`            | `2`                 | Maximum linked recipes per recipe                    |
| `DRAFT_TTL_SECONDS`             | `604800` (7 days)   | Shared draft persistence TTL in Redis                |
| `USER_DRAFTS_TTL_SECONDS`       | `2592000` (30 days) | User active draft list TTL in Redis                  |
| `LOCK_TTL_SECONDS`              | `30`                | Soft-lock expiration duration                        |
| `LOCK_HEARTBEAT_INTERVAL_MS`    | `10000` (10s)       | Heartbeat interval for renewing active section lock  |
| `LOCK_POLL_INTERVAL_MS`         | `4000` (4s)         | Polling interval for detecting co-cook section locks |
| `SHARED_DRAFT_POLL_INTERVAL_MS` | `3000` (3s)         | SWR polling interval for active shared drafts        |

---

## API Endpoints Reference

| Endpoint                 | Method                  | Description                                                                                                                |
| ------------------------ | ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `/api/draft`             | `GET`, `POST`, `DELETE` | Manages single-user or shared drafts via `DraftService`. Non-destructively merges fields; sanitizes tokens for non-owners. |
| `/api/draft/invite`      | `POST`                  | Generates a shared draft ID, secure token, and shareable link (owner only).                                                |
| `/api/draft/join`        | `GET`                   | Validates invite token, adds user to `coCooksIds`, and redirects to shared draft.                                          |
| `/api/draft/active`      | `GET`                   | Returns list of active shared drafts where current user is owner or co-cook (with lazy cleanup).                           |
| `/api/recipes/[id]/lock` | `POST`, `DELETE`, `GET` | Acquires, releases, or fetches section soft-locks with fast heartbeat path.                                                |
| `/api/recipes`           | `POST`                  | Creates published recipe, cleans up shared draft and all locks.                                                            |
| `/api/recipe/[recipeId]` | `PATCH`                 | Updates recipe; allows content edits by `userId` or any user in `coCooksIds`.                                              |

---

## UI Components & Real-Time Indicators

- **Header Top Actions**: Minimalist React Icon buttons with Tooltips in `RecipeModal`:
    - `FiShare2` ("Copy co-cook invite link")
    - `FiUploadCloud` ("Save draft")
- **In-Modal Co-Cooking Status Indicator**: Minimalist status indicator rendered inside `RecipeModal` during multi-user collaborative editing sessions:
    - _`@maria is currently editing another step`_ (Brand `green-450` pill with pulsing dot)
- **Field Lock Banners**: Rendered inside form steps when another co-cook holds an active soft-lock on that step:
    - _`@maria is currently editing this step`_ (Amber pill with pulsing lock indicator)
    - Inputs for locked fields are disabled with visual opacity feedback, while allowing other co-cooks to navigate freely.

---

## E2E Testing & Step Navigation Synchronization

The collaborative cooking architecture is covered by automated Cypress E2E tests in [`__tests__/e2e/collaborative_recipes.cy.ts`](file:///Users/jordi/dev/jorbites/jorbites/__tests__/e2e/collaborative_recipes.cy.ts) running against a local Redis instance (`REDIS_URL=redis://localhost:6379`).

### Key Test Scenarios:
1. **Multi-User Draft Invitation & Join Flow**: Generating secure tokenized invite links from `RecipeModal` and auto-opening pre-populated drafts via `/?draft=<id>&joined=true`.
2. **Real-Time Step Synchronization on Forward/Back Navigation**: When User A updates ingredients or steps in a shared draft stored in Redis, User B navigating forward or backward immediately sees those updates reflected in the active modal form without data loss.
3. **Section Soft-Locking & Activity Banners**: Verifying step inputs are locked with opacity feedback when another collaborator holds an active lock (`[data-testid="lock-banner"]`), and activity banners display on other steps (`[data-testid="co-cook-activity-banner"]`).
4. **Collaborative Publishing & Credit**: Creating recipes with `coCooksIds` and verifying `RecipeCoCooks` rendering on the recipe page.

For detailed Mermaid diagrams of this and all other E2E test suites, see [`docs/testing/e2e/workflows.md`](file:///Users/jordi/dev/jorbites/jorbites/docs/testing/e2e/workflows.md).

