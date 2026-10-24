import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PhotoLightbox from '@/app/components/modals/PhotoLightbox';

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt }: any) => (
        <img
            src={src}
            alt={alt}
            data-testid="lightbox-image"
        />
    ),
}));

describe('PhotoLightbox', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns null when isOpen is false', () => {
        const { container } = render(
            <PhotoLightbox
                src="https://images.example.com/photo.jpg"
                isOpen={false}
                onClose={mockOnClose}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('returns null when src is null or empty', () => {
        const { container } = render(
            <PhotoLightbox
                src={null}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders modal dialog and image when isOpen is true and src is provided', () => {
        render(
            <PhotoLightbox
                src="https://images.example.com/photo.jpg"
                alt="Delicious taco"
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-label', 'Delicious taco');

        const img = screen.getByTestId('lightbox-image');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute(
            'src',
            'https://images.example.com/photo.jpg'
        );
        expect(img).toHaveAttribute('alt', 'Delicious taco');
    });

    it('calls onClose when close button is clicked', () => {
        render(
            <PhotoLightbox
                src="https://images.example.com/photo.jpg"
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        const closeBtn = screen.getByLabelText('Close photo lightbox');
        fireEvent.click(closeBtn);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
        render(
            <PhotoLightbox
                src="https://images.example.com/photo.jpg"
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        const backdrop = screen.getByTestId('lightbox-modal');
        fireEvent.click(backdrop);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when inner content container is clicked', () => {
        render(
            <PhotoLightbox
                src="https://images.example.com/photo.jpg"
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        const img = screen.getByTestId('lightbox-image');
        fireEvent.click(img);

        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
        render(
            <PhotoLightbox
                src="https://images.example.com/photo.jpg"
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        const dialog = screen.getByRole('dialog');
        fireEvent.keyDown(dialog, { key: 'Escape' });

        expect(mockOnClose).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(dialog, { key: 'Enter' });
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('renders optional children content when provided', () => {
        render(
            <PhotoLightbox
                src="https://images.example.com/photo.jpg"
                isOpen={true}
                onClose={mockOnClose}
            >
                <div data-testid="lightbox-children">Cooksnap Details</div>
            </PhotoLightbox>
        );

        expect(screen.getByTestId('lightbox-children')).toBeInTheDocument();
        expect(screen.getByText('Cooksnap Details')).toBeInTheDocument();
    });
});
