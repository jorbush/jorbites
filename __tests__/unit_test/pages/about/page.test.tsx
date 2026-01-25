import React, { Suspense } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AboutPage from '@/app/about/page';
import { SafeUser } from '@/app/types';
import getCurrentUser from '@/app/actions/getCurrentUser';

// Mock getCurrentUser as a function
vi.mock('@/app/actions/getCurrentUser', () => ({
    default: vi.fn(),
}));

vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
        ...actual,
        Suspense: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="suspense">{children}</div>
        ),
    };
});

vi.mock('@/app/about/AboutClient', () => ({
    default: ({ currentUser }: { currentUser?: SafeUser | null }) => (
        <div
            data-testid="about-client"
            data-current-user={currentUser?.id || 'null'}
        >
            About Client Component
        </div>
    ),
}));

vi.mock('@/app/components/about/AboutClientSkeleton', () => ({
    default: () => <div data-testid="about-skeleton">Loading...</div>,
}));

describe('AboutPage', () => {
    const mockCurrentUser: SafeUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        image: 'test-image.jpg',
        hashedPassword: null,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        favoriteIds: [],
        emailNotifications: true,
        level: 5,
        verified: true,
        badges: [],
        resetToken: null,
        resetTokenExpiry: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders without crashing', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(null);

        const page = await AboutPage();
        render(page);

        expect(screen.getByTestId('suspense')).toBeDefined();
        expect(screen.getByTestId('about-client')).toBeDefined();
    });

    it('passes current user to AboutClient when user is logged in', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(mockCurrentUser);

        const page = await AboutPage();
        render(page);

        const aboutClient = screen.getByTestId('about-client');
        expect(aboutClient).toBeDefined();
        expect(aboutClient.getAttribute('data-current-user')).toBe('1');
    });

    it('passes null to AboutClient when user is not logged in', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(null);

        const page = await AboutPage();
        render(page);

        const aboutClient = screen.getByTestId('about-client');
        expect(aboutClient).toBeDefined();
        expect(aboutClient.getAttribute('data-current-user')).toBe('null');
    });

    it('wraps AboutClient in Suspense component', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(null);

        const page = await AboutPage();
        render(page);

        const suspense = screen.getByTestId('suspense');
        const aboutClient = screen.getByTestId('about-client');

        expect(suspense).toBeDefined();
        expect(aboutClient).toBeDefined();
        expect(suspense.contains(aboutClient)).toBe(true);
    });

    it('calls getCurrentUser action', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(mockCurrentUser);

        await AboutPage();

        expect(getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('handles getCurrentUser returning undefined', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(undefined as any);

        const page = await AboutPage();
        render(page);

        const aboutClient = screen.getByTestId('about-client');
        expect(aboutClient).toBeDefined();
        // Should handle undefined gracefully
    });

    it('is an async function that resolves properly', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(null);

        const pagePromise = AboutPage();
        expect(pagePromise).toBeInstanceOf(Promise);

        const page = await pagePromise;
        expect(page).toBeDefined();
    });

    it('properly awaits getCurrentUser before rendering', async () => {
        let resolveGetCurrentUser: (value: SafeUser | null) => void;
        const getCurrentUserPromise = new Promise<SafeUser | null>(
            (resolve) => {
                resolveGetCurrentUser = resolve;
            }
        );

        vi.mocked(getCurrentUser).mockReturnValue(getCurrentUserPromise);

        const pagePromise = AboutPage();

        // Resolve the getCurrentUser promise
        resolveGetCurrentUser!(mockCurrentUser);

        const page = await pagePromise;
        render(page);

        const aboutClient = screen.getByTestId('about-client');
        expect(aboutClient.getAttribute('data-current-user')).toBe('1');
    });
});
