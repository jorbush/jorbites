import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { PlanningActions } from '@/app/components/plannings/PlanningActions';

describe('PlanningActions', () => {
    const t = (key: string) => key;
    const onShoppingListOpen = vi.fn();
    const onCalendarExportOpen = vi.fn();
    const onPlanningModalOpen = vi.fn();
    const handleSaveToggle = vi.fn();
    const share = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correct action buttons for owner', () => {
        render(
            <PlanningActions
                statusFlags={{
                    isOwner: true,
                    isPrivate: false,
                    isSaved: false,
                    isSaving: false,
                }}
                editedName="Weekly Keto"
                onShoppingListOpen={onShoppingListOpen}
                onCalendarExportOpen={onCalendarExportOpen}
                onPlanningModalOpen={onPlanningModalOpen}
                handleSaveToggle={handleSaveToggle}
                share={share}
                t={t}
            />
        );

        expect(screen.getByTestId('shopping-list-button')).toBeDefined();
        expect(screen.getByTestId('export-calendar-button')).toBeDefined();
        expect(screen.getByTestId('share-button')).toBeDefined();
        expect(screen.getByTestId('edit-plan-button')).toBeDefined();
        expect(screen.queryByTestId('save-plan-button')).toBeNull();
    });

    it('renders correct action buttons for guest user', () => {
        render(
            <PlanningActions
                statusFlags={{
                    isOwner: false,
                    isPrivate: false,
                    isSaved: false,
                    isSaving: false,
                }}
                editedName="Weekly Keto"
                onShoppingListOpen={onShoppingListOpen}
                onCalendarExportOpen={onCalendarExportOpen}
                onPlanningModalOpen={onPlanningModalOpen}
                handleSaveToggle={handleSaveToggle}
                share={share}
                t={t}
            />
        );

        expect(screen.getByTestId('shopping-list-button')).toBeDefined();
        expect(screen.getByTestId('export-calendar-button')).toBeDefined();
        expect(screen.getByTestId('share-button')).toBeDefined();
        expect(screen.queryByTestId('edit-plan-button')).toBeNull();
        expect(screen.getByTestId('save-plan-button')).toBeDefined();
    });

    it('renders lock icon and calls togglePrivacy when clicked for owner', () => {
        const togglePrivacy = vi.fn();
        const { unmount } = render(
            <PlanningActions
                statusFlags={{
                    isOwner: true,
                    isPrivate: true,
                    isSaved: false,
                    isSaving: false,
                }}
                editedName="Weekly Keto"
                onShoppingListOpen={onShoppingListOpen}
                onCalendarExportOpen={onCalendarExportOpen}
                onPlanningModalOpen={onPlanningModalOpen}
                handleSaveToggle={handleSaveToggle}
                togglePrivacy={togglePrivacy}
                share={share}
                t={t}
            />
        );

        expect(screen.getByTestId('lock-icon')).toBeDefined();
        const lockBtn = screen.getByRole('button', { name: 'private' });
        fireEvent.click(lockBtn);
        expect(togglePrivacy).toHaveBeenCalledTimes(1);

        unmount();

        render(
            <PlanningActions
                statusFlags={{
                    isOwner: true,
                    isPrivate: false,
                    isSaved: false,
                    isSaving: false,
                }}
                editedName="Weekly Keto"
                onShoppingListOpen={onShoppingListOpen}
                onCalendarExportOpen={onCalendarExportOpen}
                onPlanningModalOpen={onPlanningModalOpen}
                handleSaveToggle={handleSaveToggle}
                togglePrivacy={togglePrivacy}
                share={share}
                t={t}
            />
        );

        expect(screen.getByTestId('lock-open-icon')).toBeDefined();
    });

    it('renders delete button for owner when onDelete is provided', () => {
        const onDelete = vi.fn();
        render(
            <PlanningActions
                statusFlags={{
                    isOwner: true,
                    isPrivate: false,
                    isSaved: false,
                    isSaving: false,
                }}
                editedName="Weekly Keto"
                onShoppingListOpen={onShoppingListOpen}
                onCalendarExportOpen={onCalendarExportOpen}
                onPlanningModalOpen={onPlanningModalOpen}
                handleSaveToggle={handleSaveToggle}
                onDelete={onDelete}
                share={share}
                t={t}
            />
        );

        const deleteBtn = screen.getByTestId('delete-plan-button');
        expect(deleteBtn).toBeDefined();
        fireEvent.click(deleteBtn);
        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});
