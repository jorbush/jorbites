# 🥑 Jorbites — Feature Roadmap & Specifications

A minimalist, phased roadmap introducing high-utility cooking tools, discovery mechanics, and community gamification.

---

## 🗓️ Roadmap Summary

```
Phase 1: Quick Wins & Discovery ───► Phase 2: Engagement & Gamification ───► Phase 3: High Utility
• Mood & Occasion Collections         • Daily Recipe Swiper ("Bite Cards")    • Interactive "Cook Mode"
• Pantry Matcher ("Fridge Search")    • Gamified Streaks & Badges
```

---

## 🎯 Phase 1: Quick Wins & Discovery

### 1. Mood & Occasion Collections
> **Goal:** Allow instant intent-based recipe discovery without typing keywords.

* **Difficulty:** ⚡ 1.5 / 5
* **Target Release:** Week 1
* **Feature Specification:**
  * **UI/UX:** Collection rail chips on the main Explore page (e.g. `⏱️ < 15 Min`, `💰 Budget Friendly`, `🕯️ Date Night`, `🥗 Healthy & Light`).
  * **Data & API:**
    * Filter queries against `Recipe` model fields:
      * `minutes` ($\le 15$ for quick meals)
      * `calories` ($\le 500$ for light meals)
      * `categories` & `recipeCuisine`
  * **Success Metric:** Increased clicks on recipe cards from home page rails.

---

### 2. "Pantry Matcher" (What's in My Fridge?)
> **Goal:** Help users find recipes based on ingredients they already have at home.

* **Difficulty:** ⚡⚡ 2.0 / 5
* **Target Release:** Week 1–2
* **Feature Specification:**
  * **UI/UX:** Multi-select tag input on `/explore/pantry`. Shows recipes ranked by match percentage badge (`90% Match`).
  * **Data & API:**
    * **Endpoint:** `GET /api/recipes/pantry-match?ingredients=eggs,tomato,cheese`
    * **Matching Logic:** Normalizes strings (case-insensitive substring match against `Recipe.ingredients`), computes match score:
      $$\text{Match \%} = \frac{|\text{Matched Ingredients}|}{|\text{Recipe Ingredients}|} \times 100$$
  * **Success Metric:** Reduced drop-off for users searching without specific recipe names.

---

## 🏆 Phase 2: Engagement & Gamification

### 3. Daily Recipe Swiper ("Bite Cards")
> **Goal:** Provide a fast, mobile-first swipe interface for quick recipe discovery and saving.

* **Difficulty:** ⚡⚡⚡ 3.0 / 5
* **Target Release:** Week 3
* **Feature Specification:**
  * **UI/UX:** Full-height card stack supporting gesture swipes (Right = Save to Favorites, Left = Next, Up = View Recipe).
  * **Data & API:**
    * **Endpoint:** `GET /api/recipes/bite-cards` (fetches un-favorited high-rating recipes).
    * **Swipe Action:** Triggers existing `User.favoriteIds` or `List` save endpoint on swipe right.
  * **Success Metric:** Increased saved recipes per active session.

---

### 4. Gamified Cooking Streaks & Season Passes
> **Goal:** Incentivize daily/weekly user returns through habit loop tracking.

* **Difficulty:** ⚡⚡⚡⚡ 3.5 / 5
* **Target Release:** Week 4
* **Feature Specification:**
  * **UI/UX:** 🔥 Streak counter icon in top navbar. User profile section showing active streak count and seasonal badge progress.
  * **Data & Microservice Integration:**
    * **Data Touchpoint:** Store `lastCookedAt` or `lastPostedAt` timestamp in `User`.
    * **Badge Forge (Rust):** Send activity event payload to `Badge Forge` microservice to increment streak, evaluate badge rules, and assign new `User.badges`.
  * **Success Metric:** Weekly Active User (WAU) retention bump.

---

## 🍳 Phase 3: High Utility & Core Experience

### 5. Hands-Free Interactive "Cook Mode"
> **Goal:** Transform Jorbites into a full-screen, step-by-step kitchen assistant.

* **Difficulty:** ⚡⚡⚡⚡ 3.5 / 5
* **Target Release:** Week 5–6
* **Feature Specification:**
  * **UI/UX:** Distraction-free full-screen modal featuring:
    * **Portion Scaler:** Dynamic ingredient quantity multipliers ($0.5\times, 1\times, 2\times, 4\times$).
    * **Step Navigation:** Large typography step carousel with built-in timers (*"Simmer 10m"*).
    * **Hands-Free Control:** Optional Web Speech voice listener (*"Next step"*, *"Previous step"*, *"Start timer"*).
  * **Data & Web APIs:**
    * Native `Web Speech API` (`SpeechRecognition`) for voice commands.
    * `Web Audio API` / Browser Notifications for timer expiry alerts.
  * **Success Metric:** Session duration spent in active Cook Mode.

---

## 🛠️ Summary Matrix

| Phase | Feature | Effort | Core Tech Touchpoints |
| :--- | :--- | :---: | :--- |
| **Phase 1** | Mood Collections | 1 day | Prisma queries, Next.js page rails |
| **Phase 1** | Pantry Matcher | 2 days | Ingredient array matching API, Tag Input UI |
| **Phase 2** | Recipe Swiper | 3 days | `framer-motion` gesture deck, Favorites API |
| **Phase 2** | Cooking Streaks | 4 days | `Badge Forge` Rust service, User model extension |
| **Phase 3** | Cook Mode | 5 days | Web Speech API, Portion Scaling state, Audio Timers |
