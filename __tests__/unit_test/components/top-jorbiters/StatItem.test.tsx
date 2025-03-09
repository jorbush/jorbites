import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import StatItem from '@/app/components/stats/StatItem';

describe('<StatItem />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders with value and label', () => {
        render(
            <StatItem
                value={42}
                label="Recipes"
                flexDirection="row"
            />
        );
        expect(screen.getByText('42')).toBeDefined();
        expect(screen.getByText('Recipes')).toBeDefined();
    });

    it('applies row flex direction styles', () => {
        render(
            <StatItem
                value={42}
                label="Recipes"
                flexDirection="row"
            />
        );
        const container = screen.getByText('42').parentElement;
        expect(container?.className).toContain('flex-row');
        expect(screen.getByText('42').className).toContain('text-sm');
    });

    it('applies column flex direction styles', () => {
        render(
            <StatItem
                value={42}
                label="Recipes"
                flexDirection="col"
            />
        );
        const container = screen.getByText('42').parentElement;
        expect(container?.className).toContain('flex-col');
        expect(screen.getByText('42').className).toContain('text-lg');
    });

    it('handles zero value correctly', () => {
        render(
            <StatItem
                value={0}
                label="Recipes"
                flexDirection="row"
            />
        );
        expect(screen.getByText('0')).toBeDefined();
    });
});
