/**
 * Utility functions for working with recipe data
 */

/**
 * Extracts categories from a recipe object, handling both legacy 'category' field
 * and new 'categories' array field for backward compatibility.
 *
 * @param recipe - Recipe object that may have 'category' (legacy) or 'categories' (new) field
 * @returns Array of category strings, empty array if none found
 */
export function getRecipeCategories(recipe: any): string[] {
    if (Array.isArray(recipe.categories)) {
        return recipe.categories;
    } else if (recipe.category) {
        return [recipe.category];
    }
    return [];
}

/**
 * Checks if a recipe has the 'award-winning' category
 *
 * @param recipe - Recipe object
 * @returns true if recipe has 'award-winning' category
 */
export function isAwardWinningRecipe(recipe: any): boolean {
    const categories = getRecipeCategories(recipe);
    return categories.some(
        (cat: string) => cat?.toLowerCase() === 'award-winning'
    );
}
