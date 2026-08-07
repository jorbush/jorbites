import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { RecipeGanttPreSteps } from '@/app/components/recipes/gantt/RecipeGanttPreSteps';

describe('RecipeGanttPreSteps', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders null when preSteps is empty array', () => {
        const { container } = render(<RecipeGanttPreSteps preSteps={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders list of preSteps', () => {
        render(
            <RecipeGanttPreSteps
                preSteps={['Preheat oven to 350°F', 'Chop vegetables']}
            />
        );

        expect(screen.getByText('Preheat oven to 350°F')).toBeDefined();
        expect(screen.getByText('Chop vegetables')).toBeDefined();
    });
});
