import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SelectedQuestDisplay } from '@/app/components/modals/recipe-steps/SelectedQuestDisplay';

const mockT = (key: string) => key;

describe('SelectedQuestDisplay', () => {
    afterEach(() => {
        cleanup();
    });

    const mockQuest = {
        id: 'q1',
        title: 'Weekly Quest',
        description: 'Cook some awesome recipe with avocados.',
    };

    it('returns null if quest is null', () => {
        const { container } = render(
            <SelectedQuestDisplay
                selectedQuest={null}
                onRemoveQuest={vi.fn()}
                t={mockT}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders quest details and triggers remove callback', () => {
        const mockRemove = vi.fn();
        render(
            <SelectedQuestDisplay
                selectedQuest={mockQuest}
                onRemoveQuest={mockRemove}
                t={mockT}
            />
        );
        expect(screen.getByText('Weekly Quest')).toBeDefined();
        expect(
            screen.getByText('Cook some awesome recipe with avocados.')
        ).toBeDefined();
        const button = screen.getByRole('button');
        button.click();
        expect(mockRemove).toHaveBeenCalledTimes(1);
    });
});
