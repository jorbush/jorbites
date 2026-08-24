import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CommentActionBar from '@/app/components/comments/CommentActionBar';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

describe('CommentActionBar', () => {
    const defaultProps = {
        rating: null,
        showRating: false,
        onToggleRating: vi.fn(),
        isCooked: false,
        onToggleCooked: vi.fn(),
        selectedFile: null,
        onFileSelect: vi.fn(),
        fileInputRef: { current: null },
        isSubmitting: false,
        commentEmpty: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders all action buttons and submit button', () => {
        render(<CommentActionBar {...defaultProps} />);

        expect(screen.getByTestId('rate-toggle-btn')).toBeDefined();
        expect(screen.getByTestId('cooked-toggle-label')).toBeDefined();
        expect(screen.getByTestId('cooked-photo-input')).toBeDefined();
        expect(screen.getByTestId('submit-comment')).toBeDefined();
    });

    it('calls onToggleRating when rate button is clicked', () => {
        render(<CommentActionBar {...defaultProps} />);

        fireEvent.click(screen.getByTestId('rate-toggle-btn'));
        expect(defaultProps.onToggleRating).toHaveBeenCalledTimes(1);
    });

    it('calls onToggleCooked when cooked toggle is changed', () => {
        render(<CommentActionBar {...defaultProps} />);

        const checkbox = screen.getByTestId('cooked-toggle');
        fireEvent.click(checkbox);
        expect(defaultProps.onToggleCooked).toHaveBeenCalledWith(true);
    });

    it('calls onFileSelect when a file is selected', () => {
        render(<CommentActionBar {...defaultProps} />);

        const fileInput = screen.getByTestId('cooked-photo-input');
        const file = new File(['test'], 'food.png', { type: 'image/png' });

        fireEvent.change(fileInput, { target: { files: [file] } });
        expect(defaultProps.onFileSelect).toHaveBeenCalledTimes(1);
    });

    it('disables submit button when commentEmpty is true', () => {
        render(
            <CommentActionBar
                {...defaultProps}
                commentEmpty={true}
            />
        );

        const submitBtn = screen.getByTestId('submit-comment');
        expect(submitBtn).toHaveProperty('disabled', true);
        expect(submitBtn.className).toContain('cursor-not-allowed');
    });

    it('disables submit button when isSubmitting is true', () => {
        render(
            <CommentActionBar
                {...defaultProps}
                isSubmitting={true}
            />
        );

        const submitBtn = screen.getByTestId('submit-comment');
        expect(submitBtn).toHaveProperty('disabled', true);
        expect(submitBtn.className).toContain('cursor-not-allowed');
    });

    it('enables submit button when comment is not empty and not submitting', () => {
        render(
            <CommentActionBar
                {...defaultProps}
                isSubmitting={false}
                commentEmpty={false}
            />
        );

        const submitBtn = screen.getByTestId('submit-comment');
        expect(submitBtn).toHaveProperty('disabled', false);
        expect(submitBtn.className).toContain('cursor-pointer');
    });
});
