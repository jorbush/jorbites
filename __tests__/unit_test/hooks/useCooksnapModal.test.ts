import { describe, it, expect, beforeEach } from 'vitest';
import useCooksnapModal from '@/app/hooks/useCooksnapModal';

describe('useCooksnapModal', () => {
    beforeEach(() => {
        useCooksnapModal.setState({
            isOpen: false,
            recipeId: null,
            recipeTitle: null,
        });
    });

    it('initializes with default closed state', () => {
        const state = useCooksnapModal.getState();
        expect(state.isOpen).toBe(false);
        expect(state.recipeId).toBeNull();
        expect(state.recipeTitle).toBeNull();
    });

    it('opens modal with recipeId and title', () => {
        useCooksnapModal.getState().onOpen('recipe-123', 'Paella Valenciana');

        const state = useCooksnapModal.getState();
        expect(state.isOpen).toBe(true);
        expect(state.recipeId).toBe('recipe-123');
        expect(state.recipeTitle).toBe('Paella Valenciana');
    });

    it('closes modal and clears state', () => {
        useCooksnapModal.getState().onOpen('recipe-123', 'Paella');
        useCooksnapModal.getState().onClose();

        const state = useCooksnapModal.getState();
        expect(state.isOpen).toBe(false);
        expect(state.recipeId).toBeNull();
        expect(state.recipeTitle).toBeNull();
    });
});
