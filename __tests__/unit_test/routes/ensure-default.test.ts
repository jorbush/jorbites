import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/lists/ensure-default/route';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';

vi.mock('@/app/actions/getCurrentUser');
vi.mock('@/app/lib/prismadb', () => ({
    default: {
        list: {
            count: vi.fn(),
            create: vi.fn(),
        },
    },
}));

const mockGetCurrentUser = getCurrentUser as any;

describe('POST /api/lists/ensure-default', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        const response = await POST();
        expect(response.status).toBe(401);
    });

    it('should create default list if none exist', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
        vi.mocked(prisma.list.count).mockResolvedValue(0);
        vi.mocked(prisma.list.create).mockResolvedValue({ id: 'list-id' } as any);

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.created).toBe(true);
        expect(prisma.list.create).toHaveBeenCalled();
    });

    it('should not create default list if some already exist', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
        vi.mocked(prisma.list.count).mockResolvedValue(1);

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.created).toBe(false);
        expect(prisma.list.create).not.toHaveBeenCalled();
    });

    it('should return 500 on internal error', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
        vi.mocked(prisma.list.count).mockRejectedValue(new Error('DB Error'));

        const response = await POST();
        expect(response.status).toBe(500);
    });
});
