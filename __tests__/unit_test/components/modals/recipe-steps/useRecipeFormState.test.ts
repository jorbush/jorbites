import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { mutate } from 'swr';
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
    mutate: vi.fn(),
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
        // Remote ingredients, steps, and method from inactive steps are omitted from payload
        // so DraftService preserves whatever is in Redis without clobbering
        expect(callPayload.ingredients).toBeUndefined();
        expect(callPayload.steps).toBeUndefined();
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
        // Verify collaborator's updated steps are not clobbered by sending stale local arrays
        expect(callPayload.steps).toBeUndefined();
    });

    it('includes ingredients in saveDraft payload when actively on ingredients step of shared draft', async () => {
        const axios = (await import('axios')).default;
        (axios.post as any).mockClear();
        (axios.post as any).mockResolvedValueOnce({
            data: { draftId: 'd-ing-test' },
        });

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
                    draftId: 'd-ing-test',
                    ingredients: ['Old Ingredient'],
                    steps: ['Step 1'],
                },
            })
        );

        act(() => {
            result.current.setStep(2); // STEPS.INGREDIENTS
        });

        act(() => {
            result.current.setValue('ingredient-0', 'Fresh Basil');
        });

        await act(async () => {
            await result.current.saveDraft(3);
        });

        expect(axios.post).toHaveBeenCalled();
        const callPayload = (axios.post as any).mock.calls[0][1] as any;
        expect(callPayload.ingredients).toEqual(['Fresh Basil']);
        expect(callPayload.steps).toBeUndefined();
    });

    it('includes both ingredients and steps in saveDraft payload for solo single-user drafts', async () => {
        const axios = (await import('axios')).default;
        (axios.post as any).mockClear();
        (axios.post as any).mockResolvedValueOnce({
            data: { success: true },
        });

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
                draftData: null,
            })
        );

        act(() => {
            result.current.setStep(1); // STEPS.DESCRIPTION
            result.current.setValue('title', 'Solo Pizza');
            result.current.setValue('ingredient-0', 'Dough');
            result.current.setValue('step-0', 'Bake');
        });

        await act(async () => {
            await result.current.saveDraft(2);
        });

        expect(axios.post).toHaveBeenCalled();
        const callPayload = (axios.post as any).mock.calls[0][1] as any;
        expect(callPayload.title).toBe('Solo Pizza');
        expect(callPayload.ingredients).toBeDefined();
        expect(callPayload.steps).toBeDefined();
        expect(mutate).toHaveBeenCalledWith('/api/draft/active');
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

    it('synchronously updates form values during render when draftData changes without act warnings', () => {
        let currentDraftData: any = {
            draftId: 'd-sync-render',
            title: 'Initial Title',
            description: 'Initial Description',
            ingredients: ['flour'],
            currentStep: 0,
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

        expect(result.current.getValues('title')).toBe('Initial Title');
        expect(result.current.getValues('description')).toBe(
            'Initial Description'
        );

        // New draft data pushed from collaborative partner
        currentDraftData = {
            draftId: 'd-sync-render',
            title: 'Synchronous Title Update',
            description: 'Synchronous Description Update',
            ingredients: ['flour', 'water'],
            currentStep: 0,
        };

        rerender({ draft: currentDraftData });

        // Synchronously updated during render
        expect(result.current.getValues('title')).toBe(
            'Synchronous Title Update'
        );
        expect(result.current.getValues('description')).toBe(
            'Synchronous Description Update'
        );
        expect(result.current.getValues('ingredient-1')).toBe('water');
    });

    it('selectively preserves active step inputs when draftData updates while inactive steps sync', () => {
        let currentDraftData: any = {
            draftId: 'd-step-sync',
            currentStep: 3, // User starts on Step 3 (Methods)
            title: 'Remote Draft Title',
            method: 'Bake',
            imageSrc: 'https://example.com/cake.jpg',
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

        expect(result.current.step).toBe(3);
        expect(result.current.getValues('method')).toBe('Bake');

        // User locally types in active step 3 (Methods)
        act(() => {
            result.current.setValue('method', 'Grill');
        });
        expect(result.current.getValues('method')).toBe('Grill');

        // Co-cook updates title (inactive step 1) and method (active step 3) remotely
        currentDraftData = {
            draftId: 'd-step-sync',
            currentStep: 3,
            title: 'Co-Cook Updated Title',
            method: 'Remote Fry',
            imageSrc: 'https://example.com/new-cake.jpg',
        };

        rerender({ draft: currentDraftData });

        // Inactive step 1 (Title) and step 6 (imageSrc) sync from remote co-cook
        expect(result.current.getValues('title')).toBe('Co-Cook Updated Title');
        expect(result.current.getValues('imageSrc')).toBe(
            'https://example.com/new-cake.jpg'
        );
        // Active step 3 (Method) preserves local typing 'Grill' without being overwritten by 'Remote Fry'
        expect(result.current.getValues('method')).toBe('Grill');
    });

    it('is idempotent and avoids redundant updates when re-rendered with identical draftData', () => {
        const mockDraftData = {
            draftId: 'd-idempotent',
            currentStep: 1,
            title: 'Static Title',
            ingredients: ['eggs'],
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
            { initialProps: { draft: mockDraftData } }
        );

        expect(result.current.getValues('title')).toBe('Static Title');

        // User modifies local field on active step
        act(() => {
            result.current.setValue('title', 'Locally Modified Title');
        });

        // Re-render with structurally identical draftData (new object reference)
        rerender({
            draft: {
                draftId: 'd-idempotent',
                currentStep: 1,
                title: 'Static Title',
                ingredients: ['eggs'],
            },
        });

        // Local changes are not clobbered because serialized content did not change
        expect(result.current.getValues('title')).toBe(
            'Locally Modified Title'
        );
    });

    it('immediately synchronizes remote inputs when user is on a step locked by another co-cook', () => {
        // Step 1 (DESCRIPTION) is locked by another cook
        mockIsLockedByOther.mockImplementation(
            (key: string) => key === 'step:1'
        );

        let currentDraftData: any = {
            draftId: 'd-locked-takeover',
            title: 'Initial Locked Title',
            description: 'Initial Description',
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
            result.current.setStep(1);
        });

        expect(result.current.getValues('title')).toBe('Initial Locked Title');

        // Co-cook who owns the lock updates the title in Redis
        currentDraftData = {
            draftId: 'd-locked-takeover',
            title: 'Co-Cook Live Edited Title',
            description: 'Co-Cook Live Edited Description',
        };

        rerender({ draft: currentDraftData });

        // Since step 1 is locked by other, the values update immediately even though user is on step 1
        expect(result.current.getValues('title')).toBe(
            'Co-Cook Live Edited Title'
        );
        expect(result.current.getValues('description')).toBe(
            'Co-Cook Live Edited Description'
        );
    });
});
