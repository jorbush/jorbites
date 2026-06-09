import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '@/app/lib/axiom/server';
import { internalServerError } from '@/app/utils/apiErrors';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        logger.info('api/badges GET - start');

        const badgesDir = path.join(process.cwd(), 'public', 'badges');
        const files = await fs.readdir(badgesDir);

        const badges = files
            .filter((file) => file.endsWith('.webp'))
            .map((file) => path.parse(file).name);

        logger.info(`api/badges GET - success, found ${badges.length} badges`);
        return NextResponse.json(badges);
    } catch (error: any) {
        logger.error('api/badges GET - error', {
            error: error.message,
        });
        return internalServerError('Failed to fetch available badges');
    }
}
