import { render, screen, cleanup, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AdProvider, useAds } from '@/app/providers/AdProvider';

describe('AdProvider', () => {
    let localStorageMock: { [key: string]: string } = {};

    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock = {};
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: vi.fn((key) => localStorageMock[key]),
                setItem: vi.fn((key, value) => {
                    localStorageMock[key] = value;
                }),
            },
            writable: true,
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    const TestComponent = () => {
        const { showAds, setShowAds, isLoading } = useAds();
        return (
            <div>
                <div data-testid="show-ads">{String(showAds)}</div>
                <div data-testid="is-loading">{String(isLoading)}</div>
                <button
                    data-testid="toggle-ads"
                    onClick={() => setShowAds(!showAds)}
                >
                    Toggle
                </button>
            </div>
        );
    };

    it('provides default values on initial render', async () => {
        await act(async () => {
            render(
                <AdProvider>
                    <TestComponent />
                </AdProvider>
            );
        });

        expect(screen.getByTestId('show-ads').textContent).toBe('false');
    });

    it('loads value from localStorage on mount', async () => {
        localStorageMock['jorbites_ads_enabled'] = 'true';

        await act(async () => {
            render(
                <AdProvider>
                    <TestComponent />
                </AdProvider>
            );
        });

        expect(screen.getByTestId('show-ads').textContent).toBe('true');
    });

    it('updates localStorage when setShowAds is called', async () => {
        await act(async () => {
            render(
                <AdProvider>
                    <TestComponent />
                </AdProvider>
            );
        });

        const toggleButton = screen.getByTestId('toggle-ads');

        await act(async () => {
            toggleButton.click();
        });

        expect(localStorageMock['jorbites_ads_enabled']).toBe('true');
        expect(screen.getByTestId('show-ads').textContent).toBe('true');
    });

    it('sets isLoading to false after mount', async () => {
        await act(async () => {
            render(
                <AdProvider>
                    <TestComponent />
                </AdProvider>
            );
        });

        expect(screen.getByTestId('is-loading').textContent).toBe('false');
    });

    it('throws error when useAds is used outside provider', () => {
        // Suppress console.error for this test
        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useAds must be used within an AdProvider');

        consoleErrorSpy.mockRestore();
    });
});
