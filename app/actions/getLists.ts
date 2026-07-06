import prisma from '@/app/lib/prismadb';
import getCurrentUser from './getCurrentUser';
import { logger } from '../lib/axiom/server';
import { USER_SELECT_FIELDS } from '../utils/constants';

export default async function getLists() {
    try {
        const currentUser = await getCurrentUser();

        // 1. Prepare community lists query
        const communityListsPromise = prisma.list.findMany({
            where: {
                isPrivate: false,
                ...(currentUser && {
                    NOT: {
                        userId: currentUser.id,
                    },
                }),
            },
            include: {
                user: {
                    select: USER_SELECT_FIELDS,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // 2. Prepare user's own lists query (only if currentUser is logged in)
        const myListsPromise = currentUser
            ? prisma.list.findMany({
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
              })
            : Promise.resolve([]);

        // 3. Resolve both queries in parallel
        const [communityLists, userLists] = await Promise.all([
            communityListsPromise,
            myListsPromise,
        ]);

        // Helper to convert Prisma dates to ISO strings for safe serialization in server components
        const mapToSafe = (list: any) => ({
            ...list,
            createdAt: list.createdAt.toISOString(),
            updatedAt: list.updatedAt.toISOString(),
            user: list.user
                ? {
                      ...list.user,
                      createdAt: list.user.createdAt.toISOString(),
                      updatedAt: list.user.updatedAt.toISOString(),
                      emailVerified:
                          list.user.emailVerified?.toISOString() || null,
                  }
                : undefined,
        });

        const safeCommunityLists = communityLists.map(mapToSafe);

        if (!currentUser) {
            return {
                myLists: [],
                communityLists: safeCommunityLists,
            };
        }

        let lists = [...userLists];

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
                logger.error('getLists - error creating default list', {
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

        const safeMyLists = lists.map(mapToSafe);

        return {
            myLists: safeMyLists,
            communityLists: safeCommunityLists,
        };
    } catch (error: any) {
        logger.error('getLists - error', { error: error.message });
        return {
            myLists: [],
            communityLists: [],
        };
    }
}
