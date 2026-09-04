# Jorbites Roadmap — Through End of 2026

> Three pillars: **Gamification that rewards**, **Search that finds**, **Drafts that flow**.
> All changes preserve the minimalist, aesthetic design.

---

## Current State

**Gamification** — Level = published recipes + total likes (computed by `badge_forge` Rust microservice). 70+ badge assets across milestones (L100/250/500), streaks (7-day/4-week), quest-solver tiers, top-recipe voting winners, and 30+ manually-assigned seasonal/event badges. Quests, weekly challenges, recipe voting, and a "Top Jorbiters" leaderboard exist. **Gaps**: levels unlock nothing tangible; challenge completion isn't auto-tracked; no progress-toward-next-badge visibility; event badges require manual CLI assignment; leaderboard is all-time only.

**Search** — Prisma `title: { contains, mode: 'insensitive' }` (regex on title only). Filters: 1 category, cuisine, calorie range, yield range, date range. Sort: newest/oldest/title/most-liked/best-rated. Results cached in Redis (24 h). **Gaps**: can't search by ingredient or description; no dietary/time filters (fields don't exist on schema); no relevance scoring; no autocomplete on the main search; no recent/trending searches; zero MongoDB indexes on Recipe.

**Drafts & Collaboration** — Full multi-slot draft management and real-time collaboration are active. Solo drafts support up to 5 slots at `draft:user:{userId}:{slotId}` tracked in `user:drafts:{userId}`, and shared collaborative drafts live at `draft:shared:{draftId}` (7-day TTL). The unified `DraftsModal` dashboard allows users to browse, switch, duplicate, delete, and create drafts with progress pills, co-cook avatars, and TTL countdowns. Collaboration features SWR sync (3 s) + step-level soft-locks (30 s TTL, heartbeat every 10 s, atomic Lua release, locked step container `inert` guard) and link-based invite/join flows (`/api/draft/invite`, `/api/draft/join`). **Gaps**: in-app co-cook role permissions (editor vs viewer); sub-step field-level presence dots; change feed log panel; scheduled publishing; version history/restore.

---

## Prioritisation Guide

Each issue is tagged with **Value** (how much the user benefits) and **Effort** (implementation cost), both on a 1–3 scale:

| Score | Value (user impact) | Effort (dev cost) |
|-------|--------------------|--------------------|
| 🟢 1 | Nice-to-have | Quick — a few hours |
| 🟡 2 | Meaningful improvement | Moderate — 1–2 days |
| 🔴 3 | Core to the pillar's goal | Heavy — 2–3+ days |

**Priority labels** derived from the combination:

| Label | Meaning | Criteria |
|-------|---------|----------|
| 🏆 **Quick Win** | High value, low effort — do these first | Value ≥ 2, Effort = 1 |
| ⭐ **High Value** | Worth the effort — schedule next | Value = 3, any Effort |
| 🔧 **Foundation** | Enables other tasks — do early | Prerequisite for ≥ 2 other issues |
| 💎 **Nice-to-Have** | Polish — do if time allows | Value = 1, or Effort > Value |


## Pillar 1 · Gamification — Make Levelling Up Matter

### Phase 1 — Unlock system & progress visibility _(Sep 2026)_

| # | Issue | Description | Scope |
|---|-------|-------------|-------|
| G-01 | **Define reward tiers model** | Create a `Reward` Prisma model: `id`, `type` (`title` / `card-accent` / `badge-frame`), `unlocksAtLevel`, `name`, `previewImageUrl`, `rarity`. Seed ~20 rewards spanning levels 5–500. | Backend |
| G-02 | **Profile titles** | Add `activeTitle` field on `User`. Let users pick from unlocked titles (e.g. *Sous Chef*, *Flavour Alchemist*). Display below username on `ProfileHeader` and on `RecipeCard` author line. | Full-stack |
| G-03 | **Recipe card accent themes** | Unlock subtle card border / accent colours at level milestones. 6–8 tasteful palettes. Store `activeCardTheme` on `User`; apply via Tailwind class on recipe cards. | Full-stack |
| G-04 | **Badge frame unlocks** | Unlock decorative frames around the profile avatar at certain levels (bronze ring at L25, silver at L100, gold at L250). CSS-only, rendered on `ProfileHeader`. | Full-stack |
| G-05 | **"Unlocks" section on profile** | Collapsible section below the badge shelf showing all rewards: earned (full colour) vs locked (silhouette + "Level X"). Clean grid, same aesthetic as badge shelf. | Frontend |
| G-06 | **Progress-to-next indicators** | On the unlocks section and badge shelf, show subtle progress hints — "3 more recipes to Level 100 badge". Utility that maps current level → next milestone delta. | Frontend |
| G-07 | **Level-up celebration modal** | When `badge_forge` returns a new level that crosses a reward tier, show a polished modal revealing the reward. Auto-dismiss 4 s. Reuse confetti from `Badge.tsx`. | Frontend |

### Phase 2 — Engagement loops & challenge tracking _(Oct 2026)_

| # | Issue | Description | Scope |
|---|-------|-------------|-------|
| G-08 | **Audit & redesign weekly challenges** | Review all existing `WeeklyChallenge` entries. Remove or rework weak ones (e.g. "Without soja"). Every challenge should feel original and exciting to complete — think creative constraints, not arbitrary exclusions. Document the curated list and design principles for future challenges. | Content + Backend |
| G-09 | **Centralise challenge criteria in `badge_forge`** | Move challenge evaluation logic entirely into `badge_forge`. Add a `challenges.json` config file in the Rust service defining each challenge's auto-evaluation criteria (e.g. `{ "type": "ingredient", "match": "contains", "value": "avocado" }` or `{ "type": "cuisine", "match": "equals", "value": "Japanese" }`). On recipe publish, Next.js calls `badge_forge` with the recipe data; `badge_forge` evaluates against the active challenge window and criteria. This keeps responsibility ownership clean — `badge_forge` owns all gamification evaluation. | Rust + Backend |
| G-10 | **`WeeklyChallengeEntry` tracking** | Add a `WeeklyChallengeEntry` Prisma model (or embedded array on `WeeklyChallenge`) to persist which users participated and which recipe fulfilled the challenge. `badge_forge` writes entries via MongoDB after evaluation. | Backend + Rust |
| G-11 | **Challenge completion badges** | Award a `challenge_completed` badge (tiered: 1 / 5 / 15 challenges completed). `badge_forge` checks the count of `WeeklyChallengeEntry` records for the user after each evaluation. | Rust |
| G-12 | **Challenge progress on banner** | On `WeeklyChallenge.tsx`, show "You've participated ✓" or "Submit a recipe to join" based on participation state from `WeeklyChallengeEntry`. | Frontend |
| G-13 | **Streak rewards at milestones** | At 7 / 14 / 30 / 60 / 100-day streaks, award bonus level points + a streak-specific badge frame. Extend `badge_forge` streak logic. | Backend + Rust |
| G-14 | **Broaden streak-eligible actions** | Count commenting, quest interaction, and recipe voting as daily activity alongside recipe creation. Make configurable in `badge_forge`. | Backend + Rust |
| G-15 | **Time-scoped leaderboard tabs** | Add "This week" / "This month" / "All time" tabs on `/top-jorbiters`. Track deltas via a lightweight `LevelSnapshot` collection or computed on read. | Full-stack |

