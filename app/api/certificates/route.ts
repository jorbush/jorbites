import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import {
    unauthorizedResponse,
    internalServerError,
    badRequest,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { authenticatedRatelimit } from '@/app/lib/ratelimit';
import {
    isValidCourseId,
    getCourseCatalogEntry,
} from '@/app/utils/courseCatalog';
import {
    PUBLIC_CERTIFICATE_USER_SELECT_FIELDS,
    generateSecureCertId,
    toSafeCertificate,
} from '@/app/utils/certificateUtils';

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse('Unauthorized');
        }

        const { searchParams } = new URL(request.url);
        const rawCourseId = searchParams.get('courseId');
        const courseId = rawCourseId ? rawCourseId.trim() : null;

        logger.info('GET /api/certificates - start', {
            userId: currentUser.id,
            courseId,
        });

        const certificates = await prisma.certificate.findMany({
            where: {
                userId: currentUser.id,
                ...(courseId ? { courseId } : {}),
            },
            include: {
                user: {
                    select: PUBLIC_CERTIFICATE_USER_SELECT_FIELDS,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        logger.info('GET /api/certificates - success', {
            userId: currentUser.id,
            count: certificates.length,
        });

        return NextResponse.json(certificates.map((c) => toSafeCertificate(c)));
    } catch (error: any) {
        logger.error('GET /api/certificates - error', { error: error.message });
        return internalServerError('Internal Error');
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse('Unauthorized');
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
                return rateLimitExceeded(
                    'Too many requests. Please try again later.',
                    retryAfterSeconds
                );
            }
        }

        logger.info('POST /api/certificates - start', {
            userId: currentUser.id,
        });

        const body = await request.json();
        const { courseId, userName } = body;

        if (typeof courseId !== 'string' || !isValidCourseId(courseId)) {
            return badRequest('Invalid course ID');
        }

        const trimmedCourseId = courseId.trim();
        const catalogEntry = getCourseCatalogEntry(trimmedCourseId);
        if (!catalogEntry) {
            return badRequest('Invalid course ID');
        }

        if (
            typeof userName !== 'string' ||
            userName.trim().length < 2 ||
            userName.trim().length > 60
        ) {
            return badRequest('User name must be between 2 and 60 characters');
        }

        const trimmedUserName = userName.trim();

        // Server-side authoritative metadata
        const courseTitle = catalogEntry.title;
        const badgeUrl = catalogEntry.badgeUrl;

        // Retry loop for upsert in case of unique certId collision
        let certificate = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (!certificate && attempts < maxAttempts) {
            attempts++;
            const generatedCertId = generateSecureCertId();

            try {
                certificate = await prisma.certificate.upsert({
                    where: {
                        userId_courseId: {
                            userId: currentUser.id,
                            courseId: trimmedCourseId,
                        },
                    },
                    create: {
                        certId: generatedCertId,
                        userId: currentUser.id,
                        courseId: trimmedCourseId,
                        courseTitle,
                        userName: trimmedUserName,
                        badgeUrl,
                    },
                    update: {
                        userName: trimmedUserName,
                        courseTitle,
                        badgeUrl,
                    },
                    include: {
                        user: {
                            select: PUBLIC_CERTIFICATE_USER_SELECT_FIELDS,
                        },
                    },
                });
            } catch (upsertError: any) {
                // If collision on unique certId (P2002), retry with new generatedCertId
                if (
                    upsertError.code === 'P2002' &&
                    upsertError.meta?.target?.includes('certId') &&
                    attempts < maxAttempts
                ) {
                    continue;
                }
                throw upsertError;
            }
        }

        if (!certificate) {
            throw new Error('Failed to create certificate after retries');
        }

        logger.info('POST /api/certificates - success', {
            certificateId: certificate.id,
            certId: certificate.certId,
            userId: currentUser.id,
            courseId: certificate.courseId,
        });

        return NextResponse.json(toSafeCertificate(certificate));
    } catch (error: any) {
        logger.error('POST /api/certificates - error', {
            error: error.message,
        });
        return internalServerError('Internal Error');
    }
}
