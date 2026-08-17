import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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

    it('generates invite link on first click with full draft data and binds shared draft', async () => {
        const mockOpenSharedDraft = vi.fn();
        const mockMutate = vi.fn();
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            clipboard: {
                writeText: mockWriteText,
            },
        });

        const axios = (await import('axios')).default;
        (axios.post as any).mockResolvedValueOnce({
            data: {
                draftId: 'generated-draft-123',
                inviteToken: 'generated-token-456',
            },
        });

        const { result } = renderHook(() =>
            useRecipeFormState({
                recipeModal: {
                    ...mockRecipeModal,
                    onOpenSharedDraft: mockOpenSharedDraft,
                },
                currentUser: {
                    id: 'u1',
                    name: 'Chef',
                    email: 'c@test.com',
                    createdAt: '',
                    updatedAt: '',
                    favoriteIds: [],
                },
                mutateDraft: mockMutate,
            })
        );

        act(() => {
            result.current.setValue('title', 'Truffle Pasta');
            result.current.setValue('categories', ['Dinner']);
            result.current.setValue('ingredient-0', 'Truffle Oil');
        });

        await act(async () => {
            await result.current.copyInviteLink();
        });

        expect(axios.post).toHaveBeenCalledWith(
            '/api/draft/invite',
            expect.objectContaining({
                title: 'Truffle Pasta',
                categories: ['Dinner'],
                ingredients: ['Truffle Oil'],
            })
        );
        expect(mockOpenSharedDraft).toHaveBeenCalledWith('generated-draft-123');
        expect(mockMutate).toHaveBeenCalled();
        expect(mockWriteText).toHaveBeenCalledWith(
            expect.stringContaining(
                '/api/draft/join?draft=generated-draft-123&token=generated-token-456'
            )
        );
    });

    it('handles clipboard error gracefully when navigator.clipboard.writeText fails', async () => {
        const mockWriteText = vi
            .fn()
            .mockRejectedValue(new Error('Clipboard error'));
        Object.assign(navigator, {
            clipboard: {
                writeText: mockWriteText,
            },
        });

        const mockDraftData = {
            draftId: 'draft-err',
            inviteToken: 'token-err',
            title: 'Pasta',
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

        expect(mockWriteText).toHaveBeenCalled();
        const toast = (await import('react-hot-toast')).toast;
        expect(toast.error).toHaveBeenCalledWith('could_not_copy_link');
    });

    it('syncs draft updates to /api/draft on subsequent copyInviteLink clicks when draftId already exists', async () => {
        const mockMutate = vi.fn();
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            clipboard: {
                writeText: mockWriteText,
            },
        });

        const axios = (await import('axios')).default;
        (axios.post as any).mockResolvedValueOnce({ data: {} });

        const mockDraftData = {
            draftId: 'existing-draft-999',
            inviteToken: 'existing-token-888',
            title: 'Existing Recipe',
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
                mutateDraft: mockMutate,
            })
        );

        await act(async () => {
            await result.current.copyInviteLink();
        });

        expect(axios.post).toHaveBeenCalledWith(
            '/api/draft',
            expect.objectContaining({
                draftId: 'existing-draft-999',
                inviteToken: 'existing-token-888',
            })
        );
        expect(mockMutate).toHaveBeenCalled();
        expect(mockWriteText).toHaveBeenCalledWith(
            expect.stringContaining(
                '/api/draft/join?draft=existing-draft-999&token=existing-token-888'
            )
        );
    });

    it('synchronizes incoming draft updates for current step when the step is locked by another co-cook', async () => {
        mockIsLockedByOther.mockImplementation(
            (key: string) => key === 'step:2'
        );

        let currentDraftData: any = {
            draftId: 'd1',
            currentStep: 2,
            ingredients: ['initial flour'],
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

        // User is currently on Step 2 (INGREDIENTS) which is locked by another cook
        act(() => {
            result.current.setStep(2);
        });

        currentDraftData = {
            draftId: 'd1',
            currentStep: 2,
            ingredients: ['co-cook updated flour', 'co-cook added sugar'],
        };

        await act(async () => {
            rerender({ draft: currentDraftData });
        });

        expect(result.current.getValues('ingredient-0')).toBe(
            'co-cook updated flour'
        );
        expect(result.current.getValues('ingredient-1')).toBe(
            'co-cook added sugar'
        );
    });

    it('does not overwrite current step inputs when the step is NOT locked by another co-cook', async () => {
        mockIsLockedByOther.mockReturnValue(false);

        let currentDraftData: any = {
            draftId: 'd1',
            currentStep: 2,
            ingredients: ['initial ingredient'],
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

        act(() => {
            result.current.setStep(2);
            result.current.setValue(
                'ingredient-0',
                'my local typing ingredient'
            );
        });

        currentDraftData = {
            draftId: 'd1',
            currentStep: 2,
            ingredients: ['incoming remote ingredient'],
        };

        await act(async () => {
            rerender({ draft: currentDraftData });
        });

        // Current step inputs preserved for the active user
        expect(result.current.getValues('ingredient-0')).toBe(
            'my local typing ingredient'
        );
    });

    it('triggers mutateDraft on onNext and onBack step transitions', async () => {
        const mockMutate = vi.fn();

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
                mutateDraft: mockMutate,
            })
        );

        act(() => {
            result.current.setStep(2);
        });
        mockMutate.mockClear();

        await act(async () => {
            await result.current.onBack();
        });
        expect(mockMutate).toHaveBeenCalledTimes(1);

        mockMutate.mockClear();
        await act(async () => {
            await result.current.onSubmit({});
        });
        expect(mockMutate).toHaveBeenCalledTimes(1);
    });
});
