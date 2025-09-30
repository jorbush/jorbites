import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Button from '@/app/components/buttons/Button';
import { FaUser } from 'react-icons/fa';
import React from 'react';
import { act } from 'react';

describe('<Button />', () => {
    const mockOnClick = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        mockOnClick.mockClear();
    });

    it('renders with label', () => {
        render(
            <Button
                label="Test Button"
                onClick={mockOnClick}
            />
        );
        expect(screen.getByText('Test Button')).toBeDefined();
    });

    it('calls onClick when clicked', () => {
        render(
            <Button
                label="Click Me"
                onClick={mockOnClick}
            />
        );
        fireEvent.click(screen.getByText('Click Me'));
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('disables the button when disabled prop is true', () => {
        render(
            <Button
                label="Disabled"
                onClick={mockOnClick}
                disabled
            />
        );
        expect(screen.getByText('Disabled')).toHaveProperty('disabled');
    });

    it('applies outline styles when outline prop is true', () => {
        render(
            <Button
                label="Outline"
                onClick={mockOnClick}
                outline
            />
        );
        const button = screen.getByText('Outline');
        expect(button.className).toContain('bg-white');
        expect(button.className).toContain('border-black');
    });

    it('applies small styles when small prop is true', () => {
        render(
            <Button
                label="Small"
                onClick={mockOnClick}
                small
            />
        );
        const button = screen.getByText('Small');
        expect(button.className).toContain('text-sm');
    });

    it('renders icon when provided', () => {
        render(
            <Button
                label="Icon Button"
                onClick={mockOnClick}
                icon={FaUser}
            />
        );
        expect(screen.getByTestId('button-icon')).toBeDefined();
    });

    it('applies delay when withDelay prop is true', async () => {
        render(
            <Button
                label="Delay Button"
                onClick={mockOnClick}
                withDelay
            />
        );
        const button = screen.getByText('Delay Button');

        fireEvent.click(button);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
        expect(button.hasAttribute('disabled')).toBe(true);

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(button.hasAttribute('disabled')).toBe(false);
    });
    it('applies delete button styles when deleteButton prop is true', () => {
        render(
            <Button
                label="Delete"
                onClick={mockOnClick}
                deleteButton
            />
        );
        const button = screen.getByText('Delete');
        expect(button.className).toContain('border-rose-500');
        expect(button.className).toContain('bg-rose-500');
    });

    it('applies cursor-pointer by default', () => {
        render(
            <Button
                label="Normal Button"
                onClick={mockOnClick}
            />
        );
        const button = screen.getByText('Normal Button');
        expect(button.className).toContain('cursor-pointer');
    });

    it('applies cursor-not-allowed when disabled', () => {
        render(
            <Button
                label="Disabled Button"
                onClick={mockOnClick}
                disabled
            />
        );
        const button = screen.getByText('Disabled Button');
        expect(button.className).toContain('disabled:cursor-not-allowed');
    });

    it('maintains cursor-pointer when not disabled', () => {
        render(
            <Button
                label="Enabled Button"
                onClick={mockOnClick}
                outline
            />
        );
        const button = screen.getByText('Enabled Button');
        expect(button.className).toContain('cursor-pointer');
        // The disabled:cursor-not-allowed class is always present but only active when button is disabled
        expect(button.className).toContain('disabled:cursor-not-allowed');
        expect(button.hasAttribute('disabled')).toBe(false);
    });
});
