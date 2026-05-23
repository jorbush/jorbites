import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import UserMenu from '@/app/components/navbar/UserMenu';
import React from 'react';
import { SafeUser } from '@/app/types';

// Declare mock functions outside of vi.mock() calls
const mockLoginModalOnOpen = vi.fn();
const mockRecipeModalOnOpen = vi.fn();
const mockSignOut = vi.fn();

// Mock the hooks and components
vi.mock('@/app/hooks/useRegisterModal', () => ({
    default: () => ({ onOpen: vi.fn() }),
}));

vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => ({ onOpen: mockLoginModalOnOpen }),
}));

vi.mock('@/app/hooks/useRecipeModal', () => ({
    default: () => ({ onOpen: mockRecipeModalOnOpen }),
}));

vi.mock('@/app/hooks/useSettingsModal', () => ({
    default: () => ({ onOpen: vi.fn() }),
}));

vi.mock('next-auth/react', () => ({
    signOut: () => mockSignOut(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/app/components/utils/Avatar', () => ({
    default: () => <div data-testid="mock-avatar">Avatar</div>,
}));

describe('<UserMenu />', () => {
    const mockCurrentUser: SafeUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: new Date().toISOString(),
        image: 'https://example.com/avatar.jpg',
        hashedPassword: 'hashedPassword',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favoriteIds: [],
        emailNotifications: true,
        level: 1,
        verified: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the post recipe button and avatar when user is logged in', () => {
        render(<UserMenu currentUser={mockCurrentUser} />);
        expect(screen.getByText('post_recipe')).toBeDefined();
        expect(screen.getByTestId('mock-avatar')).toBeDefined();
    });

    it('opens the menu when avatar is clicked', () => {
        render(<UserMenu currentUser={mockCurrentUser} />);
        fireEvent.click(screen.getByTestId('mock-avatar').parentElement!);
        expect(screen.getByText('my_profile')).toBeDefined();
        expect(screen.getByText('my_favorites')).toBeDefined();
        expect(screen.getByText('settings')).toBeDefined();
        expect(screen.getByText('logout')).toBeDefined();
    });

    it('opens login modal when post recipe is clicked and user is not logged in', () => {
        render(<UserMenu currentUser={null} />);
        fireEvent.click(screen.getByText('post_recipe'));
        expect(mockLoginModalOnOpen).toHaveBeenCalled();
    });

    it('opens recipe modal when post recipe is clicked and user is logged in', () => {
        render(<UserMenu currentUser={mockCurrentUser} />);
        fireEvent.click(screen.getByText('post_recipe'));
        expect(mockRecipeModalOnOpen).toHaveBeenCalled();
    });

    it('renders login and signup options when user is not logged in', () => {
        render(<UserMenu currentUser={null} />);
        fireEvent.click(screen.getByTestId('mock-avatar').parentElement!);
        expect(screen.getByText('login')).toBeDefined();
        expect(screen.getByText('sign_up')).toBeDefined();
    });

    it('calls signOut when logout is clicked', () => {
        render(<UserMenu currentUser={mockCurrentUser} />);
        fireEvent.click(screen.getByTestId('mock-avatar').parentElement!);
        fireEvent.click(screen.getByText('logout'));
        expect(mockSignOut).toHaveBeenCalled();
    });

    it('applies correct liquid glass CSS classes to the dropdown menu panel', () => {
        const { container } = render(
            <UserMenu currentUser={mockCurrentUser} />
        );
        fireEvent.click(screen.getByTestId('mock-avatar').parentElement!);

        const panel = container.querySelector('[data-cy="user-menu-panel"]');
        expect(panel).not.toBeNull();
        expect(panel!.className).toContain('absolute');
        expect(panel!.className).toContain('backdrop-blur-lg');
        expect(panel!.className).toContain('bg-white/97');
        expect(panel!.className).toContain('dark:bg-dark/97');
        expect(panel!.className).toContain('border-neutral-200/40');
        expect(panel!.className).toContain('dark:border-neutral-800/40');
        expect(panel!.className).toContain(
            'shadow-[0_2px_20px_rgba(0,0,0,0.03)]'
        );
        expect(panel!.className).toContain(
            'dark:shadow-[0_2px_20px_rgba(0,0,0,0.15)]'
        );
    });
});
