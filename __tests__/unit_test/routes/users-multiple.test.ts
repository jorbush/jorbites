import { GET as UsersMultipleGET } from '@/app/api/users/multiple/route';
import prisma from '@/app/lib/prismadb';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        user: {
            findMany: jest.fn(),
        },
    },
}));

describe('GET /api/users/multiple', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return empty list when ids param is missing', async () => {
        const request = new Request('http://localhost/api/users/multiple');
        const response = await UsersMultipleGET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([]);
        expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should query DB and return user summaries for provided IDs', async () => {
        const mockUsers = [
            {
                id: 'u1',
                name: 'Alice',
                image: 'a.jpg',
                level: 2,
                verified: true,
            },
            {
                id: 'u2',
                name: 'Bob',
                image: 'b.jpg',
                level: 1,
                verified: false,
            },
        ];
        jest.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);

        const request = new Request(
            'http://localhost/api/users/multiple?ids=u1,u2'
        );
        const response = await UsersMultipleGET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual(mockUsers);
        expect(prisma.user.findMany).toHaveBeenCalledWith({
            where: { id: { in: ['u1', 'u2'] } },
            select: {
                id: true,
                name: true,
                image: true,
                level: true,
                verified: true,
            },
        });
    });

    it('should return 500 when database query throws', async () => {
        jest.mocked(prisma.user.findMany).mockRejectedValue(
            new Error('DB error')
        );

        const request = new Request(
            'http://localhost/api/users/multiple?ids=u1'
        );
        const response = await UsersMultipleGET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to fetch users');
    });
});
