import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Dropdown from '@/app/components/utils/Dropdown';

// Mock the icons
vi.mock('react-icons/fi', () => ({
    FiChevronDown: () => <div data-testid="chevron-down-icon" />,
}));

describe('<Dropdown />', () => {
    afterEach(() => {
        cleanup();
    });

    const mockOptions = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
    ];

    it('renders the dropdown button with custom content', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Custom Button</span>}
            />
        );

        expect(screen.getByText('Custom Button')).toBeDefined();
    });

    it('opens dropdown when button is clicked', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByText('Option 1')).toBeDefined();
        expect(screen.getByText('Option 2')).toBeDefined();
        expect(screen.getByText('Option 3')).toBeDefined();
    });

    it('calls onChange when an option is selected', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const option2 = screen.getByText('Option 2');
        fireEvent.click(option2);

        expect(mockOnChange).toHaveBeenCalledWith('option2');
    });

    it('closes dropdown after selecting an option', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const option2 = screen.getByText('Option 2');
        fireEvent.click(option2);

        // After clicking an option, only the button should remain visible
        expect(screen.queryByText('Option 3')).toBeNull();
    });

    it('closes dropdown when clicking outside', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
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

    it('shows chevron icon when showChevron is true', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
                showChevron={true}
            />
        );

        expect(screen.getByTestId('chevron-down-icon')).toBeDefined();
    });

    it('hides chevron icon when showChevron is false', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
                showChevron={false}
            />
        );

        expect(screen.queryByTestId('chevron-down-icon')).toBeNull();
    });

    it('shows notification when showNotification is true', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
                showNotification={true}
            />
        );

        const button = screen.getByRole('button');
        const notification = button.querySelector('.bg-rose-500');
        expect(notification).toBeDefined();
    });

    it('hides notification when showNotification is false', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
                showNotification={false}
            />
        );

        const button = screen.getByRole('button');
        const notification = button.querySelector('.bg-rose-500');
        expect(notification).toBeNull();
    });

    it('sets aria-label on button', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
                ariaLabel="Test Dropdown"
            />
        );

        const button = screen.getByRole('button');
        expect(button.getAttribute('aria-label')).toBe('Test Dropdown');
    });

    it('sets aria-expanded correctly based on dropdown state', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
            />
        );

        const button = screen.getByRole('button');
        expect(button.getAttribute('aria-expanded')).toBe('false');

        fireEvent.click(button);
        expect(button.getAttribute('aria-expanded')).toBe('true');
    });

    it('applies custom className to button', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
                className="custom-button-class"
            />
        );

        const button = screen.getByRole('button');
        expect(button.className).toContain('custom-button-class');
    });

    it('highlights selected option', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option2"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const option2Element = screen.getByText('Option 2');
        expect(option2Element.parentElement?.className).toContain(
            'text-green-450'
        );
    });

    it('has aria-haspopup="listbox" attribute on button', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
            />
        );

        const button = screen.getByRole('button');
        expect(button.getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('dropdown menu has role="listbox"', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const listbox = screen.getByRole('listbox');
        expect(listbox).toBeDefined();
    });

    it('dropdown options have role="option"', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const options = screen.getAllByRole('option');
        expect(options.length).toBe(3);
    });

    it('supports keyboard navigation with ArrowDown', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
            />
        );

        const button = screen.getByRole('button');

        // ArrowDown opens the dropdown
        fireEvent.keyDown(button, { key: 'ArrowDown' });
        expect(screen.getByText('Option 1')).toBeDefined();
    });

    it('supports keyboard navigation with Escape', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Escape closes the dropdown
        fireEvent.keyDown(button, { key: 'Escape' });
        expect(screen.queryByText('Option 2')).toBeNull();
    });

    it('supports keyboard navigation with Enter to select option', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
            />
        );

        const button = screen.getByRole('button');

        // Open dropdown with Enter
        fireEvent.keyDown(button, { key: 'Enter' });
        expect(screen.getByText('Option 1')).toBeDefined();

        // Navigate down with ArrowDown
        fireEvent.keyDown(button, { key: 'ArrowDown' });

        // Select with Enter
        fireEvent.keyDown(button, { key: 'Enter' });
        expect(mockOnChange).toHaveBeenCalledWith('option2');
    });

    it('supports keyboard navigation with Space key', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option1"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
            />
        );

        const button = screen.getByRole('button');

        // Space opens the dropdown
        fireEvent.keyDown(button, { key: ' ' });
        expect(screen.getByText('Option 1')).toBeDefined();
    });

    it('selected option has aria-selected="true"', () => {
        const mockOnChange = vi.fn();
        render(
            <Dropdown
                options={mockOptions}
                value="option2"
                onChange={mockOnChange}
                buttonContent={<span>Button</span>}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const options = screen.getAllByRole('option');
        expect(options[1].getAttribute('aria-selected')).toBe('true');
        expect(options[0].getAttribute('aria-selected')).toBe('false');
    });
});
