import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

import useOcrScan from '@/app/hooks/useOcrScan';

describe('useOcrScan', () => {
    const mockOnResult = vi.fn();
    const globalFetch = global.fetch;

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock fetch
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, text: 'Detected OCR text' }),
        } as Response);
    });

    afterEach(() => {
        global.fetch = globalFetch;
        vi.restoreAllMocks();
    });

    it('returns initial state with isScanning false and scanProgress 0', () => {
        const { result } = renderHook(() =>
            useOcrScan({ onResult: mockOnResult })
        );

        expect(result.current.isScanning).toBe(false);
        expect(result.current.scanProgress).toBe(0);
        expect(result.current.fileInputRef).toBeDefined();
        expect(typeof result.current.triggerScan).toBe('function');
        expect(typeof result.current.handleFileChange).toBe('function');
    });

    it('triggerScan clicks the file input ref', () => {
        const { result } = renderHook(() =>
            useOcrScan({ onResult: mockOnResult })
        );

        const mockClick = vi.fn();
        Object.defineProperty(result.current.fileInputRef, 'current', {
            value: { click: mockClick },
            writable: true,
        });

        act(() => {
            result.current.triggerScan();
        });

        expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('does nothing if no file is selected', async () => {
        const { result } = renderHook(() =>
            useOcrScan({ onResult: mockOnResult })
        );

        const event = {
            target: { files: null, value: '' },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        await act(async () => {
            await result.current.handleFileChange(event);
        });

        expect(global.fetch).not.toHaveBeenCalled();
        expect(mockOnResult).not.toHaveBeenCalled();
    });

    it('performs OCR scan by calling Next.js API proxy and calls onResult with text', async () => {
        const { result } = renderHook(() =>
            useOcrScan({ onResult: mockOnResult })
        );

        const mockFile = new File(['test'], 'photo.jpg', {
            type: 'image/jpeg',
        });
        const event = {
            target: { files: [mockFile], value: 'photo.jpg' },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        await act(async () => {
            await result.current.handleFileChange(event);
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/ocr',
            expect.objectContaining({
                method: 'POST',
                body: expect.any(FormData),
            })
        );
        expect(mockOnResult).toHaveBeenCalledWith('Detected OCR text');
        expect(toast.success).toHaveBeenCalledWith('scan_complete');
        expect(result.current.isScanning).toBe(false);
    });

    it('shows error toast when no text is detected', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, text: '   ' }),
        } as Response);

        const { result } = renderHook(() =>
            useOcrScan({ onResult: mockOnResult })
        );

        const mockFile = new File(['test'], 'photo.jpg', {
            type: 'image/jpeg',
        });
        const event = {
            target: { files: [mockFile], value: 'photo.jpg' },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        await act(async () => {
            await result.current.handleFileChange(event);
        });

        expect(mockOnResult).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('scan_no_text');
    });

    it('shows error toast when OCR proxy request fails (status not ok)', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
        } as Response);

        const { result } = renderHook(() =>
            useOcrScan({ onResult: mockOnResult })
        );

        const mockFile = new File(['test'], 'photo.jpg', {
            type: 'image/jpeg',
        });
        const event = {
            target: { files: [mockFile], value: 'photo.jpg' },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        await act(async () => {
            await result.current.handleFileChange(event);
        });

        expect(mockOnResult).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('scan_failed');
        expect(result.current.isScanning).toBe(false);
    });

    it('shows error toast when fetch throws network error', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() =>
            useOcrScan({ onResult: mockOnResult })
        );

        const mockFile = new File(['test'], 'photo.jpg', {
            type: 'image/jpeg',
        });
        const event = {
            target: { files: [mockFile], value: 'photo.jpg' },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        await act(async () => {
            await result.current.handleFileChange(event);
        });

        expect(mockOnResult).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('scan_failed');
    });

    it('resets the file input value so the same file can be selected again', async () => {
        const { result } = renderHook(() =>
            useOcrScan({ onResult: mockOnResult })
        );

        const mockFile = new File(['test'], 'photo.jpg', {
            type: 'image/jpeg',
        });
        const target = { files: [mockFile], value: 'photo.jpg' };
        const event = {
            target,
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        await act(async () => {
            await result.current.handleFileChange(event);
        });

        expect(target.value).toBe('');
    });
});
