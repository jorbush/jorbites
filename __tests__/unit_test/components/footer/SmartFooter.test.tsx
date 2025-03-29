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

// Create mock functions for useState and useEffect
const mockSetState = vi.fn();
let mockIsMounted = false;

// Mock React's useState and useEffect
vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
        ...actual,
        useState: vi.fn(() => [mockIsMounted, mockSetState]),
        useEffect: vi.fn((callback) => callback()),
    };
});

// Import the component after all mocks are set up
import SmartFooter from '@/app/components/footer/SmartFooter';

describe('SmartFooter', () => {
    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        mockSetState.mockClear();
        mockIsMounted = false;
    });

    afterEach(() => {
        cleanup();
    });

    it('renders FooterSkeleton initially when not mounted', () => {
        // Ensure useState returns false for mounted
        mockIsMounted = false;

        render(<SmartFooter />);
        expect(screen.getByTestId('footer-skeleton-component')).toBeDefined();
    });

    it('renders ClientFooter when mounted', () => {
        // Mock useState to return true for mounted
        mockIsMounted = true;

        render(<SmartFooter />);
        expect(screen.getByTestId('client-footer')).toBeDefined();
    });

    it('calls useEffect which updates the mounted state', () => {
        // Verify effect behavior by checking if setState was called
        render(<SmartFooter />);

        // Since we mocked useEffect to immediately run its callback,
        // setMounted should have been called with true
        expect(mockSetState).toHaveBeenCalledWith(true);
    });

    it('sets mounted state to true after mounting', () => {
        render(<SmartFooter />);

        // Check that setMounted was called with true
        expect(mockSetState).toHaveBeenCalledWith(true);
    });
});
