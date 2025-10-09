import { expect } from '@jest/globals';
import { POST as RegisterPOST } from '@/app/api/register/route';
import bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
}));

// Mock prisma
jest.mock('@/app/libs/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
}));

import prisma from '@/app/lib/prismadb';

describe('Register API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/register', () => {
        it('should return 400 when email is missing', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    name: 'Test User',
                    password: 'password123',
                }),
            } as unknown as Request;

            const response = await RegisterPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Email, name, and password are required');
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when name is missing', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    email: 'test@example.com',
                    password: 'password123',
                }),
            } as unknown as Request;

            const response = await RegisterPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Email, name, and password are required');
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when password is missing', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    email: 'test@example.com',
                    name: 'Test User',
                }),
            } as unknown as Request;

            const response = await RegisterPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Email, name, and password are required');
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when password is too short', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    email: 'test@example.com',
                    name: 'Test User',
                    password: '12345',
                }),
            } as unknown as Request;

            const response = await RegisterPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Password must be at least 6 characters long'
            );
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 409 when email already exists', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
                id: '1',
                email: 'test@example.com',
            });

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    email: 'test@example.com',
                    name: 'Test User',
                    password: 'password123',
                }),
            } as unknown as Request;

            const response = await RegisterPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data.error).toBe('Email already exists');
            expect(data.code).toBe('CONFLICT');
            expect(data.timestamp).toBeDefined();
        });

        it('should create user successfully when all data is valid', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
            (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');

            const mockUser = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                hashedPassword: 'hashedPassword',
            };
            (prisma.user.create as jest.Mock).mockResolvedValueOnce(mockUser);

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    email: 'test@example.com',
                    name: 'Test User',
                    password: 'password123',
                }),
            } as unknown as Request;

            const response = await RegisterPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockUser);
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'test@example.com',
                    name: 'Test User',
                    hashedPassword: 'hashedPassword',
                },
            });
        });

        it('should return 500 when database operation fails', async () => {
            (prisma.user.findUnique as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    email: 'test@example.com',
                    name: 'Test User',
                    password: 'password123',
                }),
            } as unknown as Request;

            const response = await RegisterPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to create user account');
            expect(data.code).toBe('INTERNAL_SERVER_ERROR');
            expect(data.timestamp).toBeDefined();
        });
    });
});
