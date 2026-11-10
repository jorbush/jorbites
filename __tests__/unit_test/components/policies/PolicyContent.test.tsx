import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import PolicyContent from '@/app/components/policies/PolicyContent';
import { Policy } from '@/app/utils/policy-utils';

const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        back: mockBack,
    }),
}));

const mockEnPolicy: Policy = {
    frontmatter: {
        title: 'English Policy Title',
        description: 'English Policy Description',
    },
    content: 'This is English content.',
    slug: 'cookies',
    language: 'en',
};

const mockEsPolicy: Policy = {
    frontmatter: {
        title: 'Título de la Política',
        description: 'Descripción de la Política',
    },
    content: 'Este es el contenido en español.',
    slug: 'cookies',
    language: 'es',
};

describe('PolicyContent', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders policy frontmatter title and markdown content', () => {
        render(<PolicyContent policy={mockEnPolicy} />);

        expect(screen.getByText('English Policy Title')).toBeDefined();
        expect(screen.getByText('This is English content.')).toBeDefined();
    });

    it('calls router.back when back button is clicked', () => {
        render(<PolicyContent policy={mockEnPolicy} />);

        const backButton = screen.getByRole('button', { name: /go back/i });
        fireEvent.click(backButton);

        expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('returns null when no policy is provided', () => {
        const { container } = render(<PolicyContent policy={null} />);

        expect(container.firstChild).toBeNull();
    });

    it('selects active language from policies record', () => {
        render(
            <PolicyContent
                policies={{
                    en: mockEnPolicy,
                    es: mockEsPolicy,
                }}
            />
        );

        // Default test translation language or fallback selects es/en
        expect(
            screen.queryByText('English Policy Title') ||
                screen.queryByText('Título de la Política')
        ).not.toBeNull();
    });

    it('renders links matching the comments and blog styling', () => {
        const mockPolicyWithLinks: Policy = {
            frontmatter: {
                title: 'Policy with Links',
                description: 'Testing link styling',
            },
            content:
                'Read our [Privacy Policy](/policies/privacy) or visit [Jorbites](https://jorbites.com).',
            slug: 'terms',
            language: 'en',
        };

        const { container } = render(
            <PolicyContent policy={mockPolicyWithLinks} />
        );

        const internalLink = container.querySelector(
            'a[href="/policies/privacy"]'
        );
        expect(internalLink).toBeDefined();
        expect(internalLink?.className).toContain('decoration-green-450');
        expect(internalLink?.className).toContain('hover:text-green-450');
        expect(internalLink?.className).toContain('dark:hover:text-green-450');
        expect(internalLink?.className).toContain('font-medium');
        expect(internalLink?.className).toContain('text-neutral-900');
        expect(internalLink?.className).toContain('underline');
        expect(internalLink?.className).toContain('decoration-2');
        expect(internalLink?.className).toContain('underline-offset-4');
        expect(internalLink?.className).toContain('transition-colors');
        expect(internalLink?.className).toContain('duration-200');
        expect(internalLink?.className).toContain('dark:text-neutral-100');
        expect(internalLink?.getAttribute('target')).toBeNull();

        const externalLink = container.querySelector(
            'a[href="https://jorbites.com"]'
        );
        expect(externalLink).toBeDefined();
        expect(externalLink?.className).toContain('decoration-green-450');
        expect(externalLink?.getAttribute('target')).toBe('_blank');
        expect(externalLink?.getAttribute('rel')).toBe('noopener noreferrer');
    });
});
