import { EmailType } from '@/app/types/email';

interface SendEmailParams {
    type: EmailType;
    userEmail: string | null | undefined;
    params?: {
        userName?: string | null | undefined;
        recipeId?: string;
        recipeName?: string;
        resetUrl?: string;
    };
}

/**
 * Sends an email notification using the Jorbites Notifier service
 */
const sendEmail = async ({ type, userEmail, params = {} }: SendEmailParams) => {
    if (!userEmail) return;

    try {
        const metadata: Record<string, string> = {};

        if (params.userName) metadata.authorName = params.userName;
        if (params.recipeId) metadata.recipeId = params.recipeId;
        if (params.recipeName) metadata.recipeName = params.recipeName;
        if (params.resetUrl) metadata.resetUrl = params.resetUrl;

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
            throw new Error(
                `Notification service responded with status ${response.status}: ${JSON.stringify(errorData)}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error(
            'Error sending notification via Jorbites Notifier:',
            error
        );
    }
};

export default sendEmail;
