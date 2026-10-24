import { NextResponse } from 'next/server';

import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorizedResponse,
    notFoundResponse,
    forbiddenResponse,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { redisCache } from '@/app/lib/redis';
import { deleteFromR2 } from '@/app/utils/r2';
import { recomputeRecipeRating } from '@/app/utils/recipeRating';

interface IParams {
    cooksnapId?: string;
}

export async function DELETE(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse();
        }

        const params = await props.params;
        const { cooksnapId } = params;

        if (!cooksnapId) {
            return notFoundResponse('Cooksnap ID required');
        }

        const cooksnap = await prisma.cooksnap.findUnique({
            where: {
                id: cooksnapId,
            },
            include: {
                recipe: true,
            },
        });

        if (!cooksnap) {
            return notFoundResponse('Cooksnap not found');
        }

        const isCookAuthor = cooksnap.userId === currentUser.id;
        const isRecipeAuthor = cooksnap.recipe.userId === currentUser.id;

        if (!isCookAuthor && !isRecipeAuthor) {
            return forbiddenResponse(
                'You do not have permission to delete this cooksnap'
            );
        }

        await prisma.cooksnap.delete({
            where: {
                id: cooksnapId,
            },
        });

        if (cooksnap.rating !== null && cooksnap.rating !== undefined) {
            await recomputeRecipeRating(cooksnap.recipeId);
        }

        if (cooksnap.imageSrc) {
            try {
                await deleteFromR2(cooksnap.imageSrc);
            } catch (r2Error: any) {
                logger.error(
                    'DELETE /api/cooksnaps/[cooksnapId] - R2 deletion error',
                    {
                        error: r2Error?.message || String(r2Error),
                        imageSrc: cooksnap.imageSrc,
                    }
                );
            }
        }

        try {
            await Promise.all([
                redisCache.del(`recipe:cooksnaps:${cooksnap.recipeId}`),
                redisCache.del(`recipe:${cooksnap.recipeId}`),
                redisCache.del(`user:activity:graph:${cooksnap.userId}`),
            ]);
        } catch (cacheError: any) {
            logger.error(
                'DELETE /api/cooksnaps/[cooksnapId] - cache invalidation error',
                {
                    error: cacheError.message,
                    recipeId: cooksnap.recipeId,
                }
            );
        }

        return NextResponse.json({
            id: cooksnapId,
            message: 'Cooksnap deleted successfully',
        });
    } catch (error: any) {
        logger.error('DELETE /api/cooksnaps/[cooksnapId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to delete cooksnap');
    }
}
