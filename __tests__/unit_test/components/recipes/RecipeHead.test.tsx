import {
    render,
    screen,
    fireEvent,
    cleanup,
    waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeHead from '@/app/components/recipes/RecipeHead';
import { useRouter } from 'next/navigation';

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

// Mock the toast function
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
    },
}));

describe('<RecipeHead />', () => {
    const mockProps = {
        title: 'Test Recipe',
        minutes: '30',
        imagesSrc: ['/image1.jpg', '/image2.jpg'],
    };

    const mockRouter = {
        back: vi.fn(),
    };

    beforeEach(() => {
        vi.resetAllMocks();
        (useRouter as any).mockReturnValue(mockRouter);
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the component with correct title and minutes', () => {
        render(<RecipeHead {...mockProps} />);
        expect(screen.getByText('Test Recipe')).toBeDefined();
        expect(screen.getByText('30 min')).toBeDefined();
    });

    it('navigates back when back button is clicked', () => {
        render(<RecipeHead {...mockProps} />);
        const backButton = screen.getAllByRole('button')[0];
        fireEvent.click(backButton);
        expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it('changes image when next button is clicked', async () => {
        render(<RecipeHead {...mockProps} />);
        const nextButtonContainer = screen.getByTestId('next-button');
        const nextButton = nextButtonContainer.querySelector(
            'div[style*="pointer-events: auto"]'
        );
        const images = screen.getAllByAltText('Recipe Image');
        // Initially first image should be visible (opacity 1)
        const firstImageContainer = images[0].parentElement?.parentElement;
        const secondImageContainer = images[1].parentElement?.parentElement;
        expect(firstImageContainer?.style.opacity).toBe('1');
        expect(secondImageContainer?.style.opacity).toBe('0');

        fireEvent.click(nextButton!);
        // Wait for the animation and state update
        await waitFor(() => {
            const updatedImages = screen.getAllByAltText('Recipe Image');
            const updatedFirstContainer =
                updatedImages[0].parentElement?.parentElement;
            const updatedSecondContainer =
                updatedImages[1].parentElement?.parentElement;
            expect(updatedFirstContainer?.style.opacity).toBe('0');
            expect(updatedSecondContainer?.style.opacity).toBe('1');
        });
    });

    it('changes image when previous button is clicked', async () => {
        render(<RecipeHead {...mockProps} />);
        const prevButtonContainer = screen.getByTestId('prev-button');
        const prevButton = prevButtonContainer.querySelector(
            'div[style*="pointer-events: auto"]'
        );
        const images = screen.getAllByAltText('Recipe Image');
        // Initially first image should be visible
        const firstImageContainer = images[0].parentElement?.parentElement;
        expect(firstImageContainer?.style.opacity).toBe('1');

        fireEvent.click(prevButton!);
        // Wait for the animation and state update - should wrap to last image
        await waitFor(() => {
            const updatedImages = screen.getAllByAltText('Recipe Image');
            const updatedFirstContainer =
                updatedImages[0].parentElement?.parentElement;
            const updatedSecondContainer =
                updatedImages[1].parentElement?.parentElement;
            expect(updatedFirstContainer?.style.opacity).toBe('0');
            expect(updatedSecondContainer?.style.opacity).toBe('1');
        });
    });

    it('copies URL to clipboard when share button is clicked and navigator.share is not available', () => {
        const mockClipboard = {
            writeText: vi.fn(),
        };
        Object.assign(navigator, {
            clipboard: mockClipboard,
        });
        render(<RecipeHead {...mockProps} />);
        const shareButton = screen.getByLabelText('Share');
        fireEvent.click(shareButton);
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
            window.location.href
        );
    });

    it('should have cursor-pointer class on back button', () => {
        render(<RecipeHead {...mockProps} />);
        const backButton = screen.getAllByRole('button')[0];
        expect(backButton).toHaveProperty(
            'className',
            expect.stringContaining('cursor-pointer')
        );
    });

    it('should have cursor-pointer class on share button', () => {
        render(<RecipeHead {...mockProps} />);
        const shareButton = screen.getByLabelText('Share');
        expect(shareButton).toHaveProperty(
            'className',
            expect.stringContaining('cursor-pointer')
        );
    });

    it('renders dot indicators when multiple images are present', () => {
        render(<RecipeHead {...mockProps} />);
        const dotIndicator0 = screen.getByTestId('dot-indicator-0');
        const dotIndicator1 = screen.getByTestId('dot-indicator-1');
        expect(dotIndicator0).toBeDefined();
        expect(dotIndicator1).toBeDefined();
    });

    it('changes image when clicking on dot indicator', async () => {
        render(<RecipeHead {...mockProps} />);
        const images = screen.getAllByAltText('Recipe Image');
        // Initially first image should be visible
        const firstImageContainer = images[0].parentElement?.parentElement;
        expect(firstImageContainer?.style.opacity).toBe('1');

        const dotIndicator1 = screen.getByTestId('dot-indicator-1');
        fireEvent.click(dotIndicator1);
        // Wait for the animation and state update
        await waitFor(() => {
            const updatedImages = screen.getAllByAltText('Recipe Image');
            const updatedFirstContainer =
                updatedImages[0].parentElement?.parentElement;
            const updatedSecondContainer =
                updatedImages[1].parentElement?.parentElement;
            expect(updatedFirstContainer?.style.opacity).toBe('0');
            expect(updatedSecondContainer?.style.opacity).toBe('1');
        });
    });

    it('does not render dot indicators when only one image is present', () => {
        const singleImageProps = {
            title: 'Test Recipe',
            minutes: '30',
            imagesSrc: ['/image1.jpg'],
        };
        render(<RecipeHead {...singleImageProps} />);
        const dotIndicator = screen.queryByTestId('dot-indicator-0');
        expect(dotIndicator).toBeNull();
    });

    it('changes image on swipe left', async () => {
        const { container } = render(<RecipeHead {...mockProps} />);
        const imageContainer = container.querySelector(
            '.relative.h-\\[60vh\\]'
        );
        const images = screen.getAllByAltText('Recipe Image');

        // Initially first image should be visible
        const firstImageContainer = images[0].parentElement?.parentElement;
        expect(firstImageContainer?.style.opacity).toBe('1');

        // Simulate swipe left (next image)
        fireEvent.touchStart(imageContainer!, {
            touches: [{ clientX: 200 }],
        });
        fireEvent.touchMove(imageContainer!, {
            touches: [{ clientX: 100 }],
        });
        fireEvent.touchEnd(imageContainer!);

        // Wait for the state update
        await waitFor(() => {
            const updatedImages = screen.getAllByAltText('Recipe Image');
            const updatedFirstContainer =
                updatedImages[0].parentElement?.parentElement;
            const updatedSecondContainer =
                updatedImages[1].parentElement?.parentElement;
            expect(updatedFirstContainer?.style.opacity).toBe('0');
            expect(updatedSecondContainer?.style.opacity).toBe('1');
        });
    });

    it('changes image on swipe right', async () => {
        const { container } = render(<RecipeHead {...mockProps} />);
        const imageContainer = container.querySelector(
            '.relative.h-\\[60vh\\]'
        );
        const images = screen.getAllByAltText('Recipe Image');

        // Initially first image should be visible
        const firstImageContainer = images[0].parentElement?.parentElement;
        expect(firstImageContainer?.style.opacity).toBe('1');

        // Simulate swipe right (previous image, wraps to last)
        fireEvent.touchStart(imageContainer!, {
            touches: [{ clientX: 100 }],
        });
        fireEvent.touchMove(imageContainer!, {
            touches: [{ clientX: 200 }],
        });
        fireEvent.touchEnd(imageContainer!);

        // Wait for the state update
        await waitFor(() => {
            const updatedImages = screen.getAllByAltText('Recipe Image');
            const updatedFirstContainer =
                updatedImages[0].parentElement?.parentElement;
            const updatedSecondContainer =
                updatedImages[1].parentElement?.parentElement;
            expect(updatedFirstContainer?.style.opacity).toBe('0');
            expect(updatedSecondContainer?.style.opacity).toBe('1');
        });
    });

    it('does not change image on small swipe', () => {
        const { container } = render(<RecipeHead {...mockProps} />);
        const imageContainer = container.querySelector(
            '.relative.h-\\[60vh\\]'
        );
        const images = screen.getAllByAltText('Recipe Image');

        // Initially first image should be visible
        const firstImageContainer = images[0].parentElement?.parentElement;
        const secondImageContainer = images[1].parentElement?.parentElement;
        expect(firstImageContainer?.style.opacity).toBe('1');

        // Simulate small swipe (less than threshold)
        fireEvent.touchStart(imageContainer!, {
            touches: [{ clientX: 100 }],
        });
        fireEvent.touchMove(imageContainer!, {
            touches: [{ clientX: 120 }],
        });
        fireEvent.touchEnd(imageContainer!);

        // Image should remain the same
        expect(firstImageContainer?.style.opacity).toBe('1');
        expect(secondImageContainer?.style.opacity).toBe('0');
    });
});
