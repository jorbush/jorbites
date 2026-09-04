import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDraftSwitchSync } from '@/app/components/modals/recipe-steps/useDraftSwitchSync';
import { STEPS } from '@/app/utils/constants';

describe('useDraftSwitchSync', () => {
    const mockSetStep = vi.fn();
    const mockSetNumIngredients = vi.fn();
    const mockSetNumSteps = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does nothing when in edit mode', () => {
        const { rerender } = renderHook((props) => useDraftSwitchSync(props), {
            initialProps: {
                isEditMode: true,
                draftData: null,
                setStep: mockSetStep,
                setNumIngredients: mockSetNumIngredients,
                setNumSteps: mockSetNumSteps,
            },
        });

        rerender({
            isEditMode: true,
            draftData: { draftId: 'd1', currentStep: 2 } as any,
            setStep: mockSetStep,
            setNumIngredients: mockSetNumIngredients,
            setNumSteps: mockSetNumSteps,
        });

        expect(mockSetStep).not.toHaveBeenCalled();
        expect(mockSetNumIngredients).not.toHaveBeenCalled();
        expect(mockSetNumSteps).not.toHaveBeenCalled();
    });

    it('updates step and item counts when loading a draft with data', () => {
        const { rerender } = renderHook((props) => useDraftSwitchSync(props), {
            initialProps: {
                isEditMode: false,
                draftData: null,
                setStep: mockSetStep,
                setNumIngredients: mockSetNumIngredients,
                setNumSteps: mockSetNumSteps,
            },
        });

        rerender({
            isEditMode: false,
            draftData: {
                draftId: 'd-123',
                ingredients: ['Salt', 'Pepper'],
                steps: ['Mix', 'Cook', 'Serve'],
                currentStep: 3,
            } as any,
            setStep: mockSetStep,
            setNumIngredients: mockSetNumIngredients,
            setNumSteps: mockSetNumSteps,
        });

        expect(mockSetNumIngredients).toHaveBeenCalledWith(2);
        expect(mockSetNumSteps).toHaveBeenCalledWith(3);
        expect(mockSetStep).toHaveBeenCalledWith(3);
    });

    it('resets step to STEPS.CATEGORY and counts to 1 when transitioning from draft to null', () => {
        const { rerender } = renderHook((props) => useDraftSwitchSync(props), {
            initialProps: {
                isEditMode: false,
                draftData: { draftId: 'd-old' } as any,
                setStep: mockSetStep,
                setNumIngredients: mockSetNumIngredients,
                setNumSteps: mockSetNumSteps,
            },
        });

        rerender({
            isEditMode: false,
            draftData: null,
            setStep: mockSetStep,
            setNumIngredients: mockSetNumIngredients,
            setNumSteps: mockSetNumSteps,
        });

        expect(mockSetStep).toHaveBeenCalledWith(STEPS.CATEGORY);
        expect(mockSetNumIngredients).toHaveBeenCalledWith(1);
        expect(mockSetNumSteps).toHaveBeenCalledWith(1);
    });
});
