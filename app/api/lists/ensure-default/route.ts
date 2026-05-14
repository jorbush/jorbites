import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import { USER_SELECT_FIELDS } from '@/app/utils/constants';
import {
    unauthorized,
    internalServerError,
} from '@/app/utils/apiErrors';

export async function POST() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('Unauthorized');
        }

        logger.info('POST /api/lists/ensure-default - start', { userId: currentUser.id });

        let lists = await prisma.list.findMany({
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
                            select: USER_SELECT_FIELDS,
                        },
                    },
                });
                lists = [defaultList];
            } catch (error: any) {
                logger.error('POST /api/lists/ensure-default - error creating default list: ', {
                    error: error.message,
                });
                // If a parallel request already created it, re-fetch
                lists = await prisma.list.findMany({
                    where: { userId: currentUser.id },
                    include: {
                        user: {
                            select: USER_SELECT_FIELDS,
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                });
            }
        }

        logger.info('POST /api/lists/ensure-default - success', {
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
        logger.error('POST /api/lists/ensure-default - error', { error: error.message });
        return internalServerError('Internal Error');
    }
}
