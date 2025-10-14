import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CreateWorkshopButton from '@/app/components/workshops/CreateWorkshopButton';
import { SafeUser } from '@/app/types';
import useWorkshopModal from '@/app/hooks/useWorkshopModal';
import useLoginModal from '@/app/hooks/useLoginModal';

// Mock hooks
vi.mock('@/app/hooks/useWorkshopModal');
vi.mock('@/app/hooks/useLoginModal');

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<CreateWorkshopButton />', () => {
    const mockUser: SafeUser = {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: null,
        image: null,
        hashedPassword: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favoriteIds: [],
        emailNotifications: false,
        level: 0,
        verified: false,
        badges: [],
        resetToken: null,
        resetTokenExpiry: null,
    };

    const mockWorkshopModalOnOpen = vi.fn();
    const mockLoginModalOnOpen = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useWorkshopModal as any).mockReturnValue({
            onOpen: mockWorkshopModalOnOpen,
        });

        (useLoginModal as any).mockReturnValue({
            onOpen: mockLoginModalOnOpen,
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders create workshop button', () => {
        render(<CreateWorkshopButton currentUser={mockUser} />);

        expect(screen.getByText('create_workshop')).toBeDefined();
    });

    it('opens workshop modal when clicked by logged-in user', () => {
        render(<CreateWorkshopButton currentUser={mockUser} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockWorkshopModalOnOpen).toHaveBeenCalled();
        expect(mockLoginModalOnOpen).not.toHaveBeenCalled();
    });

    it('opens login modal when clicked by non-logged-in user', () => {
        render(<CreateWorkshopButton currentUser={null} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockLoginModalOnOpen).toHaveBeenCalled();
        expect(mockWorkshopModalOnOpen).not.toHaveBeenCalled();
    });

    it('has correct data-cy attribute', () => {
        render(<CreateWorkshopButton currentUser={mockUser} />);

        const button = screen.getByRole('button');
        expect(button.getAttribute('data-cy')).toBe('create-workshop');
    });
});
