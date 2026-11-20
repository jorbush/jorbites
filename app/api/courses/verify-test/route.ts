import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import { authenticatedRatelimit } from '@/app/lib/ratelimit';
import {
    unauthorizedResponse,
    badRequest,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { isValidCourseId } from '@/app/utils/courseCatalog';
import { gradeCourseAnswers } from '@/app/utils/courseQuestions';
import { createCompletionToken } from '@/app/utils/certificateProof';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse('Unauthorized');
        }

        if (
            process.env.NODE_ENV === 'production' ||
            process.env.ENV === 'production'
        ) {
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

        const body = await request.json().catch(() => null);
        if (!body || typeof body !== 'object') {
            return badRequest('Invalid request payload');
        }

        const { courseId, answers } = body as {
            courseId?: unknown;
            answers?: unknown;
        };

        if (typeof courseId !== 'string' || !isValidCourseId(courseId)) {
            return badRequest('Invalid course ID');
        }

        const trimmedCourseId = courseId.trim();
        const grade = gradeCourseAnswers(trimmedCourseId, answers);

        if (!grade) {
            return badRequest('Valid course answers are required');
        }

        if (!grade.passed) {
            logger.info('POST /api/courses/verify-test - did not pass', {
                userId: currentUser.id,
                courseId: trimmedCourseId,
                score: grade.score,
                total: grade.total,
            });
            return NextResponse.json({
                passed: false,
                score: grade.score,
                total: grade.total,
                passingScore: grade.passingScore,
            });
        }

        const completionToken = createCompletionToken(
            currentUser.id,
            trimmedCourseId
        );

        if (!completionToken) {
            logger.error(
                'POST /api/courses/verify-test - missing certificate signing secret'
            );
            return internalServerError('Certificate verification unavailable');
        }

        logger.info('POST /api/courses/verify-test - passed', {
            userId: currentUser.id,
            courseId: trimmedCourseId,
            score: grade.score,
            total: grade.total,
        });

        return NextResponse.json({
            passed: true,
            score: grade.score,
            total: grade.total,
            passingScore: grade.passingScore,
            completionToken,
        });
    } catch (error: any) {
        logger.error('POST /api/courses/verify-test - error', {
            error: error?.message || String(error),
        });
        return internalServerError('Internal Error');
    }
}
