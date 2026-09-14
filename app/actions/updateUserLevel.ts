import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    userId?: string;
}

export async function createLevelSnapshot(userId: string, level: number) {
    try {
        await prisma.levelSnapshot.create({
            data: {
                userId,
                level,
            },
        });
    } catch (error: any) {
        logger.error('createLevelSnapshot - error', {
            error: error.message,
            userId,
        });
    }
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
                cache: 'no-store',
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

        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { level: true },
            });
            if (user) {
                await createLevelSnapshot(userId, user.level);
            }
        }

        logger.info('updateUserLevel - success', { userId });
    } catch (error: any) {
        logger.error('updateUserLevel - error', {
            error: error.message,
            userId: params.userId,
        });
    }
}
