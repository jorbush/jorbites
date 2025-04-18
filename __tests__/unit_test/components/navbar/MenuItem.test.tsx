import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MenuItem from '@/app/components/navbar/MenuItem';

describe('<MenuItem />', () => {
    const defaultProps = {
        onClick: vi.fn(),
        label: 'Test Item',
    };

    afterEach(() => {
        cleanup();
    });

    it('renders with the correct label', () => {
        render(<MenuItem {...defaultProps} />);
        expect(screen.getByText('Test Item')).toBeDefined();
    });

    it('calls onClick when clicked', () => {
        render(<MenuItem {...defaultProps} />);
        const menuItem = screen.getByText('Test Item');
        fireEvent.click(menuItem);
        expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    it('has the correct CSS classes', () => {
        render(<MenuItem {...defaultProps} />);
        const menuItem = screen.getByText('Test Item');
        expect(menuItem.className).contain('flex');
        expect(menuItem.className).contain('items-center');
        expect(menuItem.className).contain('justify-between');
    });

    it('applies custom label', () => {
        const customLabel = 'Custom Menu Item';
        render(
            <MenuItem
                {...defaultProps}
                label={customLabel}
            />
        );
        expect(screen.getByText(customLabel)).toBeDefined();
    });

    it('applies custom onClick function', () => {
        const customOnClick = vi.fn();
        render(
            <MenuItem
                onClick={customOnClick}
                label="Test Item"
            />
        );
        const menuItem = screen.getByText('Test Item');
        fireEvent.click(menuItem);
        expect(customOnClick).toHaveBeenCalledTimes(1);
    });
});
