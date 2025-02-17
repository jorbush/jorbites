import prisma from '@/app/libs/prismadb';

export default async function getTopJorbiters() {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                level: 'desc',
            },
            take: 10,
        });
        if (!users) {
            return null;
        }
        return users.map((user) => ({
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            emailVerified: user.emailVerified?.toISOString() || null,
        }));
    } catch (error: any) {
        console.error(error);
        return error;
    }
}
