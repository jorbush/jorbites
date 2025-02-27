import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import RankIcon from '@/app/components/top-jorbiters/RankIcon';

describe('<RankIcon />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders trophy for first place', () => {
        render(<RankIcon rank={0} />);
        const icon = document.querySelector('svg');
        expect(icon).toBeDefined();
        expect(icon?.classList.contains('text-yellow-400')).toBeTruthy();
    });

    it('renders medal for second place', () => {
        render(<RankIcon rank={1} />);
        const icon = document.querySelector('svg');
        expect(icon).toBeDefined();
        expect(icon?.classList.contains('text-gray-400')).toBeTruthy();
    });

    it('renders medal for third place', () => {
        render(<RankIcon rank={2} />);
        const icon = document.querySelector('svg');
        expect(icon).toBeDefined();
        expect(icon?.classList.contains('text-amber-600')).toBeTruthy();
    });

    it('renders rank number for other positions', () => {
        render(<RankIcon rank={4} />);
        expect(screen.getByText('#5')).toBeDefined(); // rank + 1
    });
});
