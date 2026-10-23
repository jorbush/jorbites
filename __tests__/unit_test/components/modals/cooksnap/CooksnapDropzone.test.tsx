import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'react-hot-toast';
import CooksnapDropzone from '@/app/components/modals/cooksnap/CooksnapDropzone';

vi.mock('react-hot-toast');

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: any) => {
            if (opts?.defaultValue) return opts.defaultValue;
            return key;
        },
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt }: any) => (
        <img
            src={src}
            alt={alt}
            data-testid="custom-proxy-image"
        />
    ),
}));

describe('CooksnapDropzone', () => {
    const mockOnFileSelected = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        window.URL.createObjectURL = vi.fn(
            () => 'blob:http://localhost/dish-photo'
        );
        window.URL.revokeObjectURL = vi.fn();
    });

    it('renders empty dropzone with upload prompt and hint', () => {
        render(<CooksnapDropzone onFileSelected={mockOnFileSelected} />);

        expect(screen.getByTestId('cooksnap-dropzone')).toBeInTheDocument();
        expect(screen.getByText('Upload dish photo')).toBeInTheDocument();
        expect(
            screen.getByText('Drag and drop or click to browse')
        ).toBeInTheDocument();
        expect(screen.getByTestId('TbPhotoPlus')).toBeInTheDocument();
        expect(screen.getByTestId('cooksnap-file-input')).toBeInTheDocument();
    });

    it('triggers file input click when dropzone is clicked', () => {
        render(<CooksnapDropzone onFileSelected={mockOnFileSelected} />);

        const fileInput = screen.getByTestId('cooksnap-file-input');
        const clickSpy = vi
            .spyOn(fileInput, 'click')
            .mockImplementation(() => {});

        const dropzone = screen.getByTestId('cooksnap-dropzone');
        fireEvent.click(dropzone);

        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('triggers file input click on Enter and Space key presses', () => {
        render(<CooksnapDropzone onFileSelected={mockOnFileSelected} />);

        const fileInput = screen.getByTestId('cooksnap-file-input');
        const clickSpy = vi
            .spyOn(fileInput, 'click')
            .mockImplementation(() => {});
        const dropzone = screen.getByTestId('cooksnap-dropzone');

        fireEvent.keyDown(dropzone, { key: 'Enter' });
        expect(clickSpy).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(dropzone, { key: ' ' });
        expect(clickSpy).toHaveBeenCalledTimes(2);

        fireEvent.keyDown(dropzone, { key: 'Escape' });
        expect(clickSpy).toHaveBeenCalledTimes(2);
    });

    it('selects valid image file and renders preview', () => {
        render(<CooksnapDropzone onFileSelected={mockOnFileSelected} />);

        const fileInput = screen.getByTestId('cooksnap-file-input');
        const file = new File(['image-content'], 'recipe-photo.png', {
            type: 'image/png',
        });

        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);
        expect(mockOnFileSelected).toHaveBeenCalledWith(file);

        const previewImg = screen.getByTestId('custom-proxy-image');
        expect(previewImg).toBeInTheDocument();
        expect(previewImg).toHaveAttribute(
            'src',
            'blob:http://localhost/dish-photo'
        );
        expect(screen.getByTestId('remove-cooksnap-photo')).toBeInTheDocument();
    });

    it('rejects invalid non-image file selection with error toast', () => {
        render(<CooksnapDropzone onFileSelected={mockOnFileSelected} />);

        const fileInput = screen.getByTestId('cooksnap-file-input');
        const pdfFile = new File(['pdf-content'], 'document.pdf', {
            type: 'application/pdf',
        });

        fireEvent.change(fileInput, { target: { files: [pdfFile] } });

        expect(toast.error).toHaveBeenCalledWith(
            'Please select a valid image file'
        );
        expect(mockOnFileSelected).not.toHaveBeenCalled();
        expect(
            screen.queryByTestId('custom-proxy-image')
        ).not.toBeInTheDocument();
    });

    it('handles drag over, drag leave, and drop events', () => {
        render(<CooksnapDropzone onFileSelected={mockOnFileSelected} />);

        const dropzone = screen.getByTestId('cooksnap-dropzone');

        fireEvent.dragOver(dropzone);
        expect(dropzone.className).toContain('border-green-450');

        fireEvent.dragLeave(dropzone);
        expect(dropzone.className).not.toContain('border-green-450');

        const file = new File(['dropped-image'], 'burger.jpg', {
            type: 'image/jpeg',
        });

        fireEvent.drop(dropzone, {
            dataTransfer: {
                files: [file],
            },
        });

        expect(mockOnFileSelected).toHaveBeenCalledWith(file);
        expect(screen.getByTestId('custom-proxy-image')).toBeInTheDocument();
    });

    it('removes photo when remove button is clicked and revokes object URL', () => {
        render(<CooksnapDropzone onFileSelected={mockOnFileSelected} />);

        const fileInput = screen.getByTestId('cooksnap-file-input');
        const file = new File(['content'], 'pasta.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(screen.getByTestId('remove-cooksnap-photo')).toBeInTheDocument();

        const removeBtn = screen.getByTestId('remove-cooksnap-photo');
        fireEvent.click(removeBtn);

        expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(
            'blob:http://localhost/dish-photo'
        );
        expect(mockOnFileSelected).toHaveBeenCalledWith(null);
        expect(
            screen.queryByTestId('custom-proxy-image')
        ).not.toBeInTheDocument();
        expect(screen.getByTestId('cooksnap-dropzone')).toBeInTheDocument();
    });

    it('disables remove button when disabled prop is true', () => {
        render(
            <CooksnapDropzone
                onFileSelected={mockOnFileSelected}
                disabled={true}
            />
        );

        const fileInput = screen.getByTestId('cooksnap-file-input');
        const file = new File(['content'], 'pasta.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        const removeBtn = screen.getByTestId('remove-cooksnap-photo');
        expect(removeBtn).toBeDisabled();
    });

    it('revokes object URL when unmounted with active preview', () => {
        const { unmount } = render(
            <CooksnapDropzone onFileSelected={mockOnFileSelected} />
        );

        const fileInput = screen.getByTestId('cooksnap-file-input');
        const file = new File(['content'], 'salad.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        unmount();

        expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(
            'blob:http://localhost/dish-photo'
        );
    });
});
