import { PATCH as PasswordPATCH } from '@/app/api/password/[userId]/route';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');

jest.mock('@/app/actions/getCurrentUser', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

describe('PATCH /api/password/[userId]', () => {
    const params = Promise.resolve({ userId: 'user-1' });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 when user is not authenticated', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue(null);

        const request = new Request('http://localhost/api/password/user-1', {
            method: 'PATCH',
            body: JSON.stringify({
                currentPassword: 'old',
                newPassword: 'new',
            }),
        });

        const response = await PasswordPATCH(request, { params });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe(
            'User authentication required to change password'
        );
    });

    it('should return 403 when trying to change another user password', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue({
            id: 'other-user',
        } as any);

        const request = new Request('http://localhost/api/password/user-1', {
            method: 'PATCH',
            body: JSON.stringify({
                currentPassword: 'old',
                newPassword: 'new',
            }),
        });

        const response = await PasswordPATCH(request, { params });
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('You can only change your own password');
    });

    it('should return 400 when newPassword is less than 8 characters', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as any);

        const request = new Request('http://localhost/api/password/user-1', {
            method: 'PATCH',
            body: JSON.stringify({
                currentPassword: 'oldSecret1',
                newPassword: 'short',
            }),
        });

        const response = await PasswordPATCH(request, { params });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            'New password must be at least 8 characters long'
        );
    });

    it('should return 400 when current password is incorrect', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as any);
        jest.mocked(prisma.user.findUnique).mockResolvedValue({
            id: 'user-1',
            hashedPassword: 'hashed-old-pass',
        } as any);
        jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

        const request = new Request('http://localhost/api/password/user-1', {
            method: 'PATCH',
            body: JSON.stringify({
                currentPassword: 'wrongOldPassword',
                newPassword: 'validNewPassword123',
            }),
        });

        const response = await PasswordPATCH(request, { params });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Current password is incorrect');
    });

    it('should update password successfully when inputs are valid', async () => {
        jest.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as any);
        jest.mocked(prisma.user.findUnique).mockResolvedValue({
            id: 'user-1',
            hashedPassword: 'hashed-old-pass',
        } as any);
        jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
        jest.mocked(bcrypt.hash).mockResolvedValue('hashed-new-pass' as never);

        const request = new Request('http://localhost/api/password/user-1', {
            method: 'PATCH',
            body: JSON.stringify({
                currentPassword: 'correctOldPassword',
                newPassword: 'validNewPassword123',
            }),
        });

        const response = await PasswordPATCH(request, { params });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { hashedPassword: 'hashed-new-pass' },
        });
    });
});
