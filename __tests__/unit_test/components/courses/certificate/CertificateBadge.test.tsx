import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CertificateBadge from '@/app/components/courses/certificate/CertificateBadge';
import React from 'react';

describe('<CertificateBadge />', () => {
    it('renders the badge image when badgeSrc is provided', () => {
        render(
            <CertificateBadge
                badgeSrc="/badges/basics_badge.webp"
                title="Jorbites Basics"
            />
        );

        const img = screen.getByRole('img', { name: 'Jorbites Basics' });
        expect(img).toBeDefined();
        expect(img.getAttribute('src')).toContain('basics_badge.webp');
    });

    it('renders the award icon fallback when badgeSrc is not provided', () => {
        const { container } = render(
            <CertificateBadge title="Jorbites Basics" />
        );

        expect(screen.queryByRole('img')).toBeNull();
        const svg = container.querySelector('svg');
        expect(svg).toBeDefined();
        expect(svg?.classList.contains('animate-pulse')).toBe(true);
    });

    it('applies grayscale styling to image when comingSoon is true', () => {
        render(
            <CertificateBadge
                badgeSrc="/badges/basics_badge.webp"
                title="Coming Soon Course"
                comingSoon={true}
            />
        );

        const img = screen.getByRole('img', { name: 'Coming Soon Course' });
        expect(img.className).toContain('opacity-50 grayscale');
    });

    it('applies grayscale and disables pulse on icon fallback when comingSoon is true', () => {
        const { container } = render(
            <CertificateBadge
                title="Coming Soon Course"
                comingSoon={true}
            />
        );

        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('opacity-50 grayscale');
        const svg = container.querySelector('svg');
        expect(svg?.classList.contains('animate-pulse')).toBe(false);
    });
});
