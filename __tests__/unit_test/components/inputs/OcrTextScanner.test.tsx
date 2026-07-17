import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OcrTextScanner from '@/app/components/inputs/OcrTextScanner';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key,
    })),
}));

// Mock useOcrScan hook
const mockTriggerScan = vi.fn();
const mockHandleFileChange = vi.fn();
const mockFileInputRef = { current: null };

vi.mock('@/app/hooks/useOcrScan', () => ({
    default: vi.fn(() => ({
        isScanning: false,
        scanProgress: 0,
        triggerScan: mockTriggerScan,
        fileInputRef: mockFileInputRef,
        handleFileChange: mockHandleFileChange,
    })),
}));

// Mock FaCamera icon
vi.mock('react-icons/fa', () => ({
    FaCamera: ({ className }: any) => (
        <svg
            data-testid="fa-camera-icon"
            className={className}
        />
    ),
}));

import useOcrScan from '@/app/hooks/useOcrScan';

describe('<OcrTextScanner />', () => {
    const mockOnResult = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly with default state', () => {
        render(<OcrTextScanner onResult={mockOnResult} />);

        expect(screen.getByTestId('ocr-scan-button')).toBeDefined();
        expect(screen.getByTestId('fa-camera-icon')).toBeDefined();
        expect(screen.getByTestId('ocr-file-input')).toBeDefined();
    });

    it('calls triggerScan when scan button is clicked', () => {
        render(<OcrTextScanner onResult={mockOnResult} />);

        const scanButton = screen.getByTestId('ocr-scan-button');
        scanButton.click();

        expect(mockTriggerScan).toHaveBeenCalledTimes(1);
    });

    it('shows scanning loader when isScanning is true', () => {
        vi.mocked(useOcrScan).mockReturnValue({
            isScanning: true,
            scanProgress: 50,
            triggerScan: mockTriggerScan,
            fileInputRef: mockFileInputRef as any,
            handleFileChange: mockHandleFileChange,
        });

        render(<OcrTextScanner onResult={mockOnResult} />);

        const scanButton = screen.getByTestId('ocr-scan-button');
        expect(scanButton.getAttribute('disabled')).toBe('');
        expect(screen.getByText('50')).toBeDefined();
        expect(screen.queryByTestId('fa-camera-icon')).toBeNull();
    });

    it('does not show progress text overlay when scanProgress is 0', () => {
        vi.mocked(useOcrScan).mockReturnValue({
            isScanning: true,
            scanProgress: 0,
            triggerScan: mockTriggerScan,
            fileInputRef: mockFileInputRef as any,
            handleFileChange: mockHandleFileChange,
        });

        render(<OcrTextScanner onResult={mockOnResult} />);

        const scanButton = screen.getByTestId('ocr-scan-button');
        expect(scanButton.getAttribute('disabled')).toBe('');
        expect(screen.queryByText('0')).toBeNull();
        expect(screen.queryByText('scanning_text')).toBeNull();
    });
});
