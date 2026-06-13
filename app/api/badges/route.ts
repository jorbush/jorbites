import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '@/app/lib/axiom/server';
import { internalServerError } from '@/app/utils/apiErrors';

export const dynamic = 'force-dynamic';

const badgesDir = path.join(process.cwd(), 'public', 'badges');

// For testing purposes, we allow clearing the promise
let badgesPromise: Promise<string[]> | null = null;

export function _resetBadgesPromise() {
    badgesPromise = null;
}

async function loadBadges() {
    const files = await fs.readdir(badgesDir);
    return files.reduce((acc: string[], file) => {
        if (file.endsWith('.webp')) {
            acc.push(path.parse(file).name);
        }
        return acc;
    }, []);
}

function getBadgesPromise() {
    if (!badgesPromise) {
        badgesPromise = loadBadges();
    }
    return badgesPromise;
}

// Initial load
getBadgesPromise().catch((error) => {
    logger.error('Failed to pre-load badges', { error: error.message });
});

export async function GET() {
    try {
        logger.info('api/badges GET - start');

        const badges = await getBadgesPromise();

        logger.info(`api/badges GET - success, found ${badges.length} badges`);
        return NextResponse.json(badges);
    } catch (error: any) {
        logger.error('api/badges GET - error', {
            error: error.message,
        });
        return internalServerError('Failed to fetch available badges');
    }
}
