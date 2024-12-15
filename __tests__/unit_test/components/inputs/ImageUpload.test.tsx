import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ImageUpload from '@/app/components/inputs/ImageUpload';

// Define types for CldUploadWidget
type CldUploadWidgetProps = {
    onSuccess: (result: any) => void;
    children: (props: { open: () => void }) => React.ReactNode;
};

// Mock next-cloudinary
vi.mock('next-cloudinary', () => ({
    CldUploadWidget: ({ onSuccess, children }: CldUploadWidgetProps) => {
        const handleUpload = () => {
            onSuccess({
                info: {
                    secure_url: 'https://example.com/newimage.jpg',
                },
            });
        };
        return children({ open: handleUpload });
    },
}));

// Mock next/image
vi.mock('next/image', () => ({
    default: (props: any) => <img {...props} />,
}));

describe('ImageUpload', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly without a value', () => {
        render(
            <ImageUpload
                onChange={mockOnChange}
                value=""
            />
        );

        expect(screen.getByTestId('TbPhotoPlus')).toBeDefined();
        expect(screen.queryByRole('img')).toBeNull();
    });

    it('renders correctly with a value', () => {
        render(
            <ImageUpload
                onChange={mockOnChange}
                value="https://example.com/image.jpg"
            />
        );

        expect(screen.getByTestId('TbPhotoPlus')).toBeDefined();
        expect(screen.getByRole('img')).toBeDefined();
        expect(screen.getByRole('img')).toHaveProperty(
            'src',
            'https://example.com/image.jpg'
        );
    });

    it('calls onChange with the correct value when clicked', () => {
        render(
            <ImageUpload
                onChange={mockOnChange}
                value=""
            />
        );

        fireEvent.click(screen.getByTestId('TbPhotoPlus').parentElement!);
        expect(mockOnChange).toHaveBeenCalledWith(
            'https://example.com/newimage.jpg'
        );
    });
});
