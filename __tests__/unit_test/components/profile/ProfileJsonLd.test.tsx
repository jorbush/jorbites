import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import ProfileJsonLd from '@/app/components/profile/ProfileJsonLd';
import { SafeUser } from '@/app/types';

describe('ProfileJsonLd Component', () => {
    afterEach(() => {
        cleanup();
    });

    const mockUser: SafeUser = {
        id: 'creator-99',
        name: 'Julia Child',
        email: null,
        image: 'https://cdn.example.com/julia.jpg',
        emailVerified: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        favoriteIds: [],
        emailNotifications: false,
        level: 10,
        verified: true,
        badges: [],
        bio: 'French cooking teacher and author <script>alert(1)</script>',
        websiteUrl: 'https://juliachild.org',
        instagram: 'julia_cooks',
        twitter: 'julia_cooks',
        youtube: 'julia_cooks',
        tiktok: 'julia_cooks',
    };

    it('returns null when user is null or undefined', () => {
        const { container } = render(<ProfileJsonLd user={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders application/ld+json script with structured schema.org Person data', () => {
        const { container } = render(<ProfileJsonLd user={mockUser} />);
        const script = container.querySelector(
            'script[type="application/ld+json"]'
        );
        expect(script).not.toBeNull();

        const jsonContent = JSON.parse(script!.textContent || '{}');
        expect(jsonContent['@context']).toBe('https://schema.org');
        expect(jsonContent['@type']).toBe('ProfilePage');
        expect(jsonContent.mainEntity['@type']).toBe('Person');
        expect(jsonContent.mainEntity.name).toBe('Julia Child');
        expect(jsonContent.mainEntity.image).toBe(
            'https://cdn.example.com/julia.jpg'
        );
        expect(jsonContent.mainEntity.sameAs).toContain(
            'https://juliachild.org'
        );
        expect(jsonContent.mainEntity.sameAs).toContain(
            'https://instagram.com/julia_cooks'
        );
        expect(jsonContent.mainEntity.sameAs).toContain(
            'https://x.com/julia_cooks'
        );
        expect(jsonContent.mainEntity.sameAs).toContain(
            'https://youtube.com/@julia_cooks'
        );
        expect(jsonContent.mainEntity.sameAs).toContain(
            'https://tiktok.com/@julia_cooks'
        );
    });

    it('escapes < and > in HTML output to prevent XSS script injection', () => {
        const { container } = render(<ProfileJsonLd user={mockUser} />);
        const scriptHtml = container.innerHTML;

        expect(scriptHtml).not.toContain('<script>alert(1)</script>');
        expect(scriptHtml).toContain('\\u003cscript\\u003e');
    });
});
