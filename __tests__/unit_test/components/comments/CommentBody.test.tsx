import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommentBody from '@/app/components/comments/CommentBody';

vi.mock('@/app/utils/textFormatting', () => ({
    formatText: (text: string) => `formatted:${text}`,
}));

describe('CommentBody', () => {
    it('formats and renders string content with data-cy attribute', () => {
        render(<CommentBody content="Delicious recipe!" />);
        const p = screen.getByTestId
            ? screen.getByText('formatted:Delicious recipe!')
            : screen.getByText('formatted:Delicious recipe!');
        expect(p).toBeDefined();
        expect(p.getAttribute('data-cy')).toBe('comment-text');
    });

    it('renders non-string ReactNode content directly', () => {
        render(
            <CommentBody
                content={<span data-testid="custom-node">Custom Node</span>}
            />
        );
        expect(screen.getByTestId('custom-node')).toBeDefined();
    });
});
