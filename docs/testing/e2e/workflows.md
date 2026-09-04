# End-to-End (E2E) Test Workflows Documentation

This document provides architectural and behavioral sequence/flow diagrams for all End-to-End (E2E) test suites in **Jorbites**, with special focus on multi-user collaborative editing backed by local Redis, step synchronization, and GitHub Actions CI matrix execution.

---

## E2E Test Suite Overview & CI Matrix

```mermaid
flowchart TD
    subgraph GitHubActions["GitHub Actions CI Matrix (ubuntu-latest)"]
        redisSvc[("Local Redis Service (redis:6379)")]
        mongoSvc[("Local MongoDB Service (mongo:27017, rs0)")]

        subgraph Job1["Container 1: Recipes Spec"]
            T1["basic.cy.ts<br/>Full Recipe Lifecycle"]
        end

        subgraph Job2["Container 2: Workshops & Quests Specs"]
            T2["workshops.cy.ts<br/>Workshop Lifecycle"]
            T3["quests.cy.ts<br/>Quests Lifecycle"]
        end

        subgraph Job3["Container 3: User & Basic Specs"]
            T4["user.cy.ts<br/>Auth & Session"]
            T5["app.cy.ts<br/>App Shell Render"]
        end

        subgraph Job4["Container 4: Collaborative Recipes Spec"]
            T6["collaborative_recipes.cy.ts<br/>Co-Cooking & Redis Step Sync"]
        end

        subgraph Job5["Container 5: Drafts Management & Navigation"]
            T7["drafts_management.cy.ts<br/>Multi-Draft CRUD, SWR & TTL"]
            T8["drafts_navigation.cy.ts<br/>Category Persistence & Auto-Save"]
        end
    end

    redisSvc -.->|REDIS_URL| Job1
    redisSvc -.->|REDIS_URL| Job2
    redisSvc -.->|REDIS_URL| Job3
    redisSvc -.->|REDIS_URL| Job4
    redisSvc -.->|REDIS_URL| Job5

    mongoSvc -.->|DATABASE_URL| Job1
    mongoSvc -.->|DATABASE_URL| Job2
    mongoSvc -.->|DATABASE_URL| Job3
    mongoSvc -.->|DATABASE_URL| Job4
    mongoSvc -.->|DATABASE_URL| Job5
```

---

## 1. Collaborative Recipes & Step Sync Workflow (`collaborative_recipes.cy.ts`)

This spec validates multi-user co-authoring, tokenized invite links, Redis draft storage, non-destructive step synchronization on forward/back navigation, section soft-locking, and collaborative publishing.

### 1.1 Multi-User Lifecycle & Invite Link Flow

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Recipe Author (User A)
    actor CoCook as Co-Cook (User B)
    participant Modal as RecipeModal UI
    participant API as Next.js API Routes
    participant Redis as Redis (ioredis @ :6379)
    participant DB as MongoDB (Prisma)

    %% Step 1: Draft Creation & Invite
    Owner->>Modal: Open RecipeModal ("Post a recipe")
    Owner->>Modal: Fill Category, Title, Description, Ingredients
    Owner->>Modal: Click "Copy invite link" (FiShare2)
    Modal->>API: POST /api/draft/invite (Draft payload)
    API->>Redis: SET draft:shared:<draftId> (TTL 7d)
    API->>Redis: SADD user:drafts:<OwnerId> <draftId>
    API-->>Modal: { draftId, inviteToken }
    Modal-->>Owner: Toast "Co-cook invite link copied to clipboard!"

    %% Step 2: Co-Cook Joins Draft
    CoCook->>API: Open GET /api/draft/join?draft=<draftId>&token=<token>
    API->>Redis: GET draft:shared:<draftId> (Validate token)
    API->>Redis: Append User B to coCooksIds & SADD user:drafts:<CoCookId>
    API-->>CoCook: Redirect 302 to /?draft=<draftId>&joined=true
    CoCook->>Modal: RecipeModal auto-opens with pre-populated Redis draft data

    %% Step 3: Concurrent Step Sync on Navigation
    Note over Owner,CoCook: Real-Time Multi-User Step Sync on Navigation
    CoCook->>API: POST /api/draft (Updates ingredients: Cocoa Powder & ganache)
    API->>Redis: SET draft:shared:<draftId> (Non-destructive merge)
    Owner->>Modal: Navigates Forward / Back between steps
    Modal->>API: SWR Fetch GET /api/draft?draftId=<draftId>
    API->>Redis: GET draft:shared:<draftId>
    API-->>Modal: Return merged shared draft
    Modal-->>Owner: Ingredients & Steps updated automatically in active view!

    %% Step 4: Section Soft-Locking
    Note over Owner,CoCook: Section Soft-Locking & Activity Banners
    CoCook->>API: Acquire Lock (POST /api/recipes/<draftId>/lock field=step:0)
    API->>Redis: SET lock:recipe:<draftId>:field:step:0 = UserB (TTL 30s NX)
    Owner->>Modal: Polls GET /api/recipes/<draftId>/lock
    Modal-->>Owner: Render Lock Banner ("@maria is currently editing this step") & disable inputs
    CoCook->>API: Release Lock (DELETE /api/recipes/<draftId>/lock)
    API->>Redis: Atomic Lua DEL lock:recipe:<draftId>:field:step:0

    %% Step 5: Publishing Collaborative Recipe
    Owner->>Modal: Click Submit on Step 6 (Images)
    Modal->>API: POST /api/recipes (coCooksIds: [UserB])
    API->>DB: prisma.recipe.create({ coCooksIds: [UserB], ... })
    API->>Redis: DEL draft:shared:<draftId> & cleanup user sets
    API-->>Modal: { id: recipeId, title: "Collaborative Berry Tart" }
    Owner->>Modal: Redirect to /recipes/[id]
    Modal-->>Owner: Display Recipe with RecipeCoCooks collaborator avatar & badge!
