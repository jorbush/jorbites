import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import getCurrentUser from '@/app/actions/getCurrentUser';

export interface IWorkshopsParams {
    search?: string;
    page?: number;
    limit?: number;
    upcoming?: boolean; // Filter for upcoming workshops only
    isPrivate?: boolean;
    hostId?: string; // Filter by host
}

export interface ServerResponse<T> {
    data: T | null;
    error: {
        code: string;
        message: string;
    } | null;
}

export interface WorkshopsResponse {
    workshops: any[];
    totalWorkshops: number;
    totalPages: number;
    currentPage: number;
}

export default async function getWorkshops(
    params: IWorkshopsParams
): Promise<ServerResponse<WorkshopsResponse>> {
    try {
        logger.info('getWorkshops - start', { params });
        const {
            search,
            page = 1,
            limit = 10,
            upcoming = true,
            isPrivate,
            hostId,
        } = params;

        const currentUser = await getCurrentUser();
        let query: any = {};

        // Filter by search
        if (typeof search === 'string' && search.trim()) {
            query.OR = [
                {
                    title: {
                        contains: search.trim(),
                        mode: 'insensitive',
                    },
                },
                {
                    description: {
                        contains: search.trim(),
                        mode: 'insensitive',
                    },
                },
                {
                    location: {
                        contains: search.trim(),
                        mode: 'insensitive',
                    },
                },
            ];
        }

        // Filter upcoming workshops
        if (upcoming) {
            query.date = {
                gte: new Date(),
            };
        }

        // Filter by host
        if (hostId) {
            query.hostId = hostId;
        }

        // Filter private workshops - only show if user is host or whitelisted
        if (isPrivate !== undefined) {
            if (isPrivate) {
                if (currentUser) {
                    query.OR = [
                        { hostId: currentUser.id },
                        { whitelistedUserIds: { has: currentUser.id } },
                    ];
                } else {
                    // Anonymous users can't see private workshops
                    return {
                        data: {
                            workshops: [],
                            totalWorkshops: 0,
                            totalPages: 0,
                            currentPage: page,
                        },
                        error: null,
                    };
                }
            } else {
                query.isPrivate = false;
            }
        } else {
            // By default, show public workshops and private ones user has access to
            if (currentUser) {
                query.OR = [
                    { isPrivate: false },
                    { hostId: currentUser.id },
                    { whitelistedUserIds: { has: currentUser.id } },
                ];
            } else {
                query.isPrivate = false;
            }
        }

        const workshops = await prisma.workshop.findMany({
            where: query,
            orderBy: { date: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                host: true,
                participants: true,
            },
        });

        const totalWorkshops = await prisma.workshop.count({
            where: query,
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

        logger.info('getWorkshops - success', { totalWorkshops, page, limit });
        return {
            data: {
                workshops: safeWorkshops,
                totalWorkshops,
                totalPages: Math.ceil(totalWorkshops / limit),
                currentPage: page,
            },
            error: null,
        };
    } catch (error: any) {
        logger.error('getWorkshops - error', { error: error.message, params });
        return {
            data: null,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to get workshops',
            },
        };
    }
}
