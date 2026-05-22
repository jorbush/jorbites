import { POST } from '@/app/api/lists/ensure-default/route';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';

jest.mock('@/app/actions/getCurrentUser');
jest.mock('@/app/lib/prismadb', () => ({
    list: {
        count: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
    },
}));

const mockGetCurrentUser = getCurrentUser as jest.Mock;

describe('POST /api/lists/ensure-default', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        const response = await POST();
        expect(response.status).toBe(401);
    });

    it('should create default list if none exist', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
        (prisma.list.count as jest.Mock).mockResolvedValue(0);
        (prisma.list.create as jest.Mock).mockResolvedValue({ id: 'list-id' });

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.created).toBe(true);
        expect(prisma.list.create).toHaveBeenCalled();
    });

    it('should not create default list if some already exist', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
        (prisma.list.count as jest.Mock).mockResolvedValue(1);

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.created).toBe(false);
        expect(prisma.list.create).not.toHaveBeenCalled();
    });

    it('should return 500 on internal error', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
        (prisma.list.count as jest.Mock).mockRejectedValue(new Error('DB Error'));

        const response = await POST();
        expect(response.status).toBe(500);
    });

    it('should return 200 if creation fails but list exists (race condition)', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
        (prisma.list.count as jest.Mock).mockResolvedValue(0);
        (prisma.list.create as jest.Mock).mockRejectedValue(
            new Error('Unique constraint failed')
        );
        (prisma.list.findFirst as jest.Mock).mockResolvedValue({
            id: 'list-id',
        });

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.created).toBe(false);
        expect(data.message).toBe('Default list already exists');
    });
});
