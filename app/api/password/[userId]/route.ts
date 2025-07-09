import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import {
    unauthorized,
    badRequest,
    forbidden,
    internalServerError,
} from '@/app/utils/apiErrors';

interface IParams {
    userId?: string;
}

export async function PATCH(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
                'User authentication required to change password'
            );
        }

        const { userId } = params;

        if (!userId || typeof userId !== 'string') {
            return badRequest('User ID is required and must be a valid string');
        }

        if (userId !== currentUser.id) {
            return forbidden('You can only change your own password');
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return badRequest('Current password and new password are required');
        }

        if (newPassword.length < 6) {
            return badRequest(
                'New password must be at least 6 characters long'
            );
        }

        // Get the user with the hashed password for verification
        const user = await prisma.user.findUnique({
            where: {
                id: currentUser.id,
            },
        });

        if (!user || !user.hashedPassword) {
            return badRequest('User not found or no password set');
        }

        // Verify current password
        const isCorrectPassword = await bcrypt.compare(
            currentPassword,
            user.hashedPassword
        );

        if (!isCorrectPassword) {
            return badRequest('Current password is incorrect');
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Update the user's password
        const updatedUser = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                hashedPassword: hashedNewPassword,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error) {
        console.error('Error changing password:', error);
        return internalServerError('Failed to change password');
    }
}
