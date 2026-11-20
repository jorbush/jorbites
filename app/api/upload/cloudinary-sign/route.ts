import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorizedResponse,
    forbiddenResponse,
    badRequest,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { contentCreationRatelimit } from '@/app/lib/ratelimit';

const ALLOWED_SIGN_PARAMS = new Set([
    'timestamp',
    'source',
    'folder',
    'upload_preset',
]);

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to sign upload'
            );
        }

        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        if (!apiSecret) {
            logger.error(
                'POST /api/upload/cloudinary-sign - missing CLOUDINARY_API_SECRET'
            );
            return internalServerError('Upload signing is not configured');
        }

        if (
            process.env.NODE_ENV === 'production' ||
            process.env.ENV === 'production'
        ) {
            const { success, reset } = await contentCreationRatelimit.limit(
                currentUser.id
            );
            if (!success) {
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                logger.warn(
                    'POST /api/upload/cloudinary-sign - rate limit exceeded',
                    { userId: currentUser.id }
                );
                return rateLimitExceeded(
                    `Too many upload requests. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                );
            }
        }

        const body = await request.json().catch(() => null);
        const paramsToSign = body?.paramsToSign;

        if (
            !paramsToSign ||
            typeof paramsToSign !== 'object' ||
            Array.isArray(paramsToSign)
        ) {
            return badRequest('paramsToSign object is required');
        }

        const expectedFolder = `users/${currentUser.id}`;
        if (paramsToSign.folder !== expectedFolder) {
            logger.warn(
                'POST /api/upload/cloudinary-sign - folder ownership mismatch',
                {
                    userId: currentUser.id,
                    requestedFolder: paramsToSign.folder,
                }
            );
            return forbiddenResponse(
                'Uploads must target your own user folder'
            );
        }

        const sanitizedParams: Record<string, string | number> = {};
        for (const [key, value] of Object.entries(paramsToSign)) {
            if (!ALLOWED_SIGN_PARAMS.has(key)) {
                return badRequest(`Disallowed upload parameter: ${key}`);
            }
            if (typeof value !== 'string' && typeof value !== 'number') {
                return badRequest(`Invalid value for parameter: ${key}`);
            }
            if (typeof value === 'string' && value.includes('..')) {
                return badRequest(`Invalid value for parameter: ${key}`);
            }
            sanitizedParams[key] = value;
        }

        const signature = cloudinary.utils.api_sign_request(
            sanitizedParams,
            apiSecret
        );

        logger.info('POST /api/upload/cloudinary-sign - success', {
            userId: currentUser.id,
            folder: expectedFolder,
        });

        return NextResponse.json({ signature });
    } catch (error: any) {
        logger.error('POST /api/upload/cloudinary-sign - error', {
            error: error?.message || String(error),
        });
        return internalServerError('Failed to sign upload request');
    }
}
