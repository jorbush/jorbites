import { expect } from '@jest/globals';
import getRecipes from '@/app/actions/getRecipes';
import { Session } from 'next-auth';
import { POST as RecipePOST } from '@/app/api/recipes/route';
import { DELETE as RecipeDELETE } from '@/app/api/recipe/[recipeId]/route';
import getRecipeById from '@/app/actions/getRecipeById';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getRecipesByUserId from '@/app/actions/getRecipesByUserId';
import { POST as FavoritePOST } from '@/app/api/favorites/[recipeId]/route';
import { DELETE as FavoriteDELETE } from '@/app/api/favorites/[recipeId]/route';
import getFavoriteRecipes from '@/app/actions/getFavoriteRecipes';
import { POST as CommentPOST } from '@/app/api/comments/route';
import { DELETE as CommentDELETE } from '@/app/api/comments/[commentId]/route';
import getCommentsByRecipeId from '@/app/actions/getCommentsByRecipeId';
import getCommentById from '@/app/actions/getCommentById';
import { NextRequest } from 'next/server';
import {
    RECIPE_TITLE_MAX_LENGTH,
    RECIPE_DESCRIPTION_MAX_LENGTH,
    RECIPE_INGREDIENT_MAX_LENGTH,
    RECIPE_STEP_MAX_LENGTH,
} from '@/app/utils/constants';

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

    let comment: {
        id: string;
        userId: string;
        comment: string;
        recipeId: string;
        createdAt: string;
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
        initialRecipes = response.data?.recipes || [];
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

        const response = await RecipePOST(mockRequest);
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
        expect(response.data?.recipes.length).toBeGreaterThan(
            initialRecipes.length
        );
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
        expect(response.data?.recipes.length).toBeGreaterThan(0);
    });

    it('should return the recipe by id', async () => {
        const response = await getRecipeById({ recipeId: publishedRecipe?.id });
        expect(response).toMatchObject(publishedRecipe || {});
    });

    it('should like the recipe', async () => {
        const mockParams = {
            params: Promise.resolve({ recipeId: publishedRecipe?.id }),
        };
        const responseFav = await FavoritePOST(
            {} as unknown as Request,
            mockParams
        );
        const resultFav = await responseFav.json();
        const currentUser = await getCurrentUser();
        expect(resultFav).toMatchObject(currentUser || {});
    });

    it('should have added the recipe id to the current user favoriteIds', async () => {
        const currentUser = await getCurrentUser();
        expect(currentUser?.favoriteIds).toContain(publishedRecipe?.id);
    });

    it('should return favorites recipes from the current user with the return', async () => {
        const response = await getFavoriteRecipes();
        expect(
            response.filter((recipe) => recipe.id == publishedRecipe?.id).length
        ).toBe(1);
    });

    it('should undo the like of the recipe', async () => {
        const mockParams = {
            params: Promise.resolve({ recipeId: publishedRecipe?.id }),
        };
        const responseFav = await FavoriteDELETE(
            {} as unknown as Request,
            mockParams
        );
        const resultFav = await responseFav.json();
        const currentUser = await getCurrentUser();
        expect(resultFav).toMatchObject(currentUser || {});
    });

    it('should have removed the recipe id to the current user favoriteIds', async () => {
        const currentUser = await getCurrentUser();
        expect(currentUser?.favoriteIds).not.toContain(publishedRecipe?.id);
    });

    it('should return favorites recipes from the current user without the recipe id', async () => {
        const response = await getFavoriteRecipes();
        expect(
            response.filter((recipe) => recipe.id == publishedRecipe?.id).length
        ).toBe(0);
    });

    it('should comment the recipe', async () => {
        const mockBody = {
            recipeId: publishedRecipe?.id,
            comment: 'Great recipe!',
        };
        const mockRequest = {
            json: jest.fn().mockResolvedValue(mockBody),
        } as unknown as Request;
        const response = await CommentPOST(mockRequest);
        const result = await response.json();
        expect(result).toMatchObject(publishedRecipe || {});
        expect(result.comments.length).toBe(1);
        expect(result.comments[0].recipeId).toBe(publishedRecipe?.id);
        const currentUser = await getCurrentUser();
        expect(result.comments[0].userId).toBe(currentUser?.id);
        expect(result.comments[0].comment).toBe(mockBody.comment);
        comment = result.comments[0];
    });

    it('should return comment by comment id', async () => {
        if (!comment) {
            throw new Error('comment is not defined');
        }
        const response = await getCommentById({ commentId: comment?.id });
        expect(response).toMatchObject(comment);
    });

    it('should return comments by recipe id', async () => {
        if (!comment) {
            throw new Error('comment is not defined');
        }
        const response = await getCommentsByRecipeId({
            recipeId: publishedRecipe?.id,
        });
        expect(response[0]).toMatchObject(comment);
    });

    it('should delete the comment', async () => {
        if (!comment) {
            throw new Error('comment is not defined');
        }
        const mockParams = {
            params: Promise.resolve({ commentId: comment.id }),
        };
        const response = await CommentDELETE(
            {} as unknown as Request,
            mockParams
        );
        const result = await response.json();
        expect(result).toMatchObject(comment || {});
    });

    it('should not return any comments by recipe id', async () => {
        if (!comment) {
            throw new Error('comment is not defined');
        }
        const response = await getCommentsByRecipeId({
            recipeId: publishedRecipe?.id,
        });
        expect(response.length).toBe(0);
    });

    it('should delete the recipe', async () => {
        if (!publishedRecipe?.id) {
            throw new Error('publishedRecipe id is not defined');
        }
        const mockParams = {
            params: Promise.resolve({ recipeId: publishedRecipe.id }),
        };
        const response = await RecipeDELETE(
            {} as unknown as Request,
            mockParams
        );
        const result = await response.json();
        expect(result).toMatchObject(publishedRecipe || {});
        publishedRecipe = null;
    });

    it('should return the updated recipes', async () => {
        const response = await getRecipes({});
        expect(response?.data?.recipes?.length).toBe(initialRecipes.length);
    });

    it('should level down the recipe user level', async () => {
        const currentUser = await getCurrentUser();
        if (!currentUser || !initialUser) {
            throw new Error('currentUser or initialUser is not defined');
        }
        expect(currentUser.level).toBe(initialUser.level);
    });
});

