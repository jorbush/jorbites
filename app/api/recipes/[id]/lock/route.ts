import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorizedResponse,
    badRequest,
    forbiddenResponse,
    internalServerError,
} from '@/app/utils/apiErrors';
import {
    acquireLock,
    releaseLock,
    getActiveLocks,
    isLockHeldByUser,
} from '@/app/lib/redisLock';
import { logger } from '@/app/lib/axiom/server';
import getRecipeById from '@/app/actions/getRecipeById';
import { DraftService } from '@/app/services/draftService';

interface IParams {
    id?: string;
}

export async function POST(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const [params, currentUser] = await Promise.all([
            props.params,
            getCurrentUser(),
        ]);

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to acquire lock'
            );
        }

        const { id: targetId } = params;
        if (!targetId || typeof targetId !== 'string') {
            return badRequest('Target ID is required');
        }

        const body = await request.json();
        const { field } = body;
        if (!field || typeof field !== 'string') {
            return badRequest('Field key is required');
        }

        // Fast path (A2): If lock is already held by currentUser, renew immediately without DB hit
        const isHeld = await isLockHeldByUser(targetId, field, currentUser.id);
        if (isHeld) {
            const lockResult = await acquireLock(
                targetId,
                field,
                currentUser.id,
                currentUser.name || currentUser.email || 'Co-cook',
                currentUser.image || undefined
            );
            return NextResponse.json(lockResult);
        }

        // Initial acquisition authorization check
        const recipe = await getRecipeById({ recipeId: targetId }).catch(
            () => null
        );

        if (recipe) {
            const isOwner = recipe.userId === currentUser.id;
            const isCoCook =
                Array.isArray(recipe.coCooksIds) &&
                recipe.coCooksIds.includes(currentUser.id);
            if (!isOwner && !isCoCook) {
                return forbiddenResponse(
                    'You are not authorized to edit this recipe'
                );
            }
        } else {
            const draft = await DraftService.getSharedDraft(targetId);
            if (draft) {
                const isOwner = draft.ownerId === currentUser.id;
                const isCoCook =
                    Array.isArray(draft.coCooksIds) &&
                    draft.coCooksIds.includes(currentUser.id);
                if (!isOwner && !isCoCook) {
                    return forbiddenResponse(
                        'You are not authorized to lock this draft'
                    );
                }
            }
        }

        const lockResult = await acquireLock(
            targetId,
            field,
            currentUser.id,
            currentUser.name || currentUser.email || 'Co-cook',
            currentUser.image || undefined
        );

        logger.info('POST /api/recipes/[id]/lock', {
            targetId,
            field,
            userId: currentUser.id,
            success: lockResult.success,
        });

        return NextResponse.json(lockResult);
    } catch (error: any) {
        logger.error('POST /api/recipes/[id]/lock - error', {
            error: error.message,
        });
        return internalServerError('Failed to acquire lock');
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const [params, currentUser] = await Promise.all([
            props.params,
            getCurrentUser(),
        ]);

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to release lock'
            );
        }

        const { id: targetId } = params;
        if (!targetId || typeof targetId !== 'string') {
            return badRequest('Target ID is required');
        }

        const { searchParams } = new URL(request.url);
        const field = searchParams.get('field');
        if (!field) {
            return badRequest('Field query parameter is required');
        }

        const released = await releaseLock(targetId, field, currentUser.id);

        logger.info('DELETE /api/recipes/[id]/lock', {
            targetId,
            field,
            userId: currentUser.id,
            released,
        });

        return NextResponse.json({ success: released });
    } catch (error: any) {
        logger.error('DELETE /api/recipes/[id]/lock - error', {
            error: error.message,
        });
        return internalServerError('Failed to release lock');
    }
}

export async function GET(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const { id: targetId } = params;
        if (!targetId || typeof targetId !== 'string') {
            return badRequest('Target ID is required');
        }

        const locks = await getActiveLocks(targetId);
        return NextResponse.json(locks);
    } catch (error: any) {
        logger.error('GET /api/recipes/[id]/lock - error', {
            error: error.message,
        });
        return internalServerError('Failed to fetch active locks');
    }
}
