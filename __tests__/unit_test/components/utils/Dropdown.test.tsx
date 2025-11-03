import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import Dropdown, { DropdownOption } from '@/app/components/utils/Dropdown';

// Mock the icons
vi.mock('react-icons/fi', () => ({
    FiChevronDown: () => <div data-testid="chevron-down-icon" />,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('<Dropdown />', () => {
    const mockOptions: DropdownOption[] = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
    ];

    const mockOnChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders with default button', () => {
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                label="Test Dropdown"
            />
        );

        expect(screen.getByRole('button')).toBeDefined();
        expect(screen.getByText('Option 1')).toBeDefined();
    });

    it('opens dropdown when button is clicked', () => {
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByText('Option 2')).toBeDefined();
        expect(screen.getByText('Option 3')).toBeDefined();
    });

    it('calls onChange when an option is selected', () => {
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const option2 = screen.getByText('Option 2');
        fireEvent.click(option2);

        expect(mockOnChange).toHaveBeenCalledWith('option2');
    });

    it('closes dropdown after selecting an option', () => {
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const option2 = screen.getByText('Option 2');
        fireEvent.click(option2);

        // After selecting, Option 3 should not be visible anymore
        expect(screen.queryByText('Option 3')).toBeNull();
    });

    it('closes dropdown when clicking outside', () => {
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Dropdown should be open
        expect(screen.getByText('Option 2')).toBeDefined();

        // Click outside
        fireEvent.mouseDown(document.body);

        // Dropdown should be closed
        expect(screen.queryByText('Option 2')).toBeNull();
    });

    it('highlights the selected option', () => {
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const option1Elements = screen.getAllByText('Option 1');
        const dropdownOption = option1Elements.find((el) =>
            el.className.includes('whitespace-nowrap')
        );

        expect(dropdownOption?.parentElement?.className).toContain(
            'text-green-450'
        );
    });

    it('has proper ARIA attributes', () => {
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                ariaLabel="Test dropdown"
            />
        );

        const button = screen.getByRole('button');
        expect(button.getAttribute('aria-label')).toBe('Test dropdown');
        expect(button.getAttribute('aria-expanded')).toBe('false');
        expect(button.getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('updates aria-expanded when dropdown is opened', () => {
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(button.getAttribute('aria-expanded')).toBe('true');
    });

    it('supports custom button rendering', () => {
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                renderButton={({ currentLabel, isOpen }) => (
                    <div data-testid="custom-button">
                        Custom: {currentLabel} {isOpen ? '▲' : '▼'}
                    </div>
                )}
            />
        );

        const customButton = screen.getByTestId('custom-button');
        expect(customButton).toBeDefined();
        expect(customButton.textContent).toContain('Custom: Option 1');
    });

    it('supports right alignment', () => {
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                align="right"
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const dropdown = screen
            .getByRole('listbox')
            .closest('[role="listbox"]');
        expect(dropdown?.className).toContain('right-0');
    });

    it('supports auto width', () => {
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                width="auto"
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const dropdownContent = screen.getByRole('listbox').querySelector('div');
        expect(dropdownContent?.className).toContain('w-max');
    });
});
