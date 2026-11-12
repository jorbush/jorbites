import { POST as SetupPOST } from '@/app/api/2fa/setup/route';
import { POST as EnablePOST } from '@/app/api/2fa/enable/route';
import { POST as DisablePOST } from '@/app/api/2fa/disable/route';
import { POST as BackupCodesPOST } from '@/app/api/2fa/backup-codes/route';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import bcrypt from 'bcrypt';
import {
    generateTotpSecret,
    generateTotpCode,
    encryptTotpSecret,
} from '@/app/utils/totp';

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

describe('2FA API Routes (/api/2fa/*)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/2fa/setup', () => {
        it('returns 401 when unauthenticated', async () => {
            jest.mocked(getCurrentUser).mockResolvedValue(null);

            const req = new Request('http://localhost/api/2fa/setup', {
                method: 'POST',
                body: JSON.stringify({ currentPassword: 'secretPassword123' }),
            });
            const res = await SetupPOST(req);
            expect(res.status).toBe(401);
        });

        it('returns 400 when currentPassword is incorrect', async () => {
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({
                id: 'user-1',
                email: 'chef@jorbites.com',
                hashedPassword: 'hashed-password',
                twoFactorEnabled: false,
            } as any);
            jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

            const req = new Request('http://localhost/api/2fa/setup', {
                method: 'POST',
                body: JSON.stringify({ currentPassword: 'wrongPassword' }),
            });
            const res = await SetupPOST(req);
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.error).toBe('Current password is incorrect');
        });

        it('generates and stores encrypted TOTP secret when password is valid', async () => {
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({
                id: 'user-1',
                email: 'chef@jorbites.com',
                hashedPassword: 'hashed-password',
                twoFactorEnabled: false,
            } as any);
            jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

            const req = new Request('http://localhost/api/2fa/setup', {
                method: 'POST',
                body: JSON.stringify({ currentPassword: 'correctPassword' }),
            });
            const res = await SetupPOST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.secret).toMatch(/^[A-Z2-7]{32}$/);
            expect(data.otpauthUrl).toContain('otpauth://totp/Jorbites:');
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'user-1' },
                    data: expect.objectContaining({
                        twoFactorEnabled: false,
                        twoFactorSecret: expect.stringMatching(/^enc:/),
                    }),
                })
            );
        });
    });

    describe('POST /api/2fa/enable', () => {
        it('returns 400 when verification code is invalid', async () => {
            const secret = generateTotpSecret();
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({
                id: 'user-1',
                twoFactorSecret: encryptTotpSecret(secret),
                twoFactorEnabled: false,
            } as any);

            const req = new Request('http://localhost/api/2fa/enable', {
                method: 'POST',
                body: JSON.stringify({ code: 'invalid' }),
            });
            const res = await EnablePOST(req);
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.error).toBe('Invalid verification code');
        });

        it('returns 400 when 2FA is already enabled', async () => {
            const secret = generateTotpSecret();
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({
                id: 'user-1',
                twoFactorSecret: encryptTotpSecret(secret),
                twoFactorEnabled: true,
            } as any);

            const req = new Request('http://localhost/api/2fa/enable', {
                method: 'POST',
                body: JSON.stringify({ code: '123456' }),
            });
            const res = await EnablePOST(req);
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.error).toBe(
                'Two-factor authentication is already enabled'
            );
        });

        it('enables 2FA and returns 8 backup codes when TOTP code is valid', async () => {
            const secret = generateTotpSecret();
            const validCode = generateTotpCode(secret);

            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({
                id: 'user-1',
                twoFactorSecret: encryptTotpSecret(secret),
                twoFactorEnabled: false,
            } as any);

            const req = new Request('http://localhost/api/2fa/enable', {
                method: 'POST',
                body: JSON.stringify({ code: validCode }),
            });
            const res = await EnablePOST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.backupCodes).toHaveLength(8);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: {
                    twoFactorEnabled: true,
                    twoFactorBackupCodes: expect.arrayContaining([
                        expect.any(String),
                    ]),
                },
            });
        });
    });

    describe('POST /api/2fa/disable', () => {
        it('disables 2FA and clears secret and backup codes when password is valid', async () => {
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({
                id: 'user-1',
                hashedPassword: 'hashed-password',
                twoFactorEnabled: true,
            } as any);
            jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

            const req = new Request('http://localhost/api/2fa/disable', {
                method: 'POST',
                body: JSON.stringify({ currentPassword: 'correctPassword' }),
            });
            const res = await DisablePOST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: {
                    twoFactorEnabled: false,
                    twoFactorSecret: null,
                    twoFactorBackupCodes: [],
                },
            });
        });
    });

    describe('POST /api/2fa/backup-codes', () => {
        it('regenerates 8 backup codes when password is valid and 2FA is enabled', async () => {
            jest.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({
                id: 'user-1',
                hashedPassword: 'hashed-password',
                twoFactorEnabled: true,
            } as any);
            jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

            const req = new Request('http://localhost/api/2fa/backup-codes', {
                method: 'POST',
                body: JSON.stringify({ currentPassword: 'correctPassword' }),
            });
            const res = await BackupCodesPOST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.backupCodes).toHaveLength(8);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: {
                    twoFactorBackupCodes: expect.arrayContaining([
                        expect.any(String),
                    ]),
                },
            });
        });
    });
});
