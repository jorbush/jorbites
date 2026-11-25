import { NextRequest } from 'next/server';
import { POST as AnalyticsPOST } from '@/app/api/analytics/route';

jest.mock('@/app/lib/kafka', () => ({
    __esModule: true,
    default: null,
    kafkaStatus: { isConnected: false },
    produceKafkaBatch: jest.fn().mockResolvedValue(true),
}));

import { produceKafkaBatch } from '@/app/lib/kafka';

function makeRequest(
    body: unknown,
    headers: Record<string, string> = {}
): NextRequest {
    const raw = typeof body === 'string' ? body : JSON.stringify(body);
    return new NextRequest('https://jorbites.com/api/analytics', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'user-agent':
                'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148',
            'x-vercel-ip-country': 'ES',
            ...headers,
        },
        body: raw,
    });
}

describe('POST /api/analytics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('accepts a valid batch, normalizes routes, strips PII props, and emits to Kafka', async () => {
        const req = makeRequest({
            events: [
                {
                    category: 'feature',
                    name: 'ingredient_scaler_used',
                    path: '/recipes/671234567890abcdef123456?foo=bar',
                    locale: 'es-ES',
                    referrer: 'https://www.google.com/search?q=paella',
                    props: {
                        direction: 'up',
                        userId: 'secret-user-id',
                        email: 'user@example.com',
                        ip: '1.2.3.4',
                    },
                },
            ],
        });

        const res = await AnalyticsPOST(req);
        expect(res.status).toBe(202);
        const json = await res.json();
        expect(json.accepted).toBe(1);

        expect(produceKafkaBatch).toHaveBeenCalledTimes(1);
        const [topic, messages] = (produceKafkaBatch as jest.Mock).mock
            .calls[0];
        expect(topic).toBe('analytics-events');
        expect(messages).toHaveLength(1);

        const payload = JSON.parse(messages[0].value);
        expect(payload.v).toBe(1);
        expect(payload.category).toBe('feature');
        expect(payload.name).toBe('ingredient_scaler_used');
        expect(payload.path).toBe('/recipes/[id]');
        expect(payload.locale).toBe('es');
        expect(payload.device).toBe('mobile');
        expect(payload.country).toBe('ES');
        expect(payload.referrer).toBe('google.com');
        expect(payload.props).toEqual({ direction: 'up' });
        expect(payload.userId).toBeUndefined();
    });

    it('silently drops bot user agents with 204', async () => {
        const req = makeRequest(
            {
                events: [{ category: 'page', name: 'page_view', path: '/' }],
            },
            { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' }
        );

        const res = await AnalyticsPOST(req);
        expect(res.status).toBe(204);
        expect(produceKafkaBatch).not.toHaveBeenCalled();
    });

    it('rejects disallowed event names with 400', async () => {
        const req = makeRequest({
            events: [
                {
                    category: 'feature',
                    name: 'arbitrary_unlisted_event',
                    path: '/',
                },
            ],
        });

        const res = await AnalyticsPOST(req);
        expect(res.status).toBe(400);
        expect(produceKafkaBatch).not.toHaveBeenCalled();
    });

    it('rejects batches exceeding 25 events', async () => {
        const events = Array.from({ length: 26 }, () => ({
            category: 'page',
            name: 'page_view',
            path: '/',
        }));
        const req = makeRequest({ events });
        const res = await AnalyticsPOST(req);
        expect(res.status).toBe(400);
        expect(produceKafkaBatch).not.toHaveBeenCalled();
    });

    it('rejects malformed JSON', async () => {
        const req = makeRequest('{not-valid-json');
        const res = await AnalyticsPOST(req);
        expect(res.status).toBe(400);
    });
});
