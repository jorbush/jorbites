import crypto from 'crypto';
import { produceKafkaBatch } from '@/app/lib/kafka';
import {
    ALLOWED_ANALYTICS_CATEGORIES,
    ALLOWED_ANALYTICS_EVENTS,
    ANALYTICS_TOPIC,
    AnalyticsDeviceType,
    AnalyticsEventCategory,
    AnalyticsEventName,
    AnalyticsEventPayload,
    extractReferrerHost,
    normalizeAnalyticsLocale,
    normalizeAnalyticsPath,
    normalizeCountryCode,
    sanitizeAnalyticsProps,
} from '@/app/types/analytics';

export interface ServerAnalyticsEventInput {
    category: AnalyticsEventCategory;
    name: AnalyticsEventName;
    path?: string;
    locale?: string;
    device?: AnalyticsDeviceType;
    country?: string;
    referrer?: string;
    props?: Record<string, unknown>;
    ts?: string;
}

export function buildAnalyticsPayload(
    input: ServerAnalyticsEventInput
): AnalyticsEventPayload | null {
    if (
        !ALLOWED_ANALYTICS_CATEGORIES.has(input.category) ||
        !ALLOWED_ANALYTICS_EVENTS.has(input.name)
    ) {
        return null;
    }

    let ts = new Date().toISOString();
    if (input.ts && typeof input.ts === 'string') {
        const parsed = Date.parse(input.ts);
        if (!Number.isNaN(parsed)) {
            const now = Date.now();
            // Clamp client timestamps within +/- 24 hours to prevent skew/poisoning
            if (Math.abs(now - parsed) <= 24 * 60 * 60 * 1000) {
                ts = new Date(parsed).toISOString();
            }
        }
    }

    return {
        v: 1,
        id: crypto.randomUUID(),
        ts,
        category: input.category,
        name: input.name,
        path: normalizeAnalyticsPath(input.path),
        locale: normalizeAnalyticsLocale(input.locale),
        device: input.device || 'unknown',
        country: normalizeCountryCode(input.country),
        referrer: extractReferrerHost(input.referrer),
        props: sanitizeAnalyticsProps(input.props),
    };
}

export async function emitAnalyticsBatch(
    events: AnalyticsEventPayload[]
): Promise<boolean> {
    if (events.length === 0) {
        return true;
    }

    const messages = events.map((event) => ({
        key: `${event.category}:${event.name}`,
        value: JSON.stringify(event),
    }));

    return produceKafkaBatch(ANALYTICS_TOPIC, messages);
}

export async function emitServerAnalyticsEvent(
    input: ServerAnalyticsEventInput
): Promise<boolean> {
    const payload = buildAnalyticsPayload(input);
    if (!payload) {
        return false;
    }
    return emitAnalyticsBatch([payload]);
}
