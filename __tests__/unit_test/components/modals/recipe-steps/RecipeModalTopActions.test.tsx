import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RecipeModalTopActions from '@/app/components/modals/recipe-steps/RecipeModalTopActions';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/components/utils/Tooltip', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('RecipeModalTopActions', () => {
    it('renders both action buttons: My Drafts and Save Draft', () => {
        const onSave = vi.fn();
        const onOpenDrafts = vi.fn();

        render(
            <RecipeModalTopActions
                onSaveDraft={onSave}
                onOpenDrafts={onOpenDrafts}
                hasDrafts={false}
            />
        );

        expect(
            screen.getByTestId('open-drafts-modal-button')
        ).toBeInTheDocument();
        expect(screen.getByTestId('load-draft-button')).toBeInTheDocument();
        expect(
            screen.queryByTestId('copy-co-cook-link-button')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('drafts-indicator-dot')
        ).not.toBeInTheDocument();
    });

    it('renders the drafts indicator dot when hasDrafts is true', () => {
        const onSave = vi.fn();
        const onOpenDrafts = vi.fn();

        render(
            <RecipeModalTopActions
                onSaveDraft={onSave}
                onOpenDrafts={onOpenDrafts}
                hasDrafts={true}
            />
        );

        expect(screen.getByTestId('drafts-indicator-dot')).toBeInTheDocument();
    });

    it('triggers onOpenDrafts when the drafts folder icon is clicked', () => {
        const onSave = vi.fn();
        const onOpenDrafts = vi.fn();

        render(
            <RecipeModalTopActions
                onSaveDraft={onSave}
                onOpenDrafts={onOpenDrafts}
                hasDrafts={true}
            />
        );

        fireEvent.click(screen.getByTestId('open-drafts-modal-button'));
        expect(onOpenDrafts).toHaveBeenCalledTimes(1);
    });

    it('triggers onSaveDraft when the save button is clicked', () => {
        const onSave = vi.fn();
        const onOpenDrafts = vi.fn();

        render(
            <RecipeModalTopActions
                onSaveDraft={onSave}
                onOpenDrafts={onOpenDrafts}
            />
        );

        fireEvent.click(screen.getByTestId('load-draft-button'));
        expect(onSave).toHaveBeenCalledTimes(1);
    });
});
