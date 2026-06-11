import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TranslationControls from '@/app/components/translation/TranslationControls';

describe('TranslationControls', () => {
    afterEach(() => {
        cleanup();
    });

    const mockT = (key: string) => key;

    it('returns null if showTranslateButton is false', () => {
        const { container } = render(
            <TranslationControls
                showTranslateButton={false}
                isTranslated={false}
                isTranslating={false}
                onTranslate={vi.fn()}
                onShowOriginal={vi.fn()}
                t={mockT}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders translate button when not translated', () => {
        const mockTranslate = vi.fn();
        render(
            <TranslationControls
                showTranslateButton={true}
                isTranslated={false}
                isTranslating={false}
                onTranslate={mockTranslate}
                onShowOriginal={vi.fn()}
                t={mockT}
            />
        );
        const button = screen.getByRole('button', { name: 'translate' });
        expect(button).toBeDefined();
        button.click();
        expect(mockTranslate).toHaveBeenCalledTimes(1);
    });

    it('renders translating state correctly', () => {
        render(
            <TranslationControls
                showTranslateButton={true}
                isTranslated={false}
                isTranslating={true}
                onTranslate={vi.fn()}
                onShowOriginal={vi.fn()}
                t={mockT}
            />
        );
        expect(screen.getByText('translating')).toBeDefined();
        const button = screen.getByRole('button', { name: 'translate' });
        expect(button.hasAttribute('disabled')).toBe(true);
    });

    it('renders show original button when translated', () => {
        const mockShowOriginal = vi.fn();
        render(
            <TranslationControls
                showTranslateButton={true}
                isTranslated={true}
                isTranslating={false}
                onTranslate={vi.fn()}
                onShowOriginal={mockShowOriginal}
                t={mockT}
            />
        );
        const button = screen.getByRole('button');
        expect(screen.getByText('show_original')).toBeDefined();
        button.click();
        expect(mockShowOriginal).toHaveBeenCalledTimes(1);
    });
});
