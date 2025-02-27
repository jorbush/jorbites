import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ActionCard from '@/app/components/top-jorbiters/ActionCard';

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

    it('applies default styling', () => {
        const { container, getByTestId } = render(
            <ActionCard
                title="Default Style"
                subtitle="Default Style Test"
                buttonText="Default Button"
                onClick={mockOnClick}
            />
        );

        const cardDiv = container.firstChild as HTMLElement;
        expect(cardDiv.className).toContain('rounded-lg');
        expect(cardDiv.className).toContain('bg-green-50');

        const button = getByTestId('action-button');
        expect(button.className).toContain('bg-green-450');
        expect(button.className).toContain('rounded-full');
    });
});
