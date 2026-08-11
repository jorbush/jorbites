import { GET as RecipesMultipleGET } from '@/app/api/recipes/multiple/route';
import prisma from '@/app/lib/prismadb';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        recipe: {
            findMany: jest.fn(),
        },
    },
}));

describe('GET /api/recipes/multiple', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return empty list when ids query param is missing', async () => {
        const request = new Request('http://localhost/api/recipes/multiple');
        const response = await RecipesMultipleGET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([]);
        expect(prisma.recipe.findMany).not.toHaveBeenCalled();
    });

    it('should query DB and return recipes for provided IDs', async () => {
        const mockRecipes = [
            {
                id: 'r1',
                title: 'Tacos',
                imageSrc: 'tacos.jpg',
                userId: 'u1',
                user: { name: 'Chef', image: 'c.jpg' },
            },
        ];
        jest.mocked(prisma.recipe.findMany).mockResolvedValue(
            mockRecipes as any
        );

        const request = new Request(
            'http://localhost/api/recipes/multiple?ids=r1'
        );
        const response = await RecipesMultipleGET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockRecipes);
        expect(prisma.recipe.findMany).toHaveBeenCalledWith({
            where: { id: { in: ['r1'] } },
            select: {
                id: true,
                title: true,
                imageSrc: true,
                userId: true,
                user: { select: { name: true, image: true } },
            },
        });
    });

    it('should return 500 when database error occurs', async () => {
        jest.mocked(prisma.recipe.findMany).mockRejectedValue(
            new Error('Query failed')
        );

        const request = new Request(
            'http://localhost/api/recipes/multiple?ids=r1'
        );
        const response = await RecipesMultipleGET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to fetch recipes');
    });
});
