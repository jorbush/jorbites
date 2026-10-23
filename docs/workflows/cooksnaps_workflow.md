# Elevating "I Made This!" (Cooksnaps) Architecture & Workflow

This document details the end-to-end architecture, user experience, data flow, and cross-service communication workflow for **Cooksnaps** ("I Made This!") across the **Jorbites Next.js Web Application**, **Cloudflare R2**, **Jorbites Notifier (Go)**, and **Badge Forge (Rust)**.

---

## 🏗️ Architecture & Interaction Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Jorbiter (Cook)
    participant Client as Recipe Client (Next.js)
    participant Modal as CooksnapModal
    participant R2 as Cloudflare R2
    participant API as Comments API (Next.js)
    participant Notifier as Jorbites Notifier (Go)
    participant BF as Badge Forge (Rust)
    actor Author as Recipe Author

    User->>Client: Clicks "📸 I Made This!" (Header or Post-Steps CTA)
    Client->>Modal: Open CooksnapModal(recipeId, recipeTitle)
    User->>Modal: Selects photo, optional rating & note, clicks Submit
    Modal->>R2: Upload compressed WebP photo
    Modal->>API: POST /api/comments (recipeId, comment, rating, isCooked=true, imageSrc)
    API->>API: Save comment & update recipe averageRating/ratingCount
    par Dispatch Notification
        API->>Notifier: POST /notifications (Type: NEW_COOKSNAP, recipient: authorEmail)
        Notifier-->>Author: WebPush / Email ("@username cooked your recipe! See their photo")
    and Trigger Gamification
        API->>BF: POST /api/evaluate (userId, event: COOKSNAP_POSTED)
        BF->>BF: Check cooksnap count & award "Kitchen Explorer" / "Cooksnap Master" badge
    end
    API-->>Modal: Success response
    Modal-->>Client: Close modal & refresh recipe page
    Client-->>User: Cooksnap appears in CookedGallery & Comments
```

---

## 🌟 Key Components

### 1. Prominent Entry Points (CTAs) & Separation of Concerns
- **Header Action Bar**: A dedicated `"📸 I Made This!"` button in `RecipeInfoHeader.tsx` alongside Save, Like, and Likes counter.
- **Post-Steps Banner**: An engaging banner card immediately below the recipe preparation steps in `RecipeInfo.tsx` prompting cooks who just finished following the recipe to upload their photo.
- **Strict Separation from Regular Comments**:
  - Regular comments (`CommentBox`) retain the photo attachment button (`HiOutlineCamera`) for general pictures (e.g., questions about ingredient texture or progress), but attaching a photo in a comment does **NOT** mark it as `isCooked`.
  - The `"🥑 I Cooked This!"` checkbox is removed from `CommentBox`.
  - `isCooked = true` is **exclusively** set through the dedicated `"📸 I Made This!"` Cooksnap workflow (`CooksnapModal`).
  - Comments in `Comment.tsx` only display the `"🥑 Cooked"` badge if `isCooked === true`.
  - The `CookedGallery` exclusively displays entries where `isCooked === true && imageSrc != null`.

### 2. Fast 1-Click Submission (`CooksnapModal.tsx`)
- Drag-and-drop or mobile camera upload.
- Client-side WebP compression (`compressImage`) to max 1080px with quality 0.82.
- Direct-to-R2 pre-signed upload via `/api/upload/r2`.
- Optional 1-sentence note (with automatic friendly fallback if empty).
- Optional 1–5 star rating using interactive `StarRating`.

### 3. "Cooked by the Community" Photo Gallery (`CookedGallery.tsx`)
- Horizontal snap-scrolling carousel on `RecipeClient.tsx`.
- Displays dish photos with cook avatar, display name, and optional star rating.
- Clicking any card opens `PhotoLightbox` for high-resolution viewing with cook notes.
- Includes an inviting empty state if no cooksnaps exist yet.

### 4. Author Notification Microservice (`jorbites-notifier` - Go)
- New notification type: `NEW_COOKSNAP`.
- Multilingual push notifications (`es`, `ca`, `en`): *"@username cooked your recipe! See their photo"*.
- Transactional email with direct link to view the photo on Jorbites.
- Integrated into user `social` notification category preferences.

### 5. Gamification & Progression (`badge_forge` - Rust)
- Event: `COOKSNAP_POSTED`.
- Microservice counts completed cooksnaps by the user in MongoDB.
- Progressive badge unlocking:
  - Tier 1: **"Kitchen Explorer"** (1 Cooksnap)
  - Tier 2: **"Cooksnap Veteran"** (5 Cooksnaps)
  - Tier 3: **"Cooksnap Master"** (15 Cooksnaps)
- Awards badges atomically and sends `NEW_BADGE` notification.
