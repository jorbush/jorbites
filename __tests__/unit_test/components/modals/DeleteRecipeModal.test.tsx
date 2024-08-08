import {
    render,
    screen,
    fireEvent,
    act,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import React from 'react';

// Mock the useTranslation hook
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<ConfirmModal />', () => {
    const mockSetIsOpen = vi.fn();
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the modal when open is true', () => {
        render(
            <ConfirmModal
                open={true}
                setIsOpen={mockSetIsOpen}
                onConfirm={mockOnConfirm}
            />
        );
        // Using getAllByText and checking the first occurrence
        expect(screen.getAllByText('delete')[0]).toBeDefined();
    });

    it('renders the confirm title correctly', () => {
        render(
            <ConfirmModal
                open={true}
                setIsOpen={mockSetIsOpen}
                onConfirm={mockOnConfirm}
            />
        );
        expect(screen.getByText('confirm_title')).toBeDefined();
    });

    it('calls setIsOpen with false when close button is clicked', () => {
        render(
            <ConfirmModal
                open={true}
                setIsOpen={mockSetIsOpen}
                onConfirm={mockOnConfirm}
            />
        );
        const closeButton = screen.getByTestId('close-modal-button');
        fireEvent.click(closeButton);

        // Wait for the setTimeout in handleClose
        act(() => {
            vi.runAllTimers();
        });

        expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it('calls onConfirm and setIsOpen with false when confirm button is clicked', () => {
        render(
            <ConfirmModal
                open={true}
                setIsOpen={mockSetIsOpen}
                onConfirm={mockOnConfirm}
            />
        );
        const confirmButton = screen.getAllByText('delete')[1];
        fireEvent.click(confirmButton);
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it('renders nothing when open is false', () => {
        const { container } = render(
            <ConfirmModal
                open={false}
                setIsOpen={mockSetIsOpen}
                onConfirm={mockOnConfirm}
            />
        );
        expect(container.firstChild).toBeNull();
    });
});
