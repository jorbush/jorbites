import { POST as RecipePOST } from '@/app/api/recipes/route';
import prisma from '@/app/lib/prismadb';
import sendNotification from '@/app/actions/sendNotification';
import updateUserLevel from '@/app/actions/updateUserLevel';
import { redisCache } from '@/app/lib/redis';
import { NotificationType } from '@/app/types/notification';

let mockedSession: any = null;

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        recipe: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        quest: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('@/app/actions/sendNotification', () => jest.fn());
jest.mock('@/app/actions/updateUserLevel', () => jest.fn());

jest.mock('@/app/lib/redis', () => ({
    redisCache: {
        del: jest.fn(),
        incr: jest.fn(),
    },
}));

jest.mock('@/app/actions/getCurrentUser', () =>
    jest.fn(() =>
        Promise.resolve({
            id: 'remixer-user-id',
            name: 'Remix Chef',
            email: 'remixer@test.com',
        })
    )
);

jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => Promise.resolve(mockedSession)),
}));

jest.mock('@/pages/api/auth/[...nextauth].ts', () => ({
    authOptions: {},
}));

describe('Recipe Remix API route (POST /api/recipes with forkedFromRecipeId)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (prisma.recipe.findFirst as jest.Mock).mockResolvedValue(null);
    });

    it('creates a remixed recipe, notifies original author, and awards XP to both', async () => {
        const originalRecipeId = '507f1f77bcf86cd799439011';
        const originalRecipe = {
            id: originalRecipeId,
            title: 'Grandma Secret Pasta',
            userId: 'original-author-id',
            user: {
                id: 'original-author-id',
                name: 'Grandma',
                email: 'grandma@test.com',
            },
        };

        const createdRemix = {
            id: 'new-remix-id',
            title: 'Remix of Grandma Secret Pasta',
            description: 'Added some chili flakes',
            imageSrc: 'https://images.test/new-remix.webp',
            categories: ['Pasta'],
            method: 'Boil',
            ingredients: ['Pasta', 'Chili'],
            steps: ['Cook pasta', 'Add chili'],
            minutes: 20,
            userId: 'remixer-user-id',
            forkedFromRecipeId: originalRecipeId,
        };

        (prisma.recipe.create as jest.Mock).mockResolvedValue(createdRemix);
        (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(
            originalRecipe
        );

        const request = {
            json: jest.fn().mockResolvedValue({
                title: 'Remix of Grandma Secret Pasta',
                description: 'Added some chili flakes',
                imageSrc: 'https://images.test/new-remix.webp',
                categories: ['Pasta'],
                method: 'Boil',
                ingredients: ['Pasta', 'Chili'],
                steps: ['Cook pasta', 'Add chili'],
                minutes: 20,
                forkedFromRecipeId: `  ${originalRecipeId}  `,
            }),
        } as unknown as Request;

        const response = await RecipePOST(request);
        expect(response.status).toBe(200);

        // 1. Verify recipe creation persisted forkedFromRecipeId
        expect(prisma.recipe.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    forkedFromRecipeId: originalRecipeId,
                }),
            })
        );

        // 2. Verify notification sent to original recipe author
        expect(sendNotification).toHaveBeenCalledWith({
            type: NotificationType.RECIPE_REMIX,
            userEmail: 'grandma@test.com',
            params: {
                userName: 'Remix Chef',
                recipeId: 'new-remix-id',
                recipeTitle: 'Grandma Secret Pasta',
            },
        });

        // 3. Verify XP awarded to both remixer and original author
        expect(updateUserLevel).toHaveBeenCalledWith({
            userId: 'remixer-user-id',
        });
        expect(updateUserLevel).toHaveBeenCalledWith({
            userId: 'original-author-id',
        });

        // 4. Verify Redis cache invalidation for parent recipe and its remixes
        expect(redisCache.del).toHaveBeenCalledWith(
            `recipe:${originalRecipeId}`
        );
        expect(redisCache.del).toHaveBeenCalledWith(
            `recipe:remixes:${originalRecipeId}`
        );
    });

    it('gracefully ignores malformed forkedFromRecipeId and sets it to null without crashing', async () => {
        const createdRecipe = {
            id: 'new-recipe-id',
            title: 'Normal Recipe',
            description: 'Some desc',
            imageSrc: 'https://images.test/img.webp',
            categories: ['Pasta'],
            method: 'Boil',
            ingredients: ['Pasta'],
            steps: ['Cook pasta'],
            minutes: 15,
            userId: 'remixer-user-id',
            forkedFromRecipeId: null,
        };

        (prisma.recipe.create as jest.Mock).mockResolvedValue(createdRecipe);

        const request = {
            json: jest.fn().mockResolvedValue({
                title: 'Normal Recipe',
                description: 'Some desc',
                imageSrc: 'https://images.test/img.webp',
                categories: ['Pasta'],
                method: 'Boil',
                ingredients: ['Pasta'],
                steps: ['Cook pasta'],
                minutes: 15,
                forkedFromRecipeId: 'not-a-valid-24-hex-id',
            }),
        } as unknown as Request;

        const response = await RecipePOST(request);
        expect(response.status).toBe(200);

        // Should NOT attempt findUnique with invalid ObjectId
        expect(prisma.recipe.findUnique).not.toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'not-a-valid-24-hex-id' },
            })
        );

        // Persists null forkedFromRecipeId
        expect(prisma.recipe.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    forkedFromRecipeId: null,
                }),
            })
        );

        // No remix notifications or author level updates
        expect(sendNotification).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: NotificationType.RECIPE_REMIX,
            })
        );
    });

    it('gracefully sets forkedFromRecipeId to null when original recipe does not exist', async () => {
        const nonExistentId = '507f1f77bcf86cd799439099';
        const createdRecipe = {
            id: 'new-recipe-id',
            title: 'Fork of Deleted Recipe',
            description: 'Some desc',
            imageSrc: 'https://images.test/img2.webp',
            categories: ['Pasta'],
            method: 'Boil',
            ingredients: ['Pasta'],
            steps: ['Cook pasta'],
            minutes: 15,
            userId: 'remixer-user-id',
            forkedFromRecipeId: null,
        };

        (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.recipe.create as jest.Mock).mockResolvedValue(createdRecipe);

        const request = {
            json: jest.fn().mockResolvedValue({
                title: 'Fork of Deleted Recipe',
                description: 'Some desc',
                imageSrc: 'https://images.test/img2.webp',
                categories: ['Pasta'],
                method: 'Boil',
                ingredients: ['Pasta'],
                steps: ['Cook pasta'],
                minutes: 15,
                forkedFromRecipeId: nonExistentId,
            }),
        } as unknown as Request;

        const response = await RecipePOST(request);
        expect(response.status).toBe(200);

        // Checked database
        expect(prisma.recipe.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: nonExistentId },
            })
        );

        // Prevents dangling foreign reference by storing null
        expect(prisma.recipe.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    forkedFromRecipeId: null,
                }),
            })
        );

        // Does not notify or award author XP
        expect(sendNotification).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: NotificationType.RECIPE_REMIX,
            })
        );
    });

    it('suppresses remix notification and duplicate XP award when remixing own recipe', async () => {
        const ownOriginalRecipeId = '507f1f77bcf86cd799439012';
        const ownOriginalRecipe = {
            id: ownOriginalRecipeId,
            title: 'My Own Curry',
            userId: 'remixer-user-id', // Same user!
            user: {
                id: 'remixer-user-id',
                name: 'Remix Chef',
                email: 'remixer@test.com',
            },
        };

        const createdRemix = {
            id: 'self-remix-id',
            title: 'Remix of My Own Curry',
            description: 'Version 2',
            imageSrc: 'https://images.test/curry-v2.webp',
            categories: ['Curry'],
            method: 'Simmer',
            ingredients: ['Curry powder'],
            steps: ['Cook'],
            minutes: 30,
            userId: 'remixer-user-id',
            forkedFromRecipeId: ownOriginalRecipeId,
        };

        (prisma.recipe.create as jest.Mock).mockResolvedValue(createdRemix);
        (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(
            ownOriginalRecipe
        );

        const request = {
            json: jest.fn().mockResolvedValue({
                title: 'Remix of My Own Curry',
                description: 'Version 2',
                imageSrc: 'https://images.test/curry-v2.webp',
                categories: ['Curry'],
                method: 'Simmer',
                ingredients: ['Curry powder'],
                steps: ['Cook'],
                minutes: 30,
                forkedFromRecipeId: ownOriginalRecipeId,
            }),
        } as unknown as Request;

        const response = await RecipePOST(request);
        expect(response.status).toBe(200);

        // Should NOT send RECIPE_REMIX notification to oneself
        expect(sendNotification).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: NotificationType.RECIPE_REMIX,
            })
        );

        // Remixer gets creation XP once, not called a second time for originalAuthor
        expect(updateUserLevel).toHaveBeenCalledTimes(1);
        expect(updateUserLevel).toHaveBeenCalledWith({
            userId: 'remixer-user-id',
        });
    });
});
