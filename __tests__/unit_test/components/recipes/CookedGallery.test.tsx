import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import CookedGallery from '@/app/components/recipes/CookedGallery';
import { SafeCooksnap, SafeUser } from '@/app/types';

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('axios');

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
    }),
}));

vi.mock('@/app/components/modals/ConfirmModal', () => ({
    default: ({ open, onConfirm }: any) =>
        open ? (
            <div data-testid="confirm-modal">
                <button
                    data-testid="confirm-delete-btn"
                    onClick={onConfirm}
                >
                    Confirm
                </button>
            </div>
        ) : null,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: any) => {
            if (opts?.defaultValue) return opts.defaultValue;
            return key;
        },
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ src, onClick }: any) => (
        <img
            src={src || '/placeholder.png'}
            alt="avatar"
            data-testid="avatar"
            onClick={onClick}
        />
    ),
}));

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt }: any) => (
        <img
            src={src}
            alt={alt}
            data-testid="proxy-image"
        />
    ),
}));

vi.mock('@/app/components/modals/PhotoLightbox', () => ({
    default: ({ isOpen, src, onClose }: any) =>
        isOpen ? (
            <div
                data-testid="photo-lightbox"
                onClick={onClose}
            >
                <img
                    src={src}
                    alt="lightbox-preview"
                />
            </div>
        ) : null,
}));

vi.mock('@/app/components/utils/ScrollableContainer', () => ({
    default: ({ children }: any) => (
        <div data-testid="scrollable-container">{children}</div>
    ),
}));

describe('CookedGallery', () => {
    const sampleCooksnaps: SafeCooksnap[] = [
        {
            id: 'c-1',
            userId: 'u-1',
            recipeId: 'r-1',
            comment: 'Turned out amazing!',
            rating: 5,
            imageSrc: 'https://images.jorbites.com/c1.webp',
            createdAt: '2026-10-20T10:00:00.000Z',
            updatedAt: '2026-10-20T10:00:00.000Z',
            likedIds: [],
            user: {
                id: 'u-1',
                name: 'Chef Jordi',
                image: 'https://images.jorbites.com/avatar1.jpg',
                verified: true,
                level: 10,
                badges: [],
            },
        },
        {
            id: 'c-2',
            userId: 'u-2',
            recipeId: 'r-1',
            comment: 'Substituted parsley with cilantro',
            rating: 4,
            imageSrc: 'https://images.jorbites.com/c2.webp',
            createdAt: '2026-10-20T11:00:00.000Z',
            updatedAt: '2026-10-20T11:00:00.000Z',
            likedIds: [],
            user: {
                id: 'u-2',
                name: 'Maria',
                image: null,
                verified: false,
                level: 3,
                badges: [],
            },
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('returns null when there are no cooksnaps', () => {
        const { container } = render(<CookedGallery cooksnaps={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders gallery with cooksnap cards', () => {
        render(<CookedGallery cooksnaps={sampleCooksnaps} />);

        expect(screen.getByTestId('cooked-gallery')).toBeDefined();
        expect(screen.getByTestId('cooksnap-card-c-1')).toBeDefined();
        expect(screen.getByTestId('cooksnap-card-c-2')).toBeDefined();

        expect(screen.getByText('Chef Jordi')).toBeDefined();
        expect(screen.getByText('Maria')).toBeDefined();
        expect(screen.getAllByText('★')).toHaveLength(2);
    });

    it('opens lightbox when a cooksnap photo card is clicked', () => {
        render(<CookedGallery cooksnaps={sampleCooksnaps} />);

        expect(screen.queryByTestId('photo-lightbox')).toBeNull();

        const card = screen.getByTestId('cooksnap-card-c-1');
        fireEvent.click(card);

        expect(screen.getByTestId('photo-lightbox')).toBeDefined();

        // Close lightbox
        fireEvent.click(screen.getByTestId('photo-lightbox'));
        expect(screen.queryByTestId('photo-lightbox')).toBeNull();
    });

    it('navigates to user profile when avatar or name is clicked', () => {
        render(<CookedGallery cooksnaps={sampleCooksnaps} />);

        const chefName = screen.getByText('Chef Jordi');
        fireEvent.click(chefName);

        expect(mockPush).toHaveBeenCalledWith('/profile/u-1');
    });

    it('shows delete button when user is the cook of the cooksnap', async () => {
        const mockUser: SafeUser = {
            id: 'u-1',
            name: 'Chef Jordi',
        } as SafeUser;

        vi.mocked(axios.delete).mockResolvedValue({});

        render(
            <CookedGallery
                cooksnaps={sampleCooksnaps}
                currentUser={mockUser}
                recipeAuthorId="other-author"
            />
        );

        const deleteBtn = screen.getByTestId('delete-cooksnap-c-1');
        expect(deleteBtn).toBeDefined();

        // Other cooksnap (u-2) should not have delete button for u-1
        expect(screen.queryByTestId('delete-cooksnap-c-2')).toBeNull();

        fireEvent.click(deleteBtn);
        expect(screen.getByTestId('confirm-modal')).toBeDefined();

        fireEvent.click(screen.getByTestId('confirm-delete-btn'));
        expect(axios.delete).toHaveBeenCalledWith('/api/cooksnaps/c-1');
    });

    it('shows delete button for all cooksnaps when user is the recipe author', () => {
        const authorUser: SafeUser = {
            id: 'author-user',
            name: 'Recipe Author',
        } as SafeUser;

        render(
            <CookedGallery
                cooksnaps={sampleCooksnaps}
                currentUser={authorUser}
                recipeAuthorId="author-user"
            />
        );

        expect(screen.getByTestId('delete-cooksnap-c-1')).toBeDefined();
        expect(screen.getByTestId('delete-cooksnap-c-2')).toBeDefined();
    });
});
