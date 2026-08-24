import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CommentInput from '@/app/components/comments/CommentInput';
import {
    COMMENT_MAX_LENGTH,
    CHAR_COUNT_WARNING_THRESHOLD,
} from '@/app/utils/constants';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('@/app/components/inputs/MentionInput', () => ({
    default: ({
        value,
        onChange,
        placeholder,
        disabled,
        maxLength,
        dataCy,
    }: any) => (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            data-cy={dataCy}
        />
    ),
}));

describe('CommentInput', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders with default placeholder and empty value', () => {
        render(
            <CommentInput
                value=""
                onChange={mockOnChange}
            />
        );

        expect(screen.getByPlaceholderText('write_comment')).toBeDefined();
    });

    it('uses custom placeholder if provided', () => {
        render(
            <CommentInput
                value=""
                onChange={mockOnChange}
                placeholder="Custom placeholder..."
            />
        );

        expect(
            screen.getByPlaceholderText('Custom placeholder...')
        ).toBeDefined();
    });

    it('calls onChange when user types', () => {
        render(
            <CommentInput
                value=""
                onChange={mockOnChange}
            />
        );

        const textarea = screen.getByPlaceholderText('write_comment');
        fireEvent.change(textarea, { target: { value: 'Hello world' } });

        expect(mockOnChange).toHaveBeenCalledWith('Hello world');
    });

    it('disables textarea when disabled prop is true', () => {
        render(
            <CommentInput
                value=""
                onChange={mockOnChange}
                disabled={true}
            />
        );

        const textarea = screen.getByPlaceholderText('write_comment');
        expect(textarea).toHaveProperty('disabled', true);
    });

    it('hides character counter when text is below warning threshold', () => {
        const { container } = render(
            <CommentInput
                value="Short text"
                onChange={mockOnChange}
            />
        );

        const counter = container.querySelector('.absolute.right-2.bottom-2');
        expect(counter?.className).toContain('opacity-0');
        expect(counter?.textContent).toBe(`10/${COMMENT_MAX_LENGTH}`);
    });

    it('shows character counter when text reaches or exceeds warning threshold', () => {
        const thresholdLength = Math.ceil(
            COMMENT_MAX_LENGTH * CHAR_COUNT_WARNING_THRESHOLD
        );
        const longText = 'a'.repeat(thresholdLength);

        const { container } = render(
            <CommentInput
                value={longText}
                onChange={mockOnChange}
            />
        );

        const counter = container.querySelector('.absolute.right-2.bottom-2');
        expect(counter?.className).toContain('opacity-100');
        expect(counter?.textContent).toBe(
            `${thresholdLength}/${COMMENT_MAX_LENGTH}`
        );
    });
});
