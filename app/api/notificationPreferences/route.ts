import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import {
    unauthorizedResponse,
    badRequest,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

const DEFAULT_PREFERENCES = {
    social: true,
    newContent: true,
    eventsAndChallenges: true,
    quests: true,
    voting: true,
    achievements: true,
};

export async function GET() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to fetch notification preferences'
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: { notificationPreferences: true },
        });

        const preferences = user?.notificationPreferences
            ? { ...DEFAULT_PREFERENCES, ...user.notificationPreferences }
            : DEFAULT_PREFERENCES;

        return NextResponse.json(preferences);
    } catch (error: any) {
        logger.error('GET /api/notificationPreferences - error', {
            error: error.message,
        });
        return internalServerError('Failed to fetch notification preferences');
    }
}

export async function PATCH(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to update notification preferences'
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

        const allowedKeys = [
            'social',
            'newContent',
            'eventsAndChallenges',
            'quests',
            'voting',
            'achievements',
        ];

        for (const key of Object.keys(body)) {
            if (!allowedKeys.includes(key)) {
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
            select: { notificationPreferences: true },
        });

        const currentPreferences =
            currentUserData?.notificationPreferences || DEFAULT_PREFERENCES;

        const updatedPreferences = {
            ...currentPreferences,
            ...body,
        };

        const updatedUser = await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                notificationPreferences: updatedPreferences,
            },
            select: {
                id: true,
                notificationPreferences: true,
            },
        });

        logger.info('PATCH /api/notificationPreferences - success', {
            userId: currentUser.id,
            notificationPreferences: updatedUser.notificationPreferences,
        });

        return NextResponse.json(updatedUser.notificationPreferences);
    } catch (error: any) {
        logger.error('PATCH /api/notificationPreferences - error', {
            error: error.message,
        });
        return internalServerError('Failed to update notification preferences');
    }
}
