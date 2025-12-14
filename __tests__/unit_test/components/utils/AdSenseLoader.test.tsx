import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AdSenseLoader from '@/app/components/utils/AdSenseLoader';

// Mock Next.js Script component
vi.mock('next/script', () => ({
    default: ({ src, strategy, ...props }: any) => (
        <script
            data-testid="adsense-script"
            data-src={src}
            data-strategy={strategy}
            {...props}
        />
    ),
}));

// Mock the AdProvider
vi.mock('@/app/providers/AdProvider', () => ({
    useAds: vi.fn(),
}));

// Mock constants
vi.mock('@/app/utils/constants', () => ({
    ADSENSE_PUBLISHER_ID: 'test-publisher-id',
}));

import { useAds } from '@/app/providers/AdProvider';

describe('<AdSenseLoader />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders nothing when isLoading is true', () => {
        (useAds as any).mockReturnValue({
            showAds: false,
            isLoading: true,
        });

        const { container } = render(<AdSenseLoader />);
        expect(container.innerHTML).toBe('');
    });

    it('renders nothing when showAds is false', () => {
        (useAds as any).mockReturnValue({
            showAds: false,
            isLoading: false,
        });

        const { container } = render(<AdSenseLoader />);
        expect(container.innerHTML).toBe('');
    });

    it('renders Script component when showAds is true and not loading', () => {
        (useAds as any).mockReturnValue({
            showAds: true,
            isLoading: false,
        });

        const { getByTestId } = render(<AdSenseLoader />);
        const script = getByTestId('adsense-script');

        expect(script).toBeDefined();
        expect(script.getAttribute('data-src')).toContain(
            'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
        );
        expect(script.getAttribute('data-src')).toContain(
            'client=test-publisher-id'
        );
        expect(script.getAttribute('data-strategy')).toBe('lazyOnload');
        expect(script.getAttribute('crossorigin')).toBe('anonymous');
    });

    it('does not render when both showAds is true but isLoading is true', () => {
        (useAds as any).mockReturnValue({
            showAds: true,
            isLoading: true,
        });

        const { container } = render(<AdSenseLoader />);
        expect(container.innerHTML).toBe('');
    });
});
