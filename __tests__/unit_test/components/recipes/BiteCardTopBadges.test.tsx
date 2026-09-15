import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import BiteCardTopBadges from '@/app/components/recipes/BiteCardTopBadges';

describe('<BiteCardTopBadges />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders rating, minutes, and calories when provided', () => {
        render(
            <BiteCardTopBadges
                averageRating={4.8}
                minutes={20}
                calories={350}
            />
        );

        expect(screen.getByText('4.8')).toBeDefined();
        expect(screen.getByText('20 min')).toBeDefined();
        expect(screen.getByText('350 kcal')).toBeDefined();
    });

    it('omits rating and calories when absent or zero', () => {
        render(
            <BiteCardTopBadges
                averageRating={0}
                minutes={15}
                calories={null}
            />
        );

        expect(screen.queryByText('0.0')).toBeNull();
        expect(screen.getByText('15 min')).toBeDefined();
        expect(screen.queryByText(/kcal/)).toBeNull();
    });
});
