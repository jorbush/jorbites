export const JORBITES_URL = 'https://jorbites.com';
export const CONTACT_EMAIL = 'jbonetv5@gmail.com';

export const getVapidEmail = () => {
    const rawVapidEmail =
        process.env.VAPID_EMAIL || 'mailto:jorbites.app@gmail.com';
    return rawVapidEmail.startsWith('mailto:') ||
        rawVapidEmail.startsWith('http')
        ? rawVapidEmail
        : `mailto:${rawVapidEmail}`;
};

export const VAPID_EMAIL = getVapidEmail();

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

export const USER_SELECT_FIELDS = {
    id: true,
    name: true,
    image: true,
    verified: true,
    level: true,
    badges: true,
    createdAt: true,
    updatedAt: true,
    emailVerified: true,
} as const;

export const MAX_RECIPES_PER_MEAL = 4;
export const MEAL_TYPES = ['breakfast', 'lunch', 'snack', 'dinner'];
export const DAYS_OF_WEEK = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
];

export const ALLOWED_LANGUAGES = ['en', 'es', 'ca'] as const;

export const RECIPE_CUISINES = [
    'Spanish',
    'Catalan',
    'Italian',
    'Mexican',
    'Japanese',
    'Chinese',
    'Indian',
    'French',
    'American',
    'Mediterranean',
    'Middle Eastern',
    'Greek',
    'Thai',
    'Vietnamese',
    'Moroccan',
    'Turkish',
    'Latin American',
    'Caribbean',
    'Nordic',
    'British',
    'German',
    'Eastern European',
    'African',
    'Asian Fusion',
    'International',
] as const;

export type RecipeCuisineType = (typeof RECIPE_CUISINES)[number];

// Collaborative Cooking & Locking Constants
export const MAX_CO_COOKS = 4;
export const MAX_LINKED_RECIPES = 2;
export const DRAFT_TTL_SECONDS = 604800; // 7 days
export const USER_DRAFTS_TTL_SECONDS = 2592000; // 30 days
export const LOCK_TTL_SECONDS = 30; // 30 seconds
export const LOCK_HEARTBEAT_INTERVAL_MS = 10000; // 10 seconds
export const LOCK_POLL_INTERVAL_MS = 4000; // 4 seconds
export const SHARED_DRAFT_POLL_INTERVAL_MS = 8000; // 8 seconds
