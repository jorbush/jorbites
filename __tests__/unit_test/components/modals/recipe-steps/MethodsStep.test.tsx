import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MethodsStep from '@/app/components/modals/recipe-steps/MethodsStep';

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

// Mock CategoryInput component
vi.mock('@/app/components/inputs/CategoryInput', () => ({
    default: ({ onClick, selected, label, dataCy }: any) => (
        <div
            data-testid={dataCy}
            data-selected={selected}
            onClick={() => onClick(label)}
            className={selected ? 'selected' : ''}
        >
            {label}
        </div>
    ),
}));

// Mock the icons by creating simple mock components
vi.mock('react-icons/gi', () => ({
    GiCookingPot: () => <span>GiCookingPot</span>,
    GiPressureCooker: () => <span>GiPressureCooker</span>,
}));

vi.mock('react-icons/md', () => ({
    MdMicrowave: () => <span>MdMicrowave</span>,
}));

vi.mock('react-icons/tb', () => ({
    TbCooker: () => <span>TbCooker</span>,
}));

vi.mock('react-icons/cg', () => ({
    CgSmartHomeCooker: () => <span>CgSmartHomeCooker</span>,
}));

describe('<MethodsStep />', () => {
    const mockProps = {
        selectedMethod: '',
        onMethodSelect: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly with default props', () => {
        render(<MethodsStep {...mockProps} />);

        expect(screen.getByTestId('heading')).toBeDefined();
        expect(screen.getByText('methods_title')).toBeDefined();
    });

    it('renders all preparation methods', () => {
        render(<MethodsStep {...mockProps} />);

        // Check that all method boxes are rendered
        expect(screen.getByTestId('method-box-Frying pan')).toBeDefined();
        expect(screen.getByTestId('method-box-Microwave')).toBeDefined();
        expect(screen.getByTestId('method-box-Air fryer')).toBeDefined();
        expect(screen.getByTestId('method-box-Deep fryer')).toBeDefined();
        expect(screen.getByTestId('method-box-Oven')).toBeDefined();
    });

    it('shows selected method correctly', () => {
        const propsWithSelection = {
            ...mockProps,
            selectedMethod: 'Microwave',
        };

        render(<MethodsStep {...propsWithSelection} />);

        const microwaveMethod = screen.getByTestId('method-box-Microwave');
        const fryingPanMethod = screen.getByTestId('method-box-Frying pan');

        expect(microwaveMethod.getAttribute('data-selected')).toBe('true');
        expect(fryingPanMethod.getAttribute('data-selected')).toBe('false');
    });

    it('calls onMethodSelect when a method is clicked', () => {
        render(<MethodsStep {...mockProps} />);

        const ovenMethod = screen.getByTestId('method-box-Oven');
        fireEvent.click(ovenMethod);

        expect(mockProps.onMethodSelect).toHaveBeenCalledWith('Oven');
    });

    it('calls onMethodSelect for different methods', () => {
        render(<MethodsStep {...mockProps} />);

        const airFryerMethod = screen.getByTestId('method-box-Air fryer');
        fireEvent.click(airFryerMethod);

        expect(mockProps.onMethodSelect).toHaveBeenCalledWith('Air fryer');
    });

    it('renders methods in grid layout', () => {
        render(<MethodsStep {...mockProps} />);

        // Check that the grid container exists
        const gridContainer =
            screen.getByTestId('method-box-Oven').parentElement?.parentElement;
        expect(gridContainer?.className).toContain('grid');
    });

    it('renders subtitle in heading when available', () => {
        render(<MethodsStep {...mockProps} />);

        // Check that subtitle is rendered
        expect(screen.getByText('methods_subtitle')).toBeDefined();
    });

    it('renders all five preparation methods', () => {
        render(<MethodsStep {...mockProps} />);

        // Count all method elements
        const methodElements = screen.getAllByText(
            /Frying pan|Microwave|Air fryer|Deep fryer|Oven/
        );
        expect(methodElements).toHaveLength(5);
    });

    it('can select different methods sequentially', () => {
        const { rerender } = render(<MethodsStep {...mockProps} />);

        // Click on Microwave
        const microwaveMethod = screen.getByTestId('method-box-Microwave');
        fireEvent.click(microwaveMethod);
        expect(mockProps.onMethodSelect).toHaveBeenCalledWith('Microwave');

        // Simulate props update with new selection
        const updatedProps = {
            ...mockProps,
            selectedMethod: 'Microwave',
        };
        rerender(<MethodsStep {...updatedProps} />);

        // Verify Microwave is selected
        expect(
            screen
                .getByTestId('method-box-Microwave')
                .getAttribute('data-selected')
        ).toBe('true');

        // Click on Oven
        const ovenMethod = screen.getByTestId('method-box-Oven');
        fireEvent.click(ovenMethod);
        expect(mockProps.onMethodSelect).toHaveBeenCalledWith('Oven');
    });

    it('has scrollable container for methods', () => {
        render(<MethodsStep {...mockProps} />);

        // The methods container should have overflow-y-auto class
        const methodContainer =
            screen.getByTestId('method-box-Oven').parentElement?.parentElement;
        expect(methodContainer?.className).toContain('overflow-y-auto');
    });

    it('renders with grid cols-2 layout', () => {
        render(<MethodsStep {...mockProps} />);

        const gridContainer =
            screen.getByTestId('method-box-Oven').parentElement?.parentElement;
        expect(gridContainer?.className).toContain('grid-cols-2');
    });
});
