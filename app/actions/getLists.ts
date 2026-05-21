import prisma from '@/app/lib/prismadb';
import getCurrentUser from './getCurrentUser';
import { logger } from '../lib/axiom/server';
import { USER_SELECT_FIELDS } from '../utils/constants';

export default async function getLists() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return [];
        }

        const lists = await prisma.list.findMany({
            where: {
                userId: currentUser.id,
            },
            include: {
                user: {
                    select: USER_SELECT_FIELDS,
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return lists.map((list) => ({
            ...list,
            createdAt: list.createdAt.toISOString(),
            updatedAt: list.updatedAt.toISOString(),
            user: {
                ...list.user,
                createdAt: list.user.createdAt.toISOString(),
                updatedAt: list.user.updatedAt.toISOString(),
                emailVerified: list.user.emailVerified?.toISOString() || null,
            },
        }));
    } catch (error: any) {
        logger.error('getLists - error', { error: error.message });
        return [];
    }
}
