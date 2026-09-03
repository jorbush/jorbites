import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useSWR from 'swr';
import { useDraftSync } from '@/app/hooks/useDraftSync';
import { syncRemoteDraftToForm } from '@/app/utils/draftSyncUtils';
import { SafeUser } from '@/app/types';

vi.mock('swr');
vi.mock('@/app/utils/draftSyncUtils', () => ({
    syncRemoteDraftToForm: vi.fn(),
}));

const mockUser: SafeUser = {
    id: 'user-1',
    name: 'Chef Tester',
    email: 'test@example.com',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
};

describe('useDraftSync hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useSWR).mockReturnValue({
            data: null,
            error: undefined,
            isLoading: false,
            isValidating: false,
            mutate: vi.fn() as any,
        });
    });

    it('encodes activeDraftId in the SWR endpoint key (L2)', () => {
        renderHook(() =>
            useDraftSync({
                activeDraftId: 'draft with spaces & special=chars',
                isEditMode: false,
                currentUser: mockUser,
                isOpen: true,
            })
        );

        expect(useSWR).toHaveBeenCalledWith(
            '/api/draft?draftId=draft%20with%20spaces%20%26%20special%3Dchars',
            expect.any(Function),
            expect.objectContaining({
                refreshInterval: 8000,
            })
        );
    });

    it('passes null key to SWR when modal is closed', () => {
        renderHook(() =>
            useDraftSync({
                activeDraftId: 'draft-123',
                isEditMode: false,
                currentUser: mockUser,
                isOpen: false,
            })
        );

        expect(useSWR).toHaveBeenCalledWith(
            null,
            expect.any(Function),
            expect.anything()
        );
    });

    it('triggers syncFormFromDraft when draftData changes and short-circuits on identical draft', () => {
        const mockDraft1 = {
            title: 'Syncd Recipe',
            ingredients: ['Flour', 'Sugar'],
        };

        const setValue = vi.fn();
        const getValues = vi.fn().mockReturnValue({});
        const lock = null;

        const { result, rerender } = renderHook(
            ({ draft }) =>
                useDraftSync({
                    activeDraftId: 'draft-123',
                    isEditMode: false,
                    currentUser: mockUser,
                    isOpen: true,
                    initialDraftData: draft,
                }),
            { initialProps: { draft: mockDraft1 } }
        );

        // First call on step 0
        act(() => {
            result.current.syncFormFromDraft(setValue, getValues, 0, lock);
        });
        expect(syncRemoteDraftToForm).toHaveBeenCalledTimes(1);

        // Immediate second call with same draft data should short-circuit to protect local form inputs
        act(() => {
            result.current.syncFormFromDraft(setValue, getValues, 1, lock);
        });
        expect(syncRemoteDraftToForm).toHaveBeenCalledTimes(1);

        // Third call after remote draft updates should trigger sync
        const mockDraft2 = {
            title: 'Syncd Recipe Updated',
            ingredients: ['Flour', 'Sugar', 'Butter'],
        };
        rerender({ draft: mockDraft2 });
        act(() => {
            result.current.syncFormFromDraft(setValue, getValues, 1, lock);
        });
        expect(syncRemoteDraftToForm).toHaveBeenCalledTimes(2);
    });

    it('does not sync remote draft when isEditMode is true', () => {
        const mockDraft = {
            title: 'Edit Recipe',
        };

        const setValue = vi.fn();
        const getValues = vi.fn().mockReturnValue({});

        const { result } = renderHook(() =>
            useDraftSync({
                activeDraftId: 'draft-123',
                isEditMode: true,
                currentUser: mockUser,
                isOpen: true,
                initialDraftData: mockDraft,
            })
        );

        act(() => {
            result.current.syncFormFromDraft(setValue, getValues, 0, null);
        });

        expect(syncRemoteDraftToForm).not.toHaveBeenCalled();
    });
});
