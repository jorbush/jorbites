/**
 * Extracts the first image URL from an array of recipes
 */
export function getFirstRecipeImageUrl(
    recipes: any[] | undefined
): string | null {
    if (!recipes || recipes.length === 0) return null;
    return recipes[0]?.imageSrc || null;
}
