import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Container from '@/app/components/Container';

describe('<Container />', () => {
    it('renders children correctly', () => {
        render(
            <Container>
                <div data-testid="child">Test Child</div>
            </Container>
        );

        const child = screen.getByTestId('child');
        expect(child).toBeDefined();
        expect(child.textContent).toBe('Test Child');
    });

    it('applies correct CSS classes', () => {
        render(
            <Container>
                <div>Test Content</div>
            </Container>
        );

        const container =
            screen.getByText('Test Content').parentElement;
        expect(container).toBeDefined();
        expect(container?.className).toContain('mx-auto');
        expect(container?.className).toContain(
            'max-w-[2520px]'
        );
        expect(container?.className).toContain('px-4');
        expect(container?.className).toContain('sm:px-2');
        expect(container?.className).toContain('md:px-10');
        expect(container?.className).toContain('xl:px-20');
    });

    it('renders multiple children', () => {
        render(
            <Container>
                <div data-testid="child1">Child 1</div>
                <div data-testid="child2">Child 2</div>
            </Container>
        );

        expect(screen.getByTestId('child1')).toBeDefined();
        expect(screen.getByTestId('child2')).toBeDefined();
    });
});
