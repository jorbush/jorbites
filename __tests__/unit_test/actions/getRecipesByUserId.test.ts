import getRecipesByUserId from '@/app/actions/getRecipesByUserId';
import prisma from '@/app/lib/prismadb';
import { OrderByType } from '@/app/utils/filter';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        recipe: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
    },
}));

describe('getRecipesByUserId Server Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('filters user recipes by search query across title and description', async () => {
        jest.mocked(prisma.recipe.findMany).mockResolvedValue([]);
        jest.mocked(prisma.recipe.count).mockResolvedValue(0);

        const result = await getRecipesByUserId({
            userId: 'user-1',
            search: '  carbonara  ',
            orderBy: OrderByType.NEWEST,
            page: 1,
            limit: 12,
        });

        expect(result).toEqual({
            recipes: [],
            totalRecipes: 0,
            totalPages: 0,
            currentPage: 1,
        });

        const expectedWhere = {
            userId: 'user-1',
            OR: [
                {
                    title: {
                        contains: 'carbonara',
                        mode: 'insensitive',
                    },
                },
                {
                    description: {
                        contains: 'carbonara',
                        mode: 'insensitive',
                    },
                },
            ],
        };

        expect(prisma.recipe.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expectedWhere,
                skip: 0,
                take: 12,
            })
        );
        expect(prisma.recipe.count).toHaveBeenCalledWith({
            where: expectedWhere,
        });
    });

    it('ignores blank search queries', async () => {
        jest.mocked(prisma.recipe.findMany).mockResolvedValue([]);
        jest.mocked(prisma.recipe.count).mockResolvedValue(0);

        await getRecipesByUserId({
            userId: 'user-1',
            search: '   ',
            page: 1,
            limit: 12,
        });

        expect(prisma.recipe.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: 'user-1' },
            })
        );
        expect(prisma.recipe.count).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
        });
    });
});
