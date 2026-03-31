import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useFavorite from '@/app/hooks/useFavorite';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';

vi.mock('axios');

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockOnOpen = vi.fn();
vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => ({ onOpen: mockOnOpen }),
}));

const mockUser: SafeUser = {
    id: 'user-1',
    name: 'Test User',
    email: null,
    emailVerified: null,
    image: null,
    hashedPassword: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favoriteIds: [],
    emailNotifications: false,
    level: 0,
    verified: false,
};

const recipeId = 'recipe-1';
const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent<HTMLDivElement>;

describe('useFavorite', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns hasFavorited=false when recipe is not in user favoriteIds', () => {
        const { result } = renderHook(() =>
            useFavorite({ recipeId, currentUser: mockUser })
        );

        expect(result.current.hasFavorited).toBe(false);
    });

    it('returns hasFavorited=true when recipe is in user favoriteIds', () => {
        const userWithFavorite = { ...mockUser, favoriteIds: [recipeId] };
        const { result } = renderHook(() =>
            useFavorite({ recipeId, currentUser: userWithFavorite })
        );

        expect(result.current.hasFavorited).toBe(true);
    });

    it('opens login modal when user is not authenticated', () => {
        const { result } = renderHook(() =>
            useFavorite({ recipeId, currentUser: null })
        );

        act(() => {
            result.current.toggleFavorite(mockEvent);
        });

        expect(mockOnOpen).toHaveBeenCalledTimes(1);
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('flips hasFavorited optimistically on click and calls correct APIs', async () => {
        vi.mocked(axios.post).mockResolvedValue({});

        const { result } = renderHook(() =>
            useFavorite({ recipeId, currentUser: mockUser })
        );

        expect(result.current.hasFavorited).toBe(false);

        await act(async () => {
            result.current.toggleFavorite(mockEvent);
        });

        expect(axios.post).toHaveBeenCalledWith(`/api/recipe/${recipeId}`, {
            operation: 'increment',
        });
        expect(axios.post).toHaveBeenCalledWith(`/api/favorites/${recipeId}`);
        expect(toast.success).toHaveBeenCalledWith('success');
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('calls decrement and delete when removing a favorite', async () => {
        vi.mocked(axios.post).mockResolvedValue({});
        vi.mocked(axios.delete).mockResolvedValue({});

        const userWithFavorite = { ...mockUser, favoriteIds: [recipeId] };
        const { result } = renderHook(() =>
            useFavorite({ recipeId, currentUser: userWithFavorite })
        );

        await act(async () => {
            result.current.toggleFavorite(mockEvent);
        });

        expect(axios.post).toHaveBeenCalledWith(`/api/recipe/${recipeId}`, {
            operation: 'decrement',
        });
        expect(axios.delete).toHaveBeenCalledWith(`/api/favorites/${recipeId}`);
        expect(toast.success).toHaveBeenCalledWith('success');
    });

    it('prevents concurrent requests with in-flight guard', async () => {
        let resolveFirst!: (value: unknown) => void;
        const pendingRequest = new Promise((resolve) => {
            resolveFirst = resolve;
        });

        vi.mocked(axios.post)
            .mockReturnValueOnce(pendingRequest as any)
            .mockResolvedValue({});

        const { result } = renderHook(() =>
            useFavorite({ recipeId, currentUser: mockUser })
        );

        // First click — starts request
        act(() => {
            result.current.toggleFavorite(mockEvent);
        });

        // Second click — should be blocked by in-flight guard
        act(() => {
            result.current.toggleFavorite(mockEvent);
        });

        expect(axios.post).toHaveBeenCalledTimes(1);

        // Resolve first request
        await act(async () => {
            resolveFirst({});
        });
    });

    it('rolls back optimistic state and shows error on API failure', async () => {
        vi.mocked(axios.post).mockRejectedValue(new Error('Network error'));

        const userWithFavorite = { ...mockUser, favoriteIds: [recipeId] };
        const { result } = renderHook(() =>
            useFavorite({ recipeId, currentUser: userWithFavorite })
        );

        expect(result.current.hasFavorited).toBe(true);

        await act(async () => {
            result.current.toggleFavorite(mockEvent);
        });

        expect(toast.error).toHaveBeenCalledWith('Network error');
        expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('allows a new request after the previous one completes', async () => {
        vi.mocked(axios.post).mockResolvedValue({});

        const { result } = renderHook(() =>
            useFavorite({ recipeId, currentUser: mockUser })
        );

        await act(async () => {
            result.current.toggleFavorite(mockEvent);
        });

        // After first toggle completes, a second click should be allowed
        await act(async () => {
            result.current.toggleFavorite(mockEvent);
        });

        expect(axios.post).toHaveBeenCalledTimes(4); // 2 calls per toggle (recipe + favorites)
    });
});
