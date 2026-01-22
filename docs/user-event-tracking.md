# User Event Tracking System

This document describes the Kafka-based user event tracking system implemented for building the Taste Graph recommendation system.

## Overview

The tracking system captures user interactions with recipes to build taste profiles for personalized recommendations. Events are sent to a Kafka topic (`user-events`) and will be consumed by a future recommendation microservice.

## Event Types

All event types are defined in the `UserEventType` enum (`app/actions/tracking.ts`):

| Event Type | Score Impact | Description | Use Case |
|------------|--------------|-------------|----------|
| `RECIPE_VIEW` | +1 | User views a recipe page | Low intent, indicates curiosity |
| `RECIPE_LIKE` | +3 | User likes a recipe | Social validation, not yet implemented |
| `RECIPE_SAVE` | +5 | User saves/favorites a recipe | High intent, user wants to cook this |
| `RECIPE_COOKED` | +10 | User marks recipe as cooked | Ultimate validation |
| `RECIPE_UNLIKE` | -3 | User removes a like | Reversal of interest |
| `RECIPE_UNSAVE` | -5 | User removes from favorites | Reversal of intent |

## Architecture

### Components

1. **Kafka Producer** (`app/lib/kafka.ts`)
   - Maintains a persistent connection to Kafka broker
   - Validates required environment variables at startup
   - Supports optional SSL configuration for production
   - Handles graceful shutdown

2. **Tracking Actions** (`app/actions/tracking.ts`)
   - Generic `trackUserInteraction()` function
   - Convenience functions for each event type
   - Non-blocking error handling (failures are logged, not thrown)

3. **Integration Points**
   - Recipe page view: `app/recipes/[recipeId]/page.tsx`
   - Favorites API: `app/api/favorites/[recipeId]/route.ts`
   - Future: Likes, cooked markers, etc.

## Usage

### Basic Usage

```typescript
import {
    trackRecipeView,
    trackRecipeSave,
    trackRecipeCooked,
    UserEventType
} from '@/app/actions/tracking';

// Track a recipe view
await trackRecipeView(recipeId, userId);

// Track when user saves a recipe
await trackRecipeSave(recipeId, userId);

// Track when user marks recipe as cooked (with optional metadata)
await trackRecipeCooked(recipeId, userId, {
    rating: 5,
    cookingTime: 45,
    modifications: ['added garlic', 'doubled spices']
});
```

### Generic Usage

For flexibility, you can use the generic `trackUserInteraction()` function:

```typescript
import { trackUserInteraction, UserEventType } from '@/app/actions/tracking';

await trackUserInteraction(UserEventType.RECIPE_VIEW, {
    recipeId,
    userId,
    metadata: {
        source: 'search',
        position: 3
    }
});
```

### Non-Blocking Pattern

Tracking is designed to be non-blocking. In API routes or server actions:

```typescript
// Fire and forget pattern
trackRecipeSave(recipeId, userId).catch((error) => {
    logger.error('Failed to track recipe save', { recipeId, userId, error });
});

// Or with try-catch for server components
try {
    await trackRecipeView(recipeId, userId);
} catch (error) {
    // Silently fail - tracking errors should not break page rendering
    console.error('Error tracking recipe view:', error);
}
```

## Environment Variables

Required environment variables (see `docs/development.md` for full setup):

```bash
# Required
KAFKA_BROKER=your_kafka_broker_url

# Optional - only required for SSL-enabled Kafka brokers (production)
KAFKA_SSL_KEY=your_kafka_ssl_key
KAFKA_SSL_CERT=your_kafka_ssl_certificate
KAFKA_SSL_CA=your_kafka_ssl_certificate_authority
```

## Message Format

All events are sent to the `user-events` topic with the following structure:

```json
{
  "type": "RECIPE_VIEW",
  "recipeId": "recipe-id-123",
  "userId": "user-id-456",
  "timestamp": "2026-01-22T10:30:00.000Z",
  "metadata": {
    // Optional additional data
  }
}
```

- **Key**: `userId`
- **Value**: JSON string with event data

## Related Documentation

- [Taste Graph Implementation Plan](./taste-graph-draft.md) - Full recommendation system architecture
- [Development Setup](./development.md) - Environment configuration
- [Architecture](./architecture.md) - Overall system design
