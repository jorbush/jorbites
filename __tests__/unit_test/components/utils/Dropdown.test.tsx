import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dropdown, { DropdownOption } from '@/app/components/utils/Dropdown';

const options: DropdownOption[] = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
];

const renderButton = (
    isOpen: boolean,
    selectedValue: string,
    selectedLabel: string
) => <button>{selectedLabel}</button>;

describe('Dropdown', () => {
    it('renders the button with the selected option label', () => {
        render(
            <Dropdown
                options={options}
                value="1"
                onChange={() => {}}
                renderButton={renderButton}
            />
        );
        expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('opens the dropdown when the button is clicked', () => {
        render(
            <Dropdown
                options={options}
                value="1"
                onChange={() => {}}
                renderButton={renderButton}
            />
        );
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('calls the onChange callback when an option is clicked', () => {
        const handleChange = vi.fn();
        render(
            <Dropdown
                options={options}
                value="1"
                onChange={handleChange}
                renderButton={renderButton}
            />
        );
        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByText('Option 2'));
        expect(handleChange).toHaveBeenCalledWith('2');
    });

    it('calls the renderButton prop with the correct arguments', () => {
        const renderButtonMock = vi.fn();
        render(
            <Dropdown
                options={options}
                value="1"
                onChange={() => {}}
                renderButton={renderButtonMock}
            />
        );
        expect(renderButtonMock).toHaveBeenCalledWith(false, '1', 'Option 1');

        fireEvent.click(screen.getByRole('button'));
        expect(renderButtonMock).toHaveBeenCalledWith(true, '1', 'Option 1');
    });
});
