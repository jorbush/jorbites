import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DeleteWorkshopButton from '@/app/components/workshops/DeleteWorkshopButton';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Mock dependencies
vi.mock('axios');
vi.mock('react-hot-toast');
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

// Mock Modal component
vi.mock('@/app/components/modals/Modal', () => ({
    default: ({ isOpen, body, onSubmit, onClose }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="delete-modal">
                {body}
                <button
                    onClick={onSubmit}
                    data-testid="confirm-delete"
                >
                    Confirm
                </button>
                <button
                    onClick={onClose}
                    data-testid="close-modal"
                >
                    Close
                </button>
            </div>
        );
    },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<DeleteWorkshopButton />', () => {
    const mockRouter = {
        push: vi.fn(),
        refresh: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue(mockRouter);
    });

    afterEach(() => {
        cleanup();
    });

    it('renders delete button', () => {
        render(<DeleteWorkshopButton workshopId="workshop1" />);

        expect(screen.getByText('delete_workshop')).toBeDefined();
    });

    it('opens modal when delete button is clicked', () => {
        render(<DeleteWorkshopButton workshopId="workshop1" />);

        const deleteButton = screen.getByText('delete_workshop');
        fireEvent.click(deleteButton);

        expect(screen.getByTestId('delete-modal')).toBeDefined();
    });

    it('requires correct confirmation text', async () => {
        render(<DeleteWorkshopButton workshopId="workshop1" />);

        const deleteButton = screen.getByText('delete_workshop');
        fireEvent.click(deleteButton);

        const confirmButton = screen.getByTestId('confirm-delete');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('text_does_not_match');
        });
    });

    it('deletes workshop with correct confirmation', async () => {
        (axios.delete as any).mockResolvedValueOnce({ data: {} });

        render(<DeleteWorkshopButton workshopId="workshop1" />);

        const deleteButton = screen.getByText('delete_workshop');
        fireEvent.click(deleteButton);

        // Type the confirmation text
        const input = screen.getByRole('textbox');
        fireEvent.change(input, {
            target: { value: 'Jorbites delete this workshop' },
        });

        const confirmButton = screen.getByTestId('confirm-delete');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                '/api/workshop/workshop1'
            );
            expect(toast.success).toHaveBeenCalledWith('workshop_deleted');
            expect(mockRouter.push).toHaveBeenCalledWith('/workshops');
            expect(mockRouter.refresh).toHaveBeenCalled();
        });
    });

    it('shows error on delete failure', async () => {
        const errorMessage = 'Failed to delete';
        (axios.delete as any).mockRejectedValueOnce({
            response: { data: { error: errorMessage } },
        });

        render(<DeleteWorkshopButton workshopId="workshop1" />);

        const deleteButton = screen.getByText('delete_workshop');
        fireEvent.click(deleteButton);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, {
            target: { value: 'Jorbites delete this workshop' },
        });

        const confirmButton = screen.getByTestId('confirm-delete');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(errorMessage);
        });
    });

    it('closes modal when close button is clicked', () => {
        render(<DeleteWorkshopButton workshopId="workshop1" />);

        const deleteButton = screen.getByText('delete_workshop');
        fireEvent.click(deleteButton);

        expect(screen.getByTestId('delete-modal')).toBeDefined();

        const closeButton = screen.getByTestId('close-modal');
        fireEvent.click(closeButton);

        expect(screen.queryByTestId('delete-modal')).toBeNull();
    });
});
