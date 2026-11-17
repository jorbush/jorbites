import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FieldValues, UseFormRegister } from 'react-hook-form';
import QuestEditFields from '@/app/components/modals/quest/QuestEditFields';
import { QuestRecipeReply } from '@/app/hooks/useQuestModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<QuestEditFields />', () => {
    const mockRegister = vi.fn((name: string) => ({
        name,
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
    })) as unknown as UseFormRegister<FieldValues>;

    const recipes: QuestRecipeReply[] = [
        {
            id: 'recipe-1',
            title: 'Miso Soup',
            userId: 'user-1',
            user: { name: 'Chef Bob' },
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders status select with open, in_progress, and completed options', () => {
        render(
            <QuestEditFields
                register={mockRegister}
                disabled={false}
                statusValue="open"
                recipes={recipes}
            />
        );

        const statusSelect = screen.getByLabelText('status');
        expect(statusSelect).toBeInTheDocument();
        expect(statusSelect).toHaveAttribute('data-cy', 'quest-status');
        expect(mockRegister).toHaveBeenCalledWith('status');

        expect(screen.getByRole('option', { name: 'open' })).toHaveValue(
            'open'
        );
        expect(screen.getByRole('option', { name: 'in_progress' })).toHaveValue(
            'in_progress'
        );
        expect(screen.getByRole('option', { name: 'completed' })).toHaveValue(
            'completed'
        );
        expect(screen.queryByLabelText('accepted_recipe')).toBeNull();
    });

    it('hides accepted recipe field when status is completed without recipes', () => {
        render(
            <QuestEditFields
                register={mockRegister}
                disabled={false}
                statusValue="completed"
                recipes={[]}
            />
        );

        expect(screen.queryByLabelText('accepted_recipe')).toBeNull();
    });

    it('renders accepted recipe field when status is completed and recipes exist', () => {
        render(
            <QuestEditFields
                register={mockRegister}
                disabled={false}
                statusValue="completed"
                recipes={recipes}
            />
        );

        expect(screen.getByLabelText('accepted_recipe')).toBeInTheDocument();
        expect(screen.getByText('Miso Soup (by Chef Bob)')).toBeInTheDocument();
    });

    it('disables status and accepted recipe fields when disabled is true', () => {
        render(
            <QuestEditFields
                register={mockRegister}
                disabled={true}
                statusValue="completed"
                recipes={recipes}
            />
        );

        expect(screen.getByLabelText('status')).toBeDisabled();
        expect(screen.getByLabelText('accepted_recipe')).toBeDisabled();
    });
});
