import { GET } from '@/app/api/recipes/[id]/lists-and-plannings/route';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getListsAndPlanningsByRecipeId from '@/app/actions/getListsAndPlanningsByRecipeId';

jest.mock('@/app/actions/getCurrentUser');
jest.mock('@/app/actions/getListsAndPlanningsByRecipeId');

describe('GET /api/recipes/[id]/lists-and-plannings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 400 if recipe id is missing or invalid', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue(null);

        const request = new Request(
            'http://localhost:3000/api/recipes//lists-and-plannings'
        );
        const response = await GET(request, {
            params: Promise.resolve({ id: '' }),
        });

        expect(response.status).toBe(400);
        expect(getListsAndPlanningsByRecipeId).not.toHaveBeenCalled();
    });

    it('returns lists and plannings for anonymous user', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue(null);
        const mockResult = {
            lists: [
                {
                    id: 'list-1',
                    name: 'Public List',
                    isPrivate: false,
                    isDefault: false,
                    userId: 'user-1',
                    createdAt: '2026-06-01T00:00:00.000Z',
                    updatedAt: '2026-06-01T00:00:00.000Z',
                    recipes: [],
                },
            ],
            plannings: [],
            quests: [],
        };
        jest.mocked(getListsAndPlanningsByRecipeId).mockResolvedValue(
            mockResult as any
        );

        const request = new Request(
            'http://localhost:3000/api/recipes/recipe-123/lists-and-plannings'
        );
        const response = await GET(request, {
            params: Promise.resolve({ id: 'recipe-123' }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(mockResult);
        expect(getListsAndPlanningsByRecipeId).toHaveBeenCalledWith({
            recipeId: 'recipe-123',
            userId: undefined,
        });
    });

    it('passes userId to getListsAndPlanningsByRecipeId for logged-in user', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue({
            id: 'user-logged-in',
            name: 'Test User',
        } as any);

        const mockResult = {
            lists: [],
            plannings: [
                {
                    id: 'plan-1',
                    name: 'My Meal Plan',
                    isPrivate: true,
                    userId: 'user-logged-in',
                    createdAt: '2026-06-01T00:00:00.000Z',
                    updatedAt: '2026-06-01T00:00:00.000Z',
                    meals: [],
                },
            ],
            quests: [],
        };
        jest.mocked(getListsAndPlanningsByRecipeId).mockResolvedValue(
            mockResult as any
        );

        const request = new Request(
            'http://localhost:3000/api/recipes/recipe-456/lists-and-plannings'
        );
        const response = await GET(request, {
            params: Promise.resolve({ id: 'recipe-456' }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(mockResult);
        expect(getListsAndPlanningsByRecipeId).toHaveBeenCalledWith({
            recipeId: 'recipe-456',
            userId: 'user-logged-in',
        });
    });

    it('returns 500 when getListsAndPlanningsByRecipeId throws', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue(null);
        jest.mocked(getListsAndPlanningsByRecipeId).mockRejectedValue(
            new Error('Database error')
        );

        const request = new Request(
            'http://localhost:3000/api/recipes/recipe-err/lists-and-plannings'
        );
        const response = await GET(request, {
            params: Promise.resolve({ id: 'recipe-err' }),
        });

        expect(response.status).toBe(500);
    });
});