```

### 1.2 Step Forward/Back Navigation Sync Flow

```mermaid
flowchart TD
    Start["User Opens Shared Draft in RecipeModal"] --> Step1["Step 1: Description View"]
    Step1 --> CoCookEdits["Co-Cook edits Ingredients & Steps in Redis concurrently"]
    CoCookEdits --> NavForward["User clicks Next (Forward Navigation)"]
    NavForward --> SWRSync["mutateDraft / SWR revalidation triggered"]
    SWRSync --> FetchRedis["Fetch latest draft:shared:id from Redis"]
    FetchRedis --> RenderStep2["Step 2: Ingredients View updated with Co-Cook additions"]
    RenderStep2 --> NavBack["User clicks Back (Backward Navigation)"]
    NavBack --> Preserved["State preserved without data loss"]
```

### 1.3 Concurrent Multi-Field Merge & Race Condition Resolution

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Recipe Author (User A)
    actor UserB as Co-Cook (User B)
    participant Redis as Redis (:6379)
    participant Service as DraftService.saveSharedDraft

    UserA->>UserA: Edits Title & Description in UI
    UserB->>Redis: POST /api/draft (Updates Ingredients & Cooking Method)
    Redis-->>UserB: { ingredients: [...], method: "Microwave" }
    UserA->>Service: POST /api/draft (Saves Title & Description)
    Service->>Redis: GET draft:shared:<id> (Read User B's latest state)
    Service->>Service: Non-destructive deep merge (Title + User B's Ingredients & Method)
    Service->>Redis: SET draft:shared:<id> (Atomic merged payload)
    Note over UserA,UserB: No race-condition data loss! Both edits preserved.
```

### 1.4 Collaborator Capacity (MAX_CO_COOKS = 4) & Publish Cleanup

```mermaid
flowchart TD
    Add1["Add Chef 1 (1/4)"] --> Add2["Add Chef 2 (2/4)"]
    Add2 --> Add3["Add Chef 3 (3/4)"]
    Add3 --> Add4["Add Chef 4 (4/4 Max Capacity)"]
    Add4 --> Try5["Attempt Add Chef 5 -> Toast: 'Maximum of 4 co-cooks allowed'"]
    Try5 --> Remove["Remove Chef 4 -> Capacity drops to (3/4)"]
    Remove --> Publish["Publish Recipe via POST /api/recipes"]
    Publish --> CleanRedis["DraftService.cleanUpDraftOnPublish deletes draft:shared:id from Redis"]
```

### 1.5 Live UI In-Progress Edit Protection during Co-Cooking

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Active Typist (User A)
    actor UserB as Remote Co-Cook (User B)
    participant Modal as RecipeModal UI (Step 1)
    participant Sync as syncFormFromDraft Hook
    participant Redis as Redis (:6379)

    UserA->>Modal: Focusing & typing in Description ('My In-Progress Title Draft')
    Note over Modal: Form marked dirty / active step = Step 1 (DESCRIPTION)
    UserB->>Redis: POST /api/draft (Updates ingredients: ['1kg Organic Strawberries', '250g Mascarpone'])
    Redis-->>Modal: SWR Background Revalidation (/api/draft?draftId=...)
    Modal->>Sync: syncFormFromDraft(setValue, getValues, currentStep=1, lock, isLocked=false)
    Note over Sync: Step-scoped sync: Skip Step 1 (User A active typing protected)
    Sync->>Modal: Synchronize Step 2 Ingredients in background form state!
    Note over Modal: User A's input is NEVER overwritten or interrupted!
    UserA->>Modal: Clicks Next -> Step 2 (Ingredients)
    Note over Modal: Displays User B's synced ingredients: '1kg Organic Strawberries', '250g Mascarpone'
