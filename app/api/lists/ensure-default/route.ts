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

        logger.info('POST /api/lists/ensure-default - start', {
            userId: currentUser.id,
        });

        const existingDefaultList = await prisma.list.findFirst({
            where: {
                userId: currentUser.id,
                isDefault: true,
            },
        });

        if (!existingDefaultList) {
            try {
                const defaultList = await prisma.list.create({
                    data: {
                        name: 'to cook later',
                        isDefault: true,
                        isPrivate: true,
                        userId: currentUser.id,
                    },
                });

                logger.info(
                    'POST /api/lists/ensure-default - default list created',
                    {
                        userId: currentUser.id,
                        listId: defaultList.id,
                    }
                );

                return NextResponse.json({
                    message: 'Default list created',
                    created: true,
                });
            } catch (error: any) {
                logger.error(
                    'POST /api/lists/ensure-default - error creating default list',
                    {
                        error: error.message,
                    }
                );

                // Check if it was a parallel request that already created it
                const retryExistingDefaultList = await prisma.list.findFirst({
                    where: {
                        userId: currentUser.id,
                        isDefault: true,
                    },
                });

                if (retryExistingDefaultList) {
                    return NextResponse.json({
                        message: 'Default list already exists',
                        created: false,
                    });
                }

                return internalServerError('Failed to create default list');
            }
        }

        return NextResponse.json({
            message: 'Default list already exists',
            created: false,
        });
    } catch (error: any) {
        logger.error('POST /api/lists/ensure-default - error', { error: error.message });
        return internalServerError('Internal Error');
    }
}
