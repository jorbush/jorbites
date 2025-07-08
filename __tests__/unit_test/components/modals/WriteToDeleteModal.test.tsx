import React from 'react';
import {
    render,
    screen,
    cleanup,
    fireEvent,
    waitFor,
} from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import WriteToDeleteModal from '@/app/components/modals/WriteToDeleteModal';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                write_this_to_delete: 'Write this to delete',
                text_delete: 'Delete',
                text_does_not_match: 'The text does not match.',
                delete: 'Delete',
                cancel: 'Cancel',
            };
            return translations[key] || key;
        },
    }),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
    },
}));

vi.mock('@/app/components/modals/Modal', () => ({
    default: ({ isOpen, onSubmit, onClose, body, secondaryAction }: any) => (
        <div
            data-testid="write-to-delete-modal"
            style={{ display: isOpen ? 'block' : 'none' }}
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}
            >
                {body}
                <button
                    type="submit"
                    data-testid="modal-submit"
                >
                    Submit
                </button>
                <button
                    type="button"
                    onClick={secondaryAction}
                    data-testid="modal-cancel"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    data-testid="modal-close"
                >
                    Close
                </button>
            </form>
        </div>
    ),
}));

vi.mock('@/app/components/navigation/Heading', () => ({
    default: ({ title, subtitle }: any) => (
        <div data-testid="heading">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
        </div>
    ),
}));

vi.mock('@/app/components/inputs/Input', () => ({
    default: ({ id, register, required }: any) => (
        <input
            data-testid={`input-${id}`}
            {...register(id, { required })}
        />
    ),
}));

describe('WriteToDeleteModal', () => {
    const mockSetIsOpen = vi.fn();
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly when open', () => {
        render(
            <WriteToDeleteModal
                open={true}
                setIsOpen={mockSetIsOpen}
                onConfirm={mockOnConfirm}
            />
        );

        expect(screen.getByTestId('write-to-delete-modal')).toBeDefined();
        expect(screen.getByTestId('heading')).toBeDefined();
        expect(screen.getByText('Write this to delete')).toBeDefined();
        expect(screen.getByText('"Delete"')).toBeDefined();
        expect(screen.getByTestId('input-text')).toBeDefined();
    });

    it('does not render when closed', () => {
        render(
            <WriteToDeleteModal
                open={false}
                setIsOpen={mockSetIsOpen}
                onConfirm={mockOnConfirm}
            />
        );

        const modal = screen.getByTestId('write-to-delete-modal');
        expect(modal.style.display).toBe('none');
    });

    it('shows custom title and description when provided', () => {
        render(
            <WriteToDeleteModal
                open={true}
                setIsOpen={mockSetIsOpen}
                onConfirm={mockOnConfirm}
                title="Custom Delete Title"
                description="This is a custom description"
            />
        );

        expect(screen.getByText('This is a custom description')).toBeDefined();
    });

    it('uses custom required text when provided', () => {
        render(
            <WriteToDeleteModal
                open={true}
                setIsOpen={mockSetIsOpen}
                onConfirm={mockOnConfirm}
                requiredText="CUSTOM_DELETE"
            />
        );

        expect(screen.getByText('"CUSTOM_DELETE"')).toBeDefined();
    });

    it('calls onConfirm when text matches and form is submitted', async () => {
        render(
            <WriteToDeleteModal
                open={true}
                setIsOpen={mockSetIsOpen}
                onConfirm={mockOnConfirm}
            />
        );

        const input = screen.getByTestId('input-text');
        fireEvent.change(input, { target: { value: 'Delete' } });

        const submitButton = screen.getByTestId('modal-submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnConfirm).toHaveBeenCalledTimes(1);
            expect(mockSetIsOpen).toHaveBeenCalledWith(false);
        });
    });

    it('shows error when text does not match', async () => {
        const { toast } = await import('react-hot-toast');

        render(
            <WriteToDeleteModal
                open={true}
                setIsOpen={mockSetIsOpen}
                onConfirm={mockOnConfirm}
            />
        );

        const input = screen.getByTestId('input-text');
        fireEvent.change(input, { target: { value: 'Wrong Text' } });

        const submitButton = screen.getByTestId('modal-submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'The text does not match.'
            );
            expect(mockOnConfirm).not.toHaveBeenCalled();
        });
    });

    it('closes modal when cancel is clicked', () => {
        render(
            <WriteToDeleteModal
                open={true}
                setIsOpen={mockSetIsOpen}
                onConfirm={mockOnConfirm}
            />
        );

        const cancelButton = screen.getByTestId('modal-cancel');
        fireEvent.click(cancelButton);

        expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it('closes modal when close is clicked', () => {
        render(
            <WriteToDeleteModal
                open={true}
                setIsOpen={mockSetIsOpen}
                onConfirm={mockOnConfirm}
            />
        );

        const closeButton = screen.getByTestId('modal-close');
        fireEvent.click(closeButton);

        expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });
});