```

### 1.6 Step Soft-Locking Input Guard & Navigation

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Collaborator A (Viewer)
    actor UserB as Collaborator B (Lock Holder)
    participant Modal as RecipeModal UI (Step 2)
    participant Lock as useRecipeLock Hook
    participant Redis as Redis Lock Key

    UserB->>Redis: POST /api/recipes/<draftId>/lock (field='step:2', userId='user-b')
    Redis-->>UserB: { success: true } (Lock held for 30s)
    UserA->>Modal: Navigates to Step 2 (Ingredients)
    Modal->>Lock: useRecipeLock.isLockedByOther('step:2') -> true
    Modal-->>UserA: Renders Soft-Lock Banner ("Chef Maria is currently editing this step")
    Modal-->>UserA: Disables all inputs ([disabled]) & 'Add ingredient' button
    UserA->>Modal: Clicks Next -> Step 3 (Methods - Unlocked)
    Modal->>Lock: useRecipeLock.isLockedByOther('step:3') -> false
    Modal-->>UserA: Inputs and selection controls fully ENABLED and interactive!
```

### 1.7 Live Soft-Lock Auto-Recovery on Lock Release

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Active Viewer (User A)
    actor UserB as Remote Co-Cook (User B)
    participant Modal as RecipeModal UI (Step 2: Ingredients)
    participant LockHook as useRecipeLock Hook
    participant Redis as Redis Lock Key (:6379)

    UserB->>Redis: Holds lock:recipe:<draftId>:field:step:2 (User B)
    UserA->>Modal: Navigates to Step 2 (Ingredients)
    LockHook->>Redis: Polls GET /api/recipes/<draftId>/lock
    LockHook-->>Modal: Lock active (isLockedByOther = true)
    Modal-->>UserA: Displays Soft-Lock Banner ("Chef Maria is currently editing this step")
    Modal-->>UserA: All ingredient inputs & 'Add ingredient' button DISABLED

    Note over UserB,Redis: User B finishes editing and releases lock
    UserB->>Redis: DELETE /api/recipes/<draftId>/lock (field='step:2')
    Redis-->>UserB: Lock deleted from Redis

    Note over Modal,LockHook: Next polling cycle automatically detects lock release
    LockHook->>Redis: Polls GET /api/recipes/<draftId>/lock
    Redis-->>LockHook: Lock is null / empty
    LockHook-->>Modal: Lock cleared (isLockedByOther = false)
    Modal-->>UserA: Soft-Lock Banner vanishes dynamically!
    Modal-->>UserA: All ingredient inputs & 'Add ingredient' button immediately RE-ENABLED!
```

### 1.8 Dynamic Row Expansion on Remote Co-Cook Additions

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Active Viewer (User A)
    actor UserB as Remote Co-Cook (User B)
    participant Modal as RecipeModal UI
    participant Sync as syncRemoteDraftToForm / SWR
    participant Redis as Redis Shared Draft (:6379)

    Note over UserA,Modal: User A is viewing Step 1 (Description) with 1 ingredient slot
    UserB->>Redis: POST /api/draft (Appends 3 new ingredients & 2 new steps)
    Redis-->>Redis: SET draft:shared:<id> ({ ingredients: ['200g Dark Chocolate', '100g Butter', '3 Eggs'], steps: ['Step 1: Melt', 'Step 2: Whisk'] })
    
    Modal->>Sync: SWR Revalidates GET /api/draft?draftId=<id>
    Sync->>Modal: syncRemoteDraftToForm detects expanded array lengths
    Modal->>Modal: Dynamically expands ingredient array from 1 to 3 slots
    Modal->>Modal: Dynamically expands step array from 1 to 2 slots
    
    UserA->>Modal: Clicks Next -> Step 2 (Ingredients)
    Modal-->>UserA: Renders all 3 dynamic ingredient inputs populated with remote data!
    UserA->>Modal: Clicks Next -> Step 4 (Steps)
    Modal-->>UserA: Renders both dynamic step inputs populated with remote data!
```

### 1.9 Atomic Co-Cook Join & Quota Enforcement Workflow (Test 12)

This workflow validates that co-cook join requests use an atomic Redis Lua script (`JOIN_SHARED_DRAFT_SCRIPT`) to prevent TOCTOU race conditions and strictly enforce the `MAX_CO_COOKS = 4` limit under high concurrency.

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Recipe Owner (User A)
    actor CoCooks as Concurrent Joiners (Users B, C, D, E)
    participant JoinAPI as GET /api/draft/join
    participant Lua as Redis Lua Engine (JOIN_SHARED_DRAFT_SCRIPT)
    participant Redis as Redis Keys (:6379)
    participant Modal as RecipeModal UI

    Owner->>JoinAPI: POST /api/draft/invite
    JoinAPI->>Redis: SET draft:shared:<id> (inviteToken, maxCoCooks: 4)
    JoinAPI-->>Owner: { draftId, inviteToken }

    Note over CoCooks,Lua: Concurrent Joins executed simultaneously
    par Concurrent Join Valid Token
        CoCooks->>JoinAPI: GET /api/draft/join?draft=<id>&token=<token>
        JoinAPI->>Lua: EVAL JOIN_SHARED_DRAFT_SCRIPT 2 draftKey userDraftsKey token userId 4 ttl
        Lua->>Lua: Validate token matches inviteToken
        Lua->>Lua: Check coCooksIds.length < 4
        Lua->>Redis: Atomically append userId to coCooksIds & SADD user:drafts:<userId>
        Lua-->>JoinAPI: Return { ok: 1, draft }
        JoinAPI-->>CoCooks: Redirect 307 -> /?draft=<id>&joined=true
    and Concurrent Join Invalid Token
        CoCooks->>JoinAPI: GET /api/draft/join?draft=<id>&token=bad-token
        JoinAPI->>Lua: EVAL JOIN_SHARED_DRAFT_SCRIPT
        Lua-->>JoinAPI: Return { ok: 0, error: 'invalid_invite_token' }
        JoinAPI-->>CoCooks: Redirect 307 -> /?error=invalid_invite_token
    and 5th Join Attempt Exceeding Max Capacity
        CoCooks->>JoinAPI: GET /api/draft/join?draft=<id>&token=<token>
        JoinAPI->>Lua: EVAL JOIN_SHARED_DRAFT_SCRIPT
        Lua->>Lua: coCooksIds.length >= 4 -> Quota full
        Lua-->>JoinAPI: Return { ok: 0, error: 'co_cook_limit_reached' }
        JoinAPI-->>CoCooks: Redirect 307 -> /?error=co_cook_limit_reached
    end

    Note over Owner,Modal: Owner navigates to Step 5 (Related Content)
    Owner->>Modal: Advance to Step 5
    Modal-->>Owner: Displays co-cook count `(4/4)` with all participants retained!
