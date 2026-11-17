import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FieldValues, UseFormRegister } from 'react-hook-form';
import QuestModalBody from '@/app/components/modals/quest/QuestModalBody';
import { QUEST_TITLE_MAX_LENGTH } from '@/app/utils/constants';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<QuestModalBody />', () => {
    const mockRegister = vi.fn((name: string) => ({
        name,
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
    })) as unknown as UseFormRegister<FieldValues>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders heading, title input, and description field in create mode', () => {
        render(
            <QuestModalBody
                title="Request a Recipe"
                subtitle="Tell the community what recipe you would like to see"
                isEditMode={false}
                isLoading={false}
                register={mockRegister}
                errors={{}}
                statusValue="open"
            />
        );

        expect(screen.getByText('Request a Recipe')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Tell the community what recipe you would like to see'
            )
        ).toBeInTheDocument();

        const titleInput = screen.getByLabelText('title');
        expect(titleInput).toHaveAttribute('data-cy', 'quest-title');
        expect(screen.getByLabelText('description')).toBeInTheDocument();
        expect(screen.queryByLabelText('status')).toBeNull();

        expect(mockRegister).toHaveBeenCalledWith('title', {
            required: 'title_required',
            maxLength: {
                value: QUEST_TITLE_MAX_LENGTH,
                message: 'title_max_length',
            },
        });
    });

    it('renders edit fields when isEditMode is true', () => {
        render(
            <QuestModalBody
                title="Edit Quest"
                subtitle="Update your recipe request"
                isEditMode={true}
                isLoading={false}
                register={mockRegister}
                errors={{}}
                statusValue="completed"
                recipes={[
                    {
                        id: 'r-1',
                        title: 'Curry Bowl',
                        userId: 'u-1',
                    },
                ]}
            />
        );

        expect(screen.getByLabelText('status')).toBeInTheDocument();
        expect(screen.getByLabelText('accepted_recipe')).toBeInTheDocument();
    });

    it('disables form controls while loading', () => {
        render(
            <QuestModalBody
                title="Edit Quest"
                subtitle="Update your recipe request"
                isEditMode={true}
                isLoading={true}
                register={mockRegister}
                errors={{}}
                statusValue="open"
            />
        );

        expect(screen.getByLabelText('title')).toBeDisabled();
        expect(screen.getByLabelText('description')).toBeDisabled();
        expect(screen.getByLabelText('status')).toBeDisabled();
    });
});
