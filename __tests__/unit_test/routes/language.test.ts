import { PATCH } from '@/app/api/user/language/route';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/app/lib/prismadb', () => ({
    default: {
        user: {
            update: vi.fn(),
        },
    },
}));

vi.mock('@/app/actions/getCurrentUser', () => ({
    default: vi.fn(),
}));

vi.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('PATCH /api/user/language', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 if user is not authenticated', async () => {
        (getCurrentUser as any).mockResolvedValue(null);

        const req = new Request('http://localhost/api/user/language', {
            method: 'PATCH',
        });

        const response = await PATCH(req);

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe('Authentication required');
    });

    it('returns 400 if language is missing', async () => {
        (getCurrentUser as any).mockResolvedValue({ id: '123' });

        const req = new Request('http://localhost/api/user/language', {
            method: 'PATCH',
            body: JSON.stringify({}),
        });

        const response = await PATCH(req);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe('Invalid language');
    });

    it('returns 400 if language is invalid', async () => {
        (getCurrentUser as any).mockResolvedValue({ id: '123' });

        const req = new Request('http://localhost/api/user/language', {
            method: 'PATCH',
            body: JSON.stringify({ language: 'fr' }),
        });

        const response = await PATCH(req);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe('Invalid language');
    });

    it('returns 200 and updates user if language is valid', async () => {
        (getCurrentUser as any).mockResolvedValue({ id: '123' });
        (prisma.user.update as any).mockResolvedValue({ language: 'ca' });

        const req = new Request('http://localhost/api/user/language', {
            method: 'PATCH',
            body: JSON.stringify({ language: 'ca' }),
        });

        const response = await PATCH(req);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.language).toBe('ca');
        expect(prisma.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: '123' },
                data: { language: 'ca' },
                select: { language: true },
            })
        );
    });

    it('returns 500 if database update fails', async () => {
        (getCurrentUser as any).mockResolvedValue({ id: '123' });
        (prisma.user.update as any).mockRejectedValue(new Error('DB Error'));

        const req = new Request('http://localhost/api/user/language', {
            method: 'PATCH',
            body: JSON.stringify({ language: 'en' }),
        });

        const response = await PATCH(req);

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe('Internal server error');
    });
});
