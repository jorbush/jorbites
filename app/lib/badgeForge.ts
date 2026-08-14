import { logger } from '@/app/lib/axiom/server';

export async function triggerBadgeForgeEvaluation(
    solverId: string
): Promise<boolean> {
    try {
        const badgeForgeUrl =
            process.env.BADGE_FORGE_URL || 'http://localhost:4000';
        const badgeForgeKey = process.env.BADGE_FORGE_API_KEY || '';

        const badgeForgeResponse = await fetch(
            `${badgeForgeUrl}/api/evaluate`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': badgeForgeKey,
                },
                body: JSON.stringify({
                    userId: solverId,
                    event: 'QUEST_FULFILLED',
                }),
                cache: 'no-store',
                signal: AbortSignal.timeout(5000),
            }
        );

        if (!badgeForgeResponse.ok) {
            const errorData = await badgeForgeResponse.json().catch(() => ({}));
            logger.error('Badge Forge evaluation error', {
                status: badgeForgeResponse.status,
                errorData,
                solverId,
            });
            return false;
        }

        logger.info('Badge Forge evaluation triggered successfully', {
            solverId,
        });
        return true;
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        logger.error('Badge Forge evaluation request failed', {
            error: errorMessage,
            solverId,
        });
        return false;
    }
}
