import React from 'react';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PullToRefresh from '@/app/components/utils/PullToRefresh';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: mockRefresh,
    }),
}));

describe('PullToRefresh Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    });

    afterEach(() => {
        vi.useRealTimers();
        cleanup();
    });

    it('renders without crashing when inactive', () => {
        const { queryByRole } = render(<PullToRefresh />);
        expect(queryByRole('img', { hidden: true })).toBeNull();
    });

    it('triggers refresh flow on touch pull past threshold and cleans up timers on unmount', () => {
        const { unmount } = render(<PullToRefresh threshold={100} />);

        act(() => {
            document.dispatchEvent(
                new TouchEvent('touchstart', {
                    touches: [{ clientY: 100 } as Touch],
                })
            );
            document.dispatchEvent(
                new TouchEvent('touchmove', {
                    touches: [{ clientY: 250 } as Touch],
                })
            );
            document.dispatchEvent(new TouchEvent('touchend'));
        });

        // Unmount while timers are pending
        unmount();

        // Fast forward time to ensure no errors on unmounted component
        act(() => {
            vi.advanceTimersByTime(1500);
        });

        expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('executes refresh when not unmounted', () => {
        render(<PullToRefresh threshold={100} />);

        act(() => {
            document.dispatchEvent(
                new TouchEvent('touchstart', {
                    touches: [{ clientY: 100 } as Touch],
                })
            );
            document.dispatchEvent(
                new TouchEvent('touchmove', {
                    touches: [{ clientY: 250 } as Touch],
                })
            );
            document.dispatchEvent(new TouchEvent('touchend'));
        });

        act(() => {
            vi.advanceTimersByTime(800);
        });

        expect(mockRefresh).toHaveBeenCalledTimes(1);

        act(() => {
            vi.advanceTimersByTime(500);
        });
    });
});
