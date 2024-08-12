import React from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ClientOnly from '@/app/components/ClientOnly';

vi.mock('react-i18next', () => ({
    I18nextProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="i18next-provider">{children}</div>
    ),
    initReactI18next: {
        type: '3rdParty',
        init: () => {},
    },
}));

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
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders children immediately in testing environment', () => {
        render(
            <ClientOnly>
                <div data-testid="child-component">Child Component</div>
            </ClientOnly>
        );

        const childComponents = screen.getAllByTestId('child-component');
        expect(childComponents.length).toBe(1);
    });

    it('wraps children with I18nextProvider', () => {
        render(
            <ClientOnly>
                <div data-testid="child-component">Child Component</div>
            </ClientOnly>
        );

        act(() => {
            vi.runAllTimers();
        });

        const i18nextProviders = screen.getAllByTestId('i18next-provider');
        expect(i18nextProviders.length).toBe(1);

        const childComponent = i18nextProviders[0].querySelector(
            '[data-testid="child-component"]'
        );
        expect(childComponent).not.toBeNull();
        expect(childComponent?.tagName).toBe('DIV');
    });
});
