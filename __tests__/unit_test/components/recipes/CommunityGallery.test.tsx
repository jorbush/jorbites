import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CommunityGallery from '@/app/components/recipes/CommunityGallery';
import { SafeComment } from '@/app/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        <img
            src={src}
            alt={alt}
        />
    ),
}));

vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ src }: { src?: string | null }) => (
        <img
            src={src || ''}
            alt="avatar"
        />
    ),
}));

describe('CommunityGallery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('returns null when there are no comments with isCooked and imageSrc', () => {
        const comments: SafeComment[] = [
            {
                id: '1',
                userId: 'user1',
                recipeId: 'rec1',
                comment: 'Nice recipe!',
                rating: 5,
                createdAt: '2026-01-01T00:00:00.000Z',
                likedIds: [],
                user: { id: 'user1', name: 'Chef A', image: '/avatar1.jpg' },
                isCooked: false,
                imageSrc: null,
            },
        ];

        const { container } = render(<CommunityGallery comments={comments} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders community remakes gallery when comments with isCooked and imageSrc exist', () => {
        const comments: SafeComment[] = [
            {
                id: 'c1',
                userId: 'u1',
                recipeId: 'r1',
                comment: 'Cooked this today, loved it!',
                rating: 5,
                createdAt: '2026-01-01T00:00:00.000Z',
                likedIds: [],
                user: { id: 'u1', name: 'Alice', image: '/alice.jpg' },
                isCooked: true,
                imageSrc: 'https://images.jorbites.com/remakes/proof1.webp',
            },
        ];

        render(<CommunityGallery comments={comments} />);

        expect(screen.getByTestId('community-gallery')).toBeDefined();
        expect(screen.getByText('Alice')).toBeDefined();
        expect(screen.getByText('Cooked this today, loved it!')).toBeDefined();
    });

    it('opens lightbox modal when remake photo is clicked', () => {
        const comments: SafeComment[] = [
            {
                id: 'c1',
                userId: 'u1',
                recipeId: 'r1',
                comment: 'Super delicious!',
                rating: 5,
                createdAt: '2026-01-01T00:00:00.000Z',
                likedIds: [],
                user: { id: 'u1', name: 'Bob', image: '/bob.jpg' },
                isCooked: true,
                imageSrc: 'https://images.jorbites.com/remakes/proof2.webp',
            },
        ];

        render(<CommunityGallery comments={comments} />);

        const remakeImage = screen.getByAltText('Remake by Bob');
        fireEvent.click(remakeImage);

        expect(screen.getByTestId('gallery-lightbox')).toBeDefined();
    });
});
