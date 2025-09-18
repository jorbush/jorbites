export const JORBITES_URL = 'https://jorbites.com';
export const RECIPE_TITLE_MAX_LENGTH = 35;
export const RECIPE_DESCRIPTION_MAX_LENGTH = 500;
export const RECIPE_INGREDIENT_MAX_LENGTH = 100;
export const RECIPE_STEP_MAX_LENGTH = 500;
export const RECIPE_MAX_INGREDIENTS = 30;
export const RECIPE_MAX_STEPS = 30;
export const COMMENT_MAX_LENGTH = 500;
export const USERNAME_MAX_LENGTH = 15;
export const CHAR_COUNT_WARNING_THRESHOLD = 0.8;
export const MOBILE_RECIPES_LIMIT = 6;
export const DESKTOP_RECIPES_LIMIT = 12;
export enum STEPS {
    CATEGORY = 0,
    DESCRIPTION = 1,
    INGREDIENTS = 2,
    METHODS = 3,
    STEPS = 4,
    RELATED_CONTENT = 5,
    IMAGES = 6,
}
export const STEPS_LENGTH = Object.keys(STEPS).length;
