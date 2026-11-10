import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useListActions from '@/app/hooks/useListActions';
import { SafeList, SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('axios');
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
    }),
}));

describe('useListActions', () => {
    const mockUser: SafeUser = {
        id: 'user-id-1',
        name: 'User 1',
        image: null,
        level: 1,
        verified: false,
        badges: [],
    };

    const mockList: SafeList = {
        id: 'list-1',
        name: 'My Special List',
        userId: 'user-id-1',
        recipeIds: ['recipe-1'],
        isDefault: false,
        isPrivate: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('identifies owner and default list title correctly', () => {
        const { result } = renderHook(() =>
            useListActions({ list: mockList, currentUser: mockUser })
        );

        expect(result.current.isOwner).toBe(true);
        expect(result.current.shareTitle).toBe('My Special List');
    });

    it('identifies default list share title correctly', () => {
        const { result } = renderHook(() =>
            useListActions({
                list: { ...mockList, isDefault: true },
                currentUser: mockUser,
            })
        );

        expect(result.current.shareTitle).toBe('to_cook_later');
    });

    it('toggles list privacy successfully', async () => {
        vi.mocked(axios.patch).mockResolvedValue({ data: {} });
        const { result } = renderHook(() =>
            useListActions({ list: mockList, currentUser: mockUser })
        );

        await act(async () => {
            await result.current.togglePrivacy();
        });

        expect(axios.patch).toHaveBeenCalledWith('/api/lists/list-1', {
            isPrivate: false,
        });
        expect(toast.success).toHaveBeenCalled();
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('does not toggle privacy if not owner', async () => {
        const otherUser = { ...mockUser, id: 'other-id' };
        const { result } = renderHook(() =>
            useListActions({ list: mockList, currentUser: otherUser })
        );

        await act(async () => {
            await result.current.togglePrivacy();
        });

        expect(axios.patch).not.toHaveBeenCalled();
    });

    it('deletes list successfully', async () => {
        vi.mocked(axios.delete).mockResolvedValue({ data: {} });
        const { result } = renderHook(() =>
            useListActions({ list: mockList, currentUser: mockUser })
        );

        await act(async () => {
            await result.current.onDelete();
        });

        expect(axios.delete).toHaveBeenCalledWith('/api/lists/list-1');
        expect(mockPush).toHaveBeenCalledWith('/lists');
        expect(mockRefresh).toHaveBeenCalled();
        expect(result.current.isConfirmModalOpen).toBe(false);
    });

    it('removes recipe from list successfully', async () => {
        vi.mocked(axios.delete).mockResolvedValue({ data: {} });
        const { result } = renderHook(() =>
            useListActions({ list: mockList, currentUser: mockUser })
        );

        await act(async () => {
            await result.current.onRemoveRecipe('recipe-1');
        });

        expect(axios.delete).toHaveBeenCalledWith(
            '/api/lists/list-1/recipes/recipe-1'
        );
        expect(mockRefresh).toHaveBeenCalled();
        expect(result.current.deletingId).toBe('');
    });
});