```

---

## 2. Recipe Lifecycle Workflow (`basic.cy.ts`)

```mermaid
flowchart TD
    subgraph Step1["1. Recipe Creation"]
        A1["Click 'Post a recipe'"] --> A2["Select Category"]
        A2 --> A3["Enter Title & Description"]
        A3 --> A4["Add Ingredients"]
        A4 --> A5["Select Cooking Method"]
        A5 --> A6["Add Recipe Steps"]
        A6 --> A7["Skip Related Content & Images"]
        A7 --> A8["Submit Recipe & Verify Toast"]
    end

    subgraph Step2["2. Recipe Detail Verification"]
        B1["Click Recipe Card"] --> B2["Verify Title & Description Display"]
        B2 --> B3["Verify Ingredients List"]
        B3 --> B4["Verify Cooking Method"]
        B4 --> B5["Verify Recipe Steps"]
    end

    subgraph Step3["3. Social Interactions"]
        C1["Click Heart Button"] --> C2["Verify Likes = 1 & Filled Heart"]
        C2 --> C3["Click Heart Button Again"]
        C3 --> C4["Verify Likes = 0 & Unfilled Heart"]
        C4 --> C5["Type & Submit Comment"]
        C5 --> C6["Verify Comment Text"]
        C6 --> C7["Delete Comment & Verify Removal"]
    end

    subgraph Step4["4. Recipe Editing"]
        D1["Click 'Edit Recipe'"] --> D2["Update Title & Description"]
        D2 --> D3["Update Ingredients & Steps"]
        D3 --> D4["Submit Update"]
        D4 --> D5["Verify Updated Title, Description & Ingredients"]
    end

    subgraph Step5["5. Recipe Deletion"]
        E1["Click 'Delete Recipe'"] --> E2["Type Confirm Text"]
        E2 --> E3["Click Confirm Delete"]
        E3 --> E4["Verify Redirect to Homepage"]
    end

    Step1 --> Step2 --> Step3 --> Step4 --> Step5
```

---

## 3. I Cooked This Remakes & Photo Proof Workflow (`cooked_remake.cy.ts`)

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated Cook
    participant Page as Recipe Detail Page
    participant API as Next.js API (/api/upload/r2)
    participant R2 as Cloudflare R2 Storage
    participant DB as MongoDB

    User->>Page: Navigate to Recipe Detail
    User->>Page: Type Comment Text in [data-cy="comment-input"]
    User->>Page: Check "I Cooked This" Toggle [data-cy="cooked-toggle"]
    User->>Page: Attach Photo File [data-cy="cooked-photo-input"]
    User->>Page: Click Submit [data-cy="submit-comment"]
    Page->>API: POST /api/upload/r2 (filename, fileType)
    API-->>Page: { uploadUrl: presignedPutUrl, publicUrl, key }
    Page->>R2: PUT image binary to presigned uploadUrl
    R2-->>Page: 200 OK
    Page->>DB: POST /api/comments (isCookedRemake=true, proofPhotoUrl=publicUrl)
    DB-->>Page: 201 Created
    Page-->>User: Render "Cooked & Verified" Badge and Photo Gallery
```

---

## 4. Workshops Lifecycle Workflow (`workshops.cy.ts`)

```mermaid
flowchart TD
    W1["Navigate to /workshops"] --> W2["Click 'Create Workshop'"]
    W2 --> W3["Fill Info: Title, Description, Future Date, Location"]
    W3 --> W4["Fill Requirements: Ingredients & Previous Steps"]
    W4 --> W5["Skip Privacy & Images -> Create Workshop"]
    W5 --> W6["Verify Workshop Detail: Title, Description, Location, Ingredients"]
    W6 --> W7["Edit Workshop: Update Title, Description, Location"]
    W7 --> W8["Verify Updated Details"]
    W8 --> W9["Delete Workshop & Confirm"]
    W9 --> W10["Verify Redirect to /workshops List"]
```

