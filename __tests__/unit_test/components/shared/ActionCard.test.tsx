import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ActionCard from '@/app/components/shared/ActionCard';

// Mock Button component
vi.mock('@/app/components/buttons/Button', () => ({
    default: ({ label, onClick, dataCy }: any) => (
        <button onClick={onClick} data-cy={dataCy} data-testid="action-button">
            {label}
        </button>
    ),
}));

describe('<ActionCard />', () => {
    const mockOnClick = vi.fn();

    beforeEach(() => {
        mockOnClick.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders with title and subtitle', () => {
        render(
            <ActionCard
                title="Test Title"
                subtitle="Test Subtitle"
                buttonText="Click Me"
                onClick={mockOnClick}
            />
        );

        expect(screen.getByText('Test Title')).toBeDefined();
        expect(screen.getByText('Test Subtitle')).toBeDefined();
        expect(screen.getByText('Click Me')).toBeDefined();
    });

    it('calls onClick when button is clicked', () => {
        const { getByTestId } = render(
            <ActionCard
                title="Button Test"
                subtitle="Click Test Subtitle"
                buttonText="Click Me Button"
                onClick={mockOnClick}
            />
        );

        const button = getByTestId('action-button');
        fireEvent.click(button);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('applies workshops-style design with border and gradient', () => {
        const { container } = render(
            <ActionCard
                title="Design Test"
                subtitle="Design Test Subtitle"
                buttonText="Design Button"
                onClick={mockOnClick}
            />
        );

        const cardDiv = container.querySelector('div[class*="border-dashed"]');
        expect(cardDiv).toBeDefined();
        expect(cardDiv?.className).toContain('border-green-450');
        expect(cardDiv?.className).toContain('bg-gradient-to-r');
    });

    it('renders default emoji when no emoji prop is provided', () => {
        render(
            <ActionCard
                title="Emoji Test"
                subtitle="Emoji Test Subtitle"
                buttonText="Emoji Button"
                onClick={mockOnClick}
            />
        );

        expect(screen.getByText('👨‍🍳')).toBeDefined();
    });

    it('renders custom emoji when emoji prop is provided', () => {
        render(
            <ActionCard
                title="Custom Emoji Test"
                subtitle="Custom Emoji Test Subtitle"
                buttonText="Custom Emoji Button"
                onClick={mockOnClick}
                emoji="🏆"
            />
        );

        expect(screen.getByText('🏆')).toBeDefined();
    });

    it('passes dataCy to Button component', () => {
        const { getByTestId } = render(
            <ActionCard
                title="DataCy Test"
                subtitle="DataCy Test Subtitle"
                buttonText="DataCy Button"
                onClick={mockOnClick}
                dataCy="custom-data-cy"
            />
        );

        const button = getByTestId('action-button');
        expect(button.getAttribute('data-cy')).toBe('custom-data-cy');
    });
});
