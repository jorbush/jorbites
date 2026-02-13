import { NextResponse } from 'next/server';
import { getSitemapData } from '@/app/sitemap';
import {
    INDEXNOW_API_KEY,
    INDEXNOW_HOST,
    INDEXNOW_KEY_LOCATION,
    INDEXNOW_API_URL,
} from '@/app/utils/constants';
import { internalServerError, validationError } from '@/app/utils/apiErrors';

export async function POST() {
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
        });

        if (!response.ok) {
            return validationError(
                `IndexNow submission failed: ${response.statusText}`,
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
