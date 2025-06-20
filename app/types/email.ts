/* eslint-disable unused-imports/no-unused-vars */
export enum EmailType {
    NEW_COMMENT = 'NEW_COMMENT',
    NEW_LIKE = 'NEW_LIKE',
    NEW_RECIPE = 'NEW_RECIPE',
    NOTIFICATIONS_ACTIVATED = 'NOTIFICATIONS_ACTIVATED',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
    MENTION_IN_COMMENT = 'MENTION_IN_COMMENT',
}

export interface EmailTemplateParams {
    userName?: string | null | undefined;
    recipeId?: string;
    recipeName?: string;
}
