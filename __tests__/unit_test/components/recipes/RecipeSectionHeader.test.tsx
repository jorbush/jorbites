import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RecipeSectionHeader from '@/app/components/recipes/RecipeSectionHeader';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('react-hot-toast');
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('RecipeSectionHeader', () => {
    // Setup clipboard mock
    const mockClipboard = {
        writeText: vi.fn(),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    delete (window as any).location;
    (window as any).location = {
        origin: 'http://localhost:3000',
        pathname: '/recipes/123',
    };

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders usage with required props', () => {
        render(
            <RecipeSectionHeader
                id="test-section"
                title="Test Title"
            />
        );
        expect(screen.getByText('Test Title')).toBeDefined();
        // Check if id is present on the container
        const container = screen
            .getByText('Test Title')
            .closest('div')?.parentElement;
        expect(container?.getAttribute('id')).toBe('test-section');
    });

    it('renders with count when provided', () => {
        render(
            <RecipeSectionHeader
                id="test-section"
                title="Test Title"
                count={5}
            />
        );
        expect(screen.getByText('5')).toBeDefined();
    });

    it('renders copy link button with correct accessibility attributes', () => {
        render(
            <RecipeSectionHeader
                id="test-section"
                title="Test Title"
            />
        );
        const button = screen.getByRole('button', { name: 'copy_link' });
        expect(button).toBeDefined();
        expect(button.getAttribute('title')).toBe('copy_link');
    });

    it('copies link to clipboard and shows success toast on click', async () => {
        mockClipboard.writeText.mockResolvedValue(undefined);

        render(
            <RecipeSectionHeader
                id="test-section"
                title="Test Title"
            />
        );
        const button = screen.getByRole('button', { name: 'copy_link' });

        fireEvent.click(button);

        expect(mockClipboard.writeText).toHaveBeenCalledWith(
            'http://localhost:3000/recipes/123#test-section'
        );

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith(
                'link_copied',
                expect.objectContaining({ id: 'copy-link-toast' })
            );
        });
    });

    it('shows error toast when copy fails', async () => {
        mockClipboard.writeText.mockRejectedValue(new Error('Failed'));

        render(
            <RecipeSectionHeader
                id="test-section"
                title="Test Title"
            />
        );
        const button = screen.getByRole('button', { name: 'copy_link' });

        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'copy_failed',
                expect.objectContaining({ id: 'copy-link-error' })
            );
        });
    });
});
