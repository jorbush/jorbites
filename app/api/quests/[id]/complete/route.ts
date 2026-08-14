import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorizedResponse,
    badRequest,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { authenticatedRatelimit } from '@/app/lib/ratelimit';
import { completeQuest } from '@/app/services/questService';

interface IParams {
    id: string;
}

interface CompleteQuestBody {
    solverId?: string;
    userId?: string;
    recipeId?: string;
}

export async function POST(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to complete quest'
            );
        }

        if (process.env.ENV === 'production') {
            const { success, reset } = await authenticatedRatelimit.limit(
                currentUser.id
            );
            if (!success) {
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                logger.warn(
                    'POST /api/quests/[id]/complete - rate limit exceeded',
                    {
                        userId: currentUser.id,
                    }
                );
                return rateLimitExceeded(
                    `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                );
            }
        }

        const params = await props.params;
        const id = params.id;

        if (!id || typeof id !== 'string') {
            return badRequest('Invalid quest ID');
        }

        let body: CompleteQuestBody = {};
        try {
            body = await request.json();
        } catch (_) {
            // Body optional
        }

        const result = await completeQuest({
            questId: id,
            currentUserId: currentUser.id,
            recipeId: body.recipeId,
            solverId: body.solverId || body.userId,
        });

        if (result.errorResponse) {
            return result.errorResponse;
        }

        logger.info('POST /api/quests/[id]/complete - success', {
            questId: id,
            userId: currentUser.id,
        });

        return NextResponse.json(result.quest);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        logger.error('POST /api/quests/[id]/complete - error', {
            error: errorMessage,
        });
        console.error(error);
        return internalServerError('Failed to complete quest');
    }
}
