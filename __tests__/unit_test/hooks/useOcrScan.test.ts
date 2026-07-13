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

// Mock tesseract.js
const mockRecognize = vi.fn();
const mockTerminate = vi.fn();
const mockCreateWorker = vi.fn();

vi.mock('tesseract.js', () => ({
    createWorker: (...args: any[]) => mockCreateWorker(...args),
}));

import useOcrScan from '@/app/hooks/useOcrScan';

describe('useOcrScan', () => {
    const mockOnResult = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockTerminate.mockResolvedValue(undefined);
        mockRecognize.mockResolvedValue({
            data: { text: 'Detected OCR text' },
        });
        mockCreateWorker.mockResolvedValue({
            recognize: mockRecognize,
            terminate: mockTerminate,
        });
    });

    afterEach(() => {
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
        // Simulate a ref with a click method
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

        expect(mockCreateWorker).not.toHaveBeenCalled();
        expect(mockOnResult).not.toHaveBeenCalled();
    });

    it('performs OCR scan and calls onResult with recognized text', async () => {
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

        expect(mockCreateWorker).toHaveBeenCalledWith(
            'eng+spa+cat',
            undefined,
            expect.objectContaining({ logger: expect.any(Function) })
        );
        expect(mockRecognize).toHaveBeenCalledWith(mockFile);
        expect(mockOnResult).toHaveBeenCalledWith('Detected OCR text');
        expect(toast.success).toHaveBeenCalledWith('scan_complete');
        expect(result.current.isScanning).toBe(false);
    });

    it('shows error toast when no text is detected', async () => {
        mockRecognize.mockResolvedValue({
            data: { text: '   ' },
        });

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

    it('shows error toast when OCR fails', async () => {
        mockCreateWorker.mockRejectedValue(new Error('Worker init failed'));

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

    it('terminates the worker after successful scan', async () => {
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

        expect(mockTerminate).toHaveBeenCalledTimes(1);
    });

    it('terminates the worker even on recognition error', async () => {
        const workerWithFailingRecognize = {
            recognize: vi
                .fn()
                .mockRejectedValue(new Error('Recognition failed')),
            terminate: mockTerminate,
        };
        mockCreateWorker.mockResolvedValue(workerWithFailingRecognize);

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

        expect(mockTerminate).toHaveBeenCalledTimes(1);
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
