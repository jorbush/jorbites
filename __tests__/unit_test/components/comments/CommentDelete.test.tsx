import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CommentDelete from '@/app/components/comments/CommentDelete';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const mockRefresh = vi.fn();

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

vi.mock('axios');
vi.mock('react-hot-toast');

vi.mock('@/app/components/modals/ConfirmModal', () => ({
    default: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
        open ? (
            <button
                onClick={onConfirm}
                data-testid="confirm-delete"
            >
                Confirm Delete
            </button>
        ) : null,
}));

describe('CommentDelete', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns null when canDelete is false or omitted', () => {
        const { container: falseContainer } = render(
            <CommentDelete
                commentId="c1"
                canDelete={false}
            />
        );
        expect(falseContainer.firstChild).toBeNull();

        const { container: omittedContainer } = render(
            <CommentDelete commentId="c1" />
        );
        expect(omittedContainer.firstChild).toBeNull();
    });

    it('renders delete icon button when canDelete is true', () => {
        render(
            <CommentDelete
                commentId="c1"
                canDelete={true}
            />
        );
        expect(screen.getByTestId('MdDelete')).toBeDefined();
    });

    it('opens confirm modal when delete icon is clicked and deletes comment on confirm', async () => {
        (axios.delete as any).mockResolvedValue({});

        render(
            <CommentDelete
                commentId="c1"
                canDelete={true}
            />
        );

        fireEvent.click(screen.getByTestId('MdDelete'));
        expect(screen.getByTestId('confirm-delete')).toBeDefined();

        fireEvent.click(screen.getByTestId('confirm-delete'));

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith('/api/comments/c1');
            expect(toast.success).toHaveBeenCalledWith('comment_deleted');
            expect(mockRefresh).toHaveBeenCalledTimes(1);
        });
    });

    it('shows error toast when deletion fails', async () => {
        (axios.delete as any).mockRejectedValue(new Error('Network error'));

        render(
            <CommentDelete
                commentId="c1"
                canDelete={true}
            />
        );

        fireEvent.click(screen.getByTestId('MdDelete'));
        fireEvent.click(screen.getByTestId('confirm-delete'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something_went_wrong');
        });
    });
});
