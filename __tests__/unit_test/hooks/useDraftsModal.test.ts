import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDraftsModal from '@/app/hooks/useDraftsModal';

describe('useDraftsModal store', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useDraftsModal());
        act(() => {
            result.current.onClose();
        });
    });

    it('initializes with isOpen = false', () => {
        const { result } = renderHook(() => useDraftsModal());
        expect(result.current.isOpen).toBe(false);
    });

    it('opens the modal when onOpen is called', () => {
        const { result } = renderHook(() => useDraftsModal());
        act(() => {
            result.current.onOpen();
        });
        expect(result.current.isOpen).toBe(true);
    });

    it('closes the modal when onClose is called', () => {
        const { result } = renderHook(() => useDraftsModal());
        act(() => {
            result.current.onOpen();
        });
        expect(result.current.isOpen).toBe(true);

        act(() => {
            result.current.onClose();
        });
        expect(result.current.isOpen).toBe(false);
    });
});
