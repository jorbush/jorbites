import {
    render,
    screen,
    fireEvent,
    act,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
        expect(screen.getByText('Test Modal')).toBeDefined();
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
        const closeButton = screen.getByTestId('close-modal-button');
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
        expect(mockSecondaryAction).toHaveBeenCalledTimes(1);
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
        expect(screen.getByText('Test Body Content')).toBeDefined();
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
        expect(screen.getByText('Test Footer Content')).toBeDefined();
    });

    it('isolates stacking context and constrains desktop modal height for internal scrolling', () => {
        const { container } = render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                actionLabel="Submit"
                title="Settings"
                body={<div>Tall Content</div>}
            />
        );

        const backdrop = container.firstChild as HTMLElement;
        expect(backdrop.className).toContain('fixed');
        expect(backdrop.className).toContain('z-50');
        expect(backdrop.className).toContain('isolate');
        expect(backdrop.hasAttribute('data-modal-backdrop')).toBe(true);

        const dialogWrapper = backdrop.firstChild as HTMLElement;
        const animator = dialogWrapper.firstChild as HTMLElement;
        const card = animator.firstChild as HTMLElement;

        expect(dialogWrapper.className).toContain(
            'md:max-h-[calc(100vh-6rem)]'
        );
        expect(animator.className).toContain('h-full');
        expect(card.className).toContain('md:h-auto');
    });

    it('submits modal on Enter inside standalone input outside a form', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                actionLabel="Submit"
                body={<input data-testid="standalone-input" />}
            />
        );

        const input = screen.getByTestId('standalone-input');
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not submit modal on Enter inside a nested form or button', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                actionLabel="Save"
                body={
                    <div>
                        <form>
                            <input data-testid="nested-form-input" />
                        </form>
                        <button
                            type="button"
                            data-testid="body-button"
                        >
                            Inner Action
                        </button>
                    </div>
                }
            />
        );

        fireEvent.keyDown(screen.getByTestId('nested-form-input'), {
            key: 'Enter',
        });
        fireEvent.keyDown(screen.getByTestId('body-button'), { key: 'Enter' });
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('only triggers Enter submit on the topmost open modal', () => {
        const innerOnSubmit = vi.fn();
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                actionLabel="Outer"
                body={
                    <Modal
                        isOpen={true}
                        onClose={vi.fn()}
                        onSubmit={innerOnSubmit}
                        actionLabel="Inner"
                        insideModal={true}
                        body={<input data-testid="inner-input" />}
                    />
                }
            />
        );

        fireEvent.keyDown(screen.getByTestId('inner-input'), { key: 'Enter' });
        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(innerOnSubmit).toHaveBeenCalledTimes(1);
    });
});
