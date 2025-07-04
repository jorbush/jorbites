import { expect } from '@jest/globals';
import { PATCH } from '@/app/api/userName/[userId]/route';
import { NextRequest } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { USERNAME_MAX_LENGTH } from '@/app/utils/constants';

// Mock getCurrentUser
jest.mock('@/app/actions/getCurrentUser');
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
    typeof getCurrentUser
>;

// Mock prisma
jest.mock('@/app/libs/prismadb', () => ({
    user: {
        findFirst: jest.fn(),
        update: jest.fn(),
    },
}));

const mockPrisma = require('@/app/libs/prismadb');

describe('PATCH /api/userName/[userId]', () => {
    const mockUser = {
        id: 'user123',
        name: 'TestUser',
        email: 'test@example.com',
        emailVerified: null,
        image: null,
        hashedPassword: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        favoriteIds: [],
        emailNotifications: false,
        level: 0,
        verified: false,
        badges: [],
        resetToken: null,
        resetTokenExpiry: null,
    };

    const createRequest = (userName: string) => {
        return new NextRequest('http://localhost:3000/api/userName/user123', {
            method: 'PATCH',
            body: JSON.stringify({ userName }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue(mockUser);
        mockPrisma.user.findFirst.mockResolvedValue(null);
        mockPrisma.user.update.mockResolvedValue(mockUser);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should reject unauthenticated users', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        const request = createRequest('NewUser');
        const response = await PATCH(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe(
            'User authentication required to update username'
        );
    });

    it('should reject empty username', async () => {
        const request = createRequest('');
        const response = await PATCH(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Valid username is required');
    });

    it('should reject username that is too long', async () => {
        const longUsername = 'a'.repeat(USERNAME_MAX_LENGTH + 1);
        const request = createRequest(longUsername);
        const response = await PATCH(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            `Username must be ${USERNAME_MAX_LENGTH} characters or less`
        );
    });

    it('should reject username with special characters', async () => {
        const request = createRequest('User@Name');
        const response = await PATCH(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            'Username must contain only letters, numbers, and underscores'
        );
    });

    it('should reject username with spaces', async () => {
        const request = createRequest('User Name');
        const response = await PATCH(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            'Username must contain only letters, numbers, and underscores'
        );
    });

    it('should reject username with hyphens', async () => {
        const request = createRequest('User-Name');
        const response = await PATCH(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            'Username must contain only letters, numbers, and underscores'
        );
    });

    it('should accept username with underscores', async () => {
        const request = createRequest('User_Name');
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user123' },
            data: { name: 'User_Name' },
        });
    });

    it('should reject username with dots', async () => {
        const request = createRequest('User.Name');
        const response = await PATCH(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            'Username must contain only letters, numbers, and underscores'
        );
    });

    it('should accept valid alphanumeric username', async () => {
        const request = createRequest('User123');
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user123' },
            data: { name: 'User123' },
        });
    });

    it('should accept username with only letters', async () => {
        const request = createRequest('Username');
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user123' },
            data: { name: 'Username' },
        });
    });

    it('should accept username with only numbers', async () => {
        const request = createRequest('123456');
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user123' },
            data: { name: '123456' },
        });
    });

    it('should accept username with multiple underscores', async () => {
        const request = createRequest('user__name__123');
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user123' },
            data: { name: 'user__name__123' },
        });
    });

    it('should accept username starting with underscore', async () => {
        const request = createRequest('_username');
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user123' },
            data: { name: '_username' },
        });
    });

    it('should accept username ending with underscore', async () => {
        const request = createRequest('username_');
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user123' },
            data: { name: 'username_' },
        });
    });

    it('should accept username with only underscores', async () => {
        const request = createRequest('___');
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user123' },
            data: { name: '___' },
        });
    });

    it('should accept complex alphanumeric with underscores', async () => {
        const request = createRequest('test_user_123');
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user123' },
            data: { name: 'test_user_123' },
        });
    });

    it('should reject username if already taken by another user', async () => {
        const existingUser = { id: 'another-user', name: 'TakenUser' };
        mockPrisma.user.findFirst.mockResolvedValue(existingUser);

        const request = createRequest('TakenUser');
        const response = await PATCH(request);
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.error).toBe('Username is already taken');
    });

    it('should allow updating to the same username (case: user wants to keep current name)', async () => {
        const request = createRequest('TestUser');
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
            where: {
                name: 'TestUser',
                id: {
                    not: 'user123',
                },
            },
        });
    });

    it('should trim whitespace before validation', async () => {
        const request = createRequest('  Valid123  ');
        const response = await PATCH(request);

        expect(response.status).toBe(200);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user123' },
            data: { name: 'Valid123' },
        });
    });

    it('should reject whitespace-only username', async () => {
        const request = createRequest('   ');
        const response = await PATCH(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Username cannot be empty');
    });

    it('should handle database errors', async () => {
        mockPrisma.user.update.mockRejectedValue(new Error('Database error'));
        const request = createRequest('ValidUser');
        const response = await PATCH(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to update username');
    });
});
