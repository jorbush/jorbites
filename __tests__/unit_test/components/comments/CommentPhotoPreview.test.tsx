import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CommentPhotoPreview from '@/app/components/comments/CommentPhotoPreview';

describe('CommentPhotoPreview', () => {
    const mockOnRemove = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('returns null when previewUrl is null', () => {
        const { container } = render(
            <CommentPhotoPreview
                previewUrl={null}
                onRemove={mockOnRemove}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders photo preview when previewUrl is given', () => {
        render(
            <CommentPhotoPreview
                previewUrl="blob:http://localhost/test-image.jpg"
                onRemove={mockOnRemove}
            />
        );

        expect(screen.getByTestId('photo-preview')).toBeDefined();
        const img = screen.getByAltText('Remake preview');
        expect(img).toBeDefined();
        expect(img).toHaveProperty(
            'src',
            'blob:http://localhost/test-image.jpg'
        );
        expect(screen.getByTestId('remove-photo')).toBeDefined();
    });

    it('calls onRemove when remove button is clicked', () => {
        render(
            <CommentPhotoPreview
                previewUrl="blob:http://localhost/test-image.jpg"
                onRemove={mockOnRemove}
            />
        );

        fireEvent.click(screen.getByTestId('remove-photo'));
        expect(mockOnRemove).toHaveBeenCalledTimes(1);
    });
});
