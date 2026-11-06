import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ViewTransition from '@/app/components/utils/ViewTransition';

describe('ViewTransition', () => {
    it('applies viewTransitionName and viewTransitionClass to element style', () => {
        render(
            <ViewTransition
                name="article-title-123"
                share="morph"
                default="none"
            >
                <h1 data-testid="title">Hello World</h1>
            </ViewTransition>
        );

        const el = screen.getByTestId('title');
        expect(el.style.viewTransitionName).toBe('article-title-123');
        expect((el.style as any).viewTransitionClass).toBe('morph');
    });

    it('renders transparently when no name is provided', () => {
        render(
            <ViewTransition>
                <h1 data-testid="title">Hello World</h1>
            </ViewTransition>
        );

        const el = screen.getByTestId('title');
        expect(el.style.viewTransitionName).toBe('');
    });
});
