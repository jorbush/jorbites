# MongoDB Migration Guide: Single Category to Multiple Categories

This guide explains how to safely migrate the `category` field from a single `String` to a `categories` array (`String[]`) in MongoDB.

## Overview

We are migrating the Recipe model's `category` field from:
- **Before**: `category: String` (single category)
- **After**: `categories: String[]` (array of categories)

This migration allows recipes to have multiple categories while maintaining backward compatibility during the transition.

## Prerequisites

1. **Backup your database** before starting the migration
2. Ensure you have MongoDB shell access or a MongoDB client tool
3. Verify you have write permissions on the database
4. Test the migration on a staging/development environment first

## Migration Strategy

We'll use a **two-phase migration** approach:

1. **Phase 1**: Add the new `categories` field while keeping `category` (dual-write)
2. **Phase 2**: Remove the old `category` field after verifying everything works

## Step-by-Step Migration

### Phase 1: Add `categories` Field (Safe Migration)

This phase adds the new `categories` array field and populates it from existing `category` values. The old `category` field remains for backward compatibility.

#### Step 1: Connect to MongoDB

```bash
mongosh "your-connection-string"
# or
mongo "your-connection-string"
```

#### Step 2: Select Your Database

```javascript
use your_database_name
```

#### Step 3: Run the Migration Script

Execute the following script to migrate all existing recipes:

```javascript
// Migration script: Convert category to categories array
db.recipes.updateMany(
  // Find all documents that don't have categories field or have null/empty categories
  {
    $or: [
      { categories: { $exists: false } },
      { categories: null },
      { categories: [] }
    ]
  },
  [
    {
      $set: {
        categories: {
          $cond: {
            if: { $ne: ["$category", null] },
            then: ["$category"],
            else: []
          }
        }
      }
    }
  ]
)
```

**Alternative approach** (if your MongoDB version doesn't support aggregation pipeline in update):

```javascript
// Find all recipes without categories field
db.recipes.find({
  $or: [
    { categories: { $exists: false } },
    { categories: null }
  ]
}).forEach(function(recipe) {
  var categories = [];

  // If category exists and is not null/empty, add it to categories array
  if (recipe.category && recipe.category.trim() !== '') {
    categories = [recipe.category];
  }

  // Update the document
  db.recipes.updateOne(
    { _id: recipe._id },
    { $set: { categories: categories } }
  );
});
```

#### Step 4: Verify the Migration

Check that all recipes now have a `categories` field:

```javascript
// Count recipes with categories field
db.recipes.countDocuments({ categories: { $exists: true } })

// Should match total recipe count
db.recipes.countDocuments({})

// Check a few sample documents
db.recipes.find({}, { title: 1, category: 1, categories: 1 }).limit(5)
```

#### Step 5: Verify Data Integrity

Ensure all non-null categories were migrated correctly:

```javascript
// Find recipes where category exists but categories is empty (should be 0)
db.recipes.countDocuments({
  category: { $exists: true, $ne: null, $ne: "" },
  $or: [
    { categories: { $exists: false } },
    { categories: [] }
  ]
})

// Find recipes with mismatched data (category not in categories array)
db.recipes.find({
  category: { $exists: true, $ne: null, $ne: "" },
  categories: { $not: { $elemMatch: { $eq: "$category" } } }
})
```

### Phase 2: Deploy Application Code

After the database migration is complete:

1. **Deploy the updated Prisma schema** (already updated to use `categories`)
2. **Deploy the application code** (already updated to use `categories`)
3. **Verify the application works correctly** with the new schema

### Phase 3: Remove Legacy `category` Field (Optional - After Verification)

**⚠️ WARNING**: Only proceed with this phase after:
- All application code has been deployed
- You've verified everything works correctly for at least 1-2 weeks
- You've confirmed no legacy code paths are using the `category` field

#### Step 1: Remove the `category` field from all documents

```javascript
// Remove category field from all recipes
db.recipes.updateMany(
  {},
  { $unset: { category: "" } }
)
```

#### Step 2: Verify removal

```javascript
// Should return 0
db.recipes.countDocuments({ category: { $exists: true } })
```

## Rollback Plan

If you need to rollback the migration:

### Rollback Phase 1 (if categories field was added)

```javascript
// Remove categories field and restore category from first element
db.recipes.find({ categories: { $exists: true } }).forEach(function(recipe) {
  var category = recipe.categories && recipe.categories.length > 0
    ? recipe.categories[0]
    : null;

  db.recipes.updateOne(
    { _id: recipe._id },
    {
      $set: { category: category },
      $unset: { categories: "" }
    }
  );
});
```

## Testing Checklist

After migration, verify:

- [ ] All existing recipes have a `categories` array
- [ ] Recipes with a single category have it in the array
- [ ] New recipes can be created with multiple categories
- [ ] Recipe filtering by category still works
- [ ] Recipe display shows all categories correctly
- [ ] Recipe editing preserves multiple categories
- [ ] No errors in application logs related to category field

## Monitoring

After deployment, monitor:

1. **Application logs** for any errors related to categories
2. **Database queries** to ensure they're using `categories` field
3. **User reports** of missing or incorrect categories
4. **Performance metrics** to ensure queries are still efficient

## Notes

- The Prisma schema has been updated to use `categories: String[]`
- The application code handles both `category` (legacy) and `categories` (new) for backward compatibility
- The migration is designed to be non-destructive - old data is preserved during transition
- MongoDB's `has` operator is used for filtering recipes by category in the new schema

## Support

If you encounter issues during migration:

1. Check MongoDB logs for errors
2. Verify your MongoDB version supports the operations used
3. Test the migration script on a small subset first
4. Ensure you have a recent database backup before proceeding



