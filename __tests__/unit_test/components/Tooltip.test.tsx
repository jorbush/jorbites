import React from 'react';
import {
    render,
    screen,
    fireEvent,
    act,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Tooltip from '@/app/components/utils/Tooltip';

describe('Tooltip', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        cleanup();
    });

    it('renders children correctly', () => {
        render(
            <Tooltip text="Test tooltip">
                <span>Hover me</span>
            </Tooltip>
        );

        expect(screen.getByText('Hover me')).toBeDefined();
        expect(screen.queryByTestId('tooltip')).toBeNull();
    });

    it('does not show tooltip initially', () => {
        render(
            <Tooltip text="Test tooltip">
                <span>Hover me</span>
            </Tooltip>
        );

        expect(screen.queryByTestId('tooltip')).toBeNull();
    });

    it('shows tooltip on mouse enter after delay', async () => {
        render(
            <Tooltip
                text="Test tooltip"
                delay={300}
            >
                <span>Hover me</span>
            </Tooltip>
        );

        const container = screen.getByText('Hover me').parentElement;
        fireEvent.mouseEnter(container!);

        // Before delay passes
        expect(screen.queryByTestId('tooltip')).toBeNull();

        // After delay passes
        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(screen.getByTestId('tooltip')).toBeDefined();
        expect(screen.getByText('Test tooltip')).toBeDefined();
    });

    it('hides tooltip on mouse leave', async () => {
        render(
            <Tooltip
                text="Test tooltip"
                delay={300}
            >
                <span>Hover me</span>
            </Tooltip>
        );

        const container = screen.getByText('Hover me').parentElement;

        // Show tooltip
        fireEvent.mouseEnter(container!);
        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(screen.getByTestId('tooltip')).toBeDefined();

        // Hide tooltip
        fireEvent.mouseLeave(container!);
        expect(screen.queryByTestId('tooltip')).toBeNull();
    });

    it('clears timeout on mouse leave before tooltip appears', () => {
        render(
            <Tooltip
                text="Test tooltip"
                delay={300}
            >
                <span>Hover me</span>
            </Tooltip>
        );

        const container = screen.getByText('Hover me').parentElement;

        // Mouse enter but leave before delay
        fireEvent.mouseEnter(container!);
        fireEvent.mouseLeave(container!);

        // Advance time past delay
        act(() => {
            vi.advanceTimersByTime(300);
        });

        // Tooltip should not appear
        expect(screen.queryByTestId('tooltip')).toBeNull();
    });

    it('positions tooltip correctly based on position prop', async () => {
        const { rerender } = render(
            <Tooltip
                text="Test tooltip"
                position="top"
            >
                <span>Hover me</span>
            </Tooltip>
        );

        let container = screen.getByText('Hover me').parentElement;
        fireEvent.mouseEnter(container!);
        act(() => {
            vi.advanceTimersByTime(300);
        });

        // Check top position
        const topTooltip = screen.getByTestId('tooltip');
        expect(topTooltip.className).toContain('bottom-full');

        // Clean up
        fireEvent.mouseLeave(container!);

        // Check right position
        rerender(
            <Tooltip
                text="Test tooltip"
                position="right"
            >
                <span>Hover me</span>
            </Tooltip>
        );

        container = screen.getByText('Hover me').parentElement;
        fireEvent.mouseEnter(container!);
        act(() => {
            vi.advanceTimersByTime(300);
        });

        const rightTooltip = screen.getByTestId('tooltip');
        expect(rightTooltip.className).toContain('left-full');
    });

    it('applies custom class to container', () => {
        render(
            <Tooltip
                text="Test tooltip"
                className="custom-class"
            >
                <span>Hover me</span>
            </Tooltip>
        );

        const container = screen.getByText('Hover me').parentElement;
        expect(container!.className).toContain('custom-class');
    });
});
