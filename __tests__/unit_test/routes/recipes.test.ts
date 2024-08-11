import getRecipes from '@/app/actions/getRecipes';
import { Session } from 'next-auth';
import { POST } from '@/app/api/recipes/route';
import { DELETE } from '@/app/api/recipe/[recipeId]/route';
import getRecipeById from '@/app/actions/getRecipeById';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getRecipesByUserId from '@/app/actions/getRecipesByUserId';

let mockedSession: Session | null = null;

// This mocks our custom helper function to avoid passing authOptions around
jest.mock('@/pages/api/auth/[...nextauth].ts', () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));

// This mocks calls to getServerSession
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => {
        return Promise.resolve(mockedSession);
    }),
}));

describe('Recipes API Routes and Server Actions', () => {
    let initialRecipes: {
        createdAt: string;
        id: string;
        title: string;
        description: string;
        imageSrc: string;
        category: string;
        method: string;
        minutes: number;
        numLikes: number;
        ingredients: string[];
        steps: string[];
        extraImages: string[];
        userId: string;
    }[] = [];
    let publishedRecipe: {
        id: string;
        title: string;
        description: string;
        imageSrc: string;
        createdAt: Date;
        category: string;
        method: string;
        minutes: number;
        numLikes: number;
        ingredients: string[];
        steps: string[];
        extraImages: string[];
        userId: string;
    } | null = null;

    let initialUser: {
        createdAt: string;
        updatedAt: string;
        emailVerified: string | null;
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
        hashedPassword: string | null;
        favoriteIds: string[];
        emailNotifications: boolean;
        level: number;
        verified: boolean;
    } | null = null;

    beforeEach(() => {
        mockedSession = {
            expires: 'expires',
            user: {
                name: 'test',
                email: 'test@a.com',
            },
        };
    });

    it('should return the current recipes and the current user', async () => {
        const response = await getRecipes({});
        initialRecipes = response.recipes;
        const currentUser = await getCurrentUser();
        initialUser = currentUser;
    });

    it('should create a new recipe', async () => {
        const mockRecipe = {
            title: 'Test Recipe',
            description: 'Delicious test recipe',
            imageSrc: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/v1721469287/IMG_7717_xedos6.webp`,
            category: 'Desserts',
            method: 'Oven',
            ingredients: ['sugar', 'flour'],
            steps: ['Mix ingredients', 'Bake at 350F'],
            minutes: 30,
        };
        const mockRequest = {
            json: jest.fn().mockResolvedValue(mockRecipe),
        } as unknown as Request;

        const response = await POST(mockRequest);
        const result = await response.json();
        expect(result).toMatchObject(mockRecipe);
        publishedRecipe = result as {
            id: string;
            title: string;
            description: string;
            imageSrc: string;
            createdAt: Date;
            category: string;
            method: string;
            minutes: number;
            numLikes: number;
            ingredients: string[];
            steps: string[];
            extraImages: string[];
            userId: string;
        };
    });

    it('should return the updated recipes', async () => {
        const response = await getRecipes({});
        expect(response.recipes.length).toBeGreaterThan(initialRecipes.length);
    });

    it('should level up the recipe user level', async () => {
        const currentUser = await getCurrentUser();
        if (!currentUser || !initialUser) {
            console.log({
                currentUser,
                initialUser,
            });
            throw new Error('currentUser or initialUser is not defined');
        }
        expect(currentUser.level).toBeGreaterThan(initialUser.level);
    });

    it('should return the user recipes', async () => {
        if (!initialUser) {
            throw new Error('initialUser is not defined');
        }
        const mockParams = { userId: initialUser.id };
        const response = await getRecipesByUserId(mockParams);
        expect(response.length).toBeGreaterThan(0);
    });

    it('should return the recipes filtered by category', async () => {
        const response = await getRecipes({ category: 'Desserts' });
        expect(response.recipes.length).toBeGreaterThan(0);
    });

    it('should return the recipe by id', async () => {
        const response = await getRecipeById({ recipeId: publishedRecipe?.id });
        expect(response).toMatchObject(publishedRecipe || {});
    });

    it('should delete the recipe', async () => {
        if (!publishedRecipe?.id) {
            throw new Error('publishedRecipe id is not defined');
        }

        const mockParams = { params: { recipeId: publishedRecipe.id } };

        const response = await DELETE({} as unknown as Request, mockParams);
        const result = await response.json();
        expect(result).toMatchObject(publishedRecipe || {});
        publishedRecipe = null;
    });

    it('should return the updated recipes', async () => {
        const response = await getRecipes({});
        expect(response.recipes.length).toBe(initialRecipes.length);
    });

    it('should level down the recipe user level', async () => {
        const currentUser = await getCurrentUser();
        if (!currentUser || !initialUser) {
            throw new Error('currentUser or initialUser is not defined');
        }
        expect(currentUser.level).toBe(initialUser.level);
    });
});
