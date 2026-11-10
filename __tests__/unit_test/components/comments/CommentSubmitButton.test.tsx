import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CommentSubmitButton from '@/app/components/comments/CommentSubmitButton';

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

describe('CommentSubmitButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMounted = true;
        mockTranslate = (key: string) => key;
    });

    afterEach(() => {
        cleanup();
    });

    it('renders enabled submit button when comment is not empty and not submitting', () => {
        render(
            <CommentSubmitButton
                isSubmitting={false}
                commentEmpty={false}
            />
        );

        const button = screen.getByTestId('submit-comment');
        expect(button).toBeDefined();
        expect(button).toHaveProperty('disabled', false);
        expect(button.className).toContain('cursor-pointer');
    });

    it('disables button when commentEmpty is true', () => {
        render(
            <CommentSubmitButton
                isSubmitting={false}
                commentEmpty={true}
            />
        );

        const button = screen.getByTestId('submit-comment');
        expect(button).toHaveProperty('disabled', true);
        expect(button.className).toContain('cursor-not-allowed');
    });

    it('disables button when isSubmitting is true', () => {
        render(
            <CommentSubmitButton
                isSubmitting={true}
                commentEmpty={false}
            />
        );

        const button = screen.getByTestId('submit-comment');
        expect(button).toHaveProperty('disabled', true);
        expect(button.className).toContain('cursor-not-allowed');
    });

    it('uses translated label and aria-label when mounted', () => {
        mockTranslate = (key: string) => {
            if (key === 'submit_comment') return 'Publicar comentario';
            return key;
        };
        render(
            <CommentSubmitButton
                isSubmitting={false}
                commentEmpty={false}
            />
        );

        const button = screen.getByTestId('submit-comment');
        expect(button.getAttribute('aria-label')).toBe('Publicar comentario');
        expect(button.textContent).toContain('Publicar comentario');
    });

    it('falls back to default English strings when not mounted', () => {
        mockMounted = false;
        mockTranslate = (key: string) => {
            if (key === 'submit_comment') return 'Publicar comentario';
            return key;
        };
        render(
            <CommentSubmitButton
                isSubmitting={false}
                commentEmpty={false}
            />
        );

        const button = screen.getByTestId('submit-comment');
        expect(button.getAttribute('aria-label')).toBe('Submit comment');
        expect(button.textContent).toContain('Submit');
    });
});
