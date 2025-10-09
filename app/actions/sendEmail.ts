import { EmailType } from '@/app/types/email';
import { logger } from '@/app/lib/axiom/server';

interface SendEmailParams {
    type: EmailType;
    userEmail: string | null | undefined;
    params?: {
        userName?: string | null | undefined;
        recipeId?: string;
        recipeName?: string;
        resetUrl?: string;
        mentionedUsers?: string[];
    };
}

/**
 * Sends an email notification using the Jorbites Notifier service
 */
const sendEmail = async ({ type, userEmail, params = {} }: SendEmailParams) => {
    if (!userEmail) {
        logger.info('sendEmail - no userEmail provided', { type });
        return;
    }

    try {
        logger.info('sendEmail - start', { type, userEmail, params });
        const metadata: Record<string, string> = {};

        if (params.userName) metadata.authorName = params.userName;
        if (params.recipeId) metadata.recipeId = params.recipeId;
        if (params.recipeName) metadata.recipeName = params.recipeName;
        if (params.resetUrl) metadata.resetUrl = params.resetUrl;
        if (params.mentionedUsers)
            metadata.mentionedUsers = params.mentionedUsers.join(',');

        if (type === EmailType.NEW_LIKE && params.userName) {
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
            logger.error('sendEmail - notification service error', {
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
        logger.info('sendEmail - success', { type, userEmail });
        return result;
    } catch (error: any) {
        logger.error('sendEmail - error', {
            error: error.message,
            type,
            userEmail,
        });
    }
};

export default sendEmail;
