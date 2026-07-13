import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import IngredientsStep from '@/app/components/modals/recipe-steps/IngredientsStep';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key,
    })),
}));

// Mock Heading component
vi.mock('@/app/components/navigation/Heading', () => ({
    default: ({ title }: { title: string }) => (
        <div data-testid="heading">
            <h2>{title}</h2>
        </div>
    ),
}));

// Mock Input component
vi.mock('@/app/components/inputs/Input', () => ({
    default: ({ id, required, maxLength, dataCy }: any) => (
        <div data-testid={dataCy || `input-${id}`}>
            <input
                id={id}
                required={required}
                maxLength={maxLength}
                data-testid={`${id}-field`}
            />
        </div>
    ),
}));

// Mock Textarea component
vi.mock('@/app/components/inputs/Textarea', () => ({
    default: ({ id, rows, dataCy, placeholder }: any) => (
        <div data-testid={dataCy || `textarea-${id}`}>
            <textarea
                id={id}
                rows={rows}
                placeholder={placeholder}
                data-testid={`${id}-field`}
            />
        </div>
    ),
}));

// Mock ToggleSwitch component
vi.mock('@/app/components/inputs/ToggleSwitch', () => ({
    default: ({ checked, onChange, label, dataCy }: any) => (
        <div data-testid="toggle-switch-container">
            <span>{label}</span>
            <button
                data-testid="toggle-input-mode"
                data-cy={dataCy}
                onClick={onChange}
                role="switch"
                aria-checked={checked}
            >
                {checked ? 'ON' : 'OFF'}
            </button>
        </div>
    ),
}));

// Mock Button component
vi.mock('@/app/components/buttons/Button', () => ({
    default: ({ label, onClick, dataCy }: any) => (
        <button data-testid={dataCy} onClick={onClick}>
            {label}
        </button>
    ),
}));

// Mock constants
vi.mock('@/app/utils/constants', () => ({
    RECIPE_INGREDIENT_MAX_LENGTH: 200,
    RECIPE_MAX_INGREDIENTS: 20,
    CHAR_COUNT_WARNING_THRESHOLD: 0.8,
}));

// Mock AiFillDelete icon
vi.mock('react-icons/ai', () => ({
    AiFillDelete: ({ onClick, className, ...props }: any) => (
        <button
            data-testid={props['data-testid']}
            onClick={onClick}
            className={className}
        >
            Delete
        </button>
    ),
}));

// Mock FaCamera icon
vi.mock('react-icons/fa', () => ({
    FaCamera: ({ className }: any) => (
        <svg data-testid="fa-camera-icon" className={className} />
    ),
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

import useOcrScan from '@/app/hooks/useOcrScan';

describe('<IngredientsStep /> OCR integration', () => {
    const mockRegister = vi.fn();
    const mockGetValues = vi.fn();
    const mockSetValue = vi.fn();
    const mockSetInputMode = vi.fn();

    const textModeProps = {
        numIngredients: 1,
        register: mockRegister,
        errors: {},
        onAddIngredient: vi.fn(),
        onRemoveIngredient: vi.fn(),
        onSetIngredients: vi.fn(),
        getValues: mockGetValues,
        setValue: mockSetValue,
        inputMode: 'text' as const,
        setInputMode: mockSetInputMode,
    };

    const listModeProps = {
        ...textModeProps,
        inputMode: 'list' as const,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useOcrScan).mockReturnValue({
            isScanning: false,
            scanProgress: 0,
            triggerScan: mockTriggerScan,
            fileInputRef: mockFileInputRef as any,
            handleFileChange: mockHandleFileChange,
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('shows the OCR scan button when in text mode', () => {
        render(<IngredientsStep {...textModeProps} />);

        const scanButton = screen.getByTestId('ocr-scan-button');
        expect(scanButton).toBeDefined();
        expect(screen.getByTestId('fa-camera-icon')).toBeDefined();
    });

    it('ALSO shows the OCR scan button when in list mode', () => {
        render(<IngredientsStep {...listModeProps} />);

        const scanButton = screen.getByTestId('ocr-scan-button');
        expect(scanButton).toBeDefined();
        expect(screen.getByTestId('fa-camera-icon')).toBeDefined();
    });

    it('shows the hidden file input when in text mode', () => {
        render(<IngredientsStep {...textModeProps} />);

        const fileInput = screen.getByTestId('ocr-file-input');
        expect(fileInput).toBeDefined();
        expect(fileInput.getAttribute('type')).toBe('file');
        expect(fileInput.getAttribute('accept')).toBe('image/*');
        expect(fileInput.getAttribute('capture')).toBe('environment');
    });

    it('calls triggerScan when the scan button is clicked', () => {
        render(<IngredientsStep {...textModeProps} />);

        const scanButton = screen.getByTestId('ocr-scan-button');
        scanButton.click();

        expect(mockTriggerScan).toHaveBeenCalledTimes(1);
    });

    it('shows scanning state when isScanning is true', () => {
        vi.mocked(useOcrScan).mockReturnValue({
            isScanning: true,
            scanProgress: 45,
            triggerScan: mockTriggerScan,
            fileInputRef: mockFileInputRef as any,
            handleFileChange: mockHandleFileChange,
        });

        render(<IngredientsStep {...textModeProps} />);

        const scanButton = screen.getByTestId('ocr-scan-button');
        expect(scanButton.getAttribute('disabled')).toBe('');
        expect(screen.getByText('45')).toBeDefined();
        expect(screen.queryByTestId('fa-camera-icon')).toBeNull();
    });

    it('does not show progress text overlay when progress is 0', () => {
        vi.mocked(useOcrScan).mockReturnValue({
            isScanning: true,
            scanProgress: 0,
            triggerScan: mockTriggerScan,
            fileInputRef: mockFileInputRef as any,
            handleFileChange: mockHandleFileChange,
        });

        render(<IngredientsStep {...textModeProps} />);

        expect(screen.queryByText('0')).toBeNull();
        expect(screen.queryByText('scanning_text')).toBeNull();
    });

    it('has correct aria-label for accessibility', () => {
        render(<IngredientsStep {...textModeProps} />);

        const scanButton = screen.getByTestId('ocr-scan-button');
        expect(scanButton.getAttribute('aria-label')).toBe('scan_handwriting');
    });

    it('switches to plain text mode and appends text when onResult is called', () => {
        let capturedOnResult: any;
        vi.mocked(useOcrScan).mockImplementation(({ onResult }) => {
            capturedOnResult = onResult;
            return {
                isScanning: false,
                scanProgress: 0,
                triggerScan: mockTriggerScan,
                fileInputRef: mockFileInputRef as any,
                handleFileChange: mockHandleFileChange,
            };
        });

        render(<IngredientsStep {...listModeProps} />);

        act(() => {
            capturedOnResult('Scanned ingredients text');
        });

        expect(mockSetValue).toHaveBeenCalledWith('ingredients-plain-text', 'Scanned ingredients text');
        expect(mockSetInputMode).toHaveBeenCalledWith('text');
    });
});
