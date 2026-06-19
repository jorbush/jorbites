import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkshopFormState } from '@/app/hooks/useWorkshopFormState';

// Mocks
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
        push: vi.fn(),
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

describe('useWorkshopFormState hook', () => {
    const mockWorkshopModal = {
        isOpen: true,
        isEditMode: false,
        onClose: vi.fn(),
    };

    it('initializes default values correctly', () => {
        const { result } = renderHook(() =>
            useWorkshopFormState({
                workshopModal: mockWorkshopModal,
            })
        );

        expect(result.current.step).toBe(0);
        expect(result.current.numIngredients).toBe(0);
        expect(result.current.numPreviousSteps).toBe(0);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.selectedUsers).toEqual([]);
    });

    it('handles step navigation back', () => {
        const { result } = renderHook(() =>
            useWorkshopFormState({
                workshopModal: mockWorkshopModal,
            })
        );

        act(() => {
            result.current.onBack();
        });
        expect(result.current.step).toBe(-1); // Can navigate steps
    });

    it('handles step navigation next', () => {
        const { result } = renderHook(() =>
            useWorkshopFormState({
                workshopModal: mockWorkshopModal,
            })
        );

        act(() => {
            result.current.onNext();
        });
        expect(result.current.step).toBe(1);
    });

    it('manages ingredients count', () => {
        const { result } = renderHook(() =>
            useWorkshopFormState({
                workshopModal: mockWorkshopModal,
            })
        );

        act(() => {
            result.current.addIngredient();
        });
        expect(result.current.numIngredients).toBe(1);

        act(() => {
            result.current.removeIngredient(0);
        });
        expect(result.current.numIngredients).toBe(0);
    });

    it('manages previous steps count', () => {
        const { result } = renderHook(() =>
            useWorkshopFormState({
                workshopModal: mockWorkshopModal,
            })
        );

        act(() => {
            result.current.addPreviousStep();
        });
        expect(result.current.numPreviousSteps).toBe(1);

        act(() => {
            result.current.removePreviousStep(0);
        });
        expect(result.current.numPreviousSteps).toBe(0);
    });

    it('manages whitelisted users', () => {
        const { result } = renderHook(() =>
            useWorkshopFormState({
                workshopModal: mockWorkshopModal,
            })
        );

        act(() => {
            result.current.setValue('isPrivate', true);
        });

        const mockUser = { id: 'user1', name: 'Jordi' };

        act(() => {
            result.current.addWhitelistedUser(mockUser);
        });
        expect(result.current.selectedUsers).toEqual([mockUser]);

        act(() => {
            result.current.removeWhitelistedUser('user1');
        });
        expect(result.current.selectedUsers).toEqual([]);
    });
});
