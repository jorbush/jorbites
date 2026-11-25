import { NextRequest, NextResponse, after } from 'next/server';
import { analyticsRatelimit } from '@/app/lib/ratelimit';
import { badRequest, rateLimitExceeded } from '@/app/utils/apiErrors';
import {
    AnalyticsEventPayload,
    ClientAnalyticsInput,
    detectCoarseDevice,
    isBotUserAgent,
    normalizeCountryCode,
} from '@/app/types/analytics';
import {
    buildAnalyticsPayload,
    emitAnalyticsBatch,
} from '@/app/lib/analytics/server';

const MAX_BODY_BYTES = 16 * 1024; // 16 KB
const MAX_BATCH_SIZE = 25;

export async function POST(request: NextRequest) {
    const userAgent = request.headers.get('user-agent');
    if (isBotUserAgent(userAgent)) {
        return new NextResponse(null, { status: 204 });
    }

    const contentLength = request.headers.get('content-length');
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
        return badRequest('Analytics payload too large');
    }

    if (
        process.env.NODE_ENV === 'production' ||
        process.env.ENV === 'production'
    ) {
        const ip =
            request.headers.get('x-real-ip')?.trim() ||
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            'unknown-ip';
        const { success, reset } = await analyticsRatelimit.limit(
            `analytics:${ip}`
        );
        if (!success) {
            const retryAfterSeconds = Math.max(
                1,
                Math.ceil((reset - Date.now()) / 1000)
            );
            return rateLimitExceeded(
                'Too many analytics batches. Please try again later.',
                retryAfterSeconds
            );
        }
    }

    let rawText: string;
    try {
        rawText = await request.text();
    } catch {
        return badRequest('Invalid request body');
    }

    if (Buffer.byteLength(rawText, 'utf8') > MAX_BODY_BYTES) {
        return badRequest('Analytics payload too large');
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(rawText);
    } catch {
        return badRequest('Malformed JSON payload');
    }

    const rawEvents = (parsed as { events?: unknown })?.events;
    if (!Array.isArray(rawEvents) || rawEvents.length === 0) {
        return badRequest('events must be a non-empty array');
    }

    if (rawEvents.length > MAX_BATCH_SIZE) {
        return badRequest(`Maximum ${MAX_BATCH_SIZE} events per batch`);
    }

    const device = detectCoarseDevice(userAgent);
    const country = normalizeCountryCode(
        request.headers.get('x-vercel-ip-country')
    );
    const headerReferrer = request.headers.get('referer') || undefined;

    const validEvents: AnalyticsEventPayload[] = [];
    for (const item of rawEvents) {
        if (!item || typeof item !== 'object') {
            continue;
        }
        const input = item as ClientAnalyticsInput;
        const payload = buildAnalyticsPayload({
            category: input.category,
            name: input.name,
            path: input.path,
            locale: input.locale,
            device,
            country,
            referrer: input.referrer ?? headerReferrer,
            props: input.props,
            ts: input.ts,
        });
        if (payload) {
            validEvents.push(payload);
        }
    }

    if (validEvents.length === 0) {
        return badRequest('No valid analytics events in batch');
    }

    after(async () => {
        await emitAnalyticsBatch(validEvents);
    });

    return NextResponse.json({ accepted: validEvents.length }, { status: 202 });
}
