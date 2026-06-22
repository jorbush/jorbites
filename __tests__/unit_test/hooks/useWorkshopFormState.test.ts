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

    it('initializes edit values correctly and updates them when editData changes', () => {
        const mockEditData1 = {
            id: 'workshop-1',
            title: 'Test Workshop 1',
            description: 'Description 1',
            date: '2026-06-22T08:00:00.000Z',
            location: 'Location 1',
            isRecurrent: false,
            recurrencePattern: '',
            isPrivate: false,
            whitelistedUserIds: [],
            imageSrc: '',
            price: 10,
            ingredients: ['Ing 1', 'Ing 2'],
            previousSteps: ['Step 1'],
        };

        const mockWorkshopModalEdit = {
            isOpen: true,
            isEditMode: true,
            editWorkshopData: mockEditData1,
            onClose: vi.fn(),
        };

        const { result, rerender } = renderHook(
            ({ modal }) => useWorkshopFormState({ workshopModal: modal }),
            {
                initialProps: { modal: mockWorkshopModalEdit },
            }
        );

        expect(result.current.numIngredients).toBe(2);
        expect(result.current.numPreviousSteps).toBe(1);
        expect(result.current.watch('title')).toBe('Test Workshop 1');
        expect(result.current.watch('ingredient-0')).toBe('Ing 1');
        expect(result.current.watch('ingredient-1')).toBe('Ing 2');
        expect(result.current.watch('previousStep-0')).toBe('Step 1');

        // Let's test that it updates when modal switches to create mode
        const mockWorkshopModalCreate = {
            isOpen: true,
            isEditMode: false,
            editWorkshopData: null,
            onClose: vi.fn(),
        };

        rerender({ modal: mockWorkshopModalCreate });

        expect(result.current.numIngredients).toBe(0);
        expect(result.current.numPreviousSteps).toBe(0);
        expect(result.current.watch('title')).toBe('');
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
