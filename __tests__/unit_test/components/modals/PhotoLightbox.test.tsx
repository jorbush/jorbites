import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import PhotoLightbox from '@/app/components/modals/PhotoLightbox';

describe('PhotoLightbox', () => {
    const defaultProps = {
        src: 'https://example.com/photo.jpg',
        alt: 'Test photo',
        isOpen: true,
        onClose: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('does not render when isOpen is false', () => {
        const { container } = render(
            <PhotoLightbox
                {...defaultProps}
                isOpen={false}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('does not render when src is null', () => {
        const { container } = render(
            <PhotoLightbox
                {...defaultProps}
                src={null}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders a semantic dialog element when open with valid src', () => {
        render(<PhotoLightbox {...defaultProps} />);
        const dialog = screen.getByTestId('lightbox-modal');
        expect(dialog.tagName.toLowerCase()).toBe('dialog');
        expect(dialog).toBeDefined();
        expect(dialog.getAttribute('open')).not.toBeNull();
        expect(dialog.getAttribute('aria-label')).toBe('Test photo');
    });

    it('calls onClose when close button is clicked', () => {
        const handleClose = vi.fn();
        render(
            <PhotoLightbox
                {...defaultProps}
                onClose={handleClose}
            />
        );

        const closeButton = screen.getByRole('button', {
            name: 'Close photo lightbox',
        });
        fireEvent.click(closeButton);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking backdrop button', () => {
        const handleClose = vi.fn();
        render(
            <PhotoLightbox
                {...defaultProps}
                onClose={handleClose}
            />
        );

        const backdrop = screen.getByTestId('lightbox-backdrop');
        fireEvent.click(backdrop);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when pressing Escape key on window', () => {
        const handleClose = vi.fn();
        render(
            <PhotoLightbox
                {...defaultProps}
                onClose={handleClose}
            />
        );

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
