export const JORBITES_URL = 'https://jorbites.com';
export const CONTACT_EMAIL = 'jbonetv5@gmail.com';

export const INDEXNOW_API_KEY = 'f6ee79a7601145559ed566ccb188b132';
export const INDEXNOW_HOST = 'jorbites.com';
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_API_KEY}.txt`;
export const INDEXNOW_API_URL = 'https://api.indexnow.org/indexnow';

export const RECIPE_TITLE_MAX_LENGTH = 35;
export const RECIPE_DESCRIPTION_MAX_LENGTH = 500;
export const RECIPE_INGREDIENT_MAX_LENGTH = 135;
export const RECIPE_STEP_MAX_LENGTH = 500;
export const RECIPE_MAX_INGREDIENTS = 30;
export const RECIPE_MAX_STEPS = 30;
export const RECIPE_MAX_CATEGORIES = 3;
export const COMMENT_MAX_LENGTH = 500;
export const USERNAME_MAX_LENGTH = 15;
export const CHAR_COUNT_WARNING_THRESHOLD = 0.8;
export const MOBILE_RECIPES_LIMIT = 6;
export const DESKTOP_RECIPES_LIMIT = 12;
export const WORKSHOP_TITLE_MAX_LENGTH = 50;
export const WORKSHOP_DESCRIPTION_MAX_LENGTH = 500;
export const WORKSHOP_LOCATION_MAX_LENGTH = 100;
export const WORKSHOP_INGREDIENT_MAX_LENGTH = 135;
export const WORKSHOP_STEP_MAX_LENGTH = 500;
export const WORKSHOP_MAX_INGREDIENTS = 30;
export const WORKSHOP_MAX_STEPS = 10;
export const WORKSHOP_MAX_PARTICIPANTS = 50;
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
export const QUEST_TITLE_MAX_LENGTH = 200;
export const QUEST_DESCRIPTION_MAX_LENGTH = 1000;
