import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ProfileBacklinks from '@/app/components/profile/ProfileBacklinks';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('ProfileBacklinks Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('returns null when no bio, website, or social handles are provided', () => {
        const { container } = render(<ProfileBacklinks />);
        expect(container.firstChild).toBeNull();
    });

    it('renders bio paragraph when provided', () => {
        render(
            <ProfileBacklinks bio="Passionate home cook and bread baker." />
        );
        const bioElement = screen.getByTestId('profile-bio');
        expect(bioElement).toBeDefined();
        expect(bioElement.textContent).toBe(
            'Passionate home cook and bread baker.'
        );
    });

    it('renders outbound website link with rel="noopener noreferrer" and stripped domain', () => {
        render(<ProfileBacklinks websiteUrl="https://www.sweetbakes.com" />);

        const websiteLink = screen.getByTestId('profile-website-link');
        expect(websiteLink).toBeDefined();
        expect(websiteLink.getAttribute('href')).toBe(
            'https://www.sweetbakes.com'
        );
        expect(websiteLink.getAttribute('target')).toBe('_blank');
        expect(websiteLink.getAttribute('rel')).toBe('noopener noreferrer');
        expect(websiteLink.textContent).toContain('sweetbakes.com');
    });

    it('sanitizes dangerous external URLs', () => {
        render(<ProfileBacklinks websiteUrl="javascript:stealToken()" />);

        const websiteLink = screen.getByTestId('profile-website-link');
        expect(websiteLink.getAttribute('href')).toBe('#');
    });

    it('renders all social links with correct URLs and rel="noopener noreferrer"', () => {
        render(
            <ProfileBacklinks
                instagram="sweet_bakes"
                twitter="sweet_bakes"
                youtube="sweet_bakes"
                tiktok="sweet_bakes"
            />
        );

        const ig = screen.getByTestId('profile-instagram-link');
        expect(ig.getAttribute('href')).toBe(
            'https://instagram.com/sweet_bakes'
        );
        expect(ig.getAttribute('target')).toBe('_blank');
        expect(ig.getAttribute('rel')).toBe('noopener noreferrer');

        const tw = screen.getByTestId('profile-twitter-link');
        expect(tw.getAttribute('href')).toBe('https://x.com/sweet_bakes');
        expect(tw.getAttribute('rel')).toBe('noopener noreferrer');

        const yt = screen.getByTestId('profile-youtube-link');
        expect(yt.getAttribute('href')).toBe(
            'https://youtube.com/@sweet_bakes'
        );
        expect(yt.getAttribute('rel')).toBe('noopener noreferrer');

        const tk = screen.getByTestId('profile-tiktok-link');
        expect(tk.getAttribute('href')).toBe('https://tiktok.com/@sweet_bakes');
        expect(tk.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('handles full youtube.com url for creator youtube handle', () => {
        render(
            <ProfileBacklinks youtube="https://youtube.com/c/sweetbakeschannel" />
        );

        const yt = screen.getByTestId('profile-youtube-link');
        expect(yt.getAttribute('href')).toBe(
            'https://youtube.com/c/sweetbakeschannel'
        );
    });
});
