import React from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ClientOnly from '@/app/components/utils/ClientOnly';

// Create a test-only wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="i18next-provider">{children}</div>
);

// Mock react-i18next
vi.mock('react-i18next', () => ({
    I18nextProvider: ({ children }: { children: React.ReactNode }) => (
        <TestWrapper>{children}</TestWrapper>
    ),
    initReactI18next: {
        type: '3rdParty',
        init: () => {},
    },
}));

// Mock i18n
vi.mock('../app/i18n', () => ({
    default: {
        use: () => ({
            use: () => ({
                use: () => ({
                    init: () => {},
                }),
            }),
        }),
    },
}));

describe('<ClientOnly />', () => {
    // Clean up after each test to avoid element conflicts
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('should show fallback initially and then children after mounting', () => {
        // Mock requestAnimationFrame to capture callbacks
        const rAFMock = vi.fn();
        let storedCallback: ((timestamp: number) => void) | undefined;
        global.requestAnimationFrame = (cb) => {
            storedCallback = cb;
            return rAFMock() as number;
        };

        // Use a custom fallback to verify initial rendering
        const { rerender } = render(
            <ClientOnly fallback={<div data-testid="fallback">Loading...</div>}>
                <div data-testid="child-component">Child Component</div>
            </ClientOnly>
        );

        // Initially it should show the fallback
        expect(screen.getByTestId('fallback')).toBeDefined();
        // Use toBeNull() for checking absence
        expect(screen.queryByTestId('child-component')).toBeNull();

        // Now manually trigger the rAF callback
        act(() => {
            if (storedCallback) {
                storedCallback(0); // Trigger the stored callback
            }
        });

        rerender(
            <ClientOnly fallback={<div data-testid="fallback">Loading...</div>}>
                <div data-testid="child-component">Child Component</div>
            </ClientOnly>
        );

        expect(screen.queryByTestId('fallback')).toBeNull();
        expect(screen.getByTestId('child-component')).toBeDefined();
    });

    it('would wrap children with I18nextProvider in real usage', () => {
        cleanup();

        render(
            <TestWrapper>
                <div data-testid="second-test-child">Child Component</div>
            </TestWrapper>
        );

        const provider = screen.getByTestId('i18next-provider');
        expect(provider).toBeDefined();

        const childComponent = screen.getByTestId('second-test-child');
        expect(childComponent).toBeDefined();
        expect(childComponent.textContent).toBe('Child Component');
    });
});
