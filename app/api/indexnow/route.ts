import { NextResponse } from 'next/server';
import { getSitemapData } from '@/app/sitemap';
import {
    INDEXNOW_API_KEY,
    INDEXNOW_HOST,
    INDEXNOW_KEY_LOCATION,
    INDEXNOW_API_URL,
} from '@/app/utils/constants';

import {
    internalServerError,
    unauthorizedResponse,
} from '@/app/utils/apiErrors';
import { safeCompareSecret } from '@/app/utils/cryptoUtils';

export async function POST(request: Request) {
    const indexNowSecret = process.env.INDEXNOW_SECRET;
    if (!indexNowSecret) {
        return internalServerError('IndexNow secret is not configured');
    }

    const authHeader = request.headers.get('authorization');
    const providedToken = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : null;
    if (!safeCompareSecret(providedToken, indexNowSecret)) {
        return unauthorizedResponse('Invalid or missing IndexNow secret');
    }

    try {
        const sitemapData = await getSitemapData();
        const urls = sitemapData.map((entry) => entry.url);

        const response = await fetch(INDEXNOW_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                host: INDEXNOW_HOST,
                key: INDEXNOW_API_KEY,
                keyLocation: INDEXNOW_KEY_LOCATION,
                urlList: urls,
            }),
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: `IndexNow submission failed: ${response.statusText}`,
                    code: 'INDEXNOW_ERROR',
                    timestamp: new Date().toISOString(),
                },
                { status: response.status }
            );
        }

        return NextResponse.json({
            message: 'Successfully submitted URLs to IndexNow',
            count: urls.length,
        });
    } catch (error) {
        console.error('IndexNow error:', error);
        return internalServerError();
    }
}
