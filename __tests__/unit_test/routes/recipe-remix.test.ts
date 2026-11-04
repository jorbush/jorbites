import { POST as RecipePOST } from '@/app/api/recipes/route';
import prisma from '@/app/lib/prismadb';
import sendNotification from '@/app/actions/sendNotification';
import updateUserLevel from '@/app/actions/updateUserLevel';
import { NotificationType } from '@/app/types/notification';
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

jest.mock('@/app/actions/sendNotification', () =>
    jest.fn(() => Promise.resolve())
);
jest.mock('@/app/actions/updateUserLevel', () =>
    jest.fn(() => Promise.resolve())
);

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

    it('creates a remixed recipe when both ingredients and steps are modified', async () => {
        const originalRecipeId = '507f1f77bcf86cd799439011';
        const originalRecipe = {
            id: originalRecipeId,
            title: 'Grandma Secret Pasta',
            userId: 'original-author-id',
            user: {
                email: 'author@test.com',
            },
            ingredients: ['Pasta', 'Garlic', 'Olive Oil'],
            steps: ['Boil pasta', 'Fry garlic in oil', 'Combine'],
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

        // 2. Verify RECIPE_REMIX notification sent to original recipe author
        expect(sendNotification).toHaveBeenCalledWith({
            type: NotificationType.RECIPE_REMIX,
            userEmail: 'author@test.com',
            params: {
                userName: 'Remix Chef',
                recipeId: 'new-remix-id',
                recipeName: 'Grandma Secret Pasta',
                remixRecipeId: 'new-remix-id',
                originalRecipeTitle: 'Grandma Secret Pasta',
            },
        });

        // 3. Verify XP awarded to both original author (karma) and remixer (creation XP)
        expect(updateUserLevel).toHaveBeenCalledWith({
            userId: 'original-author-id',
        });
        expect(updateUserLevel).toHaveBeenCalledWith({
            userId: 'remixer-user-id',
        });

        // 4. Verify Redis cache invalidation for parent recipe and its remixes
        expect(redisCache.del).toHaveBeenCalledWith(
            `recipe:${originalRecipeId}`
        );
        expect(redisCache.del).toHaveBeenCalledWith(
            `recipe:remixes:${originalRecipeId}`
        );
    });

    it('rejects remix with 400 when both ingredients and steps are identical to original', async () => {
        const originalRecipeId = '507f1f77bcf86cd799439011';
        const originalRecipe = {
            id: originalRecipeId,
            ingredients: ['Pasta', 'Garlic', 'Olive Oil'],
            steps: ['Boil pasta', 'Fry garlic in oil', 'Combine'],
        };

        (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(
            originalRecipe
        );

        const request = {
            json: jest.fn().mockResolvedValue({
                title: 'Remix of Grandma Secret Pasta',
                description: 'Identical copy',
                imageSrc: 'https://images.test/identical.webp',
                categories: ['Pasta'],
                method: 'Boil',
                ingredients: ['Pasta', 'Garlic', 'Olive Oil'],
                steps: ['Boil pasta', 'Fry garlic in oil', 'Combine'],
                minutes: 20,
                forkedFromRecipeId: originalRecipeId,
            }),
        } as unknown as Request;

        const response = await RecipePOST(request);
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.error).toContain(
            'both the ingredients and preparation steps'
        );
        expect(prisma.recipe.create).not.toHaveBeenCalled();
    });

    it('rejects remix with 400 when only ingredients are modified and steps are unchanged', async () => {
        const originalRecipeId = '507f1f77bcf86cd799439011';
        const originalRecipe = {
            id: originalRecipeId,
            ingredients: ['Pasta', 'Garlic', 'Olive Oil'],
            steps: ['Boil pasta', 'Fry garlic in oil', 'Combine'],
        };

        (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(
            originalRecipe
        );

        const request = {
            json: jest.fn().mockResolvedValue({
                title: 'Remix of Grandma Secret Pasta',
                description: 'Only ingredients changed',
                imageSrc: 'https://images.test/partial.webp',
                categories: ['Pasta'],
                method: 'Boil',
                ingredients: ['Pasta', 'Garlic', 'Truffle Oil'], // Changed!
                steps: ['Boil pasta', 'Fry garlic in oil', 'Combine'], // Unchanged!
                minutes: 20,
                forkedFromRecipeId: originalRecipeId,
            }),
        } as unknown as Request;

        const response = await RecipePOST(request);
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.error).toContain(
            'changes to the preparation steps of the original recipe'
        );
        expect(prisma.recipe.create).not.toHaveBeenCalled();
    });

    it('rejects remix with 400 when only steps are modified and ingredients are unchanged', async () => {
        const originalRecipeId = '507f1f77bcf86cd799439011';
        const originalRecipe = {
            id: originalRecipeId,
            ingredients: ['Pasta', 'Garlic', 'Olive Oil'],
            steps: ['Boil pasta', 'Fry garlic in oil', 'Combine'],
        };

        (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(
            originalRecipe
        );

        const request = {
            json: jest.fn().mockResolvedValue({
                title: 'Remix of Grandma Secret Pasta',
                description: 'Only steps changed',
                imageSrc: 'https://images.test/partial-steps.webp',
                categories: ['Pasta'],
                method: 'Boil',
                ingredients: ['Pasta', 'Garlic', 'Olive Oil'], // Unchanged!
                steps: ['Simmer pasta in stock', 'Slow roast garlic', 'Plate'], // Changed!
                minutes: 20,
                forkedFromRecipeId: originalRecipeId,
            }),
        } as unknown as Request;

        const response = await RecipePOST(request);
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.error).toContain(
            'changes to the ingredients of the original recipe'
        );
        expect(prisma.recipe.create).not.toHaveBeenCalled();
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

    it('creates a remix of own recipe when both ingredients and steps are modified', async () => {
        const ownOriginalRecipeId = '507f1f77bcf86cd799439012';
        const ownOriginalRecipe = {
            id: ownOriginalRecipeId,
            title: 'My Own Curry',
            userId: 'remixer-user-id',
            user: {
                email: 'remixer@test.com',
            },
            ingredients: ['Curry powder', 'Potatoes'],
            steps: ['Chop potatoes', 'Boil with curry'],
        };

        const createdRemix = {
            id: 'self-remix-id',
            title: 'Remix of My Own Curry',
            description: 'Version 2',
            imageSrc: 'https://images.test/curry-v2.webp',
            categories: ['Curry'],
            method: 'Simmer',
            ingredients: ['Curry paste', 'Sweet Potatoes'],
            steps: ['Cube sweet potatoes', 'Simmer with paste'],
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
                ingredients: ['Curry paste', 'Sweet Potatoes'],
                steps: ['Cube sweet potatoes', 'Simmer with paste'],
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

        // Self-remix suppression: NO RECIPE_REMIX notification should be sent
        expect(sendNotification).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: NotificationType.RECIPE_REMIX,
            })
        );

        // Remixer only receives their own single creation XP update (no duplicate author update)
        expect(updateUserLevel).toHaveBeenCalledTimes(1);
        expect(updateUserLevel).toHaveBeenCalledWith({
            userId: 'remixer-user-id',
        });
    });

    it('handles remix creation gracefully when original author has no email', async () => {
        const originalRecipeId = '507f1f77bcf86cd799439099';
        const originalRecipe = {
            id: originalRecipeId,
            title: 'Author Without Email Recipe',
            userId: 'author-no-email-id',
            user: null,
            ingredients: ['Flour', 'Water'],
            steps: ['Mix', 'Bake'],
        };

        const createdRemix = {
            id: 'remix-no-email-id',
            title: 'Remix of No Email Recipe',
            description: 'Added yeast',
            imageSrc: 'https://images.test/bread.webp',
            categories: ['Bread'],
            method: 'Bake',
            ingredients: ['Flour', 'Water', 'Yeast'],
            steps: ['Mix and proof', 'Bake'],
            minutes: 60,
            userId: 'remixer-user-id',
            forkedFromRecipeId: originalRecipeId,
        };

        (prisma.recipe.create as jest.Mock).mockResolvedValue(createdRemix);
        (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(
            originalRecipe
        );

        const request = {
            json: jest.fn().mockResolvedValue({
                title: 'Remix of No Email Recipe',
                description: 'Added yeast',
                imageSrc: 'https://images.test/bread.webp',
                categories: ['Bread'],
                method: 'Bake',
                ingredients: ['Flour', 'Water', 'Yeast'],
                steps: ['Mix and proof', 'Bake'],
                minutes: 60,
                forkedFromRecipeId: originalRecipeId,
            }),
        } as unknown as Request;

        const response = await RecipePOST(request);
        expect(response.status).toBe(200);

        // No notification sent since author has no email
        expect(sendNotification).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: NotificationType.RECIPE_REMIX,
            })
        );

        // Both author and remixer levels are still updated
        expect(updateUserLevel).toHaveBeenCalledWith({
            userId: 'author-no-email-id',
        });
        expect(updateUserLevel).toHaveBeenCalledWith({
            userId: 'remixer-user-id',
        });
    });

    it('handles notification and level update errors gracefully without failing remix creation', async () => {
        const originalRecipeId = '507f1f77bcf86cd799439088';
        const originalRecipe = {
            id: originalRecipeId,
            title: 'Resilient Recipe',
            userId: 'author-resilient-id',
            user: {
                email: 'author@resilient.com',
            },
            ingredients: ['Milk', 'Eggs'],
            steps: ['Whisk', 'Cook'],
        };

        const createdRemix = {
            id: 'remix-resilient-id',
            title: 'Remix Resilient',
            description: 'Added cinnamon',
            imageSrc: 'https://images.test/custard.webp',
            categories: ['Dessert'],
            method: 'Cook',
            ingredients: ['Milk', 'Eggs', 'Cinnamon'],
            steps: ['Whisk together', 'Cook slowly'],
            minutes: 15,
            userId: 'remixer-user-id',
            forkedFromRecipeId: originalRecipeId,
        };

        (prisma.recipe.create as jest.Mock).mockResolvedValue(createdRemix);
        (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(
            originalRecipe
        );

        // Simulate external microservice errors specifically on remix operations
        (sendNotification as jest.Mock).mockImplementation((params) => {
            if (params.type === NotificationType.RECIPE_REMIX) {
                return Promise.reject(new Error('Notifier service down'));
            }
            return Promise.resolve();
        });
        (updateUserLevel as jest.Mock).mockImplementation((params) => {
            if (params.userId === 'author-resilient-id') {
                return Promise.reject(new Error('Badge forge unavailable'));
            }
            return Promise.resolve();
        });

        const request = {
            json: jest.fn().mockResolvedValue({
                title: 'Remix Resilient',
                description: 'Added cinnamon',
                imageSrc: 'https://images.test/custard.webp',
                categories: ['Dessert'],
                method: 'Cook',
                ingredients: ['Milk', 'Eggs', 'Cinnamon'],
                steps: ['Whisk together', 'Cook slowly'],
                minutes: 15,
                forkedFromRecipeId: originalRecipeId,
            }),
        } as unknown as Request;

        const response = await RecipePOST(request);
        // Recipe creation succeeds even if external services throw errors
        expect(response.status).toBe(200);
    });
});
