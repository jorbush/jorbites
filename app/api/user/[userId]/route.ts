import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import {
    unauthorized,
    invalidInput,
    forbidden,
    notFound,
    internalServerError,
} from '@/app/utils/apiErrors';

interface IParams {
    userId?: string;
}

export async function DELETE(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
                'User authentication required to delete account'
            );
        }

        const { userId } = params;

        if (!userId || typeof userId !== 'string') {
            return invalidInput(
                'User ID is required and must be a valid string'
            );
        }

        if (userId !== currentUser.id) {
            return forbidden('You can only delete your own account');
        }

        const userToDelete = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!userToDelete) {
            return notFound('User not found');
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.delete({
                where: {
                    id: userId,
                },
            });
        });

        return NextResponse.json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting user account:', error);
        return internalServerError('Failed to delete account');
    }
}
