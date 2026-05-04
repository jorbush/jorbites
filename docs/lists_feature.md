# Lists Feature Documentation

## Overview

The **Lists** feature allows users to curate personal collections of recipes, commonly used for organizing meal plans, saving favorite dishes, or building a backlog of recipes "to cook later". It is deeply integrated with the core `Recipe` entity, allowing seamless and atomic toggling of recipes in and out of multiple custom lists.

## Core Models

The database schema manages lists via a robust Many-to-Many relationship between the `User`, `List`, and `Recipe` entities.

### List Schema (`prisma/schema.prisma`)
- `id` (String / ObjectId): Unique identifier for the list.
- `name` (String): The descriptive title of the list.
- `isPrivate` (Boolean): Defines the visibility. Defaults to `true`.
- `isDefault` (Boolean): Flags the list as the system default. Defaults to `false`.
- `userId` (String / ObjectId): References the owner `User` document.
- `recipeIds` (String[]): Array of `Recipe` ObjectIds.

### Key Relations
Due to Prisma's specific implementation of many-to-many relationships in MongoDB, the relation requires explicit scalar arrays on **both** sides:
- `List` model holds `recipeIds String[]`
- `Recipe` model holds `listIds String[]`

This double-sided array mapping enables atomic connections and disconnections when recipes are deleted or removed without leaving orphaned references.

## Core Workflows

### 1. Default List Generation
To guarantee that users always have an immediate place to save recipes, a default "to cook later" list is lazily generated when fetching a user's lists for the first time.
- Handled primarily inside `app/api/lists/route.ts` (GET) and server action `app/actions/getLists.ts`.
- The frontend translates the literal name dynamically based on the `isDefault` flag to respect the user's selected locale (`es`, `en`, `ca`).

### 2. Saving a Recipe (AddToListModal)
When a user interacts with the `AddToListButton` on a recipe:
1. The `AddToListModal` is invoked.
2. A list of the user's available lists is fetched.
3. Users can select an existing list to atomically add the recipe using Prisma's `connect` operator.
4. Users can create a brand-new list and attach the recipe simultaneously. The frontend bundles `name`, `isPrivate`, and `recipeId` in a single `POST /api/lists` payload to prevent race conditions.

### 3. Modifying Lists (PATCH & DELETE)
- **PATCH**: Users can rename lists or toggle visibility (`isPrivate`) from the List Details page.
- **DELETE**: Lists can be safely deleted using the `ConfirmModal` check from the Lists Dashboard. Default lists (`isDefault: true`) cannot be deleted.

## API Endpoint Reference

| Endpoint | Method | Action |
|----------|--------|--------|
| `/api/lists` | `GET` | Fetches all lists for the current user. Lazily initializes the default list if none exist. |
| `/api/lists` | `POST` | Creates a new list. Atomically links a recipe if `recipeId` is provided in the body. |
| `/api/lists/[listId]` | `PATCH` | Updates a list's `name` or `isPrivate` visibility state. |
| `/api/lists/[listId]` | `DELETE` | Deletes the specified list (prevents deletion if `isDefault` is true). |
| `/api/lists/[listId]/recipes/[recipeId]` | `POST` | Connects a recipe to a list (adds to the array). |
| `/api/lists/[listId]/recipes/[recipeId]` | `DELETE` | Disconnects a recipe from a list. |

## Localization & Internationalization (i18n)

The application supports English, Spanish, and Catalan. 
Important localization keys used in the feature include:
- `to_cook_later`: Automatically mapped onto any list where `isDefault === true`.
- `my_lists`, `list_deleted`, `save_to_list`, `create_new_list`, `private_list`, `done`.
- `delete_list_confirmation`: Prompt text inside the deletion `ConfirmModal`.

## Security & Privacy Considerations

1. **Visibility Controls**: Lists with `isPrivate: true` have hard blocks inside the `getListById` server action, throwing `Unauthorized` errors if accessed by anyone other than the owner.
2. **Data Leaks**: The API explicitly uses the `select` projection operator within Prisma when returning `user` owner data (for the list owner and recipe authors). Sensitive credentials like password hashes and reset tokens are safely excluded.
