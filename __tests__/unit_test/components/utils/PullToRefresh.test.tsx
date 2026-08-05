import { render, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PullToRefresh from '@/app/components/utils/PullToRefresh';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: mockRefresh,
    }),
}));

describe('PullToRefresh', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockRefresh.mockReset();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('renders without active indicator initially', () => {
        const { container } = render(<PullToRefresh />);
        expect(container.firstChild).toBeNull();
    });

    it('starts pulling and displays indicator on pull distance threshold', () => {
        const { container } = render(<PullToRefresh threshold={100} />);

        // Simulate pulling down
        act(() => {
            fireEvent.touchStart(document, { touches: [{ clientY: 100 }] });
            fireEvent.touchMove(document, { touches: [{ clientY: 250 }] }); // 150px distance
        });

        // Since indicator condition: (displayPullDistance > 0 || refreshing) && indicator
        // 150px pull is > 0, so it should render the indicator
        expect(container.firstChild).not.toBeNull();
    });

    it('triggers refresh and stops refreshing after timeout', () => {
        render(<PullToRefresh threshold={100} />);

        act(() => {
            fireEvent.touchStart(document, { touches: [{ clientY: 100 }] });
            fireEvent.touchMove(document, { touches: [{ clientY: 250 }] });
            fireEvent.touchEnd(document);
        });

        // First timer for refreshing is set to 800ms
        act(() => {
            vi.advanceTimersByTime(800);
        });
        expect(mockRefresh).toHaveBeenCalledTimes(1);

        // Second timer for stop refreshing is set to 500ms
        act(() => {
            vi.advanceTimersByTime(500);
        });
    });

    it('cleans up timers and event listeners on unmount', () => {
        const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
        const { unmount } = render(<PullToRefresh threshold={100} />);

        // Simulate pull down to start timers
        act(() => {
            fireEvent.touchStart(document, { touches: [{ clientY: 100 }] });
            fireEvent.touchMove(document, { touches: [{ clientY: 250 }] });
            fireEvent.touchEnd(document);
        });

        // Unmounting should trigger cleanup and clear all active timers
        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalled();
        clearTimeoutSpy.mockRestore();
    });
});
