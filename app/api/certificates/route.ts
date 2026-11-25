import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { after } from 'next/server';
import { emitServerAnalyticsEvent } from '@/app/lib/analytics/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import {
    unauthorizedResponse,
    forbiddenResponse,
    internalServerError,
    badRequest,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { authenticatedRatelimit } from '@/app/lib/ratelimit';
import {
    isValidCourseId,
    getCourseCatalogEntry,
} from '@/app/utils/courseCatalog';
import { gradeCourseAnswers } from '@/app/utils/courseQuestions';
import { verifyCompletionToken } from '@/app/utils/certificateProof';
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
        const { courseId, userName, completionToken, answers } = body;

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

        // Allow updating display name on an already-issued certificate;
        // require verified server-side course completion for new issuance.
        const existingCertificate = await prisma.certificate.findUnique({
            where: {
                userId_courseId: {
                    userId: currentUser.id,
                    courseId: trimmedCourseId,
                },
            },
            select: {
                id: true,
            },
        });

        if (!existingCertificate) {
            const hasValidToken = verifyCompletionToken(
                completionToken,
                currentUser.id,
                trimmedCourseId
            );
            const hasPassingAnswers =
                !hasValidToken &&
                Boolean(
                    answers &&
                    gradeCourseAnswers(trimmedCourseId, answers)?.passed
                );

            if (!hasValidToken && !hasPassingAnswers) {
                logger.warn?.(
                    'POST /api/certificates - missing or invalid completion verification',
                    {
                        userId: currentUser.id,
                        courseId: trimmedCourseId,
                    }
                );
                return forbiddenResponse(
                    'Course completion verification required before issuing a certificate'
                );
            }
        }

        // Server-side authoritative metadata
        const courseTitle = catalogEntry.title;
        const badgeUrl = catalogEntry.badgeUrl;

        // Helper to check for unique certId collision (P2002) using Set for constant time lookup
        const isCertIdCollision = (error: unknown): boolean => {
            if (!error || typeof error !== 'object') return false;
            const err = error as { code?: string; meta?: { target?: unknown } };
            if (err.code !== 'P2002') return false;
            const target = err.meta?.target;
            if (Array.isArray(target)) {
                return new Set(target).has('certId');
            }
            return typeof target === 'string' && target.includes('certId');
        };

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
                if (isCertIdCollision(upsertError) && attempts < maxAttempts) {
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

        const courseIdForAnalytics = certificate.courseId;
        after(async () => {
            await emitServerAnalyticsEvent({
                category: 'content',
                name: 'certificate_issued',
                path: '/certificates/[id]',
                locale: currentUser.language || undefined,
                props: {
                    course_id: courseIdForAnalytics,
                },
            });
        });

        return NextResponse.json(toSafeCertificate(certificate));
    } catch (error: any) {
        logger.error('POST /api/certificates - error', {
            error: error.message,
        });
        return internalServerError('Internal Error');
    }
}
