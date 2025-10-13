import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    userId: string;
}

export default async function getWorkshopsByUserId(params: IParams) {
    try {
        logger.info('getWorkshopsByUserId - start', { userId: params.userId });
        const { userId } = params;

        const workshops = await prisma.workshop.findMany({
            where: {
                hostId: userId,
            },
            orderBy: {
                date: 'asc',
            },
            include: {
                host: true,
                participants: true,
            },
        });

        const safeWorkshops = workshops.map((workshop) => ({
            ...workshop,
            date: workshop.date.toISOString(),
            createdAt: workshop.createdAt.toISOString(),
            updatedAt: workshop.updatedAt.toISOString(),
            host: {
                ...workshop.host,
                createdAt: workshop.host.createdAt.toISOString(),
                updatedAt: workshop.host.updatedAt.toISOString(),
                emailVerified: workshop.host.emailVerified?.toString() || null,
            },
            participants: workshop.participants.map((p) => ({
                ...p,
                joinedAt: p.joinedAt.toISOString(),
            })),
        }));

        logger.info('getWorkshopsByUserId - success', {
            userId,
            count: safeWorkshops.length,
        });
        return safeWorkshops;
    } catch (error: any) {
        logger.error('getWorkshopsByUserId - error', {
            error: error.message,
            userId: params.userId,
        });
        throw new Error(error);
    }
}
