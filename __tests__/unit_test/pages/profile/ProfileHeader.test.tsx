import React from 'react';
import {
    render,
    fireEvent,
    cleanup,
} from '@testing-library/react';
import {
    describe,
    it,
    expect,
    vi,
    afterEach,
} from 'vitest';
import ProfileHeader from '@/app/profile/[userId]/ProfileHeader';
import { SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';

// Mock data
const mockUser: SafeUser = {
    id: 'user1',
    name: 'Test User',
    email: null,
    emailVerified: null,
    image: '/test-image.jpg',
    hashedPassword: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favoriteIds: [],
    emailNotifications: false,
    level: 5,
    verified: true,
};

// Mock the router and translation
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        query: {},
    })),
}));
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('ProfileHeader', () => {
    afterEach(() => {
        cleanup();
    });
    it('renders correctly with user data', () => {
        const router = { push: vi.fn() };
        (useRouter as any).mockReturnValue(router);

        const { getByText, getByAltText } = render(
            <ProfileHeader user={mockUser} />
        );

        // Assert user details
        expect(getByText('Test User')).toBeDefined();
        expect(getByText('level 5')).toBeDefined();
        expect(getByAltText('Avatar')).toBeDefined();
        expect(
            getByText('Test User').closest('svg')
        ).toBeDefined();
    });

    it('calls router.push on user name click', () => {
        const router = { push: vi.fn() };
        (useRouter as any).mockReturnValue(router);

        const { getByText } = render(
            <ProfileHeader user={mockUser} />
        );

        // Simulate click on user name
        fireEvent.click(getByText('Test User'));

        // Assert router.push is called with correct URL
        expect(router.push).toHaveBeenCalledWith(
            '/profile/user1'
        );
    });

    it('renders correctly with unverified user', () => {
        const unverifiedUser = {
            ...mockUser,
            verified: false,
        };
        const router = { push: vi.fn() };
        (useRouter as any).mockReturnValue(router);

        const { getByText, queryByTestId } = render(
            <ProfileHeader user={unverifiedUser} />
        );

        // Assert user details
        expect(getByText('Test User')).toBeDefined();
        expect(getByText('level 5')).toBeDefined();

        // Assert verified icon is not rendered
        expect(queryByTestId('MdVerified')).toBeNull();
    });
});
