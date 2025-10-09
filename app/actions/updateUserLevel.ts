import { logger } from '@/app/lib/axiom/server';

interface IParams {
    userId?: string;
}

export default async function updateUserLevel(params: IParams) {
    try {
        logger.info('updateUserLevel - start', { userId: params.userId });
        const { userId } = params;

        const badgeForgePayload = {
            user_id: userId,
        };

        const badgeForgeResponse = await fetch(
            `${process.env.BADGE_FORGE_URL}/update`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': process.env.BADGE_FORGE_API_KEY || '',
                },
                body: JSON.stringify(badgeForgePayload),
            }
        );

        if (!badgeForgeResponse.ok) {
            const errorData = await badgeForgeResponse.json().catch(() => ({}));
            logger.error('updateUserLevel - badge forge error', {
                status: badgeForgeResponse.status,
                errorData,
                userId,
            });
            throw new Error(
                `Badge Forge service responded with status ${badgeForgeResponse.status}: ${JSON.stringify(errorData)}`
            );
        }

        logger.info('updateUserLevel - success', { userId });
    } catch (error: any) {
        logger.error('updateUserLevel - error', {
            error: error.message,
            userId: params.userId,
        });
    }
}
