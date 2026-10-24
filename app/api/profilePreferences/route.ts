import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import {
    unauthorizedResponse,
    badRequest,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { DEFAULT_PROFILE_PREFERENCES } from '@/app/utils/profile-utils';

const ALLOWED_KEYS = new Set([
    'showStats',
    'showActivityGraph',
    'showArticles',
]);

export async function GET() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to fetch profile preferences'
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: { profilePreferences: true },
        });

        const preferences = user?.profilePreferences
            ? { ...DEFAULT_PROFILE_PREFERENCES, ...user.profilePreferences }
            : DEFAULT_PROFILE_PREFERENCES;

        return NextResponse.json(preferences);
    } catch (error: any) {
        logger.error('GET /api/profilePreferences - error', {
            error: error.message,
        });
        return internalServerError('Failed to fetch profile preferences');
    }
}

export async function PATCH(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to update profile preferences'
            );
        }

        let body: any;
        try {
            body = await request.json();
        } catch {
            return badRequest('Invalid JSON body');
        }

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return badRequest('Invalid request body');
        }

        for (const key of Object.keys(body)) {
            if (!ALLOWED_KEYS.has(key)) {
                return badRequest(`Unknown preference key: ${key}`);
            }
            if (typeof body[key] !== 'boolean') {
                return badRequest(
                    `Preference value for ${key} must be a boolean`
                );
            }
        }

        const currentUserData = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: { profilePreferences: true },
        });

        const currentPreferences =
            currentUserData?.profilePreferences || DEFAULT_PROFILE_PREFERENCES;

        const updatedPreferences = {
            ...DEFAULT_PROFILE_PREFERENCES,
            ...currentPreferences,
            ...body,
        };

        const updatedUser = await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                profilePreferences: updatedPreferences,
            },
            select: {
                id: true,
                profilePreferences: true,
            },
        });

        logger.info('PATCH /api/profilePreferences - success', {
            userId: currentUser.id,
            profilePreferences: updatedUser.profilePreferences,
        });

        return NextResponse.json(updatedUser.profilePreferences);
    } catch (error: any) {
        logger.error('PATCH /api/profilePreferences - error', {
            error: error.message,
        });
        return internalServerError('Failed to update profile preferences');
    }
}
