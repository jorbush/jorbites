import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecipeRelatedContent } from '@/app/components/modals/recipe-steps/useRecipeRelatedContent';
import { toast } from 'react-hot-toast';
import { SafeUser, SafeRecipe, SafeQuest } from '@/app/types';

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('swr', () => ({
    default: () => ({ data: null, isLoading: false }),
}));

describe('useRecipeRelatedContent', () => {
    const mockT = vi.fn((key: string) => key);
    const mockUpdateFormField = vi.fn();

    const sampleUser1: SafeUser = {
        id: 'user-1',
        name: 'Chef One',
        email: 'one@test.com',
        createdAt: '',
        updatedAt: '',
        favoriteIds: [],
    };

    const sampleUser2: SafeUser = {
        id: 'user-2',
        name: 'Chef Two',
        email: 'two@test.com',
        createdAt: '',
        updatedAt: '',
        favoriteIds: [],
    };

    const sampleRecipe1: SafeRecipe = {
        id: 'recipe-1',
        title: 'Tomato Soup',
        description: 'Warm soup',
        categories: ['Soup'],
        method: 'Stovetop',
        imageSrc: '',
        ingredients: [],
        steps: [],
        minutes: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'user-1',
        numLikes: 0,
    };

    const sampleQuest: SafeQuest = {
        id: 'quest-123',
        title: 'Master Chef Quest',
        description: 'Complete 3 Italian recipes',
        category: 'Cooking',
        xp: 100,
        badge: null,
        badgeId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalDays: 7,
        numParticipants: 10,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('adds and removes co-cooks and updates form fields', () => {
        let currentCoCooksIds: string[] = [];
        const updateField = vi.fn((field: string, val: any) => {
            if (field === 'coCooksIds') currentCoCooksIds = val;
        });

        const { result, rerender } = renderHook(
            (props: { coCooksIds: string[] }) =>
                useRecipeRelatedContent({
                    recipeModal: { isOpen: true, isEditMode: false },
                    coCooksIds: props.coCooksIds,
                    linkedRecipeIds: [],
                    updateFormField: updateField,
                    t: mockT,
                }),
            { initialProps: { coCooksIds: currentCoCooksIds } }
        );

        // Add first co-cook
        act(() => {
            result.current.addCoCook(sampleUser1);
        });

        expect(updateField).toHaveBeenCalledWith('coCooksIds', ['user-1']);
        rerender({ coCooksIds: currentCoCooksIds });
        expect(result.current.selectedCoCooks).toEqual([sampleUser1]);

        // Attempt duplicate add
        act(() => {
            result.current.addCoCook(sampleUser1);
        });
        expect(toast.error).toHaveBeenCalledWith('cook_already_added');

        // Add second co-cook
        act(() => {
            result.current.addCoCook(sampleUser2);
        });
        expect(updateField).toHaveBeenCalledWith('coCooksIds', [
            'user-1',
            'user-2',
        ]);
        rerender({ coCooksIds: currentCoCooksIds });
        expect(result.current.selectedCoCooks).toHaveLength(2);

        // Remove first co-cook
        act(() => {
            result.current.removeCoCook('user-1');
        });
        expect(updateField).toHaveBeenCalledWith('coCooksIds', ['user-2']);
    });

    it('enforces MAX_CO_COOKS limit of 4', () => {
        const { result } = renderHook(() =>
            useRecipeRelatedContent({
                recipeModal: { isOpen: true, isEditMode: false },
                coCooksIds: ['u1', 'u2', 'u3', 'u4'],
                linkedRecipeIds: [],
                updateFormField: mockUpdateFormField,
                t: mockT,
            })
        );

        act(() => {
            result.current.addCoCook(sampleUser1);
        });

        expect(toast.error).toHaveBeenCalledWith('max_cooks_reached');
        expect(mockUpdateFormField).not.toHaveBeenCalled();
    });

    it('adds and removes linked recipes and updates form fields', () => {
        let currentLinkedRecipeIds: string[] = [];
        const updateField = vi.fn((field: string, val: any) => {
            if (field === 'linkedRecipeIds') currentLinkedRecipeIds = val;
        });

        const { result, rerender } = renderHook(
            (props: { linkedRecipeIds: string[] }) =>
                useRecipeRelatedContent({
                    recipeModal: { isOpen: true, isEditMode: false },
                    coCooksIds: [],
                    linkedRecipeIds: props.linkedRecipeIds,
                    updateFormField: updateField,
                    t: mockT,
                }),
            { initialProps: { linkedRecipeIds: currentLinkedRecipeIds } }
        );

        act(() => {
            result.current.addLinkedRecipe(sampleRecipe1);
        });

        expect(updateField).toHaveBeenCalledWith('linkedRecipeIds', [
            'recipe-1',
        ]);
        rerender({ linkedRecipeIds: currentLinkedRecipeIds });
        expect(result.current.selectedLinkedRecipes).toEqual([sampleRecipe1]);

        // Attempt duplicate add
        act(() => {
            result.current.addLinkedRecipe(sampleRecipe1);
        });
        expect(toast.error).toHaveBeenCalledWith('recipe_already_added');

        // Remove linked recipe
        act(() => {
            result.current.removeLinkedRecipe('recipe-1');
        });
        expect(updateField).toHaveBeenCalledWith('linkedRecipeIds', []);
    });

    it('manages quest selection and removal', () => {
        let currentQuestId: string | undefined = undefined;
        const updateField = vi.fn((field: string, val: any) => {
            if (field === 'questId') currentQuestId = val;
        });

        const { result, rerender } = renderHook(
            (props: { questId?: string | null }) =>
                useRecipeRelatedContent({
                    recipeModal: { isOpen: true, isEditMode: false },
                    coCooksIds: [],
                    linkedRecipeIds: [],
                    questId: props.questId,
                    updateFormField: updateField,
                    t: mockT,
                }),
            { initialProps: { questId: currentQuestId } }
        );

        act(() => {
            result.current.selectQuest(sampleQuest);
        });

        expect(updateField).toHaveBeenCalledWith('questId', 'quest-123');
        rerender({ questId: 'quest-123' });
        expect(result.current.selectedQuest).toEqual(sampleQuest);

        act(() => {
            result.current.removeQuest();
        });

        expect(updateField).toHaveBeenCalledWith('questId', '');
        rerender({ questId: '' });
        expect(result.current.selectedQuest).toBeNull();
    });

    it('derives co-cooks and linked recipes from draftData', () => {
        const { result } = renderHook(() =>
            useRecipeRelatedContent({
                recipeModal: { isOpen: true, isEditMode: false },
                draftData: {
                    coCooks: [sampleUser1],
                    linkedRecipes: [sampleRecipe1],
                },
                coCooksIds: ['user-1'],
                linkedRecipeIds: ['recipe-1'],
                updateFormField: mockUpdateFormField,
                t: mockT,
            })
        );

        expect(result.current.selectedCoCooks).toEqual([sampleUser1]);
        expect(result.current.selectedLinkedRecipes).toEqual([sampleRecipe1]);
    });

    it('immediately derives selectedQuest from draftData.quest or editRecipeData.quest to prevent UI flicker', () => {
        const { result: draftResult } = renderHook(() =>
            useRecipeRelatedContent({
                recipeModal: { isOpen: true, isEditMode: false },
                draftData: {
                    quest: sampleQuest,
                },
                questId: 'quest-123',
                coCooksIds: [],
                linkedRecipeIds: [],
                updateFormField: mockUpdateFormField,
                t: mockT,
            })
        );

        expect(draftResult.current.selectedQuest).toEqual(sampleQuest);

        const { result: editResult } = renderHook(() =>
            useRecipeRelatedContent({
                recipeModal: {
                    isOpen: true,
                    isEditMode: true,
                    editRecipeData: {
                        id: 'recipe-with-quest',
                        quest: sampleQuest,
                    } as any,
                },
                questId: 'quest-123',
                coCooksIds: [],
                linkedRecipeIds: [],
                updateFormField: mockUpdateFormField,
                t: mockT,
            })
        );

        expect(editResult.current.selectedQuest).toEqual(sampleQuest);
    });
});
