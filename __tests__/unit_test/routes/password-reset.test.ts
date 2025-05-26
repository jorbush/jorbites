import { expect } from '@jest/globals';
import { POST as PasswordResetRequestPOST } from '@/app/api/password-reset/request/route';
import { POST as PasswordResetPOST } from '@/app/api/password-reset/reset/route';
import { GET as PasswordResetValidateGET } from '@/app/api/password-reset/validate/[token]/route';
import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';

// Mock dependencies
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
}));

jest.mock('crypto', () => ({
    randomBytes: jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue('mock-token'),
    }),
}));

jest.mock('@/app/libs/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock('@/app/actions/sendEmail', () => jest.fn());

import prisma from '@/app/libs/prismadb';
import sendEmail from '@/app/actions/sendEmail';

describe('Password Reset API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/password-reset/request', () => {
        it('should return 400 when email is missing', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({}),
            } as unknown as Request;

            const response = await PasswordResetRequestPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Email is required');
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return success even when user is not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    email: 'notfound@example.com',
                }),
            } as unknown as Request;

            const response = await PasswordResetRequestPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should process valid email and send reset token', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(
                mockUser
            );
            (prisma.user.update as jest.Mock).mockResolvedValueOnce(mockUser);
            (sendEmail as jest.Mock).mockResolvedValueOnce(true);

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    email: 'test@example.com',
                }),
            } as unknown as Request;

            const response = await PasswordResetRequestPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: {
                    resetToken: 'mock-token',
                    resetTokenExpiry: expect.any(Date),
                },
            });
            expect(sendEmail).toHaveBeenCalled();
        });

        it('should return 500 when database operation fails', async () => {
            (prisma.user.findUnique as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    email: 'test@example.com',
                }),
            } as unknown as Request;

            const response = await PasswordResetRequestPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to process password reset request');
            expect(data.code).toBe('INTERNAL_SERVER_ERROR');
            expect(data.timestamp).toBeDefined();
        });
    });

    describe('POST /api/password-reset/reset', () => {
        it('should return 400 when token is missing', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    password: 'newpassword123',
                }),
            } as unknown as Request;

            const response = await PasswordResetPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Token and password are required');
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when password is missing', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    token: 'valid-token',
                }),
            } as unknown as Request;

            const response = await PasswordResetPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Token and password are required');
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when password is too short', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    token: 'valid-token',
                    password: '12345',
                }),
            } as unknown as Request;

            const response = await PasswordResetPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Password must be at least 6 characters long'
            );
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when token is invalid or expired', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    token: 'invalid-token',
                    password: 'newpassword123',
                }),
            } as unknown as Request;

            const response = await PasswordResetPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Invalid or expired token');
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should reset password successfully with valid token', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                resetToken: 'valid-token',
                resetTokenExpiry: new Date(Date.now() + 3600000),
            };
            (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(
                mockUser
            );
            (bcrypt.hash as jest.Mock).mockResolvedValueOnce(
                'hashedNewPassword'
            );
            (prisma.user.update as jest.Mock).mockResolvedValueOnce(mockUser);

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    token: 'valid-token',
                    password: 'newpassword123',
                }),
            } as unknown as Request;

            const response = await PasswordResetPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 12);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: {
                    hashedPassword: 'hashedNewPassword',
                    resetToken: null,
                    resetTokenExpiry: null,
                },
            });
        });

        it('should return 500 when database operation fails', async () => {
            (prisma.user.findFirst as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    token: 'valid-token',
                    password: 'newpassword123',
                }),
            } as unknown as Request;

            const response = await PasswordResetPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to reset password');
            expect(data.code).toBe('INTERNAL_SERVER_ERROR');
            expect(data.timestamp).toBeDefined();
        });
    });

    describe('GET /api/password-reset/validate/[token]', () => {
        it('should return 400 when token is missing', async () => {
            const mockParams = {
                params: Promise.resolve({ token: undefined }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/password-reset/validate/'
            );
            const response = await PasswordResetValidateGET(
                request,
                mockParams
            );
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Token is required');
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return invalid when token is not found', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);

            const mockParams = {
                params: Promise.resolve({ token: 'invalid-token' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/password-reset/validate/invalid-token'
            );
            const response = await PasswordResetValidateGET(
                request,
                mockParams
            );
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.valid).toBe(false);
        });

        it('should return valid when token is found and not expired', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                resetToken: 'valid-token',
                resetTokenExpiry: new Date(Date.now() + 3600000),
            };
            (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(
                mockUser
            );

            const mockParams = {
                params: Promise.resolve({ token: 'valid-token' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/password-reset/validate/valid-token'
            );
            const response = await PasswordResetValidateGET(
                request,
                mockParams
            );
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.valid).toBe(true);
        });

        it('should return 500 when database operation fails', async () => {
            (prisma.user.findFirst as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            const mockParams = {
                params: Promise.resolve({ token: 'valid-token' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/password-reset/validate/valid-token'
            );
            const response = await PasswordResetValidateGET(
                request,
                mockParams
            );
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to validate token');
            expect(data.code).toBe('INTERNAL_SERVER_ERROR');
            expect(data.timestamp).toBeDefined();
        });
    });
});
