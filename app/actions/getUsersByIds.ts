import prisma from '@/app/lib/prismadb';

export default async function getUsersByIds(ids: string[]) {
    if (!ids || ids.length === 0) {
        return [];
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
            select: {
                id: true,
                name: true,
                image: true,
                level: true,
                verified: true,
            },
        });

        return users;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
    }
}
