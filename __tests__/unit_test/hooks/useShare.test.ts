import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useShare from '@/app/hooks/useShare';
import { toast } from 'react-hot-toast';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('useShare', () => {
    const originalNavigator = global.navigator;
    const mockShare = vi.fn();
    const mockWriteText = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockShare.mockResolvedValue(undefined);
        mockWriteText.mockResolvedValue(undefined);

        // Mock navigator.clipboard
        Object.defineProperty(global.navigator, 'clipboard', {
            value: {
                writeText: mockWriteText,
            },
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        global.navigator = originalNavigator;
    });

    describe('copyToClipboard', () => {
        it('should copy the current URL to clipboard', async () => {
            const { result } = renderHook(() => useShare());

            await act(async () => {
                result.current.copyToClipboard();
            });

            expect(mockWriteText).toHaveBeenCalledWith(window.location.href);
            expect(toast.success).toHaveBeenCalledWith('link_copied');
        });

        it('should copy a custom URL to clipboard', async () => {
            const customUrl = 'https://example.com';
            const { result } = renderHook(() => useShare());

            await act(async () => {
                result.current.copyToClipboard(customUrl);
            });

            expect(mockWriteText).toHaveBeenCalledWith(customUrl);
            expect(toast.success).toHaveBeenCalledWith('link_copied');
        });

        it('should handle clipboard errors gracefully', async () => {
            const consoleErrorSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {});
            const clipboardError = new Error('Clipboard failed');
            mockWriteText.mockRejectedValue(clipboardError);

            const { result } = renderHook(() => useShare());

            await act(async () => {
                result.current.copyToClipboard();
            });

            expect(mockWriteText).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to copy to clipboard:',
                clipboardError
            );
            expect(toast.error).toHaveBeenCalledWith('copy_failed');

            consoleErrorSpy.mockRestore();
        });
    });

    describe('share', () => {
        it('should use Web Share API when available', async () => {
            Object.defineProperty(global.navigator, 'share', {
                value: mockShare,
                writable: true,
                configurable: true,
            });

            const { result } = renderHook(() => useShare());

            await act(async () => {
                result.current.share();
            });

            expect(mockShare).toHaveBeenCalledWith({
                title: document.title,
                url: window.location.href,
            });
            expect(mockWriteText).not.toHaveBeenCalled();
        });

        it('should use Web Share API with custom options', async () => {
            Object.defineProperty(global.navigator, 'share', {
                value: mockShare,
                writable: true,
                configurable: true,
            });

            const customOptions = {
                title: 'Custom Title',
                url: 'https://custom.url',
            };

            const { result } = renderHook(() => useShare());

            await act(async () => {
                result.current.share(customOptions);
            });

            expect(mockShare).toHaveBeenCalledWith(customOptions);
            expect(mockWriteText).not.toHaveBeenCalled();
        });

        it('should fallback to clipboard when Web Share API is not available', async () => {
            Object.defineProperty(global.navigator, 'share', {
                value: undefined,
                writable: true,
                configurable: true,
            });

            const { result } = renderHook(() => useShare());

            await act(async () => {
                result.current.share();
            });

            expect(mockWriteText).toHaveBeenCalledWith(window.location.href);
            expect(toast.success).toHaveBeenCalledWith('link_copied');
        });

        it('should fallback to clipboard with custom URL when Web Share API is not available', async () => {
            Object.defineProperty(global.navigator, 'share', {
                value: undefined,
                writable: true,
                configurable: true,
            });

            const customUrl = 'https://example.com';
            const { result } = renderHook(() => useShare());

            await act(async () => {
                result.current.share({ url: customUrl });
            });

            expect(mockWriteText).toHaveBeenCalledWith(customUrl);
            expect(toast.success).toHaveBeenCalledWith('link_copied');
        });

        it('should handle Web Share API errors gracefully', async () => {
            const consoleErrorSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {});
            const shareError = new Error('Share failed');
            mockShare.mockRejectedValue(shareError);

            Object.defineProperty(global.navigator, 'share', {
                value: mockShare,
                writable: true,
                configurable: true,
            });

            const { result } = renderHook(() => useShare());

            await act(async () => {
                result.current.share();
            });

            expect(mockShare).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error sharing:',
                shareError
            );

            consoleErrorSpy.mockRestore();
        });

        it('should silently ignore AbortError when user cancels share dialog', async () => {
            const consoleErrorSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {});
            const abortError = new DOMException('User canceled', 'AbortError');
            mockShare.mockRejectedValue(abortError);

            Object.defineProperty(global.navigator, 'share', {
                value: mockShare,
                writable: true,
                configurable: true,
            });

            const { result } = renderHook(() => useShare());

            await act(async () => {
                result.current.share();
            });

            expect(mockShare).toHaveBeenCalled();
            expect(consoleErrorSpy).not.toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });
    });
});
