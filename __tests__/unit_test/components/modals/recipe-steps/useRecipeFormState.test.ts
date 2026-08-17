import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRecipeFormState } from '@/app/components/modals/recipe-steps/useRecipeFormState';

// Mocks
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('swr', () => ({
    default: () => ({ data: null, isLoading: false }),
}));

vi.mock('axios', () => ({
    default: {
        get: vi.fn().mockResolvedValue({ data: {} }),
        post: vi.fn().mockResolvedValue({ data: {} }),
        delete: vi.fn().mockResolvedValue({ data: {} }),
    },
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockIsLockedByOther = vi.fn().mockReturnValue(false);

vi.mock('@/app/hooks/useRecipeLock', () => ({
    useRecipeLock: () => ({
        locks: {},
        acquire: vi.fn().mockResolvedValue(true),
        release: vi.fn().mockResolvedValue(undefined),
        isLockedByOther: mockIsLockedByOther,
        getLockOwner: vi.fn().mockReturnValue(null),
        fetchLocks: vi.fn().mockResolvedValue(undefined),
    }),
}));

describe('useRecipeFormState hook', () => {
    beforeEach(() => {
        mockIsLockedByOther.mockReturnValue(false);
    });
    const mockRecipeModal = {
        isOpen: true,
        isEditMode: false,
        onClose: vi.fn(),
    };

    it('initializes default values correctly', () => {
        const { result } = renderHook(() =>
            useRecipeFormState({
                recipeModal: mockRecipeModal,
                currentUser: null,
            })
        );

        expect(result.current.step).toBe(0);
        expect(result.current.numIngredients).toBe(1);
        expect(result.current.numSteps).toBe(1);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.selectedCoCooks).toEqual([]);
        expect(result.current.selectedLinkedRecipes).toEqual([]);
        expect(result.current.selectedQuest).toBeNull();
    });

    it('handles step navigation', () => {
        const { result } = renderHook(() =>
            useRecipeFormState({
                recipeModal: mockRecipeModal,
                currentUser: null,
            })
        );

        act(() => {
            result.current.onBack();
        });
        expect(result.current.step).toBe(0); // Cannot go below 0
    });

    it('initializes from draftData correctly', () => {
        const mockDraftData = {
            currentStep: 2,
            ingredients: ['flour', 'water'],
            steps: ['mix', 'bake'],
            categories: ['Bread'],
            title: 'Sourdough',
            description: 'Yummy bread',
            coCooks: [{ id: 'user-1', name: 'John' }],
            linkedRecipes: [{ id: 'recipe-2', title: 'Butter' }],
        };

        const { result } = renderHook(() =>
            useRecipeFormState({
                recipeModal: mockRecipeModal,
                currentUser: null,
                draftData: mockDraftData,
            })
        );

        expect(result.current.step).toBe(2);
        expect(result.current.numIngredients).toBe(2);
        expect(result.current.numSteps).toBe(2);
        expect(result.current.selectedCoCooks).toEqual([
            { id: 'user-1', name: 'John' },
        ]);
        expect(result.current.selectedLinkedRecipes).toEqual([
            { id: 'recipe-2', title: 'Butter' },
        ]);
    });

    it('copies invite link to clipboard when draftId and inviteToken exist', async () => {
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            clipboard: {
                writeText: mockWriteText,
            },
        });

        const mockDraftData = {
            draftId: 'draft-abc',
            inviteToken: 'token-xyz',
            title: 'Tacos',
        };

        const { result } = renderHook(() =>
            useRecipeFormState({
                recipeModal: mockRecipeModal,
                currentUser: {
                    id: 'u1',
                    name: 'Chef',
                    email: 'c@test.com',
                    createdAt: '',
                    updatedAt: '',
                    favoriteIds: [],
                },
                draftData: mockDraftData,
            })
        );

        await act(async () => {
            await result.current.copyInviteLink();
        });

        expect(mockWriteText).toHaveBeenCalledWith(
            expect.stringContaining(
                '/api/draft/join?draft=draft-abc&token=token-xyz'
            )
        );
    });

    it('allows advancing past a step when locked by another user even if inputs are empty', async () => {
        mockIsLockedByOther.mockReturnValue(true);
        const { result } = renderHook(() =>
            useRecipeFormState({
                recipeModal: mockRecipeModal,
                currentUser: {
                    id: 'u1',
                    name: 'Chef',
                    email: 'c@test.com',
                    createdAt: '',
                    updatedAt: '',
                    favoriteIds: [],
                },
                draftData: { draftId: 'd1', currentStep: 1 },
            })
        );

        expect(result.current.step).toBe(1);

        act(() => {
            result.current.setIngredientsInputMode('text');
        });

        await act(async () => {
            await result.current.onSubmit({});
        });

        expect(result.current.step).toBe(2);
    });

    it('synchronizes incoming draftData for inactive steps without disturbing current step', async () => {
        let currentDraftData: any = {
            draftId: 'd1',
            ingredients: ['flour'],
            title: 'Initial Title',
        };

        const { result, rerender } = renderHook(
            (props: { draft: any }) =>
                useRecipeFormState({
                    recipeModal: mockRecipeModal,
                    currentUser: {
                        id: 'u1',
                        name: 'Chef',
                        email: 'c@test.com',
                        createdAt: '',
                        updatedAt: '',
                        favoriteIds: [],
                    },
                    draftData: props.draft,
                }),
            { initialProps: { draft: currentDraftData } }
        );

        // User is currently on Step 2 (STEPS)
        act(() => {
            result.current.setStep(2);
        });

        // Co-cook updates ingredients and title in draftData
        currentDraftData = {
            draftId: 'd1',
            ingredients: ['flour', 'sugar', 'eggs'],
            title: 'Updated Shared Title',
        };

        await act(async () => {
            rerender({ draft: currentDraftData });
        });
        await act(async () => {});

        expect(result.current.getValues('title')).toBe('Updated Shared Title');
        expect(result.current.getValues('ingredient-0')).toBe('flour');
    });
});