---

## 5. Quests Lifecycle Workflow (`quests.cy.ts`)

```mermaid
flowchart TD
    Q1["Navigate to /quests"] --> Q2["Click 'Request Recipe'"]
    Q2 --> Q3["Fill Quest Form: Title & Description"]
    Q3 --> Q4["Submit Quest & Verify in List"]
    Q4 --> Q5["Open Quest Detail Page & Verify Status = Open"]
    Q5 --> Q6["Click Edit Quest"]
    Q6 --> Q7["Update Title, Description, Status = In Progress"]
    Q7 --> Q8["Verify Updated Information on Detail Page"]
    Q8 --> Q9["Click Delete Quest & Confirm"]
    Q9 --> Q10["Verify Quest Removed from List"]
```

---

## 6. User Authentication & Session Workflow (`user.cy.ts`)

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Nav as Top Navigation Menu
    participant Modal as LoginModal
    participant Auth as NextAuth API (/api/auth)

    User->>Nav: Click User Menu [data-cy="user-menu"]
    User->>Nav: Click Login [data-cy="user-menu-login"]
    Nav->>Modal: Open Login Modal
    User->>Modal: Fill Email & Password
    User->>Modal: Click Submit [data-cy="modal-action-button"]
    Modal->>Auth: Credentials Provider signIn
    Auth-->>Modal: Session Token Cookie set
    Modal-->>User: Toast success & Modal closes
    User->>Nav: Click User Menu [data-cy="user-menu"]
    User->>Nav: Click Logout [data-cy="user-menu-logout"]
    Nav->>Auth: signOut()
    Nav-->>User: User Menu displays Login option again
```

---

## 7. App Shell & Layout Workflow (`app.cy.ts`)

```mermaid
flowchart TD
    A["Visit Homepage '/'"] --> B["Verify Root Header & Navbar Render"]
    B --> C["Verify Jorbites Logo data-cy='logo' is visible"]
    C --> D["Verify Viewport Responsiveness"]
```

---

## 8. Drafts Management & Multi-Draft Lifecycle (`drafts_management.cy.ts`)

This spec validates the complete multi-draft lifecycle: empty state in `DraftsModal`, creating and auto-saving solo drafts, indicator dot activation in `RecipeModal`, switching to `DraftsModal` from within the recipe wizard, duplicating drafts, safely deleting drafts with confirmation, switching between distinct drafts without form state leakage, full recipe state capture across multi-step wizard navigation, solo draft cleanup upon publishing, and maximum slot limit enforcement (`MAX_SOLO_DRAFT_SLOTS = 5`).

### 8.1 Multi-Draft Lifecycle, Duplication & Deletion Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant Nav as Navbar / UserMenu
    participant RM as RecipeModal (Wizard)
    participant DM as DraftsModal (Grid)
    participant API as Next.js API (/api/draft)
    participant Redis as Redis (:6379)

    %% Step 1: Empty State
    User->>Nav: Click UserMenu -> "My Drafts"
    Nav->>DM: Opens DraftsModal
    DM->>API: GET /api/draft/active
    API-->>DM: [] (0 active drafts)
    DM-->>User: Render Empty State & "+ New draft" Button

    %% Step 2: Create Draft & Save
    User->>Nav: Click "Post a recipe"
    Nav->>RM: Opens RecipeModal
    User->>RM: Select Category "Desserts" & Enter Title "Berry Pavlova Draft"
    User->>RM: Click "Save draft" [data-testid="load-draft-button"]
    RM->>API: POST /api/draft
    API->>Redis: SET draft:user:<userId>:<slotId> & SADD user:drafts:<userId>
    API-->>RM: 200 OK -> SWR mutate('/api/draft/active')
    User->>RM: Close RecipeModal

    %% Step 3: Auto-load on Re-open & Indicator Dot
    User->>Nav: Click "Post a recipe" again
    Nav->>RM: Opens RecipeModal
    RM->>API: GET /api/draft (auto-loads last modified draft)
    RM-->>User: Form populated with "Berry Pavlova Draft" & Green indicator dot on 📂 folder

    %% Step 4: Open DraftsModal from within RecipeModal
    User->>RM: Click [data-testid="open-drafts-modal-button"]
    RM->>DM: Close RecipeModal & Open DraftsModal
    DM-->>User: Displays DraftCard (Title, 7-dot Progress, TTL Badge, Action Icons)

    %% Step 5: Duplicate Draft
    User->>DM: Click Duplicate [data-testid="draft-card-duplicate"]
    DM->>API: POST /api/draft (Payload: "Berry Pavlova Draft (Copy)")
    API->>Redis: SET new slot & SADD user:drafts:<userId>
    API-->>DM: 200 OK -> SWR mutate -> Render 2 DraftCards (Copy sorted first by updatedAt)

    %% Step 6: Delete Draft Confirmation
    User->>DM: Click Delete [data-testid="draft-card-delete"] on copy
    DM-->>User: Render Delete Confirmation Banner [data-testid="draft-delete-confirmation"]
    User->>DM: Click Confirm [data-testid="draft-delete-confirm-btn"]
    DM->>API: DELETE /api/draft?draftId=<copyId>
    API->>Redis: DEL draft:user:<userId>:<copyId> & SREM user:drafts:<userId>
    API-->>DM: 200 OK -> SWR mutate -> 1 DraftCard remaining ("Berry Pavlova Draft")

    %% Step 7: Open Remaining Draft
    User->>DM: Click remaining DraftCard
    DM->>RM: Close DraftsModal & Open RecipeModal with selected draft
```

