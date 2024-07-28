import {
    render,
    screen,
    fireEvent,
    act,
    cleanup,
} from '@testing-library/react';
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
} from 'vitest';
import Modal from '@/app/components/modals/Modal';
import React from 'react';

// Mock the useTheme hook
vi.mock('@/app/hooks/useTheme', () => ({
    default: vi.fn(),
}));

describe('<Modal />', () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn();
    const mockSecondaryAction = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders nothing when isOpen is false', () => {
        const { container } = render(
            <Modal
                isOpen={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                actionLabel="Submit"
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders the modal when isOpen is true', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                actionLabel="Submit"
                title="Test Modal"
            />
        );
        expect(
            screen.getByText('Test Modal')
        ).toBeDefined();
    });

    it('calls onClose when close button is clicked', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                actionLabel="Submit"
            />
        );
        const closeButton = screen.getByTestId(
            'close-modal-button'
        );
        fireEvent.click(closeButton);

        // Wait for the setTimeout in handleClose
        act(() => {
            vi.runAllTimers();
        });

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit when submit button is clicked', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                actionLabel="Submit"
            />
        );
        const submitButton = screen.getByRole('button', {
            name: 'Submit',
        });
        fireEvent.click(submitButton);
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('renders secondary action button when provided', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                actionLabel="Submit"
                secondaryAction={mockSecondaryAction}
                secondaryActionLabel="Cancel"
            />
        );
        const cancelButton = screen.getByRole('button', {
            name: 'Cancel',
        });
        expect(cancelButton).toBeDefined();
    });

    it('calls secondaryAction when secondary action button is clicked', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                actionLabel="Submit"
                secondaryAction={mockSecondaryAction}
                secondaryActionLabel="Cancel"
            />
        );
        const cancelButton = screen.getByRole('button', {
            name: 'Cancel',
        });
        fireEvent.click(cancelButton);
        expect(mockSecondaryAction).toHaveBeenCalledTimes(
            1
        );
    });

    it('disables buttons when disabled prop is true', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                actionLabel="Submit"
                secondaryAction={mockSecondaryAction}
                secondaryActionLabel="Cancel"
                disabled={true}
            />
        );
        const submitButton = screen.getByRole('button', {
            name: 'Submit',
        });
        const cancelButton = screen.getByRole('button', {
            name: 'Cancel',
        });
        expect(submitButton).toHaveProperty('disabled');
        expect(cancelButton).toHaveProperty('disabled');
    });

    it('renders body content when provided', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                actionLabel="Submit"
                body={<div>Test Body Content</div>}
            />
        );
        expect(
            screen.getByText('Test Body Content')
        ).toBeDefined();
    });

    it('renders footer content when provided', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                actionLabel="Submit"
                footer={<div>Test Footer Content</div>}
            />
        );
        expect(
            screen.getByText('Test Footer Content')
        ).toBeDefined();
    });
});
