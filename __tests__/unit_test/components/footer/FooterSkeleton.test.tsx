import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import FooterSkeleton from '@/app/components/footer/FooterSkeleton';

describe('FooterSkeleton', () => {
    it('renders the footer container', () => {
        const { container } = render(<FooterSkeleton />);
        const footer = container.querySelector('footer');
        expect(footer).not.toBeNull();
    });

    it('has the correct base styles', () => {
        const { container } = render(<FooterSkeleton />);
        const footer = container.querySelector('footer');
        expect(footer).not.toBeNull();
        expect(footer?.className).toContain('min-h-[230px]');
        expect(footer?.className).toContain('w-full');
        expect(footer?.className).toContain('border-t');
        expect(footer?.className).toContain('bg-white');
        expect(footer?.className).toContain('dark:bg-dark');
    });

    it('renders the logo placeholder', () => {
        const { container } = render(<FooterSkeleton />);
        const logo = container.querySelector('.h-6.w-24.rounded-full');
        expect(logo).not.toBeNull();
        expect(logo?.className).toContain('bg-neutral-100');
    });

    it('renders 5 social icon placeholders', () => {
        const { container } = render(<FooterSkeleton />);
        const socialIcons = container.querySelectorAll('.h-5.w-5.rounded-full');
        expect(socialIcons.length).toBe(5);
        expect(socialIcons[0].className).toContain('bg-neutral-200');
    });

    it('renders 2 navigation link placeholders', () => {
        const { container } = render(<FooterSkeleton />);
        const navLinks = container.querySelectorAll('.h-4.w-24.rounded');
        expect(navLinks.length).toBe(2);
        expect(navLinks[0].className).toContain('bg-neutral-200');
    });

    it('renders the copyright placeholder', () => {
        const { container } = render(<FooterSkeleton />);
        const copyright = container.querySelector('.h-4.w-64.rounded');
        expect(copyright).not.toBeNull();
        expect(copyright?.className).toContain('bg-neutral-200');
    });
});
