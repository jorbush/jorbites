import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';

describe('ToggleSwitch', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders correctly when unchecked', () => {
        const onChange = vi.fn();
        render(
            <ToggleSwitch
                checked={false}
                onChange={onChange}
                label="Test Label"
            />
        );

        const switchButton = screen.getByRole('switch');
        expect(switchButton).toBeDefined();
        expect(switchButton.getAttribute('aria-checked')).toBe('false');
        expect(screen.getByText('Test Label')).toBeDefined();
    });

    it('renders correctly when checked', () => {
        const onChange = vi.fn();
        render(
            <ToggleSwitch
                checked={true}
                onChange={onChange}
                label="Test Label"
            />
        );

        const switchButton = screen.getByRole('switch');
        expect(switchButton.getAttribute('aria-checked')).toBe('true');
    });

    it('calls onChange when clicked', () => {
        const onChange = vi.fn();
        render(
            <ToggleSwitch
                checked={false}
                onChange={onChange}
                label="Test Label"
            />
        );

        const switchButton = screen.getByRole('switch');
        fireEvent.click(switchButton);
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('renders without label when not provided', () => {
        const onChange = vi.fn();
        render(
            <ToggleSwitch
                checked={false}
                onChange={onChange}
            />
        );

        const switchButton = screen.getByRole('switch');
        expect(switchButton).toBeDefined();
        expect(screen.queryByText('Test Label')).toBeNull();
    });

    it('applies data-cy attribute when provided', () => {
        const onChange = vi.fn();
        render(
            <ToggleSwitch
                checked={false}
                onChange={onChange}
                dataCy="test-toggle"
            />
        );

        const switchButton = screen.getByRole('switch');
        expect(switchButton.getAttribute('data-cy')).toBe('test-toggle');
    });

    it('has cursor-pointer class', () => {
        const onChange = vi.fn();
        render(
            <ToggleSwitch
                checked={false}
                onChange={onChange}
            />
        );

        const switchButton = screen.getByRole('switch');
        expect(switchButton.className).toContain('cursor-pointer');
    });

    it('applies checked styles when checked', () => {
        const onChange = vi.fn();
        render(
            <ToggleSwitch
                checked={true}
                onChange={onChange}
            />
        );

        const switchButton = screen.getByRole('switch');
        expect(switchButton.className).toContain('bg-green-450');
    });

    it('applies unchecked styles when unchecked', () => {
        const onChange = vi.fn();
        render(
            <ToggleSwitch
                checked={false}
                onChange={onChange}
            />
        );

        const switchButton = screen.getByRole('switch');
        expect(switchButton.className).toContain('bg-neutral-300');
    });

    it('has proper accessibility attributes', () => {
        const onChange = vi.fn();
        render(
            <ToggleSwitch
                checked={false}
                onChange={onChange}
            />
        );

        const switchButton = screen.getByRole('switch');
        expect(switchButton.getAttribute('type')).toBe('button');
        expect(switchButton.getAttribute('role')).toBe('switch');
        expect(switchButton.getAttribute('aria-checked')).toBe('false');
    });

    it('toggles aria-checked attribute', () => {
        const onChange = vi.fn();
        const { rerender } = render(
            <ToggleSwitch
                checked={false}
                onChange={onChange}
            />
        );

        const switchButton = screen.getByRole('switch');
        expect(switchButton.getAttribute('aria-checked')).toBe('false');

        rerender(
            <ToggleSwitch
                checked={true}
                onChange={onChange}
            />
        );
        expect(switchButton.getAttribute('aria-checked')).toBe('true');
    });
});