### 8.2 Full Multi-Step State Persistence Across Wizard Steps

```mermaid
flowchart TD
    S0["Step 0: Select Category ('Desserts')"] --> S1["Step 1: Description ('Cheesecake Special')"]
    S1 --> S2["Step 2: Add 3 Ingredients ('Cream Cheese', 'Strawberries', 'Crackers')"]
    S2 --> S3["Step 3: Cooking Method ('Oven')"]
    S3 --> S4["Step 4: Add 2 Steps ('Crush crackers', 'Bake at 160C')"]
    S4 --> S5["Step 5: Related Content -> Click 'Save draft'"]
    S5 --> SavePayload["extractIngredientsAndSteps collects all 30 potential slots"]
    SavePayload --> RedisStore["Redis stores whole recipe state (categories, title, desc, ingredients, method, steps)"]
    RedisStore --> Reload["Page Reload / Re-open RecipeModal"]
    Reload --> RestoreSteps["All 5 steps restored completely backward without data loss"]
```

### 8.3 In-Session Draft Switching & Form State Isolation

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant RM as RecipeModal (Wizard)
    participant DM as DraftsModal (Grid)

    Note over User,RM: User edits Draft A ("Strawberry Tart", Step 4, Oven, 2 ingredients)
    User->>RM: Click [data-testid="open-drafts-modal-button"]
    RM->>DM: Open DraftsModal
    User->>DM: Click "+ New draft" -> Create Draft B ("Garlic Bread", Step 2, Quick, 2 ingredients)
    User->>RM: Save Draft B
    User->>RM: Click [data-testid="open-drafts-modal-button"]
    RM->>DM: Open DraftsModal (Shows Draft A and Draft B)
    User->>DM: Select Draft A
    DM->>RM: Load Draft A
    Note over RM: Form resets cleanly: Step 4 active, Oven selected, Strawberry ingredients only (No Garlic Bread fields leak!)
    User->>RM: Click [data-testid="open-drafts-modal-button"] -> Select Draft B
    DM->>RM: Load Draft B
    Note over RM: Form resets cleanly: Step 2 active, Garlic Bread fields restored!
```

### 8.4 Solo Draft Cleanup on Recipe Publish

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant RM as RecipeModal
    participant API as POST /api/recipes
    participant DS as DraftService.cleanUpDraftOnPublish
    participant Redis as Redis (:6379)
    participant DB as MongoDB

    User->>RM: Advance through steps with active solo draft
    User->>RM: Click "Create" (Publish) on Step 6
    RM->>API: POST /api/recipes (Payload includes draftId)
    API->>DB: prisma.recipe.create(...)
    API->>DS: cleanUpDraftOnPublish(draftId, userId)
    DS->>Redis: DEL draft:user:<userId>:<draftId>
    DS->>Redis: SREM user:drafts:<userId> <draftId>
    Note over DS,Redis: If 0 drafts remain, DEL shadow keys draft:user:<userId> & <userId>
    API-->>RM: 200 OK -> Recipe created & Modal closes
    User->>RM: Click "Post a recipe"
    Note over RM: RecipeModal opens on Step 0 with clean empty form (no indicator dot, 0/3 categories)
```

### 8.5 Maximum Solo Draft Slots Limit Enforcement (`MAX_SOLO_DRAFT_SLOTS = 5`)

```mermaid
flowchart TD
    D1["Draft 1"] --> Dup1["Duplicate -> Drafts: 2/5"]
    Dup1 --> Dup2["Duplicate -> Drafts: 3/5"]
    Dup2 --> Dup3["Duplicate -> Drafts: 4/5"]
    Dup3 --> Dup4["Duplicate -> Drafts: 5/5 (Max Capacity)"]
    Dup4 --> Attempt6["Attempt 6th Duplicate -> POST /api/draft"]
    Attempt6 --> Reject["API returns 409 Conflict: 'MAX_SOLO_DRAFTS_REACHED'"]
    Reject --> Toast["UI shows limit warning; Card count stays at 5"]
    Toast --> DeleteOne["Delete 1 Draft -> Capacity drops to 4/5"]
    DeleteOne --> DupAllowed["Duplicate now succeeds -> Returns to 5/5"]
```

### 8.6 Mixed Solo & Collaborative Drafts Grid (`DraftsModal`)

