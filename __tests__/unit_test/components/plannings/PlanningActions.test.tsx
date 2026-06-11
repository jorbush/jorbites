import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
});
