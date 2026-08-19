# End-to-End (E2E) Test Workflows Documentation

This document provides architectural and behavioral sequence/flow diagrams for all End-to-End (E2E) test suites in **Jorbites**, with special focus on multi-user collaborative editing backed by local Redis, step synchronization, and GitHub Actions CI matrix execution.

---

## E2E Test Suite Overview & CI Matrix

```mermaid
flowchart TD
    subgraph GitHubActions["GitHub Actions CI Matrix (ubuntu-latest)"]
        redisSvc[("Local Redis Service (redis:6379)")]
        
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
        
        subgraph Job4["Container 4: Collaborative Recipes & Remakes Specs"]
            T6["collaborative_recipes.cy.ts<br/>Co-Cooking & Redis Step Sync"]
            T7["cooked_remake.cy.ts<br/>I Cooked This & R2 Proof"]
        end
    end

    redisSvc -.->|REDIS_URL| Job1
    redisSvc -.->|REDIS_URL| Job2
    redisSvc -.->|REDIS_URL| Job3
    redisSvc -.->|REDIS_URL| Job4
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