```mermaid
flowchart TD
    SD["Create Solo Draft ('Solo Truffle Pasta')"] --> Dup["Duplicate -> 2 Draft Slots"]
    Dup --> Conv["Convert 1st Draft to Collaborative via Share Button"]
    Conv --> Token["POST /api/draft/invite -> Generates Invite Token & Sets Type='shared'"]
    Token --> Grid["DraftsModal Grid Renders Mixed Draft Cards:"]
    Grid --> C1["Card 1: 'Shared' Badge | 7d TTL | Invite Share Action"]
    Grid --> C2["Card 2: 'Solo' Badge | 365d TTL | Standard Solo Actions"]
    C2 --> OpenSolo["Select Solo Draft -> Loads 'Solo Truffle Pasta' cleanly in RecipeModal"]
```

### 8.7 Plain-Text Parser Persistence Across Draft Save & Page Reload

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant RM as RecipeModal
    participant PTP as Text Parser
    participant API as POST /api/draft
    participant Redis as Redis (:6379)

    User->>RM: Step 2 (Ingredients) -> Toggle Plain-Text Mode
    User->>RM: Paste numbered items ('1. 200g Dark Chocolate\n2. 100g Butter\n...')
    User->>RM: Click 'Apply'
    PTP-->>RM: Populates individual slots (ingredient-0, ingredient-1, etc.)
    User->>RM: Step 4 (Steps) -> Toggle Plain-Text Mode & Apply steps
    User->>RM: Step 5 -> Click 'Save draft'
    RM->>API: POST /api/draft (Whole recipe state extracted)
    API->>Redis: Saved to user slot
    User->>User: Hard page reload (F5 / cy.reload())
    User->>RM: Click 'Post a recipe'
    RM->>API: GET /api/draft
    API-->>RM: Complete draft data
    Note over RM: Step backwards: Step 4 (3 steps), Step 3 (Oven), Step 2 (4 ingredients), Step 1 (Title) all intact!
```

### 8.8 Intentional Empty Array Clearing & Persistence

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant RM as RecipeModal (Wizard)
    participant API as POST /api/draft
    participant Redis as Redis (:6379)

    User->>RM: Create draft with Ingredients ('Vanilla Extract', 'Whole Milk') & Save
    RM->>API: POST /api/draft (ingredients: ['Vanilla Extract', 'Whole Milk'])
    API->>Redis: Persists draft in slot
    User->>RM: Navigate to Ingredients Step & explicitly clear all input fields
    User->>RM: Click 'Save draft'
    RM->>API: POST /api/draft (ingredients: [])
    API->>Redis: Overwrites ingredients array with [] (does not restore old items)
    User->>User: Hard page reload (cy.reload())
    User->>RM: Re-open RecipeModal -> Navigate to Ingredients
    Note over RM: Ingredients remain empty [] without ghost item restoration!
```

### 8.9 In-Flight Save Queue & Modal Transition

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant RM as RecipeModal
    participant DM as DraftsModal
    participant Hook as useDraftPersistence (saveQueueRef)
    participant API as POST /api/draft

    User->>RM: Fill Title ('In-Flight Save Test') on Step 1
    User->>RM: Immediately click 'My Drafts' header button (without clicking Save)
    RM->>Hook: flushDraftSaves() initiates & awaits pending queue
    Hook->>API: POST /api/draft
    API-->>Hook: 200 OK (draft saved)
    RM->>DM: Opens DraftsModal
    DM-->>User: Displays DraftCard with updated title ('In-Flight Save Test')!
```

### 8.10 Rapid Keystroke Autosave Queue & Step Navigation

```mermaid
sequenceDiagram
    autonumber
    actor User as Fast Typist
    participant RM as RecipeModal UI
    participant Hook as useDraftPersistence (saveQueueRef)
    participant API as POST /api/draft
    participant Redis as Redis (:6379)

    User->>RM: Rapidly types '200g Fresh Berries' on Step 2 (Ingredients)
    User->>RM: Instantly clicks 'Next' -> Step 3 (Methods)
    Note over RM,Hook: Keystroke debounced save & step transitions serialized via saveQueueRef
    User->>RM: Selects 'Oven' & clicks 'Save draft'
    Hook->>API: POST /api/draft (All step 1-3 fields serialized in queue)
    API->>Redis: Saved to user draft slot with currentStep=3
    User->>RM: Closes modal & reloads page (F5)
    User->>RM: Re-opens RecipeModal -> Auto-resumes on Step 3 (Methods)
    User->>RM: Navigates back to Ingredients (Step 2) & Description (Step 1)
    Note over RM: '200g Fresh Berries', Oven method, and Title are all intact without drop!