### Phase 3 — Seasonal automation & social proof _(Nov–Dec 2026)_

| # | Issue | Description | Scope |
|---|-------|-------------|-------|
| G-16 | **Admin role on `User`** | Add an `isAdmin` boolean (or `role` enum) on the `User` model. Gate admin-only API routes behind a middleware check. Prerequisite for G-18. | Backend |
| G-17 | **`SeasonalEvent` Prisma model** | Create model with: `id`, `name`, `description`, `badgeSlug`, `criteria` (JSON — same schema as `challenges.json` criteria from G-09), `startDate`, `endDate`, `isActive`. Replace the current approach of storing event context in markdown with structured fields that `badge_forge` can evaluate. | Backend |
| G-18 | **Seasonal badge auto-evaluation in `badge_forge`** | On recipe publish, `badge_forge` also checks active `SeasonalEvent` windows and evaluates criteria (reusing the same engine from G-09). Awards the event badge automatically. Replaces manual CLI `assign-badge`. | Rust |
| G-19 | **Admin UI for seasonal events** | Simple admin-only page (`/admin/events`) to create/edit `SeasonalEvent` entries: name, badge asset upload, criteria builder (dropdowns for type + match + value), date range picker. Minimalist form — not a full CMS. | Frontend |
| G-20 | **Level flair on recipe cards** | Tiny level indicator on recipe cards in feeds. Only for level ≥ 10 to avoid clutter. 16 px reuse of existing level display. | Frontend |
| G-21 | **Achievement share cards** | Generate an OG-image–sized card when a badge is earned. One-tap share to socials. Use `@vercel/og` or canvas endpoint. | Full-stack |
| G-22 | **"Featured Jorbiter" rotation** | Automated weekly pick (most level-points gained that week) displayed on the Explore hero area. Cached in Redis. | Full-stack |
| G-23 | **Badge categorisation in UI** | On the profile badge shelf, add subtle category tabs or group dividers: Milestones / Streaks / Quests / Events / Voting. Helps badge-heavy profiles stay readable. | Frontend |

---

## Pillar 2 · Search Engine — Find Any Recipe by What You Have

### Phase 1 — Ingredient-first search _(Sep 2026)_

| # | Issue | Description | Scope |
|---|-------|-------------|-------|
| S-01 | **Add MongoDB indexes on Recipe** | Create Prisma-level indexes on `title`, `categories`, `recipeCuisine`, `createdAt`, `numLikes`, `averageRating`. Eliminates full collection scans for every search and sort. | Backend |
| S-02 | **Ingredient normalisation on save** | On recipe creation/edit, normalise each entry in the `ingredients` `String[]`: lowercase, trim, strip quantities (extract the ingredient name token). Store a parallel `ingredientsNormalized` `String[]` field. | Backend |
| S-03 | **Distinct ingredients endpoint** | `GET /api/ingredients/distinct` — return all unique normalised ingredient names (cached in Redis, refreshed hourly). Powers autocomplete. | Backend |
| S-04 | **Ingredient autocomplete component** | As the user types in ingredient mode, fetch suggestions from S-03 (debounced, top 8). Client-side fuzzy filter for snappiness. Standalone reusable chip-input component. | Frontend |
| S-05 | **Ingredient-match query API** | New Prisma query path: given `include[]` and optional `exclude[]` ingredients, find recipes where `ingredientsNormalized` has all/most included items and none of the excluded. Sort by match % (matched / total). | Backend |
| S-06 | **Match indicator on result cards** | On recipe cards, show a subtle "4/5 ingredients" pill so users see what's missing when viewing ingredient-matched results. | Frontend |
| S-07 | **"Search by ingredients" toggle in search UI** | Wire S-04 (autocomplete input), S-05 (match API), and S-06 (card indicator) into the main search bar with a **Text** ↔ **Ingredients** toggle. Preserves minimalist navbar footprint. | Frontend |

### Phase 2 — Expand search to description + new filters _(Oct 2026)_

| # | Issue | Description | Scope |
|---|-------|-------------|-------|
| S-08 | **Search description + ingredients** | Extend the text search query to also match on `description` and `ingredients` (not just `title`). Use `OR` clause with Prisma `contains`. | Backend |
| S-09 | **Cooking time filter** | Add `totalTime` (or `prepTime + cookTime`) to the Recipe model if missing, and expose as a time range selector in search filters: ≤ 15 / ≤ 30 / ≤ 60 / 60+ min. | Full-stack |
| S-10a | **Define canonical dietary tags list** | Define a closed, deterministic set of dietary tags as a shared constant (e.g. `DIETARY_TAGS = ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "egg-free", "sugar-free", "keto", "paleo", "low-carb"]`). Store in a shared config importable by both the Next.js app and `tagatoni`. Add `dietaryTags String[] @default([])` field on Recipe. This list is the single source of truth — `tagatoni` must only output values from it. | Backend |
| S-10b | **`tagatoni` dietary tag enrichment** | Update `tagatoni` to classify existing recipes against the canonical tags list. Provide the exact allowed values in the Gemini AI prompt to ensure deterministic output. Run as a batch migration for existing recipes; on new recipes, evaluate on publish. | Rust (tagatoni) |
| S-10c | **Dietary tags filter in search UI** | Expose `dietaryTags` as multi-select filter pills in the search bar / advanced filters. Query with `dietaryTags: { hasEvery: [...selected] }`. | Frontend |
| S-11 | **Multi-category selection** | Allow selecting more than 1 category at a time. Change filter query from `has` to `hasSome`. Update URL state to support arrays. | Full-stack |
| S-12 | **Allergen exclusion filter** | Add `allergens` `String[]` field on Recipe. Let users exclude allergens via a "hide recipes with…" toggle group. | Full-stack |

### Phase 3 — Discovery & delight _(Nov–Dec 2026)_

