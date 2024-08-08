import getRecipes from '@/app/actions/getRecipes';
import getCurrentUser from '@/app/actions/getCurrentUser';
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

describe('Recipes API Routes and Server Actions', () => {
    afterEach(() => {
        mockedSession = {
            expires: 'expires',
            user: {
                name: 'test',
                email: 'test@a.com',
            },
        };
    });

    it('should return empty data', async () => {
        const response = await getRecipes({});
        const expectedEmptyData = {
            currentPage: 1,
            recipes: [],
            totalPages: 0,
            totalRecipes: 0,
        };

        expect(response).toStrictEqual(expectedEmptyData);
    });
});