describe('Recipes API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 when title exceeds max length', async () => {
        const request = new NextRequest('http://localhost:3000/api/recipes', {
            method: 'POST',
            body: JSON.stringify({
                title: 'a'.repeat(RECIPE_TITLE_MAX_LENGTH + 1),
                description: 'Test description',
                imageSrc: 'test.jpg',
                category: 'test',
                method: 'test',
                ingredients: ['test'],
                steps: ['test'],
                minutes: 30,
            }),
        });

        const response = await RecipePOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            `Title must be ${RECIPE_TITLE_MAX_LENGTH} characters or less`
        );
    });

    it('should return 400 when description exceeds max length', async () => {
        const request = new NextRequest('http://localhost:3000/api/recipes', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Test title',
                description: 'a'.repeat(RECIPE_DESCRIPTION_MAX_LENGTH + 1),
                imageSrc: 'test.jpg',
                category: 'test',
                method: 'test',
                ingredients: ['test'],
                steps: ['test'],
                minutes: 30,
            }),
        });

        const response = await RecipePOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            `Description must be ${RECIPE_DESCRIPTION_MAX_LENGTH} characters or less`
        );
    });

    it('should return 400 when ingredient exceeds max length', async () => {
        const request = new NextRequest('http://localhost:3000/api/recipes', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Test title',
                description: 'Test description',
                imageSrc: 'test.jpg',
                category: 'test',
                method: 'test',
                ingredients: ['a'.repeat(RECIPE_INGREDIENT_MAX_LENGTH + 1)],
                steps: ['test'],
                minutes: 30,
            }),
        });

        const response = await RecipePOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            `Each ingredient must be ${RECIPE_INGREDIENT_MAX_LENGTH} characters or less`
        );
    });

    it('should return 400 when step exceeds max length', async () => {
        const request = new NextRequest('http://localhost:3000/api/recipes', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Test title',
                description: 'Test description',
                imageSrc: 'test.jpg',
                category: 'test',
                method: 'test',
                ingredients: ['test'],
                steps: ['a'.repeat(RECIPE_STEP_MAX_LENGTH + 1)],
                minutes: 30,
            }),
        });

        const response = await RecipePOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            `Each step must be ${RECIPE_STEP_MAX_LENGTH} characters or less`
        );
    });

    it('should return 401 when user is not authenticated', async () => {
        mockedSession = null;

        const request = new NextRequest('http://localhost:3000/api/recipes', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Test title',
                description: 'Test description',
                imageSrc: 'test.jpg',
                category: 'test',
                method: 'test',
                ingredients: ['test'],
                steps: ['test'],
                minutes: 30,
            }),
        });

        const response = await RecipePOST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe(
            'User authentication required to create recipe'
        );
        expect(data.code).toBe('UNAUTHORIZED');
        expect(data.timestamp).toBeDefined();
    });

    it('should return 400 when required fields are missing', async () => {
        mockedSession = {
            expires: 'expires',
            user: {
                name: 'test',
                email: 'test@a.com',
            },
        };

        const request = new NextRequest('http://localhost:3000/api/recipes', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Test title',
                // description missing
                imageSrc: 'test.jpg',
                category: 'test',
                method: 'test',
                ingredients: ['test'],
                steps: ['test'],
                minutes: 30,
            }),
        });

        const response = await RecipePOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            'Missing required fields: title and description are required'
        );
        expect(data.code).toBe('BAD_REQUEST');
        expect(data.timestamp).toBeDefined();
    });

    it('should return validation error with proper error structure', async () => {
        mockedSession = {
            expires: 'expires',
            user: {
                name: 'test',
                email: 'test@a.com',
            },
        };

        const request = new NextRequest('http://localhost:3000/api/recipes', {
            method: 'POST',
            body: JSON.stringify({
                title: 'a'.repeat(RECIPE_TITLE_MAX_LENGTH + 1),
                description: 'Test description',
                imageSrc: 'test.jpg',
                category: 'test',
                method: 'test',
                ingredients: ['test'],
                steps: ['test'],
                minutes: 30,
            }),
        });

        const response = await RecipePOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            `Title must be ${RECIPE_TITLE_MAX_LENGTH} characters or less`
        );
        expect(data.code).toBe('VALIDATION_ERROR');
        expect(data.timestamp).toBeDefined();
    });
});
