/* eslint-disable unused-imports/no-unused-vars */
export enum NotificationType {
    NEW_COMMENT = 'NEW_COMMENT',
    NEW_LIKE = 'NEW_LIKE',
    NEW_RECIPE = 'NEW_RECIPE',
    NOTIFICATIONS_ACTIVATED = 'NOTIFICATIONS_ACTIVATED',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
    MENTION_IN_COMMENT = 'MENTION_IN_COMMENT',
    NEW_QUEST = 'NEW_QUEST',
    QUEST_FULFILLED = 'QUEST_FULFILLED',
}

export interface NotificationTemplateParams {
    userName?: string | null | undefined;
    recipeId?: string;
    recipeName?: string;
    questId?: string;
    submissionId?: string;
    fulfilledByName?: string;
}
