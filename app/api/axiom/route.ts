import { NextRequest } from 'next/server';
import { logger } from '@/app/lib/axiom/server';
import { createProxyRouteHandler } from '@axiomhq/nextjs';
import { unauthenticatedRatelimit } from '@/app/lib/ratelimit';
import { badRequest, rateLimitExceeded } from '@/app/utils/apiErrors';

const MAX_AXIOM_BODY_BYTES = 64 * 1024; // 64 KB
const axiomHandler = createProxyRouteHandler(logger);

export async function POST(request: NextRequest) {
    const contentLength = request.headers.get('content-length');
    if (contentLength && Number(contentLength) > MAX_AXIOM_BODY_BYTES) {
        return badRequest('Log payload too large');
    }

    if (
        process.env.NODE_ENV === 'production' ||
        process.env.ENV === 'production'
    ) {
        const ip =
            request.headers.get('x-real-ip')?.trim() ||
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            'unknown-ip';
        const { success, reset } = await unauthenticatedRatelimit.limit(
            `axiom:${ip}`
        );
        if (!success) {
            const retryAfterSeconds = Math.max(
                1,
                Math.ceil((reset - Date.now()) / 1000)
            );
            return rateLimitExceeded(
                'Too many log requests. Please try again later.',
                retryAfterSeconds
            );
        }
    }

    return axiomHandler(request);
}
