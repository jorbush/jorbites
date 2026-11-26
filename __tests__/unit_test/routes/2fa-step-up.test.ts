import { expect } from '@jest/globals';
import { POST as Enable2FAPOST } from '@/app/api/2fa/enable/route';
import { POST as Disable2FAPOST } from '@/app/api/2fa/disable/route';
import { POST as BackupCodesPOST } from '@/app/api/2fa/backup-codes/route';
import { DELETE as UserDELETE } from '@/app/api/user/[userId]/route';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import bcrypt from 'bcrypt';
import {
    generateTotpSecret,
    generateTotpCode,
    encryptTotpSecret,
    generateBackupCodes,
} from '@/app/utils/totp';

jest.mock('bcrypt');

jest.mock('next/server', () => {
    const actual = jest.requireActual('next/server');
    return {
        ...actual,
        after: jest.fn((cb: () => void) => cb()),
    };
});

jest.mock('@/app/actions/getCurrentUser', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@/app/services/draftService', () => ({
    DraftService: {
        cleanupUserDrafts: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('@/app/lib/prismadb', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            delete: jest.fn(),
        },
        $transaction: jest.fn(async (cb: any) =>
            cb({
                user: { delete: jest.fn().mockResolvedValue({}) },
            })
        ),
    },
}));

