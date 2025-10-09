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
import { logger, withAxiom } from '@/app/lib/axiom/server';

interface IParams {
    userId?: string;
}

export const DELETE = withAxiom(
    async (request: Request, props: { params: Promise<IParams> }) => {
        try {
            logger.info('DELETE /api/user/[userId] - start');
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

            logger.info('DELETE /api/user/[userId] - success', { userId });
            return NextResponse.json({
                success: true,
                message: 'Account deleted successfully',
            });
        } catch (error: any) {
            logger.error('DELETE /api/user/[userId] - error', {
                error: error.message,
            });
            return internalServerError('Failed to delete account');
        }
    }
);
