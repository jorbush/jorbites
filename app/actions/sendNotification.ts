import { NotificationType } from '@/app/types/notification';
import { logger } from '@/app/lib/axiom/server';

interface SendNotificationParams {
    type: NotificationType;
    userEmail: string | null | undefined;
    params?: {
        userName?: string | null | undefined;
        recipeId?: string;
        recipeName?: string;
        resetUrl?: string;
        mentionedUsers?: string[];
        questId?: string;
        submissionId?: string;
        fulfilledByName?: string;
    };
}

const sendNotification = async ({
    type,
    userEmail,
    params = {},
}: SendNotificationParams) => {
    if (!userEmail) {
        logger.info('sendNotification - no userEmail provided', { type });
        return;
    }

    try {
        logger.info('sendNotification - start', { type, userEmail, params });
        const metadata: Record<string, string> = {};

        if (params.userName) metadata.authorName = params.userName;
        if (params.recipeId) metadata.recipeId = params.recipeId;
        if (params.recipeName) metadata.recipeName = params.recipeName;
        if (params.resetUrl) metadata.resetUrl = params.resetUrl;
        if (params.mentionedUsers)
            metadata.mentionedUsers = params.mentionedUsers.join(',');

        if (params.questId) metadata.questId = params.questId;
        if (params.submissionId) metadata.submissionId = params.submissionId;
        if (params.fulfilledByName)
            metadata.fulfilledByName = params.fulfilledByName;

        if (type === NotificationType.NEW_LIKE && params.userName) {
            metadata.likedBy = params.userName;
        }

        const notificationPayload = {
            type: type,
            recipient: userEmail,
            metadata,
        };

        const response = await fetch(
            `${process.env.JORBITES_NOTIFIER_URL}/notifications`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': process.env.JORBITES_NOTIFIER_API_KEY || '',
                },
                body: JSON.stringify(notificationPayload),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            logger.error('sendNotification - notification service error', {
                status: response.status,
                errorData,
                type,
                userEmail,
            });
            throw new Error(
                `Notification service responded with status ${response.status}: ${JSON.stringify(errorData)}`
            );
        }

        const result = await response.json();
        logger.info('sendNotification - success', { type, userEmail });
        return result;
    } catch (error: any) {
        logger.error('sendNotification - error', {
            error: error.message,
            type,
            userEmail,
        });
    }
};

export default sendNotification;
