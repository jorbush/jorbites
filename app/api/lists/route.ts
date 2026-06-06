import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import { USER_SELECT_FIELDS } from '@/app/utils/constants';
import {
    unauthorized,
    internalServerError,
    badRequest,
} from '@/app/utils/apiErrors';

export async function GET() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('Unauthorized');
        }

        logger.info('GET /api/lists - start', { userId: currentUser.id });

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

        logger.info('GET /api/lists - success', {
            userId: currentUser.id,
            listCount: lists.length,
        });

        const safeLists = lists.map((list) => ({
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

        return NextResponse.json(safeLists);
    } catch (error: any) {
        logger.error('GET /api/lists - error', { error: error.message });
        return internalServerError('Internal Error');
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('Unauthorized');
        }

        logger.info('POST /api/lists - start', { userId: currentUser.id });

        const body = await request.json();
        const { name, isPrivate, recipeId, isDefault } = body;

        if (typeof name !== 'string' || name.trim().length === 0) {
            return badRequest('Missing or invalid name');
        }

        let list;
        try {
            list = await prisma.list.create({
                data: {
                    name: name.trim(),
                    isPrivate: isPrivate !== undefined ? isPrivate : true,
                    isDefault: isDefault === true,
                    userId: currentUser.id,
                    ...(recipeId && { recipeIds: [recipeId] }),
                },
                include: {
                    user: {
                        select: USER_SELECT_FIELDS,
                    },
                },
            });
        } catch (error: any) {
            if (isDefault) {
                logger.warn(
                    'POST /api/lists - error creating default list, checking if already exists: ',
                    {
                        error: error.message,
                    }
                );
                const existing = await prisma.list.findFirst({
                    where: {
                        userId: currentUser.id,
                        isDefault: true,
                    },
                    include: {
                        user: {
                            select: USER_SELECT_FIELDS,
                        },
                    },
                });
                if (existing) {
                    list = existing;
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }

        logger.info('POST /api/lists - success', { listId: list.id });

        const safeList = {
            ...list,
            createdAt: list.createdAt.toISOString(),
            updatedAt: list.updatedAt.toISOString(),
            user: {
                ...list.user,
                createdAt: list.user.createdAt.toISOString(),
                updatedAt: list.user.updatedAt.toISOString(),
                emailVerified: list.user.emailVerified?.toISOString() || null,
            },
        };

        return NextResponse.json(safeList);
    } catch (error: any) {
        logger.error('POST /api/lists - error', { error: error.message });
        return internalServerError('Internal Error');
    }
}
