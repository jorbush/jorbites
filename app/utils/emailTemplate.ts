import { EmailTemplateParams, EmailType } from "@/app/types/email";
import { JORBITES_URL } from "@/app/utils/constants";

export const getEmailTemplate = (
    type: EmailType,
    params: EmailTemplateParams
): { subject: string; text: string } => {
    switch (type) {
        case EmailType.NEW_COMMENT:
            return {
                subject: 'New Comment on Your Recipe - Jorbites',
                text: `You have received a new comment from ${params.userName}.\nIn this recipe: ${JORBITES_URL}/recipes/${params.recipeId}`
            };
        case EmailType.NEW_LIKE:
            return {
                subject: 'New Like on Your Recipe - Jorbites',
                text: `You have received a new like from ${params.userName}.\nIn this recipe: ${JORBITES_URL}/recipes/${params.recipeId}`
            };
        case EmailType.NEW_RECIPE:
            return {
                subject: 'New Recipe Available - Jorbites',
                text: `There's a new recipe available on Jorbites!\nCheck it out: ${JORBITES_URL}/recipes/${params.recipeId}`
            };
        case EmailType.NOTIFICATIONS_ACTIVATED:
            return {
                subject: 'Notifications Activated - Jorbites',
                text: 'Email notifications have been activated.'
            };
        default:
            throw new Error('Invalid email type');
    }
};
