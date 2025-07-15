import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DescriptionStep from '@/app/components/modals/recipe-steps/DescriptionStep';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key, // Return the key itself instead of the translated string
    })),
}));

// Mock Heading component
vi.mock('@/app/components/navigation/Heading', () => ({
    default: ({ title, subtitle }: { title: string; subtitle?: string }) => (
        <div data-testid="heading">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
        </div>
    ),
}));

// Mock Input component
vi.mock('@/app/components/inputs/Input', () => ({
    default: ({ id, label, disabled, required, maxLength, dataCy }: any) => (
        <div data-testid={dataCy || `input-${id}`}>
            <label>{label}</label>
            <input
                id={id}
                disabled={disabled}
                required={required}
                maxLength={maxLength}
                data-testid={`${id}-field`}
            />
        </div>
    ),
}));

// Mock Counter component
vi.mock('@/app/components/inputs/Counter', () => ({
    default: ({ title, subtitle, value, onChange }: any) => (
        <div data-testid="counter">
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
            <div data-testid="counter-value">{value}</div>
            <button
                data-testid="counter-increment"
                onClick={() => onChange(value + 1)}
            >
                +
            </button>
            <button
                data-testid="counter-decrement"
                onClick={() => onChange(value - 1)}
            >
                -
            </button>
        </div>
    ),
}));

// Mock constants
vi.mock('@/app/utils/constants', () => ({
    RECIPE_TITLE_MAX_LENGTH: 100,
    RECIPE_DESCRIPTION_MAX_LENGTH: 500,
}));

describe('<DescriptionStep />', () => {
    const mockRegister = vi.fn();
    const mockProps = {
        isLoading: false,
        register: mockRegister,
        errors: {},
        minutes: 30,
        onMinutesChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly with default props', () => {
        render(<DescriptionStep {...mockProps} />);

        expect(screen.getByTestId('heading')).toBeDefined();
        expect(screen.getByText('title_description')).toBeDefined();
    });

    it('renders title input field', () => {
        render(<DescriptionStep {...mockProps} />);

        const titleInput = screen.getByTestId('recipe-title');
        expect(titleInput).toBeDefined();
        expect(screen.getByText('title')).toBeDefined();
    });

    it('renders description input field', () => {
        render(<DescriptionStep {...mockProps} />);

        const descriptionInput = screen.getByTestId('recipe-description');
        expect(descriptionInput).toBeDefined();
        expect(screen.getByText('description')).toBeDefined();
    });

    it('renders counter component for minutes', () => {
        render(<DescriptionStep {...mockProps} />);

        const counter = screen.getByTestId('counter');
        expect(counter).toBeDefined();
        expect(screen.getByText('minutes')).toBeDefined();
        expect(screen.getByTestId('counter-value').textContent).toBe('30');
    });

    it('passes isLoading prop to inputs', () => {
        const loadingProps = {
            ...mockProps,
            isLoading: true,
        };

        render(<DescriptionStep {...loadingProps} />);

        const titleField = screen.getByTestId(
            'title-field'
        ) as HTMLInputElement;
        const descriptionField = screen.getByTestId(
            'description-field'
        ) as HTMLInputElement;

        expect(titleField.disabled).toBe(true);
        expect(descriptionField.disabled).toBe(true);
    });

    it('inputs are not disabled when not loading', () => {
        render(<DescriptionStep {...mockProps} />);

        const titleField = screen.getByTestId(
            'title-field'
        ) as HTMLInputElement;
        const descriptionField = screen.getByTestId(
            'description-field'
        ) as HTMLInputElement;

        expect(titleField.disabled).toBe(false);
        expect(descriptionField.disabled).toBe(false);
    });

    it('title input is required', () => {
        render(<DescriptionStep {...mockProps} />);

        const titleField = screen.getByTestId(
            'title-field'
        ) as HTMLInputElement;
        expect(titleField.required).toBe(true);
    });

    it('description input is required', () => {
        render(<DescriptionStep {...mockProps} />);

        const descriptionField = screen.getByTestId(
            'description-field'
        ) as HTMLInputElement;
        expect(descriptionField.required).toBe(true);
    });

    it('title input has correct max length', () => {
        render(<DescriptionStep {...mockProps} />);

        const titleField = screen.getByTestId(
            'title-field'
        ) as HTMLInputElement;
        expect(titleField.maxLength).toBe(100);
    });

    it('description input has correct max length', () => {
        render(<DescriptionStep {...mockProps} />);

        const descriptionField = screen.getByTestId(
            'description-field'
        ) as HTMLInputElement;
        expect(descriptionField.maxLength).toBe(500);
    });

    it('calls onMinutesChange when counter is incremented', () => {
        render(<DescriptionStep {...mockProps} />);

        const incrementButton = screen.getByTestId('counter-increment');
        fireEvent.click(incrementButton);

        expect(mockProps.onMinutesChange).toHaveBeenCalledWith(31);
    });

    it('calls onMinutesChange when counter is decremented', () => {
        render(<DescriptionStep {...mockProps} />);

        const decrementButton = screen.getByTestId('counter-decrement');
        fireEvent.click(decrementButton);

        expect(mockProps.onMinutesChange).toHaveBeenCalledWith(29);
    });

    it('displays correct minutes value in counter', () => {
        const propsWithDifferentMinutes = {
            ...mockProps,
            minutes: 45,
        };

        render(<DescriptionStep {...propsWithDifferentMinutes} />);

        expect(screen.getByTestId('counter-value').textContent).toBe('45');
    });

    it('renders subtitle in heading when available', () => {
        render(<DescriptionStep {...mockProps} />);

        // Check that subtitle is rendered
        expect(screen.getByText('subtitle_description')).toBeDefined();
    });

    it('renders horizontal dividers between sections', () => {
        render(<DescriptionStep {...mockProps} />);

        // The component should have hr elements as dividers
        const component = screen.getByTestId('heading').parentElement;
        expect(component?.innerHTML).toContain('<hr>');
    });
});
