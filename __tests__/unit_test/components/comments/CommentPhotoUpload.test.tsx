import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CommentPhotoUpload from '@/app/components/comments/CommentPhotoUpload';

let mockMounted = true;
let mockTranslate = (key: string) => key;

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => mockTranslate(key),
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => mockMounted,
}));

describe('CommentPhotoUpload', () => {
    const defaultProps = {
        selectedFile: null,
        onFileSelect: vi.fn(),
        fileInputRef: { current: null },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockMounted = true;
        mockTranslate = (key: string) => key;
    });

    afterEach(() => {
        cleanup();
    });

    it('renders file input and label with default inactive styling', () => {
        render(<CommentPhotoUpload {...defaultProps} />);

        const input = screen.getByTestId('cooked-photo-input');
        expect(input).toBeDefined();

        const label = input.nextElementSibling as HTMLElement;
        expect(label.className).toContain('border-neutral-200/80');
    });

    it('applies active styling when selectedFile is provided', () => {
        const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
        render(
            <CommentPhotoUpload
                {...defaultProps}
                selectedFile={file}
            />
        );

        const input = screen.getByTestId('cooked-photo-input');
        const label = input.nextElementSibling as HTMLElement;
        expect(label.className).toContain('border-green-450/40');
    });

    it('triggers onFileSelect when a file is chosen', () => {
        render(<CommentPhotoUpload {...defaultProps} />);

        const input = screen.getByTestId('cooked-photo-input');
        const file = new File(['food'], 'dinner.png', { type: 'image/png' });

        fireEvent.change(input, { target: { files: [file] } });
        expect(defaultProps.onFileSelect).toHaveBeenCalledTimes(1);
    });

    it('uses translated label when mounted', () => {
        mockTranslate = (key: string) =>
            key === 'add_photo' ? 'Añadir foto' : key;
        render(<CommentPhotoUpload {...defaultProps} />);

        const input = screen.getByTestId('cooked-photo-input');
        expect(input.getAttribute('aria-label')).toBe('Añadir foto');

        const label = input.nextElementSibling as HTMLElement;
        expect(label.getAttribute('title')).toBe('Añadir foto');
        expect(label.textContent).toContain('Añadir foto');
    });

    it('falls back to "Add photo" when not mounted', () => {
        mockMounted = false;
        mockTranslate = (key: string) =>
            key === 'add_photo' ? 'Añadir foto' : key;
        render(<CommentPhotoUpload {...defaultProps} />);

        const input = screen.getByTestId('cooked-photo-input');
        expect(input.getAttribute('aria-label')).toBe('Add photo');

        const label = input.nextElementSibling as HTMLElement;
        expect(label.getAttribute('title')).toBe('Add photo');
        expect(label.textContent).toContain('Add photo');
    });
});
