import { NextResponse } from 'next/server';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import { deleteFromCloudinary, isCloudinaryUrl } from '@/app/utils/cloudinary';
import {
    unauthorizedResponse,
    badRequest,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { authenticatedRatelimit } from '@/app/lib/ratelimit';

export async function PATCH(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to update profile image'
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
                    'PATCH /api/userImage/[userId] - rate limit exceeded',
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

        logger.info('PATCH /api/userImage/[userId] - start', {
            userId: currentUser.id,
        });

        const body = await request.json();
        const { userImage } = body;

        if (!userImage || typeof userImage !== 'string') {
            return badRequest('Valid user image URL is required');
        }

        const oldImage = currentUser.image;

        // Delete old image from Cloudinary if it's a Cloudinary URL and different from new image
        if (oldImage && oldImage !== userImage && isCloudinaryUrl(oldImage)) {
            try {
                const deleted = await deleteFromCloudinary(oldImage);
                if (deleted) {
                    console.log(
                        `Successfully deleted old profile image from Cloudinary for user ${currentUser.id}`
                    );
                } else {
                    console.warn(
                        `Failed to delete old profile image from Cloudinary for user ${currentUser.id}: ${oldImage}`
                    );
                }
            } catch (error) {
                console.error(
                    'Error deleting old profile image from Cloudinary:',
                    error
                );
            }
        }

        const user = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                image: userImage,
            },
            select: {
                id: true,
                image: true,
            },
        });

        logger.info('PATCH /api/userImage/[userId] - success', {
            userId: user.id,
        });
        return NextResponse.json(user);
    } catch (error: any) {
        logger.error('PATCH /api/userImage/[userId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to update user image');
    }
}