| # | Issue | Description | Scope |
|---|-------|-------------|-------|
| S-13 | **Recent searches** | Persist last 10 searches per user in `localStorage`. Show as subtle chips below the search bar on focus. Clear-all button. | Frontend |
| S-14 | **Trending searches** | Track anonymised search queries server-side (rolling 7-day window, Redis sorted set). Show top 5 as ghost-text or pills when search is empty. | Full-stack |
| S-15 | **"What can I cook?" page** | Dedicated page where user enters everything in their fridge → results ranked by fewest missing ingredients. Reuses S-06. Prominent CTA on Explore. | Frontend |
| S-16 | **Search empty state redesign** | When no results: suggest relaxing filters, switching to ingredient mode, or browsing trending. Friendly illustration + actionable pills. | Frontend |
| S-17 | **Saved filter presets** | Let users save a filter combination (e.g. "Quick vegan dinners") to their profile. Small dropdown on the search bar. Stored as JSON on User or `SavedSearch` model. | Full-stack |

---

## Pillar 3 · Drafts & Collaborative Editing — Work on Many Recipes at Once

### Phase 1 — Surface multi-draft in the UI _(Sep 2026)_

The backend already supports multiple shared drafts via `user:drafts:{userId}` and `GET /api/draft/active`. The gap is entirely in the frontend.

