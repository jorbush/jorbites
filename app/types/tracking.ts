export enum UserEventType {
    RECIPE_VIEW = 'RECIPE_VIEW',
    RECIPE_LIKE = 'RECIPE_LIKE',
    RECIPE_SAVE = 'RECIPE_SAVE',
    RECIPE_COOKED = 'RECIPE_COOKED',
    RECIPE_UNLIKE = 'RECIPE_UNLIKE',
    RECIPE_UNSAVE = 'RECIPE_UNSAVE',
}

export interface UserInteractionData {
    recipeId: string;
    userId: string;
    metadata?: Record<string, unknown>;
}
