import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ProfileDetailsView from '@/app/components/settings/ProfileDetailsView';
import { SafeUser } from '@/app/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('ProfileDetailsView Component', () => {
    afterEach(() => {
        cleanup();
    });

    const baseUser: SafeUser = {
        id: 'user-1',
        name: 'Chef Gordon',
        email: 'gordon@example.com',
        image: null,
        emailVerified: null,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        favoriteIds: [],
        emailNotifications: false,
        level: 1,
        verified: false,
        badges: [],
    };

    it('renders fallback text when bio is empty or undefined', () => {
        render(<ProfileDetailsView currentUser={baseUser} />);
        expect(screen.getByText('no_bio_yet')).toBeDefined();
    });

    it('renders bio text when provided', () => {
        const userWithBio: SafeUser = {
            ...baseUser,
            bio: 'Master chef specializing in French pastry.',
        };
        render(<ProfileDetailsView currentUser={userWithBio} />);
        expect(
            screen.getByText('"Master chef specializing in French pastry."')
        ).toBeDefined();
    });

    it('renders website domain without protocol prefix', () => {
        const userWithSite: SafeUser = {
            ...baseUser,
            websiteUrl: 'https://pastrymaster.com',
        };
        render(<ProfileDetailsView currentUser={userWithSite} />);
        expect(screen.getByText('pastrymaster.com')).toBeDefined();
    });

    it('renders social handle chips with formatted @ handles', () => {
        const userWithSocials: SafeUser = {
            ...baseUser,
            instagram: 'gordon_ig',
            twitter: '@gordon_tw',
            youtube: 'GordonCooking',
            tiktok: 'gordon_tok',
        };
        render(<ProfileDetailsView currentUser={userWithSocials} />);

        expect(screen.getByText('@gordon_ig')).toBeDefined();
        expect(screen.getByText('@gordon_tw')).toBeDefined();
        expect(screen.getByText('GordonCooking')).toBeDefined();
        expect(screen.getByText('@gordon_tok')).toBeDefined();
    });

    it('handles undefined or null currentUser gracefully', () => {
        render(<ProfileDetailsView currentUser={null} />);
        expect(screen.getByText('no_bio_yet')).toBeDefined();
    });
});