| # | Issue | Description | Scope | Status |
|---|-------|-------------|-------|:------:|
| D-01 | **Multi-slot solo drafts backend** | Change the solo draft Redis key from `draft:user:{userId}` to `draft:user:{userId}:{slotId}`. Add the slot to the `user:drafts:{userId}` set. Cap at 5 solo draft slots per user. Backward-compatible with existing solo drafts. | Backend | ✅ Completed (PR #1642) |
| D-02 | **Draft metadata & title utilities** | Add helper utilities: auto-generate a scannable placeholder (e.g. *"Untitled — Pasta"*, *"Untitled — 3 ingredients"*) when title is empty; calculate draft TTL remaining from Redis (e.g. "Expires in 5 days" for shared, "No expiry" for solo, amber warning when < 24 h). | Frontend | ✅ Completed (PR #1642) |
| D-03 | **Draft card component & quick actions** | Build reusable draft card component displaying title, last edited timestamp, step completion progress pills, co-cook avatars, and TTL badge. Add quick actions on each card: Delete (`DELETE /api/draft`), Duplicate (clone draft payload in Redis). Hover on desktop, swipe on mobile. | Frontend | ✅ Completed (PR #1642) |
| D-04 | **"New draft" creation action** | Add helper / action to initialize a fresh solo or shared draft in a new Redis slot and navigate directly into the `RecipeModal` wizard with the new `draftId`. | Frontend | ✅ Completed (PR #1642) |
| D-05 | **Drafts dashboard modal UI** | Unified `DraftsModal` dashboard. Clean card grid assembling D-03 cards from `GET /api/draft/active`, "New draft" button (D-04), quota counter ("X/5 solo drafts"), and empty state. Seamless in-app switching without full-page navigation context loss. | Frontend | ✅ Completed (PR #1642) |
| D-06 | **Navigation entry point to drafts** | Added "My Drafts" action in `UserMenu` dropdown with dynamic active count badge, and a "My Drafts" button in `RecipeModalTopActions` for switching active drafts mid-edit. | Frontend | ✅ Completed (PR #1642) |
| D-07 | **Remove `DraftRecoveryDialog`** | With the drafts dashboard live and navigation connected (D-06), safely remove the legacy binary recovery dialog. | Frontend | ✅ Completed (PR #1642) |

### Phase 2 — Collaboration UX improvements _(Oct–Nov 2026)_

| # | Issue | Description | Scope | Status |
|---|-------|-------------|-------|:------:|
| D-08 | **In-app invite management** | Instead of only clipboard-copied links, add an in-modal panel to see pending/active co-cooks, copy/regenerate invite link, and remove co-cooks. Reuse `RelatedContentStep` patterns. | Frontend | ⏳ Pending |
| D-09 | **Conflict notification toast** | When SWR sync detects a field was changed by a co-cook on the step the user is currently editing, show a subtle inline toast: "Maria updated ingredients — tap to refresh". Non-blocking. | Frontend | ⏳ Pending |
| D-10 | **Co-cook role management** | Allow the draft owner to toggle co-cook permissions (editor / viewer) from the in-app invite panel (D-08). Viewer can browse but inputs are disabled. | Full-stack | ⏳ Pending |
| D-11 | **Field-level presence indicators** | Augment step-level locking with sub-step field granularity. Track which specific field (title, description, ingredient row N, step row N) a co-cook is editing. Show a coloured dot + tiny avatar next to the active field. Use the existing Redis lock key pattern: `lock:recipe:{id}:field:ingredient:{index}`. | Full-stack | ⏳ Pending |
| D-12 | **Change feed panel** | Slim collapsible panel in `RecipeModal` listing recent edits: "Ana added 'garlic' — 2 min ago". Populated from a lightweight `edit:{draftId}` Redis list (capped at last 30 events, TTL = draft TTL). | Full-stack | ⏳ Pending |

### Phase 3 — History, scheduling & polish _(Nov–Dec 2026)_

| # | Issue | Description | Scope | Status |
|---|-------|-------------|-------|:------:|
| D-13 | **Scheduled recipe publication** | Add a `scheduledPublishAt` `DateTime?` field on Recipe. In the final step of the recipe wizard, let the user pick a future date/time to publish instead of publishing immediately. Once scheduled, the recipe is locked from editing (show a "Scheduled for Oct 15" badge on the draft card). User can undo the scheduling to re-enable editing. | Full-stack | ⏳ Pending |
| D-14 | **Scheduled publication cron job** | GitHub Actions cron (daily at 06:00 UTC) that calls `POST /api/recipes/publish-scheduled` with `CRON_SECRET`. The endpoint queries recipes where `scheduledPublishAt <= now()` and `status = "draft"`, publishes them (status → published, trigger `badge_forge` level recalc, invalidate Redis cache), and sends a push notification to the author: "Your recipe is now live!". | Backend + CI | ⏳ Pending |
| D-15 | **Version snapshots** | Auto-save a full draft snapshot to a `RecipeVersion` Prisma model every 10 meaningful field changes or on manual "Save version". Store `recipeId` (or `draftId`), `data` (JSON), `createdBy`, `createdAt`, `label?`. Cap at 50 versions. | Backend | ⏳ Pending |
| D-16 | **Version history viewer** | Timeline rail in the editor sidebar with dots per version. Click → inline diff view (text diff for description/steps, list diff for ingredients). Minimal UI. | Frontend | ⏳ Pending |
| D-17 | **Restore version** | One-click restore. Auto-creates a snapshot of the current state first. | Full-stack | ⏳ Pending |
| D-18 | **Draft status labels** | Optional labels on draft cards: *In Progress*, *Ready for Review*, *Needs Photos*, *Scheduled*. Useful when author and photographer are different co-cooks. | Full-stack | ⏳ Pending |
| D-19 | **Offline draft editing** | Cache the active draft in IndexedDB via a service worker. Queue saves and sync to Redis when back online. Subtle "offline — changes will sync" indicator. | Frontend | ⏳ Pending |

---

## Cross-cutting & Infrastructure

| # | Issue | When | Description | Scope |
|---|-------|------|-------------|-------|
| X-01a | **`Notification` Prisma model** | Sep | Create model: `id`, `userId` (relation to User), `type` (enum: `BADGE_EARNED`, `LEVEL_MILESTONE`, `CO_COOK_JOINED`, `CHALLENGE_PROGRESS`, `QUEST_ACCEPTED`, `LIKE`, `COMMENT`, `REPLY`, `VOTING`), `title`, `body`, `imageUrl?`, `actionUrl` (deep-link — e.g. `/profile/abc#badges`, `/quests/xyz`, `/recipes/abc`), `isRead` (Boolean, default false), `createdAt`. Index on `[userId, isRead, createdAt]`. Keep push notifications (via `jorbites-notifier`) as-is for real-time delivery; this model stores a persistent copy for in-app history. | Backend |
| X-01b | **Write notifications on events** | Sep | When `jorbites-notifier` sends a push, *also* write a `Notification` document to MongoDB. Extend the `POST /notify` flow in the Next.js API (or add a webhook from `jorbites-notifier`) to create the DB record. This is the single write path — no dual-write needed from individual features. | Backend |
| X-01c | **Notifications API** | Sep | `GET /api/notifications?page=1&limit=20` — paginated, sorted by `createdAt desc`, filterable by `isRead`. `PATCH /api/notifications/[id]/read` — mark single as read. `PATCH /api/notifications/read-all` — mark all as read. `GET /api/notifications/unread-count` — returns count (cached in Redis, invalidated on write). | Backend |
| X-01d | **Notification bell inside UserMenu** | Oct | Since the top bar is crowded, embed notifications *inside* the existing `UserMenu` dropdown: add a "Notifications" row at the top of the menu with an unread count badge (red dot if > 0). Clicking it opens a slide-over panel (or replaces the dropdown content) showing the notification list. On mobile, the same panel is accessible from the profile tab in the bottom nav — add a red dot badge on the profile icon when unread > 0. No new navbar icon needed. | Frontend |
| X-01e | **Notification click routing** | Oct | Each notification card in the list is tappable. On click: navigate to `actionUrl`, mark notification as read (optimistic UI — update local state immediately, fire `PATCH` in background). Group consecutive notifications of the same type (e.g. "3 people liked your recipe") to keep the list scannable. | Frontend |
| X-02 | **Analytics event bus** | Oct | Track key actions (search query, ingredient search, challenge participation, draft created, collab joined) via Kafka topic or Redis stream. Feed into trending + gamification. | Backend |
| X-03 | **A11y audit** | Ongoing | Every new component (modals, tag-inputs, drawers, filter pills, presence dots) must meet WCAG 2.1 AA. Keyboard nav, screen reader labels, contrast. | Frontend |
| X-04 | **Mobile gesture polish** | Nov | Audit swipe actions (draft cards), pull-to-refresh, and bottom-sheet interactions on iOS Safari + Android Chrome. | Frontend |
| X-05 | **Performance budget** | Ongoing | Lighthouse: FCP < 1.5 s, TTI < 3 s. Lazy-load new features behind `next/dynamic`. Monitor via Axiom + Vercel Speed Insights. | Frontend |

---

## Prioritisation Matrix

> Scan this table to understand the user value vs. implementation effort. **🏆 Quick Wins**, **⭐ High Value**, **🔧 Foundation**, and **💎 Nice-to-Have**.

### Gamification

| # | Issue | Value | Effort | Priority |
|---|-------|:-----:|:------:|----------|
| G-01 | Define reward tiers model | 🔴 3 | 🟡 2 | 🔧 Foundation — prerequisite for G-02 through G-07 |
| G-02 | Profile titles | 🔴 3 | 🟡 2 | ⭐ High Value — visible payoff for levelling up |
| G-03 | Recipe card accent themes | 🟡 2 | 🟡 2 | ⭐ High Value — social proof in feeds |
| G-04 | Badge frame unlocks | 🟡 2 | 🟢 1 | 🏆 Quick Win — CSS-only, high visibility |
| G-05 | "Unlocks" section on profile | 🔴 3 | 🟡 2 | ⭐ High Value — shows users what to aim for |
| G-06 | Progress-to-next indicators | 🔴 3 | 🟢 1 | 🏆 Quick Win — simple utility, drives engagement |
| G-07 | Level-up celebration modal | 🟡 2 | 🟢 1 | 🏆 Quick Win — reuses existing confetti |
| G-08 | Audit & redesign weekly challenges | 🔴 3 | 🟢 1 | 🏆 Quick Win — content review, no code risk |
| G-09 | Centralise challenge criteria in `badge_forge` | 🔴 3 | 🔴 3 | 🔧 Foundation — enables G-10, G-11, G-18 |
| G-10 | `WeeklyChallengeEntry` tracking | 🟡 2 | 🟡 2 | ⭐ High Value — unlocks challenge participation data |
| G-11 | Challenge completion badges | 🟡 2 | 🟢 1 | 🏆 Quick Win — simple count check in `badge_forge` |
| G-12 | Challenge progress on banner | 🟡 2 | 🟢 1 | 🏆 Quick Win — small UI change, big feedback loop |
| G-13 | Streak rewards at milestones | 🟡 2 | 🟡 2 | ⭐ High Value — motivates consistency |
| G-14 | Broaden streak-eligible actions | 🟢 1 | 🟡 2 | 💎 Nice-to-Have — incremental improvement |
| G-15 | Time-scoped leaderboard tabs | 🟡 2 | 🟡 2 | ⭐ High Value — makes leaderboard dynamic |
| G-16 | Admin role on `User` | 🟢 1 | 🟢 1 | 🔧 Foundation — prerequisite for G-19 |
| G-17 | `SeasonalEvent` Prisma model | 🟡 2 | 🟢 1 | 🔧 Foundation — prerequisite for G-18, G-19 |
| G-18 | Seasonal badge auto-evaluation | 🔴 3 | 🟡 2 | ⭐ High Value — eliminates manual CLI work |
| G-19 | Admin UI for seasonal events | 🟡 2 | 🟡 2 | ⭐ High Value — admin portal |
| G-20 | Level flair on recipe cards | 🟢 1 | 🟢 1 | 💎 Nice-to-Have — subtle polish |
| G-21 | Achievement share cards | 🟡 2 | 🟡 2 | 💎 Nice-to-Have — growth feature, not core |
| G-22 | "Featured Jorbiter" rotation | 🟢 1 | 🟡 2 | 💎 Nice-to-Have |
| G-23 | Badge categorisation in UI | 🟢 1 | 🟢 1 | 💎 Nice-to-Have — only matters with many badges |

### Search

| # | Issue | Value | Effort | Priority |
|---|-------|:-----:|:------:|----------|
| S-01 | Add MongoDB indexes on Recipe | 🔴 3 | 🟢 1 | 🏆 Quick Win — zero UI work, fixes perf for every query |
| S-02 | Ingredient normalisation on save | 🔴 3 | 🟡 2 | 🔧 Foundation — prerequisite for S-03 through S-07 |
| S-03 | Distinct ingredients endpoint | 🟡 2 | 🟢 1 | 🏆 Quick Win — powers autocomplete |
| S-04 | Ingredient autocomplete component | 🔴 3 | 🟢 1 | 🏆 Quick Win — reusable chip input component |
| S-05 | Ingredient-match query API | 🔴 3 | 🟡 2 | ⭐ High Value — the engine behind ingredient search |
| S-06 | Match indicator on result cards | 🟡 2 | 🟢 1 | 🏆 Quick Win — "4/5 ingredients" pill on cards |
| S-07 | "Search by ingredients" toggle in search UI | 🔴 3 | 🟡 2 | ⭐ High Value — connects ingredient search to users |
| S-08 | Search description + ingredients | 🔴 3 | 🟢 1 | 🏆 Quick Win — one Prisma `OR` clause |
| S-09 | Cooking time filter | 🟡 2 | 🟢 1 | 🏆 Quick Win — field exists, just wire it |
| S-10a | Define canonical dietary tags list | 🟡 2 | 🟢 1 | 🔧 Foundation — prerequisite for S-10b, S-10c |
| S-10b | `tagatoni` dietary tag enrichment | 🟡 2 | 🟡 2 | ⭐ High Value — populates data for filters |
| S-10c | Dietary tags filter in search UI | 🟡 2 | 🟢 1 | 🏆 Quick Win — filter pills in search bar |
| S-11 | Multi-category selection | 🟡 2 | 🟢 1 | 🏆 Quick Win — change `has` to `hasSome` |
| S-12 | Allergen exclusion filter | 🟡 2 | 🟡 2 | ⭐ High Value — safety + inclusivity |
| S-13 | Recent searches | 🟡 2 | 🟢 1 | 🏆 Quick Win — localStorage only, no backend |
| S-14 | Trending searches | 🟢 1 | 🟡 2 | 💎 Nice-to-Have — needs analytics pipeline |
| S-15 | "What can I cook?" page | 🔴 3 | 🟢 1 | 🏆 Quick Win — reuses S-05 API, just a new page |
| S-16 | Search empty state redesign | 🟢 1 | 🟢 1 | 💎 Nice-to-Have — polish |
| S-17 | Saved filter presets | 🟢 1 | 🟡 2 | 💎 Nice-to-Have — power-user feature |

### Drafts & Collaboration

| # | Issue | Value | Effort | Priority | Status |
|---|-------|:-----:|:------:|----------|:------:|
| D-01 | Multi-slot solo drafts backend | 🔴 3 | 🟢 1 | 🔧 Foundation — Redis key update, backwards-compatible | ✅ Completed (PR #1642) |
| D-02 | Draft metadata & title utilities | 🟡 2 | 🟢 1 | 🏆 Quick Win — auto-title placeholder + TTL helper | ✅ Completed (PR #1642) |
| D-03 | Draft card component & quick actions | 🟡 2 | 🟢 1 | 🏆 Quick Win — card UI with delete/duplicate actions | ✅ Completed (PR #1642) |
| D-04 | "New draft" creation action | 🟡 2 | 🟢 1 | 🏆 Quick Win — action to open modal with new slot | ✅ Completed (PR #1642) |
| D-05 | Drafts dashboard modal / UI | 🔴 3 | 🟡 2 | ⭐ High Value — unified DraftsModal dashboard | ✅ Completed (PR #1642) |
| D-06 | Navigation entry point to drafts | 🔴 3 | 🟢 1 | 🏆 Quick Win — routes navbar/menu to drafts modal | ✅ Completed (PR #1642) |
| D-07 | Remove `DraftRecoveryDialog` | 🟢 1 | 🟢 1 | 🏆 Quick Win — safely delete legacy dialog | ✅ Completed (PR #1642) |
| D-08 | In-app invite management | 🟡 2 | 🟡 2 | ⭐ High Value — better collab onboarding in modal | ⏳ Pending |
| D-09 | Conflict notification toast | 🟡 2 | 🟢 1 | 🏆 Quick Win — SWR diff check + inline alert | ⏳ Pending |
| D-10 | Co-cook role management | 🟢 1 | 🟢 1 | 💎 Nice-to-Have — editor/viewer toggle | ⏳ Pending |
| D-11 | Field-level presence indicators | 🟡 2 | 🔴 3 | 💎 Nice-to-Have — complex for incremental gain | ⏳ Pending |
| D-12 | Change feed panel | 🟢 1 | 🟡 2 | 💎 Nice-to-Have — collapsible log in modal | ⏳ Pending |
| D-13 | Scheduled recipe publication | 🔴 3 | 🟡 2 | ⭐ High Value — unique feature for creators | ⏳ Pending |
| D-14 | Scheduled publication cron job | 🔴 3 | 🟢 1 | 🏆 Quick Win — GitHub Actions daily cron + API | ⏳ Pending |
| D-15 | Version snapshots | 🟡 2 | 🟡 2 | ⭐ High Value — safety net for collab edits | ⏳ Pending |
| D-16 | Version history viewer | 🟡 2 | 🔴 3 | 💎 Nice-to-Have — complex diff UI | ⏳ Pending |
| D-17 | Restore version | 🟡 2 | 🟢 1 | 🏆 Quick Win — rollback action (needs D-15) | ⏳ Pending |
| D-18 | Draft status labels | 🟢 1 | 🟢 1 | 💎 Nice-to-Have — collab workflow tags | ⏳ Pending |
| D-19 | Offline draft editing | 🟢 1 | 🔴 3 | 💎 Nice-to-Have — heavy effort, edge case | ⏳ Pending |

### Cross-cutting

| # | Issue | Value | Effort | Priority |
|---|-------|:-----:|:------:|----------|
| X-01a | `Notification` Prisma model | 🟡 2 | 🟢 1 | 🔧 Foundation — prerequisite for all X-01 |
| X-01b | Write notifications on events | 🟡 2 | 🟢 1 | 🔧 Foundation — event persistence |
| X-01c | Notifications API | 🟡 2 | 🟢 1 | 🔧 Foundation — GET, mark read, unread count |
| X-01d | Notification bell inside UserMenu | 🟡 2 | 🟡 2 | ⭐ High Value — visible user feedback |
| X-01e | Notification click routing | 🟡 2 | 🟢 1 | 🏆 Quick Win — deep link navigation on click |
| X-02 | Analytics event bus | 🟢 1 | 🟡 2 | 💎 Nice-to-Have — supports trending, not blocking |
| X-03 | A11y audit | 🟡 2 | 🟢 1 | 🏆 Quick Win — do alongside each new component |
| X-04 | Mobile gesture polish | 🟢 1 | 🟢 1 | 💎 Nice-to-Have |
| X-05 | Performance budget | 🟡 2 | 🟢 1 | 🏆 Quick Win — set targets, monitor |

---

## Suggested Execution Order (Production-Safe & Deployable)

> [!IMPORTANT]
> **Production-Safe CI/CD Principle**: Every issue in this order is an atomic, self-contained PR that is safe to merge and deploy directly to production. Prerequisite models, APIs, and components are always deployed *before* user-facing navigation redirects or dependent pages, guaranteeing zero 404s and zero broken states.

```
                  ┌─────────────────────────────────────────────────────────────┐
                  │ SPRINT 1: Zero-Dependency Quick Wins (Immediate Value)      │
                  │   S-01 ──▶ S-08 ──▶ S-09 ──▶ S-11 ──▶ S-13 ──▶ G-08 ──▶ G-15│
                  └──────────────────────────────┬──────────────────────────────┘
                                                 │
                                                 ▼
                  ┌─────────────────────────────────────────────────────────────┐
                  │ SPRINT 2: Multi-Draft Dashboard [COMPLETED ✅ — PR #1642]    │
                  │   D-01 ──▶ D-02 ──▶ D-03 ──▶ D-04 ──▶ D-05 ──▶ D-06 ──▶ D-07│
                  └──────────────────────────────┬──────────────────────────────┘
                                                 │
                                                 ▼
                  ┌─────────────────────────────────────────────────────────────┐
                  │ SPRINT 3: Ingredient Search & "What Can I Cook?"            │
                  │   S-02 ──▶ S-03 ──▶ S-04 ──▶ S-05 ──▶ S-06 ──▶ S-07 ──▶ S-15│
                  └──────────────────────────────┬──────────────────────────────┘
                                                 │
                                                 ▼
                  ┌─────────────────────────────────────────────────────────────┐
                  │ SPRINT 4: Level Unlocks & In-App Notifications              │
                  │   G-01 ──▶ G-02 ──▶ G-03 ──▶ G-04 ──▶ G-05 ──▶ G-06 ──▶ G-07│
                  │   X-01a ─▶ X-01b ─▶ X-01c ─▶ X-01d ─▶ X-01e                 │
                  └──────────────────────────────┬──────────────────────────────┘
                                                 │
                                                 ▼
                  ┌─────────────────────────────────────────────────────────────┐
                  │ SPRINT 5: Challenge Centralisation & Dietary AI Enrichment  │
                  │   G-09 ──▶ G-10 ──▶ G-11 ──▶ G-12 ──▶ G-13                  │
                  │   S-10a ─▶ S-10b ─▶ S-10c ─▶ S-12                           │
                  └──────────────────────────────┬──────────────────────────────┘
                                                 │
                                                 ▼
                  ┌─────────────────────────────────────────────────────────────┐
                  │ SPRINT 6: Collaboration, Scheduling & Seasonal Events       │
                  │   D-08 ──▶ D-09 ──▶ D-13 ──▶ D-14                           │
                  │   G-16 ──▶ G-17 ──▶ G-18 ──▶ G-19                           │
                  └──────────────────────────────┬──────────────────────────────┘
                                                 │
                                                 ▼
                  ┌─────────────────────────────────────────────────────────────┐
                  │ SPRINT 7: History & Final Polish (Nice-to-Haves)            │
                  │   D-15 ──▶ D-17 ──▶ D-16 ──▶ D-18                           │
                  │   S-16 ──▶ S-17 ──▶ G-20..G-23 ──▶ X-03..X-05               │
                  └─────────────────────────────────────────────────────────────┘
```

---

### Step-by-Step Breakdown

#### **Sprint 1 — Zero-Dependency Quick Wins _(~1.5 weeks)_**
*Each task is 100% independent and delivers instant value to existing pages:*
1. **`S-01`**: Add MongoDB indexes on `Recipe` (Prisma) → *Instant search and sorting query speedup in production with 0 UI changes.*
2. **`S-08`**: Search `description` and `ingredients` in `getRecipes.ts` (Prisma `OR` clause) → *Instant search quality lift.*
3. **`S-09`**: Cooking time filter slider in `AdvancedFilters.tsx` and `getRecipes.ts` → *Instant filter capability.*
4. **`S-11`**: Multi-category selection (`hasSome` in `getRecipes.ts`) → *Fixes the 1-category limitation in search.*
5. **`S-13`**: Recent searches chip list in `SearchBar.tsx` (`localStorage`) → *Zero backend dependencies, instant search UX win.*
6. **`G-08`**: Audit & redesign weekly challenges (DB/content curation) → *Immediate challenge quality improvement without code risks.*
7. **`G-15`**: Time-scoped leaderboard tabs on `/top-jorbiters` (Week / Month / All Time) → *Self-contained page upgrade.*

#### **Sprint 2 — Multi-Draft Dashboard _(COMPLETED ✅ — PR #1642)_**
*Strict deployable order: Backend → Utilities → Components → Dashboard Modal → Navigation Entry Points → Cleanup:*
- [x] **`D-01`**: Multi-slot solo drafts backend (Redis key `draft:user:{userId}:{slotId}` + `user:drafts:{userId}`, 5-slot quota) → *Backend safely supports up to 5 drafts per user with backward compatibility.*
- [x] **`D-02`**: Draft metadata utilities (Auto-title placeholder + TTL countdown helper + badge styling in `draftMetadata.ts`) → *Shared helpers in codebase.*
- [x] **`D-03`**: Draft card component & quick actions (`DraftCard.tsx`, `DraftProgressBar.tsx`, `DraftTTLBadge.tsx` with Delete & Duplicate) → *Component ready & tested.*
- [x] **`D-04`**: "New draft" creation action (Initialize slot in Redis & open wizard via `useDraftActions.ts`) → *Draft creation flow ready with quota validation.*
- [x] **`D-05`**: Drafts dashboard UI (`DraftsModal.tsx`) → *Unified dashboard assembling draft cards, solo/collab distinction, progress pills, and empty state.*
- [x] **`D-06`**: Navigation entry points ("My Drafts" with active count badge in `UserMenu.tsx`, and in `RecipeModalTopActions.tsx`) → *Seamless draft switching without modal lock-in.*
- [x] **`D-07`**: Remove obsolete `DraftRecoveryDialog` → *Cleaned up legacy recovery popup now that the dashboard handles draft selection.*

#### **Sprint 3 — Ingredient Search & "What Can I Cook?" _(~2.5 weeks)_**
*Strict deployable order: Schema → API → Input Component → Query Engine → Card Pill → Main Search Integration → Fridge Page:*
1. **`S-02`**: Ingredient normalisation on save (`ingredientsNormalized String[]` field on Recipe) → *Pipeline populates clean data.*
2. **`S-03`**: Distinct ingredients endpoint (`GET /api/ingredients/distinct` + Redis cache) → *Autocomplete endpoint live.*
3. **`S-04`**: Ingredient autocomplete chip input component → *Reusable input component ready.*
4. **`S-05`**: Ingredient-match query API (`GET /api/recipes/search/by-ingredients` with match % scoring) → *Search API live.*
5. **`S-06`**: Match indicator on result cards ("4/5 ingredients" pill on `RecipeCard`) → *Visual component ready.*
6. **`S-07`**: "Search by ingredients" toggle in search UI (Integrates S-04, S-05, S-06) → *Feature fully live in navbar!*
7. **`S-15`**: "What can I cook?" fridge page (`/recipes/whats-in-my-fridge` reusing S-05 API) → *Dedicated discovery page live!*

#### **Sprint 4 — Level Unlocks & In-App Notifications _(~3 weeks)_**
*Strict deployable order: Database Models → Visual Elements → Showcase UI → Event Persistence → In-App Bell & Panel:*
1. **`G-01`**: Define `Reward` Prisma model & seed levels 5–500 → *Database model and rewards inventory ready.*
2. **`G-02`**: Profile titles (`activeTitle` on `User` + display on `ProfileHeader` & `RecipeCard`) → *First unlockable live.*
3. **`G-03`**: Recipe card accent themes (`activeCardTheme` + CSS palettes) → *Second unlockable live.*
4. **`G-04`**: Badge frame unlocks (CSS avatar frames on profile) → *Third unlockable live.*
5. **`G-05`**: "Unlocks" section on profile (`/profile/[userId]` collapsible rewards grid) → *Profile showcase page live.*
6. **`G-06`**: Progress-to-next indicators (Milestone delta hints on profile & badge shelf) → *Engagement feedback live.*
7. **`G-07`**: Level-up celebration modal (Popup with reward reveal & confetti on level-up) → *Level-up moment celebrated!*
8. **`X-01a`**: `Notification` Prisma model & indexes → *Database schema ready.*
9. **`X-01b`**: Write notification records on events (`POST /notify` persistence in MongoDB) → *Event persistence live.*
10. **`X-01c`**: Notifications API (`GET /api/notifications`, `PATCH /read`, `GET /unread-count`) → *API live.*
11. **`X-01d`**: Notification bell row inside `UserMenu` & mobile profile dot badge → *Entry point in UI live.*
12. **`X-01e`**: Notification slide-over panel & click routing (`actionUrl` navigation) → *Full notification centre live!*

#### **Sprint 5 — Challenge Centralisation & Dietary AI Enrichment _(~2.5 weeks)_**
1. **`G-09`**: Centralise challenge criteria in `badge_forge` (`challenges.json` in Rust) → *Rust engine ready.*
2. **`G-10`**: `WeeklyChallengeEntry` tracking (Prisma model + MongoDB write from `badge_forge`) → *Participation tracked.*
3. **`G-11`**: Challenge completion badges (Tiered badges 1/5/15 in `badge_forge`) → *Badges awarded automatically.*
4. **`G-12`**: Challenge progress banner on `WeeklyChallenge.tsx` → *Banner feedback live.*
5. **`G-13`**: Streak rewards at milestones (Bonus points + frames in `badge_forge`) → *Streak rewards live.*
6. **`S-10a`**: Define canonical `DIETARY_TAGS` list + `dietaryTags String[]` on Recipe → *Canonical source of truth.*
7. **`S-10b`**: `tagatoni` dietary tag enrichment (AI batch/event classification) → *Data populated.*
8. **`S-10c`**: Dietary tags filter in search UI (Multi-select pills) → *Filter live for users.*
9. **`S-12`**: Allergen exclusion filter (`allergens` field + toggle group) → *Safety filter live.*

#### **Sprint 6 — Collaboration, Scheduling & Seasonal Events _(~2.5 weeks)_**
1. **`D-08`**: In-app invite management (View/manage co-cooks in `RecipeModal`) → *Collab onboarding live.*
2. **`D-09`**: Conflict notification toast (SWR diff detection + "tap to refresh") → *Live collision alert.*
3. **`D-13`**: Scheduled recipe publication field & wizard UI (`scheduledPublishAt`) → *Scheduling UI live.*
4. **`D-14`**: Scheduled publication cron job (GitHub Actions cron + API handler) → *Automated publishing live.*
5. **`G-16`**: Admin role on `User` (`isAdmin` boolean + middleware) → *Admin auth ready.*
6. **`G-17`**: `SeasonalEvent` Prisma model → *Event model ready.*
7. **`G-18`**: Seasonal badge auto-evaluation in `badge_forge` → *Auto-awarding live.*
8. **`G-19`**: Admin UI for seasonal events (`/admin/events`) → *Admin portal live.*

#### **Sprint 7 — History, Polish & Nice-to-Haves _(Remaining Time)_**
*Non-critical items to pick from as time permits:*
1. **`D-15` & `D-17`**: Version snapshots model & one-click restore.
2. **`D-16`**: Version history viewer (Timeline diff view).
3. **`D-18`**: Draft status labels (*In Progress*, *Ready for Review*, etc.).
4. **`S-16`**: Search empty state redesign.
5. **`S-17`**: Saved filter presets.
6. **`G-20` through `G-23`**: Level flair, OG share cards, featured jorbiter, badge categorisation.
7. **`X-03` through `X-05`**: Accessibility audit, mobile gestures, performance budget.

---

## Timeline Overview

```
Sep 2026            Oct 2026            Nov 2026            Dec 2026
─────────────────── ─────────────────── ─────────────────── ───────────────────
Sprint 1 (QuickWins)Sprint 3 (Ingredient)Sprint 5 (Rust/AI)  Sprint 6 (Collab/Sched)
Sprint 2 [DONE ✅]  Sprint 4 (Unlocks+Notif)                Sprint 7 (Polish)
```

> **Total: 70 issues** organized into strict, dependency-safe deployable sequences.
> **Current Progress**: **7 / 70 issues completed (10%)** — Sprint 2 is 100% delivered in PR #1642.

---

## Remaining Tasks & Roadmap Next Steps

### Progress Summary by Pillar

| Pillar / Track | Completed | Pending | Total Issues | Completion % |
|---|:---:|:---:|:---:|:---:|
| **Pillar 1: Gamification** | 0 | 23 | 23 | 0% |
| **Pillar 2: Search** | 0 | 18 | 18 | 0% |
| **Pillar 3: Drafts & Collaboration** | **7** (Phase 1) | 12 (Phases 2 & 3) | 19 | **37%** |
| **Cross-cutting & Infrastructure** | 0 | 10 | 10 | 0% |
| **Overall** | **7** | **63** | **70** | **10%** |

### Remaining Sprints Breakdown

#### 1. **Sprint 1 — Zero-Dependency Quick Wins _(7 tasks pending)_**
*Immediate high-impact wins requiring 0 schema changes:*
- `S-01`: Add MongoDB indexes on `Recipe` (Prisma) — `title`, `createdAt`, `likesCount`, `category`, `cuisine`.
- `S-08`: Search `description` and `ingredients` in `getRecipes.ts` (Prisma `OR` clause).
- `S-09`: Cooking time filter slider in `AdvancedFilters.tsx` and `getRecipes.ts`.
- `S-11`: Multi-category selection (`hasSome` in `getRecipes.ts`).
- `S-13`: Recent searches chip list in `SearchBar.tsx` (`localStorage`).
- `G-08`: Audit & redesign weekly challenges (DB/content curation).
- `G-15`: Time-scoped leaderboard tabs on `/top-jorbiters` (Week / Month / All Time).

#### 2. **Sprint 3 — Ingredient Search & "What Can I Cook?" _(7 tasks pending)_**
*Transforms recipe discovery by matching available ingredients:*
- `S-02`: Ingredient normalisation on save (`ingredientsNormalized String[]` field on `Recipe`).
- `S-03`: Distinct ingredients endpoint (`GET /api/ingredients/distinct` + Redis cache).
- `S-04`: Ingredient autocomplete chip input component.
- `S-05`: Ingredient-match query API (`GET /api/recipes/search/by-ingredients` with match % scoring).
- `S-06`: Match indicator on result cards ("4/5 ingredients" pill on `RecipeCard`).
- `S-07`: "Search by ingredients" toggle in search UI (Integrates S-04, S-05, S-06).
- `S-15`: "What can I cook?" fridge page (`/recipes/whats-in-my-fridge` reusing S-05 API).

#### 3. **Sprint 4 — Level Unlocks & In-App Notifications _(12 tasks pending)_**
*Tangible rewards for levelling up and persistent in-app notifications:*
- `G-01` to `G-07`: `Reward` Prisma model & seeding, profile titles (`activeTitle`), recipe card accent themes, badge frame unlocks, unlocks section on profile, progress-to-next hints, level-up celebration modal with confetti.
- `X-01a` to `X-01e`: `Notification` Prisma model & indexes, event persistence via `POST /notify`, notifications API (`GET`, `PATCH /read`, `GET /unread-count`), notification bell row inside `UserMenu` & mobile profile dot badge, notification slide-over panel with click routing.

#### 4. **Sprint 5 — Challenge Centralisation & Dietary AI Enrichment _(9 tasks pending)_**
*Rust gamification microservice expansion and AI-powered dietary tags:*
- `G-09` to `G-13`: Centralise challenge criteria in `badge_forge` (`challenges.json` in Rust), `WeeklyChallengeEntry` tracking, tiered challenge completion badges (1/5/15), challenge progress banner on `WeeklyChallenge.tsx`, streak rewards at milestones.
- `S-10a` to `S-10c`: Canonical `DIETARY_TAGS` list + schema, `tagatoni` dietary tag enrichment, dietary tags filter in search UI.
- `S-12`: Allergen exclusion filter (`allergens` field + toggle group).

#### 5. **Sprint 6 — Collaboration, Scheduling & Seasonal Events _(8 tasks pending)_**
*Advanced collaborative workflows, scheduled publishing, and admin-driven events:*
- `D-08`: In-app invite management (view/manage active co-cooks in `RecipeModal`).
- `D-09`: Conflict notification toast (SWR diff detection + "tap to refresh").
- `D-13`: Scheduled recipe publication field & wizard UI (`scheduledPublishAt`).
- `D-14`: Scheduled publication cron job (GitHub Actions cron + API handler).
- `G-16` to `G-19`: Admin role on `User`, `SeasonalEvent` Prisma model, seasonal badge auto-evaluation in `badge_forge`, admin UI for seasonal events (`/admin/events`).

#### 6. **Sprint 7 — History, Polish & Nice-to-Haves _(11 tasks pending)_**
*Non-critical polish and advanced capabilities:*
- `D-15` to `D-18`: Version snapshots model, one-click restore, version history viewer, draft status labels.
- `S-16` & `S-17`: Search empty state redesign, saved filter presets.
- `G-20` to `G-23`: Level flair on recipe cards, achievement share cards, featured jorbiter rotation, badge categorisation.
- `X-03` to `X-05`: Accessibility audit, mobile gesture polish, performance budget.

---

### Recommended Immediate Next Step
1. **Option A (Quick Wins)**: Tackle **Sprint 1 (Zero-Dependency Quick Wins)**. These 7 tasks (`S-01`, `S-08`, `S-09`, `S-11`, `S-13`, `G-08`, `G-15`) can be completed rapidly without migrations or complex dependencies, providing immediate speed and search quality improvements.
2. **Option B (Feature Depth)**: Proceed directly to **Sprint 3 (Ingredient Search)** to give users the ability to search by pantry ingredients and use the "What can I cook?" fridge feature.


