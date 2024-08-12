import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Comments from '@/app/components/comments/Comments';
import { SafeComment, SafeUser } from '@/app/types';

// Mocks
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/components/comments/CommentBox', () => ({
    default: ({
        userImage,
        onCreateComment,
    }: {
        userImage: string;
        onCreateComment: (comment: string) => void;
    }) => (
        <div>
            <img
                src={userImage}
                alt="avatar"
            />
            <button onClick={() => onCreateComment('This is a new comment')}>
                Submit
            </button>
        </div>
    ),
}));

vi.mock('@/app/components/comments/Comment', () => ({
    default: ({ userName, comment }: { userName: string; comment: string }) => (
        <div>
            <p>{userName}</p>
            <p>{comment}</p>
        </div>
    ),
}));

describe('Comments', () => {
    const mockUser: SafeUser = {
        id: '1',
        image: 'https://example.com/avatar.jpg',
        name: 'Test User',
        email: null,
        emailVerified: null,
        hashedPassword: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favoriteIds: [],
        emailNotifications: false,
        level: 1,
        verified: false,
    };

    const mockComments: SafeComment[] = [
        {
            id: '1',
            comment: 'This is a comment',
            createdAt: new Date().toISOString(),
            userId: '1',
            user: mockUser,
            recipeId: '1', // Add the recipeId property
        },
    ];

    const mockOnCreateComment = vi.fn();

    afterEach(() => {
        cleanup();
    });

    it('renders correctly', () => {
        render(
            <Comments
                currentUser={mockUser}
                onCreateComment={mockOnCreateComment}
                comments={mockComments}
            />
        );

        expect(screen.getByText('comments')).toBeDefined();
        expect(screen.getByAltText('avatar')).toHaveProperty(
            'src',
            mockUser.image
        );
    });

    it('displays comments', () => {
        render(
            <Comments
                currentUser={mockUser}
                onCreateComment={mockOnCreateComment}
                comments={mockComments}
            />
        );

        expect(screen.getByText('Test User')).toBeDefined();
        expect(screen.getByText('This is a comment')).toBeDefined();
    });

    it('handles creating a comment', async () => {
        render(
            <Comments
                currentUser={mockUser}
                onCreateComment={mockOnCreateComment}
                comments={mockComments}
            />
        );

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnCreateComment).toHaveBeenCalledWith(
                'This is a new comment'
            );
        });
    });
});
