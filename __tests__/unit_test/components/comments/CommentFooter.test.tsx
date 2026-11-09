import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CommentFooter from '@/app/components/comments/CommentFooter';

const mockToggleLike = vi.fn();
let mockHasLiked = false;

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('@/app/hooks/useCommentLike', () => ({
    default: () => ({
        hasLiked: mockHasLiked,
        toggleLike: mockToggleLike,
    }),
}));

describe('CommentFooter', () => {
    const defaultProps = {
        commentId: 'comment123',
        likedIds: ['user1', 'user2'],
        currentUser: null,
        translateButtonElement: (
            <button data-testid="translate-btn">Translate</button>
        ),
        createdAt: '2023-05-20T12:00:00',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockHasLiked = false;
    });

    it('renders translate button and formatted date', () => {
        render(<CommentFooter {...defaultProps} />);
        expect(screen.getByTestId('translate-btn')).toBeDefined();
        expect(screen.getByText('20/05/2023 12:00')).toBeDefined();
    });

    it('renders like button with count and triggers toggleLike', () => {
        render(<CommentFooter {...defaultProps} />);
        const likeButton = screen.getByTestId('comment-like-button');
        expect(likeButton).toBeDefined();
        expect(likeButton.getAttribute('aria-label')).toBe('Like comment');
        expect(screen.getByText('2')).toBeDefined();

        fireEvent.click(likeButton);
        expect(mockToggleLike).toHaveBeenCalledTimes(1);
    });

    it('renders unlike aria-label when hasLiked is true', () => {
        mockHasLiked = true;
        render(<CommentFooter {...defaultProps} />);
        const likeButton = screen.getByTestId('comment-like-button');
        expect(likeButton.getAttribute('aria-label')).toBe('Unlike comment');
    });
});
