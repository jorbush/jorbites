import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ProfileHeader from '@/app/profile/[userId]/ProfileHeader';
import { SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';

// Mock data
vi.mock('@/app/hooks/useMediaQuery', () => ({
    default: () => false,
}));

const mockUser: SafeUser = {
    id: 'user1',
    name: 'Test User',
    email: null,
    emailVerified: null,
    image: '/test-image.jpg',
    hashedPassword: null,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
    favoriteIds: [],
    emailNotifications: false,
    level: 5,
    verified: true,
    badges: [],
    resetToken: null,
    resetTokenExpiry: null,
};

// Mock the router and translation
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        query: {},
    })),
}));

vi.mock('react-i18next', async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        useTranslation: () => ({
            t: (key: string) => {
                const translations: Record<string, string> = {
                    level: 'Lv.',
                    since: 'Since',
                    link_copied: 'Link copied to clipboard',
                };
                return translations[key] || key;
            },
        }),
        initReactI18next: {
            type: '3rdParty',
            init: vi.fn(),
        },
    };
});

// Mock react-icons
vi.mock('react-icons/fi', () => ({
    FiCalendar: () =>
        React.createElement('div', { 'data-testid': 'calendar-icon' }),
    FiShare2: () =>
        React.createElement('div', { 'data-testid': 'share-icon' }),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
    format: vi.fn(() => '2023'),
}));

// Mock date-fns/locale
vi.mock('date-fns/locale', () => ({
    es: {},
    enUS: {},
    ca: {},
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
    },
}));

describe('ProfileHeader', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders correctly with user data', () => {
        const router = { push: vi.fn() };
        (useRouter as any).mockReturnValue(router);

        const { getByText, getByAltText, getByTestId } = render(
            <ProfileHeader user={mockUser} />
        );

        // Assert user details
        expect(getByText('Test User')).toBeDefined();
        expect(getByText('Lv. 5')).toBeDefined();
        expect(getByAltText('Avatar')).toBeDefined();
        expect(getByText('Since 2023')).toBeDefined();
        expect(getByTestId('calendar-icon')).toBeDefined();
    });

    it('calls router.push on user name click', () => {
        const router = { push: vi.fn() };
        (useRouter as any).mockReturnValue(router);

        const { getByText } = render(<ProfileHeader user={mockUser} />);

        // Simulate click on user name
        fireEvent.click(getByText('Test User'));

        // Assert router.push is called with correct URL
        expect(router.push).toHaveBeenCalledWith('/profile/user1');
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
        expect(getByText('Lv. 5')).toBeDefined();

        // Assert verified icon is not rendered
        expect(queryByTestId('MdVerified')).toBeNull();
    });

    it('does not render member since when createdAt is not provided', () => {
        const userWithoutCreatedAt: SafeUser = {
            ...mockUser,
            createdAt: '',
        };
        const router = { push: vi.fn() };
        (useRouter as any).mockReturnValue(router);

        const { queryByText, queryByTestId } = render(
            <ProfileHeader user={userWithoutCreatedAt} />
        );

        // Assert member since is not rendered when createdAt is empty
        expect(queryByText('Since 2023')).toBeNull();
        expect(queryByTestId('calendar-icon')).toBeNull();
    });

    it('renders share button', () => {
        const router = { push: vi.fn() };
        (useRouter as any).mockReturnValue(router);

        const { getByTestId } = render(<ProfileHeader user={mockUser} />);

        // Assert share button is rendered
        expect(getByTestId('share-icon')).toBeDefined();
    });

    it('calls navigator.clipboard.writeText when share button is clicked and navigator.share is not available', async () => {
        const router = { push: vi.fn() };
        (useRouter as any).mockReturnValue(router);

        // Mock clipboard API
        const mockWriteText = vi.fn();
        Object.assign(navigator, {
            clipboard: {
                writeText: mockWriteText,
            },
        });

        const { getByLabelText } = render(<ProfileHeader user={mockUser} />);

        // Click share button
        fireEvent.click(getByLabelText('Share'));

        // Assert clipboard was called
        expect(mockWriteText).toHaveBeenCalled();
    });
});
