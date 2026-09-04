import { describe, it, expect, beforeEach } from 'vitest';
import useRecipeModal from '@/app/hooks/useRecipeModal';

describe('useRecipeModal', () => {
    beforeEach(() => {
        useRecipeModal.getState().onClose();
    });

    it('initializes with closed state', () => {
        const state = useRecipeModal.getState();
        expect(state.isOpen).toBe(false);
        expect(state.isEditMode).toBe(false);
        expect(state.editRecipeData).toBeNull();
        expect(state.questId).toBeNull();
        expect(state.activeDraftId).toBeNull();
    });

    it('opens modal with onOpen', () => {
        useRecipeModal.getState().onOpen();
        const state = useRecipeModal.getState();
        expect(state.isOpen).toBe(true);
        expect(state.isEditMode).toBe(false);
    });

    it('opens modal for create with optional questId', () => {
        useRecipeModal.getState().onOpenCreate('quest-123');
        const state = useRecipeModal.getState();
        expect(state.isOpen).toBe(true);
        expect(state.questId).toBe('quest-123');
    });

    it('opens modal with draftId for solo drafts', () => {
        useRecipeModal.getState().onOpenDraft('draft-solo-1');
        const state = useRecipeModal.getState();
        expect(state.isOpen).toBe(true);
        expect(state.activeDraftId).toBe('draft-solo-1');
        expect(state.isEditMode).toBe(false);
    });

    it('opens modal with draftId for shared drafts', () => {
        useRecipeModal.getState().onOpenSharedDraft('draft-shared-1');
        const state = useRecipeModal.getState();
        expect(state.isOpen).toBe(true);
        expect(state.activeDraftId).toBe('draft-shared-1');
        expect(state.isEditMode).toBe(false);
    });

    it('preserves questId when opening in edit mode (M5)', () => {
        const recipeData = {
            id: 'rec-1',
            title: 'Quest Recipe',
            description: 'Delicious Quest Dish',
            method: 'Bake',
            imageSrc: 'http://img.com/1.jpg',
            ingredients: ['1 cup flour'],
            steps: ['Bake at 350'],
            minutes: 30,
            questId: 'quest-linked-456',
        };

        useRecipeModal.getState().onOpenEdit(recipeData);
        const state = useRecipeModal.getState();
        expect(state.isOpen).toBe(true);
        expect(state.isEditMode).toBe(true);
        expect(state.editRecipeData).toEqual(recipeData);
        expect(state.questId).toBe('quest-linked-456');
    });

    it('resets all state on onClose', () => {
        useRecipeModal.getState().onOpenCreate('quest-abc');
        useRecipeModal.getState().onClose();
        const state = useRecipeModal.getState();
        expect(state.isOpen).toBe(false);
        expect(state.isEditMode).toBe(false);
        expect(state.editRecipeData).toBeNull();
        expect(state.questId).toBeNull();
        expect(state.activeDraftId).toBeNull();
    });
});
