import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';

export default async function getCurrentUser() {
    try {
        logger.info('getCurrentUser - start');
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            logger.info('getCurrentUser - no session');
            return null;
        }

        const currentUser = await prisma.user.findUnique({
            where: {
                email: session.user.email as string,
            },
        });

        if (!currentUser) {
            logger.info('getCurrentUser - user not found');
            return null;
        }

        logger.info('getCurrentUser - success', { userId: currentUser.id });
        return {
            ...currentUser,
            createdAt: currentUser.createdAt.toISOString(),
            updatedAt: currentUser.updatedAt.toISOString(),
            emailVerified: currentUser.emailVerified?.toISOString() || null,
        };
    } catch (error: any) {
        logger.error('getCurrentUser - error', { error: error.message });
        return null;
    }
}
