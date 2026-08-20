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
        onOpenSharedDraft: vi.fn(),
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

    it('derives effectiveNumIngredients and effectiveNumSteps synchronously during render from incoming draftData', async () => {
        let currentDraftData: any = {
            draftId: 'd1',
            ingredients: ['flour'],
            steps: ['mix'],
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

        expect(result.current.numIngredients).toBe(1);
        expect(result.current.numSteps).toBe(1);

        // Co-cook expands ingredients and steps in Redis
        currentDraftData = {
            draftId: 'd1',
            ingredients: ['flour', 'sugar', 'cocoa powder'],
            steps: ['mix', 'bake at 180C', 'top with ganache'],
        };

        await act(async () => {
            rerender({ draft: currentDraftData });
        });

        // Derived synchronously during render
        expect(result.current.numIngredients).toBe(3);
        expect(result.current.numSteps).toBe(3);
        expect(result.current.getValues('ingredient-2')).toBe('cocoa powder');
        expect(result.current.getValues('step-2')).toBe('top with ganache');
    });

    it('preserves user-selected cooking method on Step 3 and does not overwrite with empty string on step transitions', async () => {
        const { result } = renderHook(() =>
            useRecipeFormState({
                recipeModal: mockRecipeModal,
                currentUser: null,
                draftData: {
                    draftId: 'd-method',
                    method: '',
                },
            })
        );

        // Advance to Step 3 (Methods) and select Oven
        act(() => {
            result.current.setStep(3);
            result.current.setValue('method', 'Oven');
        });

        expect(result.current.getValues('method')).toBe('Oven');

        // Advance to Step 4 (Steps)
        await act(async () => {
            await result.current.onSubmit({});
        });

        expect(result.current.step).toBe(4);
        // Method should NOT be wiped with empty string from draftData
        expect(result.current.getValues('method')).toBe('Oven');
    });

    it('preserves remote draftData for inactive steps when saveDraft is invoked', async () => {
        const axios = (await import('axios')).default;
        (axios.post as any).mockClear();
        (axios.post as any).mockResolvedValueOnce({
            data: { draftId: 'd-save-test', inviteToken: 'tok-123' },
        });

        const mockDraftData = {
            draftId: 'd-save-test',
            inviteToken: 'tok-123',
            currentStep: 1,
            title: 'Initial Title',
            description: 'Initial Description',
            ingredients: ['2 cups Flour', '1 cup Sugar'],
            steps: ['Mix well', 'Bake 30m'],
            method: 'Microwave',
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

        // User edits only Step 1 (Description)
        act(() => {
            result.current.setStep(1);
            result.current.setValue('title', 'Updated Berry Cake Title');
        });

        // User saves draft
        await act(async () => {
            await result.current.saveDraft();
        });

        expect(axios.post).toHaveBeenCalled();
        const callPayload = (axios.post as any).mock.calls[0][1] as any;
        expect(callPayload.title).toBe('Updated Berry Cake Title');
        // Remote ingredients, steps, and method from inactive steps preserved!
        expect(callPayload.ingredients).toEqual([
            '2 cups Flour',
            '1 cup Sugar',
        ]);
        expect(callPayload.steps).toEqual(['Mix well', 'Bake 30m']);
        expect(callPayload.method).toBe('Microwave');
    });

    it('does not overwrite collaborator updated steps with stale local form values when saving draft from earlier steps', async () => {
        const axios = (await import('axios')).default;
        (axios.post as any).mockClear();
        (axios.post as any).mockResolvedValueOnce({
            data: { draftId: 'd-collab-test', inviteToken: 'tok-456' },
        });

        // Initial draft with original steps
        let currentDraftData: any = {
            draftId: 'd-collab-test',
            inviteToken: 'tok-456',
            currentStep: 1,
            title: 'Collaborative Cake',
            description: 'Delicious cake',
            ingredients: ['2 cups Flour', '1 cup Sugar'],
            steps: ['Mix ingredients', 'Bake at 180C for 30 mins'],
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

        // User is currently on Step 1 (Description)
        act(() => {
            result.current.setStep(1);
        });

        // Co-cook updates steps in Redis concurrently
        const coCookUpdatedSteps = [
            'Mix ingredients thoroughly',
            'Bake at 180C for 30 mins',
            'Top with chocolate ganache (added by Co-Cook)',
        ];

        currentDraftData = {
            ...currentDraftData,
            steps: coCookUpdatedSteps,
        };

        await act(async () => {
            rerender({ draft: currentDraftData });
        });

        // User triggers saveDraft while advancing from Step 1
        await act(async () => {
            await result.current.saveDraft(2);
        });

        expect(axios.post).toHaveBeenCalled();
        const callPayload = (axios.post as any).mock.calls[0][1] as any;
        // Verify collaborator's updated steps are preserved and not clobbered by stale 'Mix ingredients'
        expect(callPayload.steps).toEqual(coCookUpdatedSteps);
    });

    it('preserves user selected coCooksIds and linkedRecipeIds when advancing steps with empty remote draft array', async () => {
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
                draftData: {
                    draftId: 'd-cooks',
                    coCooksIds: [],
                    linkedRecipeIds: [],
                },
            })
        );

        // User is on Step 5 (Related Content) and adds Chef Maria
        act(() => {
            result.current.setStep(5);
            result.current.addCoCook({
                id: '507f1f77bcf86cd799439011',
                name: 'Chef Maria',
                email: 'maria@test.com',
                createdAt: '',
                updatedAt: '',
                favoriteIds: [],
            });
        });

        expect(result.current.selectedCoCooks).toHaveLength(1);
        expect(result.current.getValues('coCooksIds')).toEqual([
            '507f1f77bcf86cd799439011',
        ]);

        // User advances to Step 6 (Images)
        await act(async () => {
            await result.current.onSubmit({});
        });

        expect(result.current.step).toBe(6);
        // CoCooksIds should NOT be wiped with [] from draftData
        expect(result.current.getValues('coCooksIds')).toEqual([
            '507f1f77bcf86cd799439011',
        ]);
    });
});
