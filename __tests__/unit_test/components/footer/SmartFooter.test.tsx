import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';

// Mock components with string literals to avoid hoisting issues
vi.mock('next/dynamic', () => ({
    default: () => {
        return function MockedDynamicComponent() {
            return <div data-testid="client-footer">Client Footer Content</div>;
        };
    },
}));

// Mock FooterSkeleton component with string literals
vi.mock('@/app/components/footer/FooterSkeleton', () => ({
    default: function MockedFooterSkeleton() {
        return (
            <div data-testid="footer-skeleton-component">Footer Skeleton</div>
        );
    },
}));

// Create mock state for mounting
let mockIsMounted = false;

// Mock React's useSyncExternalStore
vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
        ...actual,
        useSyncExternalStore: vi.fn(
            (subscribe, getSnapshot, getServerSnapshot) => {
                return mockIsMounted ? getSnapshot() : getServerSnapshot();
            }
        ),
    };
});

// Import the component after all mocks are set up
import SmartFooter from '@/app/components/footer/SmartFooter';

describe('SmartFooter', () => {
    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        mockIsMounted = false;
    });

    afterEach(() => {
        cleanup();
    });

    it('renders FooterSkeleton initially when not mounted', () => {
        // Ensure useSyncExternalStore returns false (simulating server / initial state)
        mockIsMounted = false;

        render(<SmartFooter />);
        expect(screen.getByTestId('footer-skeleton-component')).toBeDefined();
    });

    it('renders ClientFooter when mounted', () => {
        // Ensure useSyncExternalStore returns true (simulating client-mounted state)
        mockIsMounted = true;

        render(<SmartFooter />);
        expect(screen.getByTestId('client-footer')).toBeDefined();
    });
});