describe('2FA Step-Up Verification & TOTP Replay Protection (#1859)', () => {
    const mockCurrentUser = {
        id: 'user-1',
        email: 'chef@jorbites.com',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.ENV;
    });

    describe('POST /api/2fa/enable', () => {
        it('records twoFactorLastUsedStep when enabling 2FA', async () => {
            const secret = generateTotpSecret();
            const code = generateTotpCode(secret);

            jest.mocked(getCurrentUser).mockResolvedValueOnce(
                mockCurrentUser as any
            );
            jest.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'user-1',
                twoFactorEnabled: false,
                twoFactorSecret: encryptTotpSecret(secret),
            } as any);

            const req = new Request('http://localhost/api/2fa/enable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });

            const res = await Enable2FAPOST(req);
            expect(res.status).toBe(200);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: expect.objectContaining({
                    twoFactorEnabled: true,
                    twoFactorLastUsedStep: expect.any(Number),
                }),
            });
        });
    });

    describe('POST /api/2fa/disable', () => {
        it('returns 400 when twoFactorCode is missing', async () => {
            jest.mocked(getCurrentUser).mockResolvedValueOnce(
                mockCurrentUser as any
            );

            const req = new Request('http://localhost/api/2fa/disable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: 'correctPassword' }),
            });

            const res = await Disable2FAPOST(req);
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.error).toContain('2FA verification code');
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('rejects replayed TOTP code when disabling 2FA', async () => {
            const secret = generateTotpSecret();
            const code = generateTotpCode(secret);
            const currentStep = Math.floor(Date.now() / 1000 / 30);

            jest.mocked(getCurrentUser).mockResolvedValueOnce(
                mockCurrentUser as any
            );
            jest.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'user-1',
                hashedPassword: 'hashed-password',
                twoFactorEnabled: true,
                twoFactorSecret: encryptTotpSecret(secret),
                twoFactorBackupCodes: [],
                twoFactorLastUsedStep: currentStep,
            } as any);
            jest.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

            const req = new Request('http://localhost/api/2fa/disable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: 'correctPassword',
                    twoFactorCode: code,
                }),
            });

            const res = await Disable2FAPOST(req);
            expect(res.status).toBe(400);
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('disables 2FA and clears twoFactorLastUsedStep when password and valid TOTP are provided', async () => {
            const secret = generateTotpSecret();
            const code = generateTotpCode(secret);

            jest.mocked(getCurrentUser).mockResolvedValueOnce(
                mockCurrentUser as any
            );
            jest.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'user-1',
                hashedPassword: 'hashed-password',
                twoFactorEnabled: true,
                twoFactorSecret: encryptTotpSecret(secret),
                twoFactorBackupCodes: [],
                twoFactorLastUsedStep: null,
            } as any);
            jest.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
            jest.mocked(prisma.user.updateMany).mockResolvedValueOnce({
                count: 1,
            });

            const req = new Request('http://localhost/api/2fa/disable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: 'correctPassword',
                    twoFactorCode: code,
                }),
            });

            const res = await Disable2FAPOST(req);
            expect(res.status).toBe(200);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: {
                    twoFactorEnabled: false,
                    twoFactorSecret: null,
                    twoFactorBackupCodes: [],
                    twoFactorLastUsedStep: null,
                },
            });
        });

        it('disables 2FA when a valid one-time backup code is provided', async () => {
            const secret = generateTotpSecret();
            const { rawCodes, hashedCodes } = generateBackupCodes(4);

            jest.mocked(getCurrentUser).mockResolvedValueOnce(
                mockCurrentUser as any
            );
            jest.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'user-1',
                hashedPassword: 'hashed-password',
                twoFactorEnabled: true,
                twoFactorSecret: encryptTotpSecret(secret),
                twoFactorBackupCodes: hashedCodes,
                twoFactorLastUsedStep: null,
            } as any);
            jest.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
            jest.mocked(prisma.user.updateMany).mockResolvedValueOnce({
                count: 1,
            });

            const req = new Request('http://localhost/api/2fa/disable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: 'correctPassword',
                    twoFactorCode: rawCodes[0],
                }),
            });

            const res = await Disable2FAPOST(req);
            expect(res.status).toBe(200);
        });
    });

    describe('POST /api/2fa/backup-codes', () => {
        it('returns 400 when twoFactorCode is missing', async () => {
            jest.mocked(getCurrentUser).mockResolvedValueOnce(
                mockCurrentUser as any
            );

            const req = new Request('http://localhost/api/2fa/backup-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: 'correctPassword' }),
            });

            const res = await BackupCodesPOST(req);
            expect(res.status).toBe(400);
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('regenerates backup codes when password and fresh TOTP are valid', async () => {
            const secret = generateTotpSecret();
            const code = generateTotpCode(secret);

            jest.mocked(getCurrentUser).mockResolvedValueOnce(
                mockCurrentUser as any
            );
            jest.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'user-1',
                hashedPassword: 'hashed-password',
                twoFactorEnabled: true,
                twoFactorSecret: encryptTotpSecret(secret),
                twoFactorBackupCodes: [],
                twoFactorLastUsedStep: null,
            } as any);
            jest.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
            jest.mocked(prisma.user.updateMany).mockResolvedValueOnce({
                count: 1,
            });

            const req = new Request('http://localhost/api/2fa/backup-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: 'correctPassword',
                    twoFactorCode: code,
                }),
            });

            const res = await BackupCodesPOST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.backupCodes).toHaveLength(8);
        });
    });

    describe('DELETE /api/user/[userId] - 2FA step-up', () => {
        const params = Promise.resolve({ userId: 'user-1' });

        it('requires twoFactorCode when 2FA is enabled on the account', async () => {
            const secret = generateTotpSecret();
            jest.mocked(getCurrentUser).mockResolvedValueOnce(
                mockCurrentUser as any
            );
            jest.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'user-1',
                twoFactorEnabled: true,
                twoFactorSecret: encryptTotpSecret(secret),
                twoFactorBackupCodes: [],
                twoFactorLastUsedStep: null,
            } as any);

            const req = new Request('http://localhost/api/user/user-1', {
                method: 'DELETE',
            });

            const res = await UserDELETE(req, { params });
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.error).toContain('Two-factor authentication code');
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });

        it('rejects invalid or replayed TOTP code on account deletion', async () => {
            const secret = generateTotpSecret();
            const code = generateTotpCode(secret);
            const currentStep = Math.floor(Date.now() / 1000 / 30);

            jest.mocked(getCurrentUser).mockResolvedValueOnce(
                mockCurrentUser as any
            );
            jest.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'user-1',
                twoFactorEnabled: true,
                twoFactorSecret: encryptTotpSecret(secret),
                twoFactorBackupCodes: [],
                twoFactorLastUsedStep: currentStep,
            } as any);

            const req = new Request('http://localhost/api/user/user-1', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ twoFactorCode: code }),
            });

            const res = await UserDELETE(req, { params });
            expect(res.status).toBe(400);
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });

        it('deletes 2FA-enabled account when valid fresh TOTP code is provided', async () => {
            const secret = generateTotpSecret();
            const code = generateTotpCode(secret);

            jest.mocked(getCurrentUser).mockResolvedValueOnce(
                mockCurrentUser as any
            );
            jest.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'user-1',
                twoFactorEnabled: true,
                twoFactorSecret: encryptTotpSecret(secret),
                twoFactorBackupCodes: [],
                twoFactorLastUsedStep: null,
            } as any);
            jest.mocked(prisma.user.updateMany).mockResolvedValueOnce({
                count: 1,
            });

            const req = new Request('http://localhost/api/user/user-1', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ twoFactorCode: code }),
            });

            const res = await UserDELETE(req, { params });
            expect(res.status).toBe(200);
            expect(prisma.$transaction).toHaveBeenCalledTimes(1);
        });

        it('allows deleting account without twoFactorCode when 2FA is not enabled', async () => {
            jest.mocked(getCurrentUser).mockResolvedValueOnce(
                mockCurrentUser as any
            );
            jest.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'user-1',
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorBackupCodes: [],
                twoFactorLastUsedStep: null,
            } as any);

            const req = new Request('http://localhost/api/user/user-1', {
                method: 'DELETE',
            });

            const res = await UserDELETE(req, { params });
            expect(res.status).toBe(200);
            expect(prisma.$transaction).toHaveBeenCalledTimes(1);
        });
    });
});
