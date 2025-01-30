/* eslint-disable unused-imports/no-unused-vars */
export enum EmailType {
    NEW_COMMENT = 'NEW_COMMENT',
    NEW_LIKE = 'NEW_LIKE',
    NEW_RECIPE = 'NEW_RECIPE',
    NOTIFICATIONS_ACTIVATED = 'NOTIFICATIONS_ACTIVATED',
}

export interface EmailTemplateParams {
    userName?: string | null | undefined;
    recipeId?: string;
    recipeName?: string;
}
