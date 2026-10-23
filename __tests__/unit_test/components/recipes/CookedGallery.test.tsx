import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CookedGallery from '@/app/components/recipes/CookedGallery';
import { SafeComment } from '@/app/types';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
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
    const sampleCooksnaps: SafeComment[] = [
        {
            id: 'c-1',
            userId: 'u-1',
            recipeId: 'r-1',
            comment: 'Turned out amazing!',
            rating: 5,
            imageSrc: 'https://images.jorbites.com/c1.webp',
            isCooked: true,
            createdAt: '2026-10-20T10:00:00.000Z',
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
            isCooked: true,
            createdAt: '2026-10-20T11:00:00.000Z',
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
        // Regular comment with image but NOT cooked -> should be EXCLUDED
        {
            id: 'c-3',
            userId: 'u-3',
            recipeId: 'r-1',
            comment: 'Is my dough supposed to look like this?',
            rating: null,
            imageSrc: 'https://images.jorbites.com/dough-question.jpg',
            isCooked: false,
            createdAt: '2026-10-20T11:30:00.000Z',
            likedIds: [],
            user: {
                id: 'u-3',
                name: 'Carlos',
                image: null,
                verified: false,
                level: 1,
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
        const { container } = render(<CookedGallery comments={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders gallery with cooksnap cards and excludes regular comments with photo', () => {
        render(<CookedGallery comments={sampleCooksnaps} />);

        expect(screen.getByTestId('cooked-gallery')).toBeDefined();
        expect(screen.getByTestId('cooksnap-card-c-1')).toBeDefined();
        expect(screen.getByTestId('cooksnap-card-c-2')).toBeDefined();

        // c-3 had isCooked: false, so it must not be in the gallery
        expect(screen.queryByTestId('cooksnap-card-c-3')).toBeNull();

        expect(screen.getByText('Chef Jordi')).toBeDefined();
        expect(screen.getByText('Maria')).toBeDefined();
        expect(screen.getAllByText('★')).toHaveLength(2);
    });

    it('opens lightbox when a cooksnap photo card is clicked', () => {
        render(<CookedGallery comments={sampleCooksnaps} />);

        expect(screen.queryByTestId('photo-lightbox')).toBeNull();

        const card = screen.getByTestId('cooksnap-card-c-1');
        fireEvent.click(card);

        expect(screen.getByTestId('photo-lightbox')).toBeDefined();

        // Close lightbox
        fireEvent.click(screen.getByTestId('photo-lightbox'));
        expect(screen.queryByTestId('photo-lightbox')).toBeNull();
    });

    it('navigates to user profile when avatar or name is clicked', () => {
        render(<CookedGallery comments={sampleCooksnaps} />);

        const chefName = screen.getByText('Chef Jordi');
        fireEvent.click(chefName);

        expect(mockPush).toHaveBeenCalledWith('/profile/u-1');
    });
});
