import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CommentBox from '@/app/components/comments/CommentBox';
import { toast } from 'react-hot-toast';

// Mocks
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('react-hot-toast');

// Mock Avatar component
vi.mock('@/app/components/Avatar', () => ({
    default: ({ src }: { src: string }) => (
        <img
            src={src}
            alt="avatar"
        />
    ),
}));

describe('CommentBox', () => {
    const mockProps = {
        userImage: 'https://example.com/avatar.jpg',
        onCreateComment: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly', () => {
        render(<CommentBox {...mockProps} />);

        expect(screen.getByPlaceholderText('write_comment')).toBeDefined();
        expect(screen.getByAltText('avatar')).toHaveProperty(
            'src',
            mockProps.userImage
        );
    });

    it('enables submit button when comment is not empty', async () => {
        render(<CommentBox {...mockProps} />);

        const textarea = screen.getByPlaceholderText('write_comment');
        fireEvent.change(textarea, {
            target: { value: 'This is a test comment' },
        });

        await waitFor(
            () => {
                const submitButton = screen.getByRole('button');
                expect(submitButton).toHaveProperty('disabled', false);
            },
            { timeout: 4000 }
        );
    });

    it('disables submit button when comment is empty', () => {
        render(<CommentBox {...mockProps} />);

        const submitButton = screen.getByRole('button');
        expect(submitButton).toHaveProperty('disabled');
    });

    it('displays an error toast when trying to submit an empty comment', async () => {
        render(<CommentBox {...mockProps} />);

        const submitButton = screen.getByRole('button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Comment cannot be empty');
        });
    });

    it('calls onCreateComment with the comment text when submitted', async () => {
        render(<CommentBox {...mockProps} />);

        const textarea = screen.getByPlaceholderText('write_comment');
        fireEvent.change(textarea, {
            target: { value: 'This is a test comment' },
        });

        const submitButton = screen.getByRole('button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockProps.onCreateComment).toHaveBeenCalledWith(
                'This is a test comment'
            );
        });
    });

    it('resets the textarea and re-enables the submit button after submission', async () => {
        render(<CommentBox {...mockProps} />);

        const textarea = screen.getByPlaceholderText('write_comment');
        fireEvent.change(textarea, {
            target: { value: 'This is a test comment' },
        });

        const submitButton = screen.getByRole('button');
        fireEvent.click(submitButton);

        await waitFor(
            () => {
                expect(textarea.nodeValue).toBeNull();
                expect(submitButton).toHaveProperty('disabled', false);
            },
            { timeout: 4000 }
        );
    });
});
