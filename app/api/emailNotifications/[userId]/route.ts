import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import sendNotification from '@/app/actions/sendNotification';
import { NotificationType } from '@/app/types/notification';
import { unauthorized, internalServerError } from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

export async function PUT(_request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
                'User authentication required to update email notifications'
            );
        }

        logger.info('PUT /api/emailNotifications/[userId] - start', {
            userId: currentUser.id,
        });

        const user = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                emailNotifications: !currentUser.emailNotifications,
            },
        });

        if (user.emailNotifications) {
            await sendNotification({
                type: NotificationType.NOTIFICATIONS_ACTIVATED,
                userEmail: user.email,
            });
        }

        logger.info('PUT /api/emailNotifications/[userId] - success', {
            userId: user.id,
            emailNotifications: user.emailNotifications,
        });
        return NextResponse.json(user);
    } catch (error: any) {
        logger.error('PUT /api/emailNotifications/[userId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to update email notifications');
    }
}
