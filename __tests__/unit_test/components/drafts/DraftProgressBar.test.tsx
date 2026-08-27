import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import DraftProgressBar from '@/app/components/drafts/DraftProgressBar';
import { DraftProgress } from '@/app/types/draft';

describe('DraftProgressBar', () => {
    it('renders 7 dots corresponding to total steps', () => {
        const mockProgress: DraftProgress = {
            completedSteps: 3,
            totalSteps: 7,
            percentage: 43,
            stepDetails: [
                { step: 0, name: 'Category', completed: true },
                { step: 1, name: 'Description', completed: true },
                { step: 2, name: 'Ingredients', completed: true },
                { step: 3, name: 'Method', completed: false },
                { step: 4, name: 'Steps', completed: false },
                { step: 5, name: 'Related', completed: false },
                { step: 6, name: 'Images', completed: false },
            ],
        };

        render(<DraftProgressBar progress={mockProgress} />);

        const container = screen.getByTestId('draft-progress-bar');
        expect(container).toBeInTheDocument();

        const dots = screen.getAllByTestId('draft-progress-dot');
        expect(dots.length).toBe(7);

        // First 3 should have green-450 class
        expect(dots[0].className).toContain('bg-green-450');
        expect(dots[1].className).toContain('bg-green-450');
        expect(dots[2].className).toContain('bg-green-450');

        // Remaining 4 should have neutral class
        expect(dots[3].className).toContain('bg-neutral-200');
        expect(dots[4].className).toContain('bg-neutral-200');
        expect(dots[5].className).toContain('bg-neutral-200');
        expect(dots[6].className).toContain('bg-neutral-200');
    });

    it('renders all completed dots when progress is 100%', () => {
        const mockProgress: DraftProgress = {
            completedSteps: 7,
            totalSteps: 7,
            percentage: 100,
            stepDetails: [
                { step: 0, name: 'Category', completed: true },
                { step: 1, name: 'Description', completed: true },
                { step: 2, name: 'Ingredients', completed: true },
                { step: 3, name: 'Method', completed: true },
                { step: 4, name: 'Steps', completed: true },
                { step: 5, name: 'Related', completed: true },
                { step: 6, name: 'Images', completed: true },
            ],
        };

        render(<DraftProgressBar progress={mockProgress} />);

        const dots = screen.getAllByTestId('draft-progress-dot');
        dots.forEach((dot) => {
            expect(dot.className).toContain('bg-green-450');
        });
    });
});
