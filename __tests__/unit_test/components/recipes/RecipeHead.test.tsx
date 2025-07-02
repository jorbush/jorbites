import { render, screen, fireEvent, cleanup } from '@testing-library/react';
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

    it('changes image when next button is clicked', () => {
        render(<RecipeHead {...mockProps} />);
        const nextButton = screen.getByTestId('next-button');
        const image = screen.getByAltText('Recipe Image');
        expect(image).toHaveProperty(
            'src',
            expect.stringContaining('image1.jpg')
        );
        fireEvent.click(nextButton);
        expect(image).toHaveProperty(
            'src',
            expect.stringContaining('image2.jpg')
        );
    });

    it('changes image when previous button is clicked', () => {
        render(<RecipeHead {...mockProps} />);
        const prevButton = screen.getByTestId('prev-button');
        const image = screen.getByAltText('Recipe Image');
        fireEvent.click(prevButton);
        expect(image).toHaveProperty(
            'src',
            expect.stringContaining('image2.jpg')
        );
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
});
