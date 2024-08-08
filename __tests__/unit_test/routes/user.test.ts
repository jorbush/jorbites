import getCurrentUser from '@/app/actions/getCurrentUser';
import { be } from 'date-fns/locale';
import { Session } from 'next-auth';

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

jest.setTimeout(60000);

describe('User API Routes and Server Actions', () => {

    afterEach(() => {
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
    });
});
