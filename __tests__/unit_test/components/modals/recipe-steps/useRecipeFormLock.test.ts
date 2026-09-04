import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRecipeFormLock } from '@/app/components/modals/recipe-steps/useRecipeFormLock';
import { useRecipeLock } from '@/app/hooks/useRecipeLock';

vi.mock('@/app/hooks/useRecipeLock');

describe('useRecipeFormLock', () => {
    const mockIsLockedByOther = vi.fn();
    const mockWatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useRecipeLock as any).mockReturnValue({
            isLockedByOther: mockIsLockedByOther,
        });
    });

    it('does not engage locks for solo drafts without collaborators or invite tokens', () => {
        mockWatch.mockReturnValue(undefined);

        const { result } = renderHook(() =>
            useRecipeFormLock({
                recipeModal: {
                    isOpen: true,
                    isEditMode: false,
                    activeDraftId: 'solo-123',
                },
                draftData: { draftId: 'solo-123', type: 'solo' },
                coCooksIds: [],
                watch: mockWatch as any,
                step: 0,
                currentUser: { id: 'u1' } as any,
            })
        );

        expect(result.current.isCollaborativeSession).toBe(false);
        expect(useRecipeLock).toHaveBeenCalledWith(null, 'u1', null);
        expect(result.current.isCurrentStepLocked).toBe(false);
    });

    it('engages locks when draftType is shared and modal is open', () => {
        mockWatch.mockReturnValue(undefined);
        mockIsLockedByOther.mockReturnValue(true);

        const { result } = renderHook(() =>
            useRecipeFormLock({
                recipeModal: {
                    isOpen: true,
                    isEditMode: false,
                    activeDraftId: 'shared-456',
                },
                draftData: { draftId: 'shared-456', type: 'shared' },
                coCooksIds: [],
                watch: mockWatch as any,
                step: 2,
                currentUser: { id: 'u1' } as any,
            })
        );

        expect(result.current.isCollaborativeSession).toBe(true);
        expect(useRecipeLock).toHaveBeenCalledWith(
            'shared-456',
            'u1',
            'step:2'
        );
        expect(result.current.isCurrentStepLocked).toBe(true);
        expect(mockIsLockedByOther).toHaveBeenCalledWith('step:2');
    });

    it('engages locks when in recipe edit mode targeting editRecipeData.id', () => {
        mockWatch.mockReturnValue(undefined);
        mockIsLockedByOther.mockReturnValue(false);

        const { result } = renderHook(() =>
            useRecipeFormLock({
                recipeModal: {
                    isOpen: true,
                    isEditMode: true,
                    editRecipeData: { id: 'recipe-789' } as any,
                },
                draftData: null,
                coCooksIds: [],
                watch: mockWatch as any,
                step: 1,
                currentUser: { id: 'u1' } as any,
            })
        );

        expect(result.current.isCollaborativeSession).toBe(true);
        expect(result.current.lockTargetId).toBe('recipe-789');
        expect(useRecipeLock).toHaveBeenCalledWith(
            'recipe-789',
            'u1',
            'step:1'
        );
        expect(result.current.isCurrentStepLocked).toBe(false);
    });
});
