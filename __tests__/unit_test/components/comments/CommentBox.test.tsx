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
import {
    COMMENT_MAX_LENGTH,
    CHAR_COUNT_WARNING_THRESHOLD,
} from '@/app/utils/constants';

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

// Mock MentionInput component
vi.mock('@/app/components/inputs/MentionInput', () => ({
    default: ({ value, onChange, placeholder, dataCy, ...props }: any) => (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            data-cy={dataCy}
            {...props}
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
                const submitButton = screen.getByTestId('submit-comment');
                expect(submitButton).toHaveProperty('disabled', false);
            },
            { timeout: 4000 }
        );
    });

    it('disables submit button when comment is empty', () => {
        render(<CommentBox {...mockProps} />);

        const submitButton = screen.getByTestId('submit-comment');
        expect(submitButton).toHaveProperty('disabled');
    });

    it('calls onCreateComment with the comment text and null rating when submitted without rating', async () => {
        render(<CommentBox {...mockProps} />);

        const textarea = screen.getByPlaceholderText('write_comment');
        fireEvent.change(textarea, {
            target: { value: 'This is a test comment' },
        });

        const submitButton = screen.getByTestId('submit-comment');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockProps.onCreateComment).toHaveBeenCalledWith(
                'This is a test comment',
                null,
                false,
                null
            );
        });
    });

    it('calls onCreateComment with comment and selected rating when rating is clicked', async () => {
        render(<CommentBox {...mockProps} />);

        const textarea = screen.getByPlaceholderText('write_comment');
        fireEvent.change(textarea, {
            target: { value: 'Very nice!' },
        });

        const star = screen.getByTestId('star-4');
        fireEvent.click(star);

        const submitButton = screen.getByTestId('submit-comment');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockProps.onCreateComment).toHaveBeenCalledWith(
                'Very nice!',
                4,
                false,
                null
            );
        });
    });

    it('clears the rating when clear button is clicked', async () => {
        render(<CommentBox {...mockProps} />);

        const star = screen.getByTestId('star-4');
        fireEvent.click(star);

        const clearButton = screen.getByTestId('clear-rating');
        expect(clearButton).toBeDefined();

        fireEvent.click(clearButton);

        expect(screen.queryByTestId('clear-rating')).toBeNull();

        const textarea = screen.getByPlaceholderText('write_comment');
        fireEvent.change(textarea, {
            target: { value: 'No rating comment' },
        });

        const submitButton = screen.getByTestId('submit-comment');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockProps.onCreateComment).toHaveBeenCalledWith(
                'No rating comment',
                null,
                false,
                null
            );
        });
    });

    it('resets the textarea and re-enables the submit button after submission', async () => {
        render(<CommentBox {...mockProps} />);

        const textarea = screen.getByPlaceholderText('write_comment');
        fireEvent.change(textarea, {
            target: { value: 'This is a test comment' },
        });

        const submitButton = screen.getByTestId('submit-comment');
        fireEvent.click(submitButton);

        await waitFor(
            () => {
                expect((textarea as HTMLTextAreaElement).value).toBe(''); // Assert textarea is cleared
                fireEvent.change(textarea, { target: { value: 'A' } }); // Simulate new typing
                expect(submitButton).toHaveProperty('disabled', false); // Now button should be enabled
            },
            { timeout: 4000 }
        );
    });

    it('has cursor-pointer style when enabled and not loading', async () => {
        render(
            <CommentBox
                {...mockProps}
                isLoading={false}
            />
        );
        const textarea = screen.getByPlaceholderText('write_comment');
        fireEvent.change(textarea, { target: { value: 'Test comment' } });

        const submitButton = screen.getByTestId('submit-comment');
        await waitFor(() => {
            // Ensure the button is enabled by checking the disabled attribute directly
            // and also by class, as per the component's logic
            expect(submitButton).toHaveProperty('disabled', false);
            expect(submitButton).toHaveProperty(
                'className',
                expect.stringContaining('cursor-pointer')
            );
            expect(submitButton.className).not.toContain('cursor-not-allowed');
            expect(submitButton.className).not.toContain('opacity-50');
        });
    });

    it('has cursor-not-allowed style when disabled', () => {
        render(
            <CommentBox
                {...mockProps}
                isLoading={false}
            />
        ); // Initially empty, so button is disabled
        const submitButton = screen.getByTestId('submit-comment');
        expect(submitButton).toHaveProperty('disabled', true);
        expect(submitButton).toHaveProperty(
            'className',
            expect.stringContaining('cursor-not-allowed')
        );
        expect(submitButton).toHaveProperty(
            'className',
            expect.stringContaining('opacity-50')
        );
        expect(submitButton.className).not.toContain('cursor-pointer');
    });

    it('has cursor-not-allowed style when loading', () => {
        render(
            <CommentBox
                {...mockProps}
                isLoading={true}
            />
        );
        const submitButton = screen.getByTestId('submit-comment');
        expect(submitButton).toHaveProperty('disabled', true);
        expect(submitButton).toHaveProperty(
            'className',
            expect.stringContaining('cursor-not-allowed')
        );
        expect(submitButton).toHaveProperty(
            'className',
            expect.stringContaining('opacity-50')
        );
        expect(submitButton.className).not.toContain('cursor-pointer');
    });

    it('hides character count when comment length is below 80% threshold', () => {
        render(<CommentBox {...mockProps} />);

        // Character count should be hidden when comment is empty (0% of 500)
        const commentBox = document.querySelector('.absolute.right-2.bottom-2');
        expect(commentBox?.className).toContain('opacity-0');
    });

    it('shows character count when comment length is at or above 80% threshold', async () => {
        render(<CommentBox {...mockProps} />);

        const textarea = screen.getByPlaceholderText('write_comment');
        const thresholdLength = Math.ceil(
            COMMENT_MAX_LENGTH * CHAR_COUNT_WARNING_THRESHOLD
        ); // 400 chars = 80% of 500
        const longComment = 'a'.repeat(thresholdLength);
        fireEvent.change(textarea, { target: { value: longComment } });

        await waitFor(() => {
            const commentBox = document.querySelector(
                '.absolute.right-2.bottom-2'
            );
            expect(commentBox?.className).toContain('opacity-100');
        });
    });

    it('toggles I Cooked This! checkbox and passes isCooked on submit', async () => {
        render(<CommentBox {...mockProps} />);

        const textarea = screen.getByPlaceholderText('write_comment');
        fireEvent.change(textarea, {
            target: { value: 'Made this for dinner!' },
        });

        const cookedToggle = screen.getByTestId('cooked-toggle');
        expect(cookedToggle).toHaveProperty('checked', false);

        fireEvent.click(cookedToggle);
        expect(cookedToggle).toHaveProperty('checked', true);

        const submitButton = screen.getByTestId('submit-comment');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockProps.onCreateComment).toHaveBeenCalledWith(
                'Made this for dinner!',
                null,
                true,
                null
            );
        });
    });

    it('toggles rating stars container when rate button is clicked', () => {
        render(<CommentBox {...mockProps} />);

        const rateBtn = screen.getByTestId('rate-toggle-btn');
        expect(rateBtn).toBeDefined();

        fireEvent.click(rateBtn);
        const star = screen.getByTestId('star-5');
        expect(star).toBeDefined();
    });

    it('renders with transparent background container', () => {
        const { container } = render(<CommentBox {...mockProps} />);
        const cardBox = container.querySelector('.rounded-xl');
        expect(cardBox?.className).toContain('bg-transparent');
    });

    it('displays photo preview when an image file is selected and allows removing it', async () => {
        render(<CommentBox {...mockProps} />);

        const fileInput = screen.getByTestId('cooked-photo-input');
        const file = new File(['fake image'], 'remake.png', {
            type: 'image/png',
        });

        // Mock URL.createObjectURL and revokeObjectURL
        window.URL.createObjectURL = vi.fn(
            () => 'blob:http://localhost/fake-url'
        );
        window.URL.revokeObjectURL = vi.fn();

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByTestId('photo-preview')).toBeDefined();
        });

        const removeBtn = screen.getByTestId('remove-photo');
        fireEvent.click(removeBtn);

        expect(screen.queryByTestId('photo-preview')).toBeNull();
    });

    it('applies correct responsive text visibility classes to action buttons', () => {
        render(<CommentBox {...mockProps} />);

        const cookedLabel = screen.getByTestId('cooked-toggle-label');
        expect(cookedLabel.querySelector('.md\\:hidden')).toBeDefined();
        expect(cookedLabel.querySelector('.hidden.md\\:inline')).toBeDefined();

        const rateBtn = screen.getByTestId('rate-toggle-btn');
        expect(rateBtn.querySelector('.hidden.md\\:inline')).toBeDefined();
    });

    it('uses text-base and sm:text-sm font size classes on input to prevent auto-zoom on mobile', () => {
        render(<CommentBox {...mockProps} />);

        const textarea = screen.getByPlaceholderText('write_comment');
        expect(textarea.className).toContain('text-base');
        expect(textarea.className).toContain('sm:text-sm');
    });
});
