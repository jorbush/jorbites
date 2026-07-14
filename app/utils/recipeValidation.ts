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
 * Validates common fields between POST and PATCH operations.
 *
 * @param body - The request body containing recipe data
 * @returns A Response object with an error message, or null if validation passes
 */
function validateCommonFields(body: RecipeDataBody) {
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
        const isValid = (RECIPE_CUISINES as readonly string[]).includes(
            recipeCuisine
        );
        if (!isValid) {
            return validationError(
                `Invalid recipeCuisine. Must be one of: ${RECIPE_CUISINES.join(', ')}`
            );
        }
    }

    // Validate calories if provided
    if (calories !== undefined && calories !== null && calories !== '') {
        if (typeof calories !== 'number' && typeof calories !== 'string') {
            return badRequest(
                'Calories must be a number or string representation of a number'
            );
        }
        const parsed = parseInt(calories.toString(), 10);
        if (isNaN(parsed) || parsed < 0) {
            return validationError('Calories must be a non-negative integer');
        }
    }

    // Validate recipeYield if provided
    if (
        recipeYield !== undefined &&
        recipeYield !== null &&
        recipeYield !== ''
    ) {
        if (
            typeof recipeYield !== 'number' &&
            typeof recipeYield !== 'string'
        ) {
            return badRequest(
                'Yield must be a number or string representation of a number'
            );
        }
        const parsed = parseInt(recipeYield.toString(), 10);
        if (isNaN(parsed) || parsed <= 0) {
            return validationError('Yield must be a positive integer');
        }
    }

    // Validate categories array format
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
        if (categories.some((cat) => typeof cat !== 'string' || !cat.trim())) {
            return badRequest('All categories must be non-empty strings');
        }
    }

    // Validate title length
    if (title !== undefined) {
        if (typeof title !== 'string') {
            return badRequest('Title must be a string');
        }
        if (title.length > RECIPE_TITLE_MAX_LENGTH) {
            return validationError(
                `Title must be ${RECIPE_TITLE_MAX_LENGTH} characters or less`
            );
        }
    }

    // Validate description length
    if (description !== undefined) {
        if (typeof description !== 'string') {
            return badRequest('Description must be a string');
        }
        if (description.length > RECIPE_DESCRIPTION_MAX_LENGTH) {
            return validationError(
                `Description must be ${RECIPE_DESCRIPTION_MAX_LENGTH} characters or less`
            );
        }
    }

    // Validate ingredients array format
    if (ingredients !== undefined) {
        if (!Array.isArray(ingredients)) {
            return badRequest('Ingredients must be an array');
        }
        if (ingredients.length > RECIPE_MAX_INGREDIENTS) {
            return validationError(
                `Recipe cannot have more than ${RECIPE_MAX_INGREDIENTS} ingredients`
            );
        }
        for (const ingredient of ingredients) {
            if (typeof ingredient !== 'string') {
                return badRequest('All ingredients must be strings');
            }
            if (ingredient.length > RECIPE_INGREDIENT_MAX_LENGTH) {
                return validationError(
                    `Each ingredient must be ${RECIPE_INGREDIENT_MAX_LENGTH} characters or less`
                );
            }
        }
    }

    // Validate steps array format
    if (steps !== undefined) {
        if (!Array.isArray(steps)) {
            return badRequest('Steps must be an array');
        }
        if (steps.length > RECIPE_MAX_STEPS) {
            return validationError(
                `Recipe cannot have more than ${RECIPE_MAX_STEPS} steps`
            );
        }
        for (const step of steps) {
            if (typeof step !== 'string') {
                return badRequest('All steps must be strings');
            }
            if (step.length > RECIPE_STEP_MAX_LENGTH) {
                return validationError(
                    `Each step must be ${RECIPE_STEP_MAX_LENGTH} characters or less`
                );
            }
        }
    }

    // Validate youtubeUrl format
    if (youtubeUrl !== undefined && youtubeUrl !== null && youtubeUrl !== '') {
        if (typeof youtubeUrl !== 'string') {
            return badRequest('youtubeUrl must be a string');
        }
        if (youtubeUrl.trim() !== '') {
            if (!YOUTUBE_URL_REGEX.test(youtubeUrl.trim())) {
                return validationError('Invalid YouTube URL format');
            }
        }
    }

    return null; // No common errors
}

/**
 * Validates recipe data for POST (create) operations.
 *
 * @param body - The request body containing recipe data
 * @returns A Response object with an error message, or null if validation passes
 */
export function validateRecipeCreateData(body: RecipeDataBody) {
    const { title, description, categories } = body;

    // Required fields check (must be present and truthy where applicable)
    if (!title || !description) {
        return badRequest(
            'Missing required fields: title and description are required'
        );
    }

    if (categories === undefined) {
        return badRequest('Categories must be an array');
    }

    if (!Array.isArray(categories)) {
        return badRequest('Categories must be an array');
    }

    // POST logic: Cannot set Award-winning
    if (categories.some((cat) => cat.toLowerCase() === 'award-winning')) {
        return forbiddenResponse(
            'The Award-winning category cannot be set via API'
        );
    }

    return validateCommonFields(body);
}

/**
 * Validates recipe data for PATCH (update) operations.
 *
 * @param body - The request body containing recipe data
 * @param existingRecipe - The existing recipe object
 * @returns A Response object with an error message, or null if validation passes
 */
export function validateRecipeUpdateData(
    body: RecipeDataBody,
    existingRecipe: SafeRecipe
) {
    const { title, description, categories } = body;

    // Check empty-value constraints if provided
    if (title !== undefined) {
        if (typeof title !== 'string' || !title) {
            return badRequest('Title cannot be empty');
        }
    }

    if (description !== undefined) {
        if (typeof description !== 'string' || !description) {
            return badRequest('Description cannot be empty');
        }
    }

    // PATCH category transition validation
    if (categories !== undefined) {
        if (!Array.isArray(categories)) {
            return badRequest('Categories must be an array');
        }

        const existingCategories: string[] = existingRecipe.categories || [];
        const hasAwardWinning = existingCategories.some(
            (cat: string) => cat.toLowerCase() === 'award-winning'
        );

        const tryingToSetAwardWinning = categories.some(
            (cat) => cat.toLowerCase() === 'award-winning'
        );

        if (tryingToSetAwardWinning && !hasAwardWinning) {
            return forbiddenResponse(
                'The Award-winning category cannot be set via API'
            );
        }

        // Prevent removal of the Award-winning category
        if (hasAwardWinning && !tryingToSetAwardWinning) {
            return badRequest('Cannot remove the Award-winning category');
        }
    }

    return validateCommonFields(body);
}
