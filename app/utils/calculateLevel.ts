export function calculateLevel(
    numRecipes: number,
    numTotalLikes: number
): number {
    return Math.floor(numRecipes + numTotalLikes);
}
