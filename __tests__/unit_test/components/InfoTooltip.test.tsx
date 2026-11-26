import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import InfoTooltip from '@/app/components/utils/InfoTooltip';

describe('InfoTooltip', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders trigger button with accessible label and hides tooltip initially', () => {
        render(
            <InfoTooltip
                text="Helpful disclaimer text"
                ariaLabel="More info"
                triggerTestId="info-trigger"
                tooltipTestId="info-tooltip"
            />
        );

        const trigger = screen.getByTestId('info-trigger');
        expect(trigger).toBeDefined();
        expect(trigger.getAttribute('aria-label')).toBe('More info');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(trigger.getAttribute('aria-describedby')).toBeNull();
        expect(screen.queryByTestId('info-tooltip')).toBeNull();
    });

    it('shows tooltip on hover and hides on mouse leave', () => {
        render(
            <InfoTooltip
                text="Helpful disclaimer text"
                ariaLabel="More info"
                triggerTestId="info-trigger"
                tooltipTestId="info-tooltip"
            />
        );

        const trigger = screen.getByTestId('info-trigger');
        const container = trigger.parentElement!;

        fireEvent.mouseEnter(container);
        const tooltip = screen.getByTestId('info-tooltip');
        expect(tooltip).toBeDefined();
        expect(tooltip.textContent).toBe('Helpful disclaimer text');
        expect(tooltip.getAttribute('role')).toBe('tooltip');
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);

        fireEvent.mouseLeave(container);
        expect(screen.queryByTestId('info-tooltip')).toBeNull();
    });

    it('toggles tooltip on click and keeps it open after mouse leave until dismissed', () => {
        render(
            <div>
                <InfoTooltip
                    text="Helpful disclaimer text"
                    ariaLabel="More info"
                    triggerTestId="info-trigger"
                    tooltipTestId="info-tooltip"
                />
                <button type="button">Outside</button>
            </div>
        );

        const trigger = screen.getByTestId('info-trigger');
        const container = trigger.parentElement!;

        fireEvent.click(trigger);
        expect(screen.getByTestId('info-tooltip')).toBeDefined();

        fireEvent.mouseLeave(container);
        expect(screen.getByTestId('info-tooltip')).toBeDefined();

        fireEvent.mouseDown(screen.getByText('Outside'));
        expect(screen.queryByTestId('info-tooltip')).toBeNull();
    });

    it('toggles cleanly on touch devices without synthetic hover conflict', () => {
        render(
            <InfoTooltip
                text="Helpful disclaimer text"
                ariaLabel="More info"
                triggerTestId="info-trigger"
                tooltipTestId="info-tooltip"
            />
        );

        const trigger = screen.getByTestId('info-trigger');
        const container = trigger.parentElement!;

        // First tap: touchStart -> synthetic mouseEnter -> click
        fireEvent.touchStart(trigger);
        fireEvent.mouseEnter(container);
        fireEvent.click(trigger);
        expect(screen.getByTestId('info-tooltip')).toBeDefined();

        // Second tap: touchStart -> click closes it
        fireEvent.touchStart(trigger);
        fireEvent.click(trigger);
        expect(screen.queryByTestId('info-tooltip')).toBeNull();
    });

    it('opens on keyboard focus and dismisses on Escape or blur', () => {
        render(
            <InfoTooltip
                text="Helpful disclaimer text"
                ariaLabel="More info"
                triggerTestId="info-trigger"
                tooltipTestId="info-tooltip"
            />
        );

        const trigger = screen.getByTestId('info-trigger');
        const container = trigger.parentElement!;

        fireEvent.focus(container);
        expect(screen.getByTestId('info-tooltip')).toBeDefined();

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(screen.queryByTestId('info-tooltip')).toBeNull();

        fireEvent.focus(container);
        expect(screen.getByTestId('info-tooltip')).toBeDefined();

        fireEvent.blur(container, { relatedTarget: null });
        expect(screen.queryByTestId('info-tooltip')).toBeNull();
    });

    it('aligns tooltip to parent when anchorToParent is true', () => {
        render(
            <InfoTooltip
                text="Helpful disclaimer text"
                ariaLabel="More info"
                anchorToParent
                triggerTestId="info-trigger"
                tooltipTestId="info-tooltip"
            />
        );

        const trigger = screen.getByTestId('info-trigger');
        fireEvent.click(trigger);

        const tooltip = screen.getByTestId('info-tooltip');
        expect(tooltip.className).toContain('left-0');
        expect(trigger.parentElement!.className).not.toContain('relative');
    });

    it('renders custom icon and triggerClassName when provided', () => {
        render(
            <InfoTooltip
                text="Helpful disclaimer text"
                ariaLabel="More info"
                icon={<span data-testid="custom-icon">!</span>}
                triggerClassName="text-amber-600"
                triggerTestId="info-trigger"
                tooltipTestId="info-tooltip"
            />
        );

        const trigger = screen.getByTestId('info-trigger');
        expect(screen.getByTestId('custom-icon')).toBeDefined();
        expect(trigger.className).toContain('text-amber-600');
    });
});
