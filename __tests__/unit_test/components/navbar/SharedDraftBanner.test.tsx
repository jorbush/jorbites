import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SharedDraftBanner from '@/app/components/navbar/SharedDraftBanner';
import React from 'react';
import { SafeUser } from '@/app/types';

const mockOnOpenSharedDraft = vi.fn();

vi.mock('@/app/hooks/useRecipeModal', () => ({
    default: () => ({
        onOpenSharedDraft: mockOnOpenSharedDraft,
    }),
}));

const mockSWRData = vi.fn();
vi.mock('swr', () => ({
    default: (_key: string | null) => ({
        data: mockSWRData(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'shared_draft_banner_text') {
                return `You're co-cooking "${options?.title}" with @${options?.ownerName}!`;
            }
            if (key === 'open_draft') return 'Open Draft';
            if (key === 'untitled_recipe') return 'Untitled Recipe';
            return key;
        },
    }),
}));

describe('SharedDraftBanner', () => {
    const mockUser: SafeUser = {
        id: 'user-1',
        name: 'Test Chef',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        favoriteIds: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when no user is logged in', () => {
        mockSWRData.mockReturnValue([{ draftId: 'd1', title: 'Guacamole' }]);
        const { container } = render(<SharedDraftBanner currentUser={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when there are no active drafts', () => {
        mockSWRData.mockReturnValue([]);
        const { container } = render(
            <SharedDraftBanner currentUser={mockUser} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders banner with green-450 styling and draft info', () => {
        mockSWRData.mockReturnValue([
            {
                draftId: 'draft-123',
                title: 'Tacos Al Pastor',
                ownerName: 'mario',
            },
        ]);

        render(<SharedDraftBanner currentUser={mockUser} />);

        const banner = screen.getByTestId('shared-draft-banner');
        expect(banner).toBeDefined();
        expect(banner.className).toContain('border-green-450/30');
        expect(banner.className).toContain('bg-green-450/10');

        expect(
            screen.getByText(/You're co-cooking "Tacos Al Pastor" with @mario!/)
        ).toBeDefined();

        const openButton = screen.getByRole('button', { name: /Open Draft/i });
        expect(openButton.className).toContain('bg-green-450');

        fireEvent.click(openButton);
        expect(mockOnOpenSharedDraft).toHaveBeenCalledWith('draft-123');
    });
});
