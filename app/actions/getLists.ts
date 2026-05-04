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
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        verified: true,
                        level: true,
                        badges: true,
                        createdAt: true,
                        updatedAt: true,
                        emailVerified: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        if (lists.length === 0) {
            try {
                const defaultList = await prisma.list.create({
                    data: {
                        name: 'to cook later',
                        isDefault: true,
                        isPrivate: true,
                        userId: currentUser.id,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                verified: true,
                                level: true,
                                badges: true,
                                createdAt: true,
                                updatedAt: true,
                                emailVerified: true,
                            },
                        },
                    },
                });
                lists = [defaultList];
            } catch (error: any) {
                // If a parallel request already created it, re-fetch
                lists = await prisma.list.findMany({
                    where: { userId: currentUser.id },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                verified: true,
                                level: true,
                                badges: true,
                                createdAt: true,
                                updatedAt: true,
                                emailVerified: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                });
            }
        }

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
