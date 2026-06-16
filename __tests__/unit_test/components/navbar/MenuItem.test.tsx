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

    it('renders isNew icon when isNew prop is true', () => {
        render(
            <MenuItem
                {...defaultProps}
                isNew
            />
        );
        // The MdFiberNew icon doesn't have a simple text label, but we can look for it via a selector if needed
        // or just check that something extra is rendered.
        // In MenuItem.tsx: {isNew && (<MdFiberNew ... />)}
        // We can check if it renders the icon by its class or just see if the container has it.
        // Since we are using vitest and react-icons, it might render as an svg.
        const svg = document.querySelector('svg');
        expect(svg).not.toBeNull();
    });

    it('does not render isNew icon when isNew prop is false', () => {
        render(
            <MenuItem
                {...defaultProps}
                isNew={false}
            />
        );
        const svg = document.querySelector('svg');
        expect(svg).toBeNull();
    });
});
