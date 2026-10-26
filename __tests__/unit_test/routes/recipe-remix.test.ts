import { POST as RecipePOST } from '@/app/api/recipes/route';
import prisma from '@/app/lib/prismadb';
import sendNotification from '@/app/actions/sendNotification';
import updateUserLevel from '@/app/actions/updateUserLevel';
import { redisCache } from '@/app/lib/redis';

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

    it('creates a remixed recipe, persists forkedFromRecipeId, invalidates cache, and awards creator XP', async () => {
        const originalRecipeId = '507f1f77bcf86cd799439011';
        const originalRecipe = {
            id: originalRecipeId,
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

        // 2. Verify XP awarded to remixer
        expect(updateUserLevel).toHaveBeenCalledWith({
            userId: 'remixer-user-id',
        });

        // 3. Verify Redis cache invalidation for parent recipe and its remixes
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
    });

    it('creates a remix of own recipe without issues', async () => {
        const ownOriginalRecipeId = '507f1f77bcf86cd799439012';
        const ownOriginalRecipe = {
            id: ownOriginalRecipeId,
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

        expect(prisma.recipe.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    forkedFromRecipeId: ownOriginalRecipeId,
                }),
            })
        );
        expect(updateUserLevel).toHaveBeenCalledWith({
            userId: 'remixer-user-id',
        });
    });
});
