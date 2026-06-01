import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import {
    unauthorized,
    invalidInput,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { planningRatelimit } from '@/app/lib/ratelimit';

interface IParams {
    planningId?: string;
}

export async function POST(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('User authentication required to save plan');
        }

        // Rate limiting for saving plans - prevent spam
        if (process.env.ENV === 'production') {
            const { success, reset } = await planningRatelimit.limit(
                currentUser.id
            );
            if (!success) {
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                logger.warn('POST /api/saves/[planningId] - rate limit exceeded', {
                    userId: currentUser.id,
                });
                return rateLimitExceeded(
                    `Too many planning operations. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                );
            }
        }

        const { planningId } = params;

        logger.info('POST /api/saves/[planningId] - start', {
            planningId,
            userId: currentUser.id,
        });

        if (!planningId || typeof planningId !== 'string') {
            return invalidInput(
                'Planning ID is required and must be a valid string'
            );
        }

        let savedPlanningIds = [...(currentUser.savedPlanningIds || [])];

        if (!savedPlanningIds.includes(planningId)) {
            savedPlanningIds.push(planningId);
        }

        const user = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                savedPlanningIds,
            },
            select: {
                id: true,
                savedPlanningIds: true,
            },
        });

        logger.info('POST /api/saves/[planningId] - success', {
            planningId,
            userId: user.id,
        });
        return NextResponse.json(user);
    } catch (error: any) {
        logger.error('POST /api/saves/[planningId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to save plan');
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('User authentication required to unsave plan');
        }

        // Rate limiting for unsaving plans - prevent spam
        if (process.env.ENV === 'production') {
            const { success, reset } = await planningRatelimit.limit(
                currentUser.id
            );
            if (!success) {
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                logger.warn(
                    'DELETE /api/saves/[planningId] - rate limit exceeded',
                    {
                        userId: currentUser.id,
                    }
                );
                return rateLimitExceeded(
                    `Too many planning operations. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                );
            }
        }

        const { planningId } = params;

        logger.info('DELETE /api/saves/[planningId] - start', {
            planningId,
            userId: currentUser.id,
        });

        if (!planningId || typeof planningId !== 'string') {
            return invalidInput(
                'Planning ID is required and must be a valid string'
            );
        }

        let savedPlanningIds = [...(currentUser.savedPlanningIds || [])];

        savedPlanningIds = savedPlanningIds.filter((id) => id !== planningId);

        const user = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                savedPlanningIds,
            },
            select: {
                id: true,
                savedPlanningIds: true,
            },
        });

        logger.info('DELETE /api/saves/[planningId] - success', {
            planningId,
            userId: user.id,
        });
        return NextResponse.json(user);
    } catch (error: any) {
        logger.error('DELETE /api/saves/[planningId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to unsave plan');
    }
}
