jest.unmock('@/pages/api/auth/[...nextauth].ts');
jest.unmock('@/pages/api/auth/[...nextauth]');

import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/app/lib/prismadb';
import bcrypt from 'bcrypt';
import {
    generateTotpSecret,
    generateTotpCode,
    encryptTotpSecret,
    generateBackupCodes,
} from '@/app/utils/totp';

jest.mock('bcrypt');

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            updateMany: jest.fn(),
        },
    },
}));

describe('NextAuth Credentials authorize() - 2FA Flow', () => {
    const credentialsProvider = authOptions.providers.find(
        (provider: any) => provider.id === 'credentials'
    ) as any;

    const authorize = (credentials: Record<string, string>) => {
        const fn =
            credentialsProvider.options?.authorize ||
            credentialsProvider.authorize;
        return fn(credentials, {} as any);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('throws Invalid credentials when email or password is missing', async () => {
        await expect(
            authorize({ email: '', password: 'secretPassword' })
        ).rejects.toThrow('Invalid credentials');

        await expect(
            authorize({ email: 'chef@jorbites.com', password: '' })
        ).rejects.toThrow('Invalid credentials');
    });

    it('throws Invalid credentials when password does not match', async () => {
        jest.mocked(prisma.user.findUnique).mockResolvedValue({
            id: 'user-1',
            email: 'chef@jorbites.com',
            hashedPassword: 'hashed-password',
            twoFactorEnabled: false,
        } as any);
        jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

        await expect(
            authorize({
                email: 'chef@jorbites.com',
                password: 'wrongPassword',
            })
        ).rejects.toThrow('Invalid credentials');
    });

    it('returns user directly when 2FA is not enabled', async () => {
        const mockUser = {
            id: 'user-1',
            email: 'chef@jorbites.com',
            hashedPassword: 'hashed-password',
            twoFactorEnabled: false,
        };
        jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
        jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

        const result = await authorize({
            email: 'chef@jorbites.com',
            password: 'correctPassword',
        });

        expect(result).toEqual(mockUser);
    });

    it('throws 2FA_REQUIRED when 2FA is enabled but no twoFactorCode is provided', async () => {
        const secret = generateTotpSecret();
        jest.mocked(prisma.user.findUnique).mockResolvedValue({
            id: 'user-1',
            email: 'chef@jorbites.com',
            hashedPassword: 'hashed-password',
            twoFactorEnabled: true,
            twoFactorSecret: encryptTotpSecret(secret),
        } as any);
        jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

        await expect(
            authorize({
                email: 'chef@jorbites.com',
                password: 'correctPassword',
            })
        ).rejects.toThrow('2FA_REQUIRED');
    });

    it('returns user when a valid 6-digit TOTP code is provided', async () => {
        const secret = generateTotpSecret();
        const validTotp = generateTotpCode(secret);
        const mockUser = {
            id: 'user-1',
            email: 'chef@jorbites.com',
            hashedPassword: 'hashed-password',
            twoFactorEnabled: true,
            twoFactorSecret: encryptTotpSecret(secret),
            twoFactorBackupCodes: [],
        };

        jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
        jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

        const result = await authorize({
            email: 'chef@jorbites.com',
            password: 'correctPassword',
            twoFactorCode: validTotp,
        });

        expect(result).toEqual(mockUser);
        expect(prisma.user.updateMany).not.toHaveBeenCalled();
    });

    it('consumes a backup code with optimistic concurrency and returns user', async () => {
        const secret = generateTotpSecret();
        const { rawCodes, hashedCodes } = generateBackupCodes(8);
        const mockUser = {
            id: 'user-1',
            email: 'chef@jorbites.com',
            hashedPassword: 'hashed-password',
            twoFactorEnabled: true,
            twoFactorSecret: encryptTotpSecret(secret),
            twoFactorBackupCodes: [...hashedCodes],
        };

        jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
        jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
        jest.mocked(prisma.user.updateMany).mockResolvedValue({ count: 1 });

        const result = await authorize({
            email: 'chef@jorbites.com',
            password: 'correctPassword',
            twoFactorCode: rawCodes[0],
        });

        expect(result).toEqual(mockUser);
        expect(prisma.user.updateMany).toHaveBeenCalledWith({
            where: {
                id: 'user-1',
                twoFactorBackupCodes: {
                    equals: hashedCodes,
                },
            },
            data: {
                twoFactorBackupCodes: hashedCodes.slice(1),
            },
        });
    });

    it('throws INVALID_2FA_CODE when concurrent consumption of backup code fails (count === 0)', async () => {
        const secret = generateTotpSecret();
        const { rawCodes, hashedCodes } = generateBackupCodes(8);
        const mockUser = {
            id: 'user-1',
            email: 'chef@jorbites.com',
            hashedPassword: 'hashed-password',
            twoFactorEnabled: true,
            twoFactorSecret: encryptTotpSecret(secret),
            twoFactorBackupCodes: [...hashedCodes],
        };

        jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
        jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
        jest.mocked(prisma.user.updateMany).mockResolvedValue({ count: 0 });

        await expect(
            authorize({
                email: 'chef@jorbites.com',
                password: 'correctPassword',
                twoFactorCode: rawCodes[0],
            })
        ).rejects.toThrow('INVALID_2FA_CODE');
    });

    it('throws INVALID_2FA_CODE when code matches neither TOTP nor backup codes', async () => {
        const secret = generateTotpSecret();
        const { hashedCodes } = generateBackupCodes(8);
        const mockUser = {
            id: 'user-1',
            email: 'chef@jorbites.com',
            hashedPassword: 'hashed-password',
            twoFactorEnabled: true,
            twoFactorSecret: encryptTotpSecret(secret),
            twoFactorBackupCodes: [...hashedCodes],
        };

        jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
        jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

        await expect(
            authorize({
                email: 'chef@jorbites.com',
                password: 'correctPassword',
                twoFactorCode: '999999',
            })
        ).rejects.toThrow('INVALID_2FA_CODE');
    });

    it('throws INVALID_2FA_CODE cleanly when twoFactorSecret is corrupt or unreadable', async () => {
        const mockUser = {
            id: 'user-1',
            email: 'chef@jorbites.com',
            hashedPassword: 'hashed-password',
            twoFactorEnabled: true,
            twoFactorSecret: 'corrupted-secret-format',
            twoFactorBackupCodes: [],
        };

        jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
        jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

        await expect(
            authorize({
                email: 'chef@jorbites.com',
                password: 'correctPassword',
                twoFactorCode: '123456',
            })
        ).rejects.toThrow('INVALID_2FA_CODE');
    });
});
