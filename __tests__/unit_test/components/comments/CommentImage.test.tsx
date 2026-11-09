import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommentImage from '@/app/components/comments/CommentImage';

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        <img
            src={src}
            alt={alt}
            data-testid="mock-proxy-image"
        />
    ),
}));

vi.mock('@/app/components/modals/PhotoLightbox', () => ({
    default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
        isOpen ? (
            <div data-testid="lightbox-modal">
                <button
                    onClick={onClose}
                    data-testid="close-lightbox"
                >
                    Close
                </button>
            </div>
        ) : null,
}));

describe('CommentImage', () => {
    it('returns null when imageSrc is null or undefined', () => {
        const { container: nullContainer } = render(
            <CommentImage imageSrc={null} />
        );
        expect(nullContainer.firstChild).toBeNull();

        const { container: undefContainer } = render(
            <CommentImage imageSrc={undefined} />
        );
        expect(undefContainer.firstChild).toBeNull();
    });

    it('renders image thumbnail and opens lightbox when clicked', () => {
        render(<CommentImage imageSrc="https://example.com/proof.jpg" />);

        const button = screen.getByTestId('remake-photo-button');
        expect(button).toBeDefined();
        expect(button.getAttribute('data-cy')).toBe('remake-photo-button');
        expect(screen.getByTestId('mock-proxy-image')).toBeDefined();

        expect(screen.queryByTestId('lightbox-modal')).toBeNull();

        fireEvent.click(button);
        expect(screen.getByTestId('lightbox-modal')).toBeDefined();

        fireEvent.click(screen.getByTestId('close-lightbox'));
        expect(screen.queryByTestId('lightbox-modal')).toBeNull();
    });
});
