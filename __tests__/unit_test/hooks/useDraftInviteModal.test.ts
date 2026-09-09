import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDraftInviteModal from '@/app/hooks/useDraftInviteModal';

describe('useDraftInviteModal store', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useDraftInviteModal());
        act(() => {
            result.current.onClose();
        });
    });

    it('initializes with isOpen = false and null draftId', () => {
        const { result } = renderHook(() => useDraftInviteModal());
        expect(result.current.isOpen).toBe(false);
        expect(result.current.draftId).toBeNull();
    });

    it('opens the modal with the specified draftId when onOpen is called', () => {
        const { result } = renderHook(() => useDraftInviteModal());
        act(() => {
            result.current.onOpen('draft-789');
        });
        expect(result.current.isOpen).toBe(true);
        expect(result.current.draftId).toBe('draft-789');
    });

    it('closes the modal and clears draftId when onClose is called', () => {
        const { result } = renderHook(() => useDraftInviteModal());
        act(() => {
            result.current.onOpen('draft-789');
        });
        expect(result.current.isOpen).toBe(true);

        act(() => {
            result.current.onClose();
        });
        expect(result.current.isOpen).toBe(false);
        expect(result.current.draftId).toBeNull();
    });
});
