export interface RemixValidationResult {
    hasModifiedIngredients: boolean;
    hasModifiedSteps: boolean;
    isValidRemix: boolean;
}

/**
 * Validates that a recipe remix contains modifications to BOTH the ingredients and preparation steps.
 *
 * Normalization rules:
 * - Trims leading and trailing whitespace.
 * - Compares case-insensitively.
 * - Filters out empty strings.
 * - Ingredients are compared order-independently so merely reordering items does not qualify as a change.
 * - Steps are compared sequentially so the preparation flow is validated.
 */
export function validateRemixContent(
    newIngredients?: string[] | null,
    newSteps?: string[] | null,
    originalIngredients?: string[] | null,
    originalSteps?: string[] | null
): RemixValidationResult {
    const normalize = (list?: string[] | null) =>
        Array.isArray(list)
            ? list
                  .map((s) =>
                      typeof s === 'string' ? s.trim().toLowerCase() : ''
                  )
                  .filter(Boolean)
            : [];

    const normNewIng = normalize(newIngredients);
    const normOrigIng = normalize(originalIngredients);
    const normNewSteps = normalize(newSteps);
    const normOrigSteps = normalize(originalSteps);

    // Order-independent ingredients check (reordering existing items is not a modification)
    const sortedNewIng = [...normNewIng].sort();
    const sortedOrigIng = [...normOrigIng].sort();
    const isSameIngredients =
        sortedNewIng.length === sortedOrigIng.length &&
        sortedNewIng.every((item, idx) => item === sortedOrigIng[idx]);

    // Sequential steps check (exact step sequence)
    const isSameSteps =
        normNewSteps.length === normOrigSteps.length &&
        normNewSteps.every((item, idx) => item === normOrigSteps[idx]);

    const hasModifiedIngredients = !isSameIngredients;
    const hasModifiedSteps = !isSameSteps;

    return {
        hasModifiedIngredients,
        hasModifiedSteps,
        isValidRemix: hasModifiedIngredients && hasModifiedSteps,
    };
}
