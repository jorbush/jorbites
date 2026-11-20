import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FieldValues, UseFormRegister } from 'react-hook-form';
import QuestAcceptedRecipeField from '@/app/components/modals/quest/QuestAcceptedRecipeField';
import { QuestRecipeReply } from '@/app/hooks/useQuestModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<QuestAcceptedRecipeField />', () => {
    const mockRegister = vi.fn((name: string) => ({
        name,
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
    })) as unknown as UseFormRegister<FieldValues>;

    const recipes: QuestRecipeReply[] = [
        {
            id: 'recipe-1',
            title: 'Tonkotsu Ramen',
            userId: 'user-1',
            user: { name: 'Chef Alice' },
        },
        {
            id: 'recipe-2',
            title: 'Shoyu Ramen',
            userId: 'user-2',
            user: { name: null },
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders label, default option, and formatted recipe options', () => {
        render(
            <QuestAcceptedRecipeField
                recipes={recipes}
                register={mockRegister}
                disabled={false}
            />
        );

        const select = screen.getByLabelText('accepted_recipe');
        expect(select).toBeInTheDocument();
        expect(select).toHaveAttribute('data-cy', 'accepted-recipe-select');
        expect(select).not.toBeDisabled();
        expect(mockRegister).toHaveBeenCalledWith('recipeId');

        expect(
            screen.getByRole('option', { name: 'select_accepted_recipe' })
        ).toHaveValue('');
        expect(
            screen.getByRole('option', {
                name: 'Tonkotsu Ramen (by Chef Alice)',
            })
        ).toHaveValue('recipe-1');
        expect(screen.getByRole('option', { name: 'Shoyu Ramen' })).toHaveValue(
            'recipe-2'
        );
    });

    it('disables select when disabled is true', () => {
        render(
            <QuestAcceptedRecipeField
                recipes={recipes}
                register={mockRegister}
                disabled={true}
            />
        );

        expect(screen.getByLabelText('accepted_recipe')).toBeDisabled();
    });
});
