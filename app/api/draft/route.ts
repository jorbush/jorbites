import { NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { unauthorized, internalServerError } from '@/app/utils/apiErrors';
import { STEPS_LENGTH } from '@/app/utils/constants';
import { logger, withAxiom } from '@/app/lib/axiom/server';

export const POST = withAxiom(async (request: Request) => {
    try {
        logger.info('POST /api/draft - start');
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorized('User authentication required to save draft');
        }
        const body = await request.json();

        if (
            body.currentStep !== undefined &&
            (typeof body.currentStep !== 'number' ||
                body.currentStep < 0 ||
                body.currentStep >= STEPS_LENGTH)
        ) {
            body.currentStep = 0;
        }

        await redis.set(currentUser.id, JSON.stringify(body));
        logger.info('POST /api/draft - success', { userId: currentUser.id });
        return NextResponse.json(null);
    } catch (error: any) {
        logger.error('POST /api/draft - error', { error: error.message });
        return internalServerError('Failed to save draft');
    }
});

export const GET = withAxiom(async () => {
    try {
        logger.info('GET /api/draft - start');
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorized('User authentication required to get draft');
        }
        const data = await redis.get(currentUser.id);
        logger.info('GET /api/draft - success', {
            userId: currentUser.id,
            hasDraft: !!data,
        });
        return NextResponse.json(data ? JSON.parse(data) : null);
    } catch (error: any) {
        logger.error('GET /api/draft - error', { error: error.message });
        return internalServerError('Failed to retrieve draft');
    }
});

export const DELETE = withAxiom(async () => {
    try {
        logger.info('DELETE /api/draft - start');
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorized('User authentication required to delete draft');
        }
        const response = await redis.del(currentUser.id);
        logger.info('DELETE /api/draft - success', { userId: currentUser.id });
        return NextResponse.json(response);
    } catch (error: any) {
        logger.error('DELETE /api/draft - error', { error: error.message });
        return internalServerError('Failed to delete draft');
    }
});
