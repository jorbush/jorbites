import { GET as ChefsGET } from '@/app/api/chefs/route';
import getChefs from '@/app/actions/getChefs';

jest.mock('@/app/actions/getChefs', () => ({
    __esModule: true,
    default: jest.fn(),
    ChefOrderByType: {
        POPULARITY: 'popularity',
        RECIPES_COUNT: 'recipesCount',
        LEVEL: 'level',
        NAME: 'name',
    },
}));

describe('GET /api/chefs', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call getChefs with parsed query parameters and return 200', async () => {
        const mockChefsData = {
            chefs: [{ id: 'chef-1', name: 'Chef Gordon' }],
            pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
        };
        jest.mocked(getChefs).mockResolvedValue({
            data: mockChefsData as any,
        });

        const request = new Request(
            'http://localhost/api/chefs?search=Gordon&page=2&limit=10&orderBy=popularity'
        );

        const response = await ChefsGET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockChefsData);

        expect(getChefs).toHaveBeenCalledWith({
            search: 'Gordon',
            page: 2,
            limit: 10,
            orderBy: 'popularity',
        });
    });

    it('should return 500 when getChefs returns an action error', async () => {
        jest.mocked(getChefs).mockResolvedValue({
            error: { message: 'Failed to query database' } as any,
        });

        const request = new Request('http://localhost/api/chefs');

        const response = await ChefsGET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to query database');
    });

    it('should return 500 when an unhandled exception is thrown', async () => {
        jest.mocked(getChefs).mockRejectedValue(
            new Error('Unexpected failure')
        );

        const request = new Request('http://localhost/api/chefs');

        const response = await ChefsGET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to fetch chefs');
    });
});