```

### 8.11 Recipe Steps Intentional Empty Deletion & Parser Mode Switch

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant RM as RecipeModal UI (Step 4)
    participant Parser as parseStepsText Utility
    participant API as POST /api/draft
    participant Redis as Redis (:6379)

    User->>RM: Fill steps in Plain-Text mode ('Step 1: Prep\nStep 2: Bake') & Apply
    RM->>Parser: parseStepsText converts to ['Step 1: Prep', 'Step 2: Bake']
    RM->>API: POST /api/draft (steps: ['Step 1: Prep', 'Step 2: Bake'])
    API->>Redis: Persists initial steps in draft
    User->>RM: Switch to List Mode & clear all step inputs (step-0='', step-1='')
    User->>RM: Toggle mode back to Plain-Text (empty textarea) & Save Draft
    RM->>API: POST /api/draft (steps: [])
    API->>Redis: Explicit empty array replaces old entries in Redis slot
    User->>RM: Hard page reload -> Re-open RecipeModal -> Navigate to Steps
    Note over RM: Steps section is completely clean and empty (no stale resurrection)!
```

### 8.12 Deep Form State Persistence Across Page Reload

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant RM as RecipeModal (Wizard)
    participant API as POST /api/draft
    participant Redis as Redis (:6379)

    User->>RM: Complete Steps 0-4 (Desserts, Title, Ingredients, Oven, Steps)
    User->>RM: Step 5 (Related Content) -> Switch to 'Videos' Tab
    User->>RM: Type YouTube URL ('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    User->>RM: Click 'Save draft'
    RM->>API: POST /api/draft (Full deep metadata payload serialized)
    API->>Redis: Saved to user draft slot
    User->>User: Hard page reload (cy.reload())
    User->>RM: Re-open RecipeModal -> Draft auto-loads on Step 5
    User->>RM: Switch to 'Videos' Tab -> YouTube URL is perfectly preserved!
    User->>RM: Step backwards 5 -> 4 -> 3 -> 2 -> 1 -> 0
    Note over RM: Every step retains all nested inputs, method selections, and titles!
```

### 8.13 Solo vs Shared Quota Isolation in Unified DraftsModal

```mermaid
flowchart TD
    subgraph SoloFlow["Solo Drafts Flow (Cap = 5)"]
        S1["Create 5 Solo Drafts<br/>(user:solo-drafts:id)"] --> SMax["Reach Quota 5/5"]
        SMax --> S6["Attempt 6th Solo Draft -> Rejection 409 Conflict"]
        SMax --> SDel["Delete 1 Solo Draft -> Capacity drops to 4/5"]
        SDel --> SNew["Create New Solo Draft -> Succeeded (200 OK)"]
    end

    subgraph SharedFlow["Shared Collaborative Drafts Flow (Uncapped)"]
        Col1["Create Collab Draft 1<br/>(draft:shared:id1)"]
        Col2["Create Collab Draft 2<br/>(draft:shared:id2)"]
    end

    SoloFlow --> Modal["DraftsModal Unified Grid View"]
    SharedFlow --> Modal
    Modal --> Total["Displays all 7 Drafts seamlessly (5 Solo + 2 Shared)"]
    Total --> Badges["Clear Visual Badging:<br/>- Solo: 365-day TTL Badge<br/>- Shared: 7-day TTL Badge + Co-Cook Avatars"]
```

### 8.14 Near-Expiration TTL Visual Warning Badge (< 24h)

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant DM as DraftsModal
    participant Card as DraftCard / DraftTTLBadge
    participant API as GET /api/draft/active
    participant Meta as getDraftTTLInfo / formatTTLText

    User->>DM: Opens 'My Drafts' from UserMenu
    DM->>API: GET /api/draft/active
    API-->>DM: Return drafts (including shared draft with 2h remaining TTL)
    DM->>Card: Renders DraftCard for 'Expiring Soon Berry Tart'
    Card->>Meta: getDraftTTLInfo(updatedAt, type='shared')
    Note over Meta: remainingSeconds = 7200 < 86400 (24h) -> isExpiringSoon = true
    Meta-->>Card: { label: 'Expires in 2 hours', isExpiringSoon: true }
    Card-->>DM: Renders amber warning badge (bg-amber-50 text-amber-600) with 'Expires in 2 hours'!
    User->>Card: Clicks card -> Opens RecipeModal directly to continue editing
```

---

## 9. Drafts Navigation & Auto-Save Wizard Persistence (`drafts_navigation.cy.ts`)

This spec validates step-by-step navigation auto-save, category multi-select preservation across re-opening, input modes (plain text vs. multi-row dynamic inputs), and draft data integrity during wizard transitions.

```mermaid
flowchart TD
    N1["Open RecipeModal via 'Post a recipe'"] --> N2["Step 1: Select Category 'Desserts'"]
    N2 --> N3["Click 'Next' -> Step 2: Description"]
    N3 --> N4["Fill Title 'Persistent Chocolate Cake' & Description"]
    N4 --> N5["Click 'Save draft' -> Stored in Redis"]
    N5 --> N6["Close RecipeModal"]
    N6 --> N7["Re-open RecipeModal -> Auto-loads latest draft"]
    N7 --> N8["Click 'Back' -> Category 'Desserts' remains selected"]
    N8 --> N9["Navigate to Ingredients -> Fill items via plain-text mode"]
    N9 --> N10["Navigate to Steps -> Fill items via list mode"]
    N10 --> N11["Save Draft -> Navigate across steps without state loss"]
```
