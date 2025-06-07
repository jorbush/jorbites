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

// Mocks
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('react-hot-toast');

// Mock Avatar component
vi.mock('@/app/components/utils/Avatar', () => ({
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
                expect(textarea.value).toBe(''); // Assert textarea is cleared
                fireEvent.change(textarea, { target: { value: 'A' } }); // Simulate new typing
                expect(submitButton).toHaveProperty('disabled', false); // Now button should be enabled
            },
            { timeout: 4000 }
        );
    });

    it('has cursor-pointer style when enabled and not loading', async () => {
        render(<CommentBox {...mockProps} isLoading={false} />);
        const textarea = screen.getByPlaceholderText('write_comment');
        fireEvent.change(textarea, { target: { value: 'Test comment' } });

        const submitButton = screen.getByTestId('submit-comment');
        await waitFor(() => {
            // Ensure the button is enabled by checking the disabled attribute directly
            // and also by class, as per the component's logic
            expect(submitButton).toHaveProperty('disabled', false);
            expect(submitButton).toHaveProperty('className', expect.stringContaining('cursor-pointer'));
            expect(submitButton.className).not.toContain('cursor-not-allowed');
            expect(submitButton.className).not.toContain('opacity-50');
        });
    });

    it('has cursor-not-allowed style when disabled', () => {
        render(<CommentBox {...mockProps} isLoading={false} />); // Initially empty, so button is disabled
        const submitButton = screen.getByTestId('submit-comment');
        expect(submitButton).toHaveProperty('disabled', true);
        expect(submitButton).toHaveProperty('className', expect.stringContaining('cursor-not-allowed'));
        expect(submitButton).toHaveProperty('className', expect.stringContaining('opacity-50'));
        expect(submitButton.className).not.toContain('cursor-pointer');
    });

    it('has cursor-not-allowed style when loading', () => {
        render(<CommentBox {...mockProps} isLoading={true} />);
        const submitButton = screen.getByTestId('submit-comment');
        expect(submitButton).toHaveProperty('disabled', true);
        expect(submitButton).toHaveProperty('className', expect.stringContaining('cursor-not-allowed'));
        expect(submitButton).toHaveProperty('className', expect.stringContaining('opacity-50'));
        expect(submitButton.className).not.toContain('cursor-pointer');
    });
});
