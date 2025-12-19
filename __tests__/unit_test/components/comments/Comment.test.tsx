import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Comment from '@/app/components/comments/Comment';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// Mocks
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: vi.fn(),
            language: 'en',
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: vi.fn(),
    },
}));

vi.mock('axios');
vi.mock('react-hot-toast');

// Mock ConfirmModal
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

describe('Comment', () => {
    const mockProps = {
        userId: '123',
        userImage: 'https://example.com/avatar.jpg',
        comment: 'This is a test comment',
        createdAt: '2023-05-20T12:00:00',
        userName: 'Test User',
        commentId: 'comment123',
        userLevel: 5,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders comment correctly', () => {
        render(<Comment {...mockProps} />);

        expect(screen.getByText('Test User')).toBeDefined();
        expect(screen.getByText('This is a test comment')).toBeDefined();
        expect(screen.getByText('level 5')).toBeDefined();
        expect(screen.getByText('20/05/2023 12:00')).toBeDefined();
    });

    it('shows delete icon when canDelete prop is true', () => {
        render(
            <Comment
                {...mockProps}
                canDelete={true}
            />
        );

        expect(screen.getByTestId('MdDelete')).toBeDefined();
    });

    it('opens confirm modal when delete icon is clicked', async () => {
        render(
            <Comment
                {...mockProps}
                canDelete={true}
            />
        );

        fireEvent.click(screen.getByTestId('MdDelete'));

        await waitFor(() => {
            expect(screen.getByTestId('confirm-delete')).toBeDefined();
        });
    });

    it('deletes comment when confirmed', async () => {
        (axios.delete as any).mockResolvedValue({});

        render(
            <Comment
                {...mockProps}
                canDelete={true}
            />
        );

        fireEvent.click(screen.getByTestId('MdDelete'));

        await waitFor(() => {
            fireEvent.click(screen.getByTestId('confirm-delete'));
        });

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                '/api/comments/comment123'
            );
            expect(toast.success).toHaveBeenCalledWith('comment_deleted');
        });
    });

    it('shows error toast when delete fails', async () => {
        (axios.delete as any).mockRejectedValue(new Error('API Error'));

        render(
            <Comment
                {...mockProps}
                canDelete={true}
            />
        );

        fireEvent.click(screen.getByTestId('MdDelete'));

        await waitFor(() => {
            fireEvent.click(screen.getByTestId('confirm-delete'));
        });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something_went_wrong');
        });
    });
});
