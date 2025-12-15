import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import LcpPreloader from '@/app/components/optimization/LcpPreloader';

// Mock React's useEffect to immediately execute the callback
vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
        ...actual,
        useEffect: vi.fn((callback) => callback()),
    };
});

describe('LcpPreloader', () => {
    // Global setup and teardown
    let originalCreateElement: typeof document.createElement;
    let originalAppendChild: typeof document.head.appendChild;
    let originalQuerySelector: typeof document.querySelector;
    let originalQuerySelectorAll: typeof document.querySelectorAll;
    let originalConsoleError: typeof console.error;
    let originalReadyState: string;
    let originalAddEventListener: typeof window.addEventListener;
    let originalRemoveEventListener: typeof window.removeEventListener;
    let originalLocation: Location;

    // Elements created for testsadds DOMContentLoaded listener when document not complete
    let createdLinks: Array<Partial<HTMLLinkElement>> = [];
    let appendedLinks: Array<any> = [];
    let removedLinks: number = 0;
    let domContentLoadedCallback: Function | null = null;

    beforeEach(() => {
        createdLinks = [];
        appendedLinks = [];
        removedLinks = 0;
        domContentLoadedCallback = null;

        // Save original implementations
        originalCreateElement = document.createElement;
        originalAppendChild = document.head.appendChild;
        originalQuerySelector = document.querySelector;
        originalQuerySelectorAll = document.querySelectorAll;
        originalConsoleError = console.error;
        originalReadyState = document.readyState;
        originalAddEventListener = window.addEventListener;
        originalRemoveEventListener = window.removeEventListener;
        originalLocation = window.location;

        // More specific mock for createElement that only captures links
        document.createElement = vi.fn((tag) => {
            if (tag === 'link') {
                const link = {
                    rel: '',
                    as: '',
                    href: '',
                    setAttribute: vi.fn(),
                };
                createdLinks.push(link);
                return link as unknown as HTMLElement;
            }
            return originalCreateElement.call(document, tag);
        });

        // Mock for appendChild
        document.head.appendChild = vi.fn(<T extends Node>(child: T) => {
            appendedLinks.push(child);
            return child;
        });

        // Mock for querySelector - always returns null (preconnect doesn't exist)
        document.querySelector = vi.fn(() => null);

        // Mock for querySelectorAll - returns a fake collection with forEach method
        document.querySelectorAll = vi.fn(() => {
            return {
                forEach: (cb: (el: any) => void) => {
                    // Simulate two elements that will be removed
                    const mockElements = [
                        {
                            remove: () => {
                                removedLinks++;
                            },
                        },
                        {
                            remove: () => {
                                removedLinks++;
                            },
                        },
                    ];
                    mockElements.forEach(cb);
                },
            } as unknown as NodeListOf<Element>;
        });

        // Mock for console.error
        console.error = vi.fn();

        // Mock for window.location.origin
        Object.defineProperty(window, 'location', {
            value: { origin: 'https://test-domain.com' },
            configurable: true,
        });

        // Set readyState as 'complete' by default
        Object.defineProperty(document, 'readyState', {
            value: 'complete',
            configurable: true,
        });

        // Mock for addEventListener and removeEventListener
        window.addEventListener = vi.fn((event, callback) => {
            if (event === 'DOMContentLoaded') {
                domContentLoadedCallback = callback as Function;
            }
        });

        window.removeEventListener = vi.fn((event, callback) => {
            if (
                event === 'DOMContentLoaded' &&
                callback === domContentLoadedCallback
            ) {
                domContentLoadedCallback = null;
            }
        });
    });

    afterEach(() => {
        // Restore original implementations
        document.createElement = originalCreateElement;
        document.head.appendChild = originalAppendChild;
        document.querySelector = originalQuerySelector;
        document.querySelectorAll = originalQuerySelectorAll;
        console.error = originalConsoleError;
        Object.defineProperty(document, 'readyState', {
            value: originalReadyState,
        });
        window.addEventListener = originalAddEventListener;
        window.removeEventListener = originalRemoveEventListener;
        Object.defineProperty(window, 'location', { value: originalLocation });

        // Clear mocks
        vi.clearAllMocks();
    });

    it('no render visible elements', () => {
        const { container } = render(
            <LcpPreloader imageUrl="https://example.com/image.jpg" />
        );
        expect(container.firstChild).toBeNull();
    });

    it('does nothing when imageUrl is empty', () => {
        // Reset mocks before this specific test to ensure clean counts
        vi.clearAllMocks();

        render(<LcpPreloader imageUrl="" />);

        // Check if link elements were created (which is what we really care about)
        expect(createdLinks.length).toBe(0);
        expect(appendedLinks.length).toBe(0);
    });

    it('creates preload link with correct attributes', () => {
        render(<LcpPreloader imageUrl="https://example.com/image.jpg" />);

        expect(createdLinks.length).toBeGreaterThan(0);

        const link = createdLinks[0];
        expect(link.rel).toBe('preload');
        expect(link.as).toBe('image');
        expect(link.href).toContain('/api/image-proxy');
        expect(link.href).toContain(
            'url=https%3A%2F%2Fexample.com%2Fimage.jpg'
        );
        expect(link.setAttribute).toHaveBeenCalledWith('fetchpriority', 'high');

        expect(appendedLinks).toContain(link);
    });

    it('removes existing preload links', () => {
        render(<LcpPreloader imageUrl="https://example.com/image.jpg" />);

        expect(document.querySelectorAll).toHaveBeenCalledWith(
            'link[rel="preload"][as="image"][href*="api/image-proxy"]'
        );
        expect(removedLinks).toBe(2);
    });

    it('does not create preconnect link when already present', () => {
        // Reset mocks and make querySelector return an element (preconnect already exists)
        vi.clearAllMocks();
        createdLinks = [];
        document.querySelector = vi.fn().mockReturnValue({ exists: true });

        render(<LcpPreloader imageUrl="https://example.com/image.jpg" />);

        // Should only create one link (preload)
        expect(createdLinks.length).toBe(1);
        expect(appendedLinks.length).toBe(1);
    });

    it('handles errors gracefully', () => {
        // Force an error in appendChild
        document.head.appendChild = vi.fn(() => {
            throw new Error('Test error');
        });

        render(<LcpPreloader imageUrl="https://example.com/image.jpg" />);

        expect(console.error).toHaveBeenCalledWith(
            'Error injecting preload:',
            expect.any(Error)
        );
    });
});
