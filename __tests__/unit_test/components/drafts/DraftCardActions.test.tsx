import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DraftCardActions from '@/app/components/drafts/DraftCardActions';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => options?.defaultValue || key,
    }),
}));

describe('DraftCardActions', () => {
    it('renders duplicate and delete buttons, but not manage co-cooks when onManageCoCooks is undefined', () => {
        const onDuplicate = vi.fn();
        const onDelete = vi.fn();

        render(
            <DraftCardActions
                onDuplicate={onDuplicate}
                onDelete={onDelete}
            />
        );

        expect(
            screen.queryByTestId('draft-card-manage-collabs')
        ).not.toBeInTheDocument();
        expect(screen.getByTestId('draft-card-duplicate')).toBeInTheDocument();
        expect(screen.getByTestId('draft-card-delete')).toBeInTheDocument();
    });

    it('renders manage co-cooks button when onManageCoCooks is provided and handles clicks', () => {
        const onManageCoCooks = vi.fn();
        const onDuplicate = vi.fn();
        const onDelete = vi.fn();

        render(
            <DraftCardActions
                onManageCoCooks={onManageCoCooks}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
            />
        );

        const manageBtn = screen.getByTestId('draft-card-manage-collabs');
        expect(manageBtn).toBeInTheDocument();
        fireEvent.click(manageBtn);
        expect(onManageCoCooks).toHaveBeenCalledTimes(1);

        const duplicateBtn = screen.getByTestId('draft-card-duplicate');
        fireEvent.click(duplicateBtn);
        expect(onDuplicate).toHaveBeenCalledTimes(1);

        const deleteBtn = screen.getByTestId('draft-card-delete');
        fireEvent.click(deleteBtn);
        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});
