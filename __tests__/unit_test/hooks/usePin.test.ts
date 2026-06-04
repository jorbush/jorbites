import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import usePin from '@/app/hooks/usePin';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import useLoginModal from '@/app/hooks/useLoginModal';
import { toast } from 'react-hot-toast';

vi.mock('axios');
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        refresh: vi.fn(),
    })),
}));
vi.mock('@/app/hooks/useLoginModal', () => ({
    default: vi.fn(() => ({
        onOpen: vi.fn(),
    })),
}));
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('usePin hook', () => {
    const mockRecipeId = 'recipe-123';
    const mockCurrentUser = {
        id: 'user-456',
        pinnedRecipeIds: ['pin-1'],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should determine isPinned correctly', () => {
        const { result: r1 } = renderHook(() =>
            usePin({ recipeId: 'pin-1', currentUser: mockCurrentUser as any })
        );
        expect(r1.current.isPinned).toBe(true);

        const { result: r2 } = renderHook(() =>
            usePin({ recipeId: 'pin-2', currentUser: mockCurrentUser as any })
        );
        expect(r2.current.isPinned).toBe(false);
    });

    it('should trigger login modal if no user is authenticated', async () => {
        const onOpenMock = vi.fn();
        vi.mocked(useLoginModal).mockReturnValue({ onOpen: onOpenMock } as any);

        const { result } = renderHook(() =>
            usePin({ recipeId: mockRecipeId, currentUser: null })
        );

        await act(async () => {
            await result.current.togglePin({
                stopPropagation: () => {},
            } as any);
        });

        expect(onOpenMock).toHaveBeenCalled();
    });

    it('should pin a recipe successfully', async () => {
        const refreshMock = vi.fn();
        vi.mocked(useRouter).mockReturnValue({ refresh: refreshMock } as any);
        vi.mocked(axios.post).mockResolvedValue({ data: {} });

        const { result } = renderHook(() =>
            usePin({
                recipeId: 'pin-new',
                currentUser: mockCurrentUser as any,
            })
        );

        await act(async () => {
            await result.current.togglePin({
                stopPropagation: () => {},
            } as any);
        });

        expect(axios.post).toHaveBeenCalledWith('/api/pinned/pin-new');
        expect(toast.success).toHaveBeenCalledWith('pin_success');
        expect(refreshMock).toHaveBeenCalled();
    });

    it('should unpin a recipe successfully', async () => {
        const refreshMock = vi.fn();
        vi.mocked(useRouter).mockReturnValue({ refresh: refreshMock } as any);
        vi.mocked(axios.delete).mockResolvedValue({ data: {} });

        const { result } = renderHook(() =>
            usePin({ recipeId: 'pin-1', currentUser: mockCurrentUser as any })
        );

        await act(async () => {
            await result.current.togglePin({
                stopPropagation: () => {},
            } as any);
        });

        expect(axios.delete).toHaveBeenCalledWith('/api/pinned/pin-1');
        expect(toast.success).toHaveBeenCalledWith('unpin_success');
        expect(refreshMock).toHaveBeenCalled();
    });

    it('should show toast error if pin limit is exceeded', async () => {
        const userWith4Pins = {
            id: 'user-456',
            pinnedRecipeIds: ['pin-1', 'pin-2', 'pin-3', 'pin-4'],
        };
        const { result } = renderHook(() =>
            usePin({ recipeId: 'pin-5', currentUser: userWith4Pins as any })
        );

        await act(async () => {
            await result.current.togglePin({
                stopPropagation: () => {},
            } as any);
        });

        expect(axios.post).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('pin_limit_reached');
    });
});
