import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import sendEmail from '@/app/actions/sendEmail';
import { EmailType } from '@/app/types/email';

export async function PUT(_request: Request) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
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
            userEmail: user.email
        });
    }

    return NextResponse.json(user);
}
