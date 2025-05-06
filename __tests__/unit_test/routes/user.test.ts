import getCurrentUser from '@/app/actions/getCurrentUser';
import getUserById from '@/app/actions/getUserById';
import { Session } from 'next-auth';
import { POST } from '@/app/api/register/route';
import { NextRequest } from 'next/server';

let mockedSession: Session | null = null;

// This mocks our custom helper function to avoid passing authOptions around
jest.mock('@/pages/api/auth/[...nextauth].ts', () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));

// This mocks calls to getServerSession
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => {
        return Promise.resolve(mockedSession);
    }),
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn(() => Promise.resolve('hashedpassword')),
}));

describe('User API Routes and Server Actions', () => {
    let currentUser: any = null;
    afterEach(async () => {
        mockedSession = null;
    });

    it('should return empty user', async () => {
        const response = await getCurrentUser();
        expect(response).toStrictEqual(mockedSession?.user || null);
    });

    it('should return current user', async () => {
        mockedSession = {
            expires: 'expires',
            user: {
                name: 'test',
                email: 'test@a.com',
            },
        };
        const response = await getCurrentUser();
        expect(response).toMatchObject(mockedSession?.user || {});
        currentUser = response;
    });

    it('should return the user with the id', async () => {
        const response = await getUserById({ userId: currentUser.id });
        expect(response).toMatchObject(mockedSession?.user || {});
    });

    it('should return error 409 when email already exists', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@a.com',
                name: 'New User',
                password: 'password123',
            }),
        });

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(409);
        expect(responseData).toEqual({ error: 'Email already exists' });
    });
});
