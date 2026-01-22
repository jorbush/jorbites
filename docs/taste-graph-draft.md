# Taste Graph Draft - Phases 2 & 3

**Status:** Deferred / Future Work
**Goal:** Implement the Microservice and UI Integration for the Taste Graph feature.

## Phase 2: Recommendation Microservice

### Goal
Build a dedicated service to consume Kafka events and build the SQLite flavor profile.

### Architecture
-   **Tech:** Node.js (Express), Prisma, SQLite.
-   **Structure:** `/recommendation-service` (Sibling to main app).
-   **Port:** `4000`.

### Implementation Steps

#### 1. Service Setup
- Initialize `recommendation-service` folder.
- `package.json` with `express`, `kafkajs`, `sqlite3`, `prisma`.

#### 2. Database (SQLite)
- **Model:** `TasteProfile`
  ```prisma
  model TasteProfile {
    userId String @id
    // JSON blob stores separate scores for flexibility
    // e.g. { "categories": {"italian": 15, "vegan": 2}, "tags": {"spicy": 5} }
    preferences String
    lastUpdated DateTime @updatedAt
  }
  ```

#### 3. Consumer Logic (Scoring System)
The consumer doesn't just count; it weighs interactions to build a "Taste Score".

| Interaction Type | Score Impact | Rationale |
| :--- | :--- | :--- |
| **View** | +1 | Low intent, but indicates curiosity. |
| **Favorite/Save** | +5 | High intent. User wants to cook this. |
| **Cooked** | +10 | Ultimate validation. |
| **Like** | +3 | Social validation. |

- **Algorithm:**
  1.  Receive `USER_INTERACTION` event.
  2.  Fetch `TasteProfile` for `userId`.
  3.  Get Tags/Categories from the Recipe (requires fetching Recipe metadata, potentially caching it in the service).
  4.  Update scores: `CurrentScore + NewInteractionScore`.
  5.  *Optional:* Apply a generic "Decay Factor" (multiply all existing scores by 0.99) to keep recent interests fresher.

#### 4. API Endpoint (`GET /recommendations/:userId`)
- **Logic:**
  1.  **Fetch Profile:** Get user's `TasteProfile`.
  2.  **Identify Top Interests:** Select top 3 categories/tags (e.g., `Italian`, `Pasta`, `Spicy`).
  3.  **Candidate Generation:** (This logic can live in the Main App or Service, but Service is better if it has data access).
      - *If Service has Recipe Data:* Query local DB for matches.
      - *If Service is "Brain Only":* Return the **Strategy** to the Main App.
        -   *Response:* `{"strategy": "filter", "filters": {"categories": ["Italian"], "tags": ["Spicy"]}}`

## Phase 3: UI Integration

### Goal
Display recommendations in the main Jorbites app.

### Implementation Steps

#### 1. API Client
- In Main App, create `app/lib/recommendations.ts`.
- Function `getRecommendations(userId)` calls `http://localhost:4000/recommendations/:userId`.

#### 2. Matching Strategy (The "Engine" in Main App)
Since the Main App holds the Recipe Database (Mongo/Prisma), it does the final query.

1.  **Call Service:** Get `{"filters": {"categories": ["Italian", "Comfort Food"]}}`.
2.  **Database Query (Prisma):**
    ```typescript
    prisma.recipe.findMany({
      where: {
        AND: [
             { categories: { hasSome: ["Italian", "Comfort Food"] } },
             { id: { notIn: viewedRecipeIds } } // Exclude what they've already seen
        ]
      },
      orderBy: { numLikes: 'desc' }, // Boost by popularity
      take: 5
    })
    ```

#### 3. Cold Start Strategy
- If the Service returns "No Data" (New User):
  - Fallback to "Trending Now" (Top liked recipes from last 7 days).
  - Or "Editor's Choice" (Curated list).

#### 4. Recommendation Component
- Create `RecommendationRail.tsx`.
- Render the recipes with a header "Chosen for you because you like Italian".
