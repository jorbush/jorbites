import {
    RECIPE_TITLE_MAX_LENGTH,
    RECIPE_DESCRIPTION_MAX_LENGTH,
    RECIPE_INGREDIENT_MAX_LENGTH,
    RECIPE_STEP_MAX_LENGTH,
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
    RECIPE_MAX_CATEGORIES,
    RECIPE_CUISINES,
} from '@/app/utils/constants';
import { YOUTUBE_URL_REGEX } from '@/app/utils/validation';
import {
    badRequest,
    validationError,
    forbiddenResponse,
} from '@/app/utils/apiErrors';
import { SafeRecipe } from '@/app/types';

interface RecipeDataBody {
    title?: string;
    description?: string;
    categories?: string[];
    ingredients?: string[];
    steps?: string[];
    youtubeUrl?: string;
    recipeCuisine?: string;
    calories?: number | string;
    recipeYield?: number | string;
}

/**
 * Validates recipe data for both POST (create) and PATCH (update) operations.
 *
 * @param body - The request body containing recipe data
 * @param existingRecipe - The existing recipe object (only for PATCH)
 * @returns A Response object with an error message, or null if validation passes
 */
export function validateRecipeData(
    body: RecipeDataBody,
    existingRecipe?: SafeRecipe | null
) {
    const {
        title,
        description,
        categories,
        ingredients,
        steps,
        youtubeUrl,
        recipeCuisine,
        calories,
        recipeYield,
    } = body;

    // Validate recipeCuisine if provided
    if (
        recipeCuisine !== undefined &&
        recipeCuisine !== null &&
        recipeCuisine !== ''
    ) {
        if (typeof recipeCuisine !== 'string') {
            return badRequest('recipeCuisine must be a string');
        }
        const isValid = RECIPE_CUISINES.includes(recipeCuisine as any);
        if (!isValid) {
            return validationError(
                `Invalid recipeCuisine. Must be one of: ${RECIPE_CUISINES.join(', ')}`
            );
        }
    }

    // Validate calories if provided
    if (calories !== undefined && calories !== null && calories !== '') {
        const parsed = parseInt(calories.toString(), 10);
        if (isNaN(parsed) || parsed < 0) {
            return validationError(
                'Calories must be a non-negative integer'
            );
        }
    }

    // Validate recipeYield if provided
    if (
        recipeYield !== undefined &&
        recipeYield !== null &&
        recipeYield !== ''
    ) {
        const parsed = parseInt(recipeYield.toString(), 10);
        if (isNaN(parsed) || parsed <= 0) {
            return validationError('Yield must be a positive integer');
        }
    }

    // Validate categories
    if (categories !== undefined) {
        if (!Array.isArray(categories)) {
            return badRequest('Categories must be an array');
        }

        if (categories.length > RECIPE_MAX_CATEGORIES) {
            return validationError(
                `Recipe cannot have more than ${RECIPE_MAX_CATEGORIES} categories`
            );
        }

        // Validate each category is a non-empty string
        if (
            categories.some((cat) => typeof cat !== 'string' || !cat.trim())
        ) {
            return badRequest('All categories must be non-empty strings');
        }

        if (existingRecipe) {
            // PATCH logic: Check for existing award-winning category
            const existingCategories: string[] = existingRecipe.categories || [];
            const hasAwardWinning = existingCategories.some(
                (cat: string) => cat.toLowerCase() === 'award-winning'
            );

            if (
                categories.some(
                    (cat: string) => cat.toLowerCase() === 'award-winning'
                ) &&
                !hasAwardWinning
            ) {
                return forbiddenResponse(
                    'The Award-winning category cannot be set via API'
                );
            }

            // Prevent removal of the Award-winning category
            if (
                hasAwardWinning &&
                !categories.some(
                    (cat: string) => cat.toLowerCase() === 'award-winning'
                )
            ) {
                return badRequest('Cannot remove the Award-winning category');
            }
        } else {
            // POST logic: Cannot set Award-winning
            if (categories.some((cat: string) => cat.toLowerCase() === 'award-winning')) {
                return forbiddenResponse(
                    'The Award-winning category cannot be set via API'
                );
            }
        }
    } else if (!existingRecipe) {
        // Categories is required for POST
        return badRequest('Categories must be an array');
    }

    // Required fields check (currently both POST and PATCH require title and description in this implementation)
    if (!title || !description) {
        return badRequest(
            'Missing required fields: title and description are required'
        );
    }

    if (title && title.length > RECIPE_TITLE_MAX_LENGTH) {
        return validationError(
            `Title must be ${RECIPE_TITLE_MAX_LENGTH} characters or less`
        );
    }

    if (description && description.length > RECIPE_DESCRIPTION_MAX_LENGTH) {
        return validationError(
            `Description must be ${RECIPE_DESCRIPTION_MAX_LENGTH} characters or less`
        );
    }

    if (ingredients) {
        if (ingredients.length > RECIPE_MAX_INGREDIENTS) {
            return validationError(
                `Recipe cannot have more than ${RECIPE_MAX_INGREDIENTS} ingredients`
            );
        }
        for (const ingredient of ingredients) {
            if (ingredient.length > RECIPE_INGREDIENT_MAX_LENGTH) {
                return validationError(
                    `Each ingredient must be ${RECIPE_INGREDIENT_MAX_LENGTH} characters or less`
                );
            }
        }
    }

    if (steps) {
        if (steps.length > RECIPE_MAX_STEPS) {
            return validationError(
                `Recipe cannot have more than ${RECIPE_MAX_STEPS} steps`
            );
        }
        for (const step of steps) {
            if (step.length > RECIPE_STEP_MAX_LENGTH) {
                return validationError(
                    `Each step must be ${RECIPE_STEP_MAX_LENGTH} characters or less`
                );
            }
        }
    }

    if (youtubeUrl && youtubeUrl.trim() !== '') {
        if (!YOUTUBE_URL_REGEX.test(youtubeUrl.trim())) {
            return validationError('Invalid YouTube URL format');
        }
    }

    return null; // No errors
}
