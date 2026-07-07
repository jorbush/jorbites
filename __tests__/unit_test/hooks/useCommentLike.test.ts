import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useCommentLike from '@/app/hooks/useCommentLike';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const mockRefresh = vi.fn();
const mockOnOpen = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: mockRefresh,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => ({
        onOpen: mockOnOpen,
    }),
}));

vi.mock('axios');
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('useCommentLike hook', () => {
    const mockUser = {
        id: 'user-123',
        name: 'John Doe',
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize hasLiked as false when user has not liked the comment', () => {
        const { result } = renderHook(() =>
            useCommentLike({
                commentId: 'comment-123',
                likedIds: [],
                currentUser: mockUser,
            })
        );

        expect(result.current.hasLiked).toBe(false);
    });

    it('should initialize hasLiked as true when user has liked the comment', () => {
        const { result } = renderHook(() =>
            useCommentLike({
                commentId: 'comment-123',
                likedIds: ['user-123', 'other-user'],
                currentUser: mockUser,
            })
        );

        expect(result.current.hasLiked).toBe(true);
    });

    it('should open login modal when toggling like without being logged in', async () => {
        const { result } = renderHook(() =>
            useCommentLike({
                commentId: 'comment-123',
                likedIds: [],
                currentUser: null,
            })
        );

        await act(async () => {
            await result.current.toggleLike({
                stopPropagation: vi.fn(),
            } as any);
        });

        expect(mockOnOpen).toHaveBeenCalled();
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('should call POST API to like comment when not liked yet', async () => {
        vi.mocked(axios.post).mockResolvedValueOnce({ data: {} });

        const { result } = renderHook(() =>
            useCommentLike({
                commentId: 'comment-123',
                likedIds: [],
                currentUser: mockUser,
            })
        );

        await act(async () => {
            await result.current.toggleLike({
                stopPropagation: vi.fn(),
            } as any);
        });

        expect(axios.post).toHaveBeenCalledWith(
            '/api/comments/comment-123/like'
        );
        expect(mockRefresh).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('success');
    });

    it('should call DELETE API to unlike comment when already liked', async () => {
        vi.mocked(axios.delete).mockResolvedValueOnce({ data: {} });

        const { result } = renderHook(() =>
            useCommentLike({
                commentId: 'comment-123',
                likedIds: ['user-123'],
                currentUser: mockUser,
            })
        );

        await act(async () => {
            await result.current.toggleLike({
                stopPropagation: vi.fn(),
            } as any);
        });

        expect(axios.delete).toHaveBeenCalledWith(
            '/api/comments/comment-123/like'
        );
        expect(mockRefresh).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('success');
    });

    it('should handle API errors and show error toast', async () => {
        const errorMsg = 'Network Error';
        vi.mocked(axios.post).mockRejectedValueOnce(new Error(errorMsg));

        const { result } = renderHook(() =>
            useCommentLike({
                commentId: 'comment-123',
                likedIds: [],
                currentUser: mockUser,
            })
        );

        await act(async () => {
            await result.current.toggleLike({
                stopPropagation: vi.fn(),
            } as any);
        });

        expect(axios.post).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith(errorMsg);
    });
});
