import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    workshopId?: string;
}

export default async function getWorkshopById(params: IParams) {
    try {
        logger.info('getWorkshopById - start', {
            workshopId: params.workshopId,
        });
        const { workshopId } = params;

        const workshop = await prisma.workshop.findUnique({
            where: {
                id: workshopId,
            },
            include: {
                host: true,
                participants: {
                    include: {
                        workshop: false,
                    },
                },
            },
        });

        if (!workshop) {
            logger.info('getWorkshopById - workshop not found', { workshopId });
            return null;
        }

        logger.info('getWorkshopById - success', { workshopId });
        return {
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
        };
    } catch (error: any) {
        logger.error('getWorkshopById - error', {
            error: error.message,
            workshopId: params.workshopId,
        });
        throw new Error(error);
    }
}
