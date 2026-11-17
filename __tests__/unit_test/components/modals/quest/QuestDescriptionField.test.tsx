import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import QuestDescriptionField from '@/app/components/modals/quest/QuestDescriptionField';
import { QUEST_DESCRIPTION_MAX_LENGTH } from '@/app/utils/constants';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<QuestDescriptionField />', () => {
    const mockRegister = vi.fn((name: string) => ({
        name,
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
    })) as unknown as UseFormRegister<FieldValues>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders label, textarea, and placeholder with validation rules', () => {
        render(
            <QuestDescriptionField
                register={mockRegister}
                errors={{}}
                disabled={false}
            />
        );

        const textarea = screen.getByLabelText('description');
        expect(textarea).toBeInTheDocument();
        expect(textarea.tagName).toBe('TEXTAREA');
        expect(textarea).toHaveAttribute('data-cy', 'quest-description');
        expect(textarea).toHaveAttribute(
            'placeholder',
            'quest_description_placeholder'
        );
        expect(textarea).not.toBeDisabled();

        expect(mockRegister).toHaveBeenCalledWith('description', {
            required: 'description_required',
            maxLength: {
                value: QUEST_DESCRIPTION_MAX_LENGTH,
                message: 'description_max_length',
            },
        });
    });

    it('disables textarea when disabled is true', () => {
        render(
            <QuestDescriptionField
                register={mockRegister}
                errors={{}}
                disabled={true}
            />
        );

        expect(screen.getByLabelText('description')).toBeDisabled();
    });

    it('renders validation error message and error border when errors.description is set', () => {
        const errors: FieldErrors = {
            description: {
                type: 'required',
                message: 'Description is required',
            },
        };

        render(
            <QuestDescriptionField
                register={mockRegister}
                errors={errors}
                disabled={false}
            />
        );

        expect(screen.getByText('Description is required')).toBeInTheDocument();
        expect(screen.getByLabelText('description').className).toContain(
            'border-rose-500'
        );
    });
});
