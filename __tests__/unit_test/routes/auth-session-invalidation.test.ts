jest.unmock('@/pages/api/auth/[...nextauth].ts');
jest.unmock('@/pages/api/auth/[...nextauth]');

import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/app/lib/prismadb';

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

describe('NextAuth JWT Callback - Session Invalidation (#1858)', () => {
    const jwtCallback = authOptions.callbacks!.jwt!;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('embeds user.tokenVersion on initial sign-in', async () => {
        const result = await jwtCallback({
            token: {},
            user: {
                id: 'user-1',
                name: 'Chef Jordi',
                email: 'jordi@jorbites.com',
                image: '/avatar.png',
                tokenVersion: 3,
            } as any,
            account: null,
        });

        expect(result).toEqual({
            id: 'user-1',
            name: 'Chef Jordi',
            email: 'jordi@jorbites.com',
            picture: '/avatar.png',
            tokenVersion: 3,
        });
        expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('defaults tokenVersion to 0 on initial sign-in when missing on user', async () => {
        const result = await jwtCallback({
            token: {},
            user: {
                id: 'user-1',
                name: 'Chef Jordi',
                email: 'jordi@jorbites.com',
                image: null,
            } as any,
            account: null,
        });

        expect(result.tokenVersion).toBe(0);
    });

    it('keeps pre-deploy tokens valid (undefined tokenVersion) when DB tokenVersion is 0', async () => {
        jest.mocked(prisma.user.findUnique).mockResolvedValueOnce({
            tokenVersion: 0,
        } as any);

        const existingToken = {
            id: 'user-1',
            name: 'Chef Jordi',
            email: 'jordi@jorbites.com',
        };

        const result = await jwtCallback({
            token: existingToken,
            user: undefined as any,
            account: null,
        });

        expect(result).toEqual(existingToken);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            select: { tokenVersion: true },
        });
    });

    it('accepts tokens whose tokenVersion matches the database value', async () => {
        jest.mocked(prisma.user.findUnique).mockResolvedValueOnce({
            tokenVersion: 2,
        } as any);

        const validToken = {
            id: 'user-1',
            email: 'jordi@jorbites.com',
            tokenVersion: 2,
        };

        const result = await jwtCallback({
            token: validToken,
            user: undefined as any,
            account: null,
        });

        expect(result).toEqual(validToken);
    });

    it('revokes pre-deploy and stale tokens once DB tokenVersion increments', async () => {
        jest.mocked(prisma.user.findUnique)
            .mockResolvedValueOnce({ tokenVersion: 1 } as any)
            .mockResolvedValueOnce({ tokenVersion: 2 } as any);

        await expect(
            jwtCallback({
                token: { id: 'user-1', email: 'jordi@jorbites.com' },
                user: undefined as any,
                account: null,
            })
        ).rejects.toThrow('SESSION_REVOKED');

        await expect(
            jwtCallback({
                token: {
                    id: 'user-1',
                    email: 'jordi@jorbites.com',
                    tokenVersion: 1,
                },
                user: undefined as any,
                account: null,
            })
        ).rejects.toThrow('SESSION_REVOKED');
    });

    it('revokes tokens when user no longer exists in database', async () => {
        jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

        await expect(
            jwtCallback({
                token: {
                    id: 'deleted-user',
                    email: 'deleted@jorbites.com',
                    tokenVersion: 0,
                },
                user: undefined as any,
                account: null,
            })
        ).rejects.toThrow('SESSION_REVOKED');
    });

    it('rejects malformed tokens missing a valid user id', async () => {
        await expect(
            jwtCallback({
                token: { email: 'jordi@jorbites.com' },
                user: undefined as any,
                account: null,
            })
        ).rejects.toThrow('SESSION_INVALID');

        expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
});
