import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import {
    unauthorizedResponse,
    invalidInput,
    forbiddenResponse,
    notFoundResponse,
    internalServerError,
    badRequest,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { authenticatedRatelimit } from '@/app/lib/ratelimit';
import {
    normalizeSocialHandle,
    normalizeWebsiteUrl,
} from '@/app/utils/profile-utils';

interface IParams {
    userId?: string;
}

export async function GET(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const { userId } = params;

        logger.info('GET /api/user/[userId] - start', { userId });

        if (!userId || typeof userId !== 'string') {
            return invalidInput(
                'User ID is required and must be a valid string'
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                email: false, // Don't expose email
                image: true,
                level: true,
                verified: true,
                createdAt: true,
                bio: true,
                websiteUrl: true,
                instagram: true,
                twitter: true,
                youtube: true,
                tiktok: true,
            },
        });

        if (!user) {
            return notFoundResponse('User not found');
        }

        logger.info('GET /api/user/[userId] - success', { userId });
        return NextResponse.json({
            ...user,
            createdAt: user.createdAt.toISOString(),
        });
    } catch (error: any) {
        logger.error('GET /api/user/[userId] - error', {
            error: error.message,
            userId: (await props.params).userId,
        });
        return internalServerError('Failed to fetch user');
    }
}

export async function PATCH(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to update profile'
            );
        }

        const { userId } = params;

        if (!userId || typeof userId !== 'string') {
            return invalidInput(
                'User ID is required and must be a valid string'
            );
        }

        if (userId !== currentUser.id) {
            return forbiddenResponse('You can only update your own profile');
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
                logger.warn('PATCH /api/user/[userId] - rate limit exceeded', {
                    userId: currentUser.id,
                });
                return rateLimitExceeded(
                    `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                );
            }
        }

        const body = await request.json();
        const { bio, websiteUrl, instagram, twitter, youtube, tiktok } = body;

        let cleanBio: string | null | undefined = undefined;
        if (bio !== undefined) {
            if (bio !== null && typeof bio !== 'string') {
                return badRequest('Bio must be a string');
            }
            if (typeof bio === 'string' && bio.length > 250) {
                return badRequest('Bio must be 250 characters or less');
            }
            cleanBio = typeof bio === 'string' ? bio.trim() || null : null;
        }

        let cleanWebsiteUrl: string | null | undefined = undefined;
        if (websiteUrl !== undefined) {
            const normalized = normalizeWebsiteUrl(websiteUrl);
            if (normalized.error) {
                return badRequest(normalized.error);
            }
            cleanWebsiteUrl = normalized.url;
        }

        const instagramResult = normalizeSocialHandle(instagram, 'Instagram');
        if (instagramResult.error) return badRequest(instagramResult.error);

        const twitterResult = normalizeSocialHandle(twitter, 'X/Twitter');
        if (twitterResult.error) return badRequest(twitterResult.error);

        const youtubeResult = normalizeSocialHandle(youtube, 'YouTube');
        if (youtubeResult.error) return badRequest(youtubeResult.error);

        const tiktokResult = normalizeSocialHandle(tiktok, 'TikTok');
        if (tiktokResult.error) return badRequest(tiktokResult.error);

        const updateData: Record<string, any> = {};
        if (cleanBio !== undefined) updateData.bio = cleanBio;
        if (cleanWebsiteUrl !== undefined)
            updateData.websiteUrl = cleanWebsiteUrl;
        if (instagramResult.handle !== undefined)
            updateData.instagram = instagramResult.handle;
        if (twitterResult.handle !== undefined)
            updateData.twitter = twitterResult.handle;
        if (youtubeResult.handle !== undefined)
            updateData.youtube = youtubeResult.handle;
        if (tiktokResult.handle !== undefined)
            updateData.tiktok = tiktokResult.handle;

        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: updateData,
            select: {
                id: true,
                name: true,
                image: true,
                level: true,
                verified: true,
                createdAt: true,
                bio: true,
                websiteUrl: true,
                instagram: true,
                twitter: true,
                youtube: true,
                tiktok: true,
            },
        });

        logger.info('PATCH /api/user/[userId] - success', { userId });
        return NextResponse.json({
            ...updatedUser,
            createdAt: updatedUser.createdAt.toISOString(),
        });
    } catch (error: any) {
        logger.error('PATCH /api/user/[userId] - error', {
            error: error.message,
            userId: (await props.params).userId,
        });
        return internalServerError('Failed to update user profile');
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
            return unauthorizedResponse(
                'User authentication required to delete account'
            );
        }

        const { userId } = params;

        logger.info('DELETE /api/user/[userId] - start', {
            userId,
            currentUserId: currentUser.id,
        });

        if (!userId || typeof userId !== 'string') {
            return invalidInput(
                'User ID is required and must be a valid string'
            );
        }

        if (userId !== currentUser.id) {
            return forbiddenResponse('You can only delete your own account');
        }

        const userToDelete = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!userToDelete) {
            return notFoundResponse('User not found');
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.delete({
                where: {
                    id: userId,
                },
            });
        });

        logger.info('DELETE /api/user/[userId] - success', { userId });
        return NextResponse.json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (error: any) {
        logger.error('DELETE /api/user/[userId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to delete account');
    }
}
