import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecipeStepNavigation } from '@/app/components/modals/recipe-steps/useRecipeStepNavigation';
import { STEPS, STEPS_LENGTH } from '@/app/utils/constants';
import axios from 'axios';
import { toast } from 'react-hot-toast';

vi.mock('axios');
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/app/components/modals/recipe-steps/recipeStepProcessors', () => ({
    processIngredientsOnStepAdvance: vi.fn(() => true),
    processStepsOnStepAdvance: vi.fn(() => true),
}));

describe('useRecipeStepNavigation', () => {
    const mockT = vi.fn((key: string) => key);
    const mockSetStep = vi.fn();
    const mockMutateDraft = vi.fn().mockResolvedValue({});
    const mockSaveDraft = vi.fn().mockResolvedValue(true);
    const mockDeleteDraft = vi.fn().mockResolvedValue(undefined);
    const mockReset = vi.fn();
    const mockSetIngredients = vi.fn();
    const mockSetSteps = vi.fn();
    const mockSetIngredientsInputMode = vi.fn();
    const mockSetStepsInputMode = vi.fn();
    const mockSetCustomValue = vi.fn();
    const mockGetValues = vi.fn();
    const mockRefresh = vi.fn();
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const defaultProps = {
        step: STEPS.CATEGORY,
        setStep: mockSetStep,
        recipeModal: { isEditMode: false, onClose: mockOnClose },
        mutateDraft: mockMutateDraft,
        saveDraft: mockSaveDraft,
        deleteDraft: mockDeleteDraft,
        reset: mockReset,
        imageSrc: 'https://example.com/test.jpg',
        ingredientsInputMode: 'list' as const,
        stepsInputMode: 'list' as const,
        setIngredients: mockSetIngredients,
        setSteps: mockSetSteps,
        setIngredientsInputMode: mockSetIngredientsInputMode,
        setStepsInputMode: mockSetStepsInputMode,
        setCustomValue: mockSetCustomValue,
        getValues: mockGetValues as any,
        isCurrentStepLocked: false,
        t: mockT as any,
        refresh: mockRefresh,
    };

    it('advances step on onNext when not on last step', () => {
        const { result } = renderHook(() =>
            useRecipeStepNavigation({
                ...defaultProps,
                step: STEPS.CATEGORY,
            })
        );

        let success: boolean = false;
        act(() => {
            success = result.current.onNext();
        });

        expect(success).toBe(true);
        expect(mockSetStep).toHaveBeenCalledWith(expect.any(Function));
        expect(mockMutateDraft).toHaveBeenCalled();
    });

    it('does not advance step when already at last step', () => {
        const { result } = renderHook(() =>
            useRecipeStepNavigation({
                ...defaultProps,
                step: STEPS_LENGTH - 1,
            })
        );

        let success: boolean = true;
        act(() => {
            success = result.current.onNext();
        });

        expect(success).toBe(false);
        expect(mockSetStep).not.toHaveBeenCalled();
    });

    it('navigates back on onBack and clamps to 0', async () => {
        const { result } = renderHook(() =>
            useRecipeStepNavigation({
                ...defaultProps,
                step: STEPS.DESCRIPTION,
            })
        );

        await act(async () => {
            await result.current.onBack();
        });

        expect(mockSetStep).toHaveBeenCalledWith(expect.any(Function));
        expect(mockMutateDraft).toHaveBeenCalled();
    });

    it('handles onSubmit on intermediate steps by calling onNext', async () => {
        const { result } = renderHook(() =>
            useRecipeStepNavigation({
                ...defaultProps,
                step: STEPS.CATEGORY,
            })
        );

        await act(async () => {
            await result.current.onSubmit({ title: 'Soup' });
        });

        expect(mockSetStep).toHaveBeenCalledWith(expect.any(Function));
    });

    it('submits new recipe on STEPS.IMAGES and deletes draft', async () => {
        (axios.post as any).mockResolvedValue({ data: { id: 'recipe-new' } });

        const { result } = renderHook(() =>
            useRecipeStepNavigation({
                ...defaultProps,
                step: STEPS.IMAGES,
                imageSrc: 'https://example.com/food.jpg',
            })
        );

        await act(async () => {
            await result.current.onSubmit({ title: 'New Recipe' });
        });

        expect(axios.post).toHaveBeenCalled();
        expect(mockDeleteDraft).toHaveBeenCalled();
        expect(mockReset).toHaveBeenCalled();
        expect(mockSetStep).toHaveBeenCalledWith(STEPS.CATEGORY);
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockRefresh).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('recipe_posted');
    });

    it('updates recipe on STEPS.IMAGES when in edit mode', async () => {
        (axios.patch as any).mockResolvedValue({ data: { id: 'recipe-edit' } });

        const { result } = renderHook(() =>
            useRecipeStepNavigation({
                ...defaultProps,
                step: STEPS.IMAGES,
                recipeModal: {
                    isEditMode: true,
                    editRecipeData: { id: 'recipe-edit' } as any,
                    onClose: mockOnClose,
                },
                imageSrc: 'https://example.com/food.jpg',
            })
        );

        await act(async () => {
            await result.current.onSubmit({ title: 'Updated Recipe' });
        });

        expect(axios.patch).toHaveBeenCalled();
        expect(mockDeleteDraft).not.toHaveBeenCalled();
        expect(mockReset).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('recipe_updated');
    });

    it('computes correct actionLabel for intermediate vs final steps', () => {
        const { result: intermediateResult } = renderHook(() =>
            useRecipeStepNavigation({
                ...defaultProps,
                step: STEPS.CATEGORY,
            })
        );
        expect(intermediateResult.current.actionLabel).toBe('next');

        const { result: finalResult } = renderHook(() =>
            useRecipeStepNavigation({
                ...defaultProps,
                step: STEPS.IMAGES,
                recipeModal: { isEditMode: false },
            })
        );
        expect(finalResult.current.actionLabel).toBe('create');

        const { result: editResult } = renderHook(() =>
            useRecipeStepNavigation({
                ...defaultProps,
                step: STEPS.IMAGES,
                recipeModal: { isEditMode: true },
            })
        );
        expect(editResult.current.actionLabel).toBe('update');
    });

    it('computes correct secondaryActionLabel', () => {
        const { result: categoryResult } = renderHook(() =>
            useRecipeStepNavigation({
                ...defaultProps,
                step: STEPS.CATEGORY,
            })
        );
        expect(categoryResult.current.secondaryActionLabel).toBeUndefined();

        const { result: laterResult } = renderHook(() =>
            useRecipeStepNavigation({
                ...defaultProps,
                step: STEPS.INGREDIENTS,
            })
        );
        expect(laterResult.current.secondaryActionLabel).toBe('back');
    });

    describe('Remix content validation in fork mode', () => {
        const forkRecipeData = {
            title: 'Original Dish',
            ingredients: ['Flour', 'Water', 'Salt'],
            steps: ['Mix', 'Knead', 'Bake'],
        };

        const forkProps = {
            ...defaultProps,
            step: STEPS.IMAGES,
            recipeModal: {
                isEditMode: false,
                onClose: mockOnClose,
                forkRecipeData,
            },
        };

        it('blocks submission and navigates to ingredients when both ingredients and steps are identical', async () => {
            const { result } = renderHook(() =>
                useRecipeStepNavigation(forkProps)
            );

            await act(async () => {
                await result.current.onSubmit({
                    title: 'Remix of Original Dish',
                    ingredients: ['Flour', 'Water', 'Salt'],
                    steps: ['Mix', 'Knead', 'Bake'],
                });
            });

            expect(axios.post).not.toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith(
                'remix_validation_both_required'
            );
            expect(mockSetStep).toHaveBeenCalledWith(STEPS.INGREDIENTS);
        });

        it('blocks submission and navigates to ingredients when only ingredients are unchanged', async () => {
            const { result } = renderHook(() =>
                useRecipeStepNavigation(forkProps)
            );

            await act(async () => {
                await result.current.onSubmit({
                    title: 'Remix of Original Dish',
                    ingredients: ['Flour', 'Water', 'Salt'],
                    steps: ['Mix gently', 'Cold ferment', 'Bake with steam'], // Modified
                });
            });

            expect(axios.post).not.toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith(
                'remix_validation_ingredients_required'
            );
            expect(mockSetStep).toHaveBeenCalledWith(STEPS.INGREDIENTS);
        });

        it('blocks submission and navigates to steps when only steps are unchanged', async () => {
            const { result } = renderHook(() =>
                useRecipeStepNavigation(forkProps)
            );

            await act(async () => {
                await result.current.onSubmit({
                    title: 'Remix of Original Dish',
                    ingredients: ['Rye Flour', 'Water', 'Salt', 'Seeds'], // Modified
                    steps: ['Mix', 'Knead', 'Bake'], // Unchanged
                });
            });

            expect(axios.post).not.toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith(
                'remix_validation_steps_required'
            );
            expect(mockSetStep).toHaveBeenCalledWith(STEPS.STEPS);
        });

        it('submits successfully when both ingredients and steps are modified', async () => {
            (axios.post as any).mockResolvedValueOnce({
                data: { id: 'new-remix-id' },
            });

            const { result } = renderHook(() =>
                useRecipeStepNavigation(forkProps)
            );

            await act(async () => {
                await result.current.onSubmit({
                    title: 'Remix of Original Dish',
                    ingredients: ['Rye Flour', 'Water', 'Salt', 'Seeds'],
                    steps: ['Mix gently', 'Cold ferment', 'Bake with steam'],
                });
            });

            expect(axios.post).toHaveBeenCalled();
            expect(mockReset).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith('recipe_posted');
        });
    });
});
