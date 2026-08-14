# Quest Fulfillment Badges Architecture & Communication Workflow

This document details the end-to-end architecture, data flow, and communication workflow between the **Jorbites Next.js application**, **MongoDB**, and the **Badge Forge Rust microservice** for evaluating and awarding Quest Fulfillment Badges.

---

## 🏗️ Architecture Overview

When a user completes a community recipe quest, the system selects an accepted recipe submission, atomically locks the quest to prevent race conditions or badge farming, and triggers an immediate evaluation call with a 5s timeout to `Badge Forge`.

```mermaid
graph TD
    A[User / UI QuestModal] -->|1. Submit Completion| B[Next.js API /complete or PATCH]
    B -->|2. Validate & Atomic CAS Update| C[(MongoDB - Quest & Recipe)]
    B -->|3. Await POST /api/evaluate with 5s timeout| D[Badge Forge Rust Microservice]
    D -->|4. MongoDB Direct Count on Quest Collection| C
    D -->|5. Award Badge & Send Notifier| E[User Profile & Notifications]
    B -->|6. On 200 OK update badgeEvaluated: true| C
    
    subgraph Daily Fallback Recovery
        F[GitHub Actions Daily Cron] -->|Daily at 03:00 UTC POST /api/quests/outbox with Bearer CRON_SECRET| G[Outbox Processor]
        G -->|Fetch up to 50 items where badgeEvaluated: false| C
        G -->|Retry Evaluation| D
    end
```

---

## 🔄 End-to-End Sequence Diagram

The following Mermaid sequence diagram illustrates the direct evaluation call sequence and the daily fallback recovery path:

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Quest Owner
    participant UI as Next.js UI (QuestModal)
    participant API as Next.js API (completeQuest Service)
    participant DB as MongoDB
    participant BF as Badge Forge Microservice
    participant Cron as GitHub Actions Daily Cron
    participant Outbox as Outbox Processor

    Owner->>UI: Select accepted recipe & set status to "completed"
    UI->>API: PATCH /api/quest/:id (status: completed, recipeId)
    API->>DB: Atomic CAS updateMany (status: not completed -> completed, acceptedRecipeId, acceptedSolverId, badgeEvaluated: false)
    alt CAS Update count == 0
        DB-->>API: count: 0 (Quest already completed or invalid)
        API-->>UI: 400 Bad Request ("Quest is already completed")
    else CAS Update count == 1
        DB-->>API: count: 1 (Success)
        API->>BF: POST /api/evaluate { userId: solverId, event: "QUEST_FULFILLED" } (5s timeout)
        alt Badge Forge Success (200 OK)
            BF->>DB: Direct count_documents(status: "completed", acceptedSolverId: user_id)
            BF->>DB: Update User.badges ($addToSet)
            BF-->>API: 200 OK { granted_badges: ["quest_solver_1.webp"] }
            API->>DB: Update Quest { badgeEvaluated: true }
            API-->>UI: 200 OK (Quest completed & badge evaluated immediately)
        else Badge Forge Down / Timeout
            BF-->>API: Timeout / Network Error (handled gracefully)
            API-->>UI: 200 OK (Quest completed, badgeEvaluated remains false)
        end
    end

    Note over Cron,DB: Scheduled Fallback Recovery (Daily at 03:00 UTC via GitHub Actions)
    Cron->>API: POST /api/quests/outbox (Bearer CRON_SECRET)
    API->>Outbox: processPendingBadgeEvaluations()
    Outbox->>DB: findMany(status: completed, badgeEvaluated: false, take: 50)
    DB-->>Outbox: Returns pending quests
    loop For each pending quest
        Outbox->>BF: POST /api/evaluate { userId: solverId }
        BF-->>Outbox: 200 OK
        Outbox->>DB: Update Quest { badgeEvaluated: true }
    end
```

---

## 🏅 Badge Tier Thresholds

Badge evaluation in `Badge Forge` counts **distinct completed quests** where `quest.acceptedSolverId` matches the evaluated user directly in the `Quest` collection:

| Badge Identifier | Name | Requirement | Icon Asset |
|---|---|---|---|
| `quest_solver_1.webp` | Bronze Quest Solver | 1 Quest Fulfilled | `/public/badges/quest_solver_1.webp` |
| `quest_solver_10.webp` | Silver Quest Solver | 10 Distinct Quests Fulfilled | `/public/badges/quest_solver_10.webp` |
| `quest_solver_25.webp` | Gold Quest Master | 25 Distinct Quests Fulfilled | `/public/badges/quest_solver_25.webp` |

---

## 🔒 Security & Data Integrity

1. **Atomic Compare-And-Set (CAS)**:
   - Uses `prisma.quest.updateMany({ where: { id: questId, userId: currentUserId, status: { not: 'completed' } }, data: ... })`.
   - Prevents race conditions and guarantees that exactly one completion request can set the accepted solver.
2. **Terminal State & Typo Editing**:
   - Completed quests cannot be reopened to `open` or `in_progress` (returns `400 Bad Request`).
   - However, quest owners may update the `title` and `description` of a completed quest without re-triggering completion or encountering errors.
3. **Outbox Bearer Authentication & Batching**:
   - `/api/quests/outbox` strictly requires `Authorization: Bearer <CRON_SECRET>` authentication. Missing or invalid tokens return `401 Unauthorized`.
   - The processor fetches up to 50 pending quests per batch (`take: 50`) to ensure execution stays well within execution timeout limits.
4. **Resilient HTTP Client**:
   - Outbound requests to `Badge Forge` use an `AbortSignal.timeout(5000)` to ensure hanging sockets or network lag do not block backend processes.
