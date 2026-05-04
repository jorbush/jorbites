import prisma from '@/app/lib/prismadb';
import getCurrentUser from './getCurrentUser';
import { logger } from '../lib/axiom/server';

export default async function getLists() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return [];
        }

        let lists = await prisma.list.findMany({
            where: {
                userId: currentUser.id,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        if (lists.length === 0) {
            const defaultList = await prisma.list.create({
                data: {
                    name: 'to cook later',
                    isDefault: true,
                    isPrivate: true,
                    userId: currentUser.id,
                },
            });
            lists = [defaultList];
        }

        return lists.map((list) => ({
            ...list,
            createdAt: list.createdAt.toISOString(),
            updatedAt: list.updatedAt.toISOString(),
        }));
    } catch (error: any) {
        logger.error('getLists - error', { error: error.message });
        return [];
    }
}
