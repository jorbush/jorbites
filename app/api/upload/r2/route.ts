import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorizedResponse,
    badRequest,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { contentCreationRatelimit } from '@/app/lib/ratelimit';

const ALLOWED_IMAGE_MIME_TYPES: Record<string, string> = {
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/avif': 'avif',
    'image/gif': 'gif',
};

const ALLOWED_IMAGE_EXTENSIONS = new Set([
    'webp',
    'jpg',
    'jpeg',
    'png',
    'avif',
    'gif',
]);

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

const accountId = process.env.R2_ACCOUNT_ID || 'mock-account-id';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || 'mock-access-key';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || 'mock-secret-key';
const bucketName = process.env.R2_BUCKET_NAME || 'jorbites-remakes';
const publicDomain = process.env.R2_PUBLIC_DOMAIN || 'images.jorbites.com';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to upload image'
            );
        }

        if (
            process.env.NODE_ENV === 'production' &&
            (!process.env.R2_ACCOUNT_ID ||
                !process.env.R2_ACCESS_KEY_ID ||
                !process.env.R2_SECRET_ACCESS_KEY)
        ) {
            logger.error(
                'POST /api/upload/r2 - missing R2 credentials in production'
            );
            return internalServerError('Storage service configuration error');
        }

        // Rate limiting for upload URL generation
        if (process.env.ENV === 'production') {
            const { success, reset } = await contentCreationRatelimit.limit(
                currentUser.id
            );
            if (!success) {
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                logger.warn('POST /api/upload/r2 - rate limit exceeded', {
                    userId: currentUser.id,
                });
                return rateLimitExceeded(
                    `Too many upload requests. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                );
            }
        }

        const body = await request.json();
        const { filename, contentType, contentLength } = body;

        if (!filename || typeof filename !== 'string') {
            return badRequest('Filename is required');
        }

        const fileContentType = (
            typeof contentType === 'string' && contentType
                ? contentType
                : 'image/webp'
        )
            .split(';')[0]
            .trim()
            .toLowerCase();

        if (!ALLOWED_IMAGE_MIME_TYPES[fileContentType]) {
            return badRequest(
                'Invalid content type. Only image files are allowed.'
            );
        }

        let validatedContentLength: number | undefined;
        if (contentLength !== undefined && contentLength !== null) {
            if (
                typeof contentLength !== 'number' ||
                !Number.isInteger(contentLength) ||
                contentLength <= 0 ||
                contentLength > MAX_UPLOAD_BYTES
            ) {
                return badRequest(
                    `File size must be between 1 byte and ${MAX_UPLOAD_BYTES} bytes.`
                );
            }
            validatedContentLength = contentLength;
        }

        const rawExtension = filename.includes('.')
            ? filename
                  .split('.')
                  .pop()
                  ?.toLowerCase()
                  .replace(/[^a-z0-9]/g, '') || ''
            : '';
        const extension = ALLOWED_IMAGE_EXTENSIONS.has(rawExtension)
            ? rawExtension
            : ALLOWED_IMAGE_MIME_TYPES[fileContentType];
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(6).toString('hex');
        const key = `remakes/${currentUser.id}/${timestamp}-${randomString}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: fileContentType,
            ...(validatedContentLength !== undefined
                ? { ContentLength: validatedContentLength }
                : {}),
        });

        const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
        });

        const formattedPublicDomain = publicDomain.replace(/\/+$/, '');
        const publicUrl =
            formattedPublicDomain.startsWith('http://') ||
            formattedPublicDomain.startsWith('https://')
                ? `${formattedPublicDomain}/${key}`
                : `https://${formattedPublicDomain}/${key}`;

        logger.info('POST /api/upload/r2 - success', {
            userId: currentUser.id,
            key,
            publicUrl,
        });

        return NextResponse.json({
            uploadUrl,
            publicUrl,
            key,
        });
    } catch (error: any) {
        logger.error('POST /api/upload/r2 - error', {
            error: error?.message || String(error),
        });
        return internalServerError('Failed to generate upload URL');
    }
}
