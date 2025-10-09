import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import sendEmail from '@/app/actions/sendEmail';
import { EmailType } from '@/app/types/email';
import { unauthorized, internalServerError } from '@/app/utils/apiErrors';

export async function PUT(_request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
                'User authentication required to update email notifications'
            );
        }

        const user = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                emailNotifications: !currentUser.emailNotifications,
            },
        });

        if (user.emailNotifications) {
            await sendEmail({
                type: EmailType.NOTIFICATIONS_ACTIVATED,
                userEmail: user.email,
            });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating email notifications:', error);
        return internalServerError('Failed to update email notifications');
    }
}
