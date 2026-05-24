import React from 'react';
import {
    render,
    screen,
    cleanup,
    fireEvent,
    waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeBookModal from '@/app/components/modals/RecipeBookModal';
import useRecipeBookModal from '@/app/hooks/useRecipeBookModal';
import axios from 'axios';

vi.mock('@/app/hooks/useRecipeBookModal');
vi.mock('axios');
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@react-pdf/renderer', () => ({
    pdf: vi.fn().mockReturnValue({
        toBlob: vi
            .fn()
            .mockResolvedValue(
                new Blob(['pdf-data'], { type: 'application/pdf' })
            ),
    }),
}));

vi.mock('../../profile/RecipeBookPDF', () => ({
    RecipeBookPDF: () => <div data-testid="mock-pdf">RecipeBookPDF</div>,
}));

vi.mock('@/app/components/modals/Modal', () => ({
    default: ({
        isOpen: _isOpen,
        onClose,
        onSubmit,
        title,
        body,
        actionLabel,
        ..._props
    }: any) => (
        <div data-testid="modal">
            <div data-testid="modal-title">{title}</div>
            <div data-testid="modal-body">{body}</div>
            <button
                data-testid="action-button"
                onClick={onSubmit}
            >
                {actionLabel}
            </button>
            <button
                data-testid="close-modal-button"
                onClick={onClose}
            >
                Close
            </button>
        </div>
    ),
}));

describe('RecipeBookModal', () => {
    const mockOnClose = vi.fn();
    const mockOnOpen = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useRecipeBookModal).mockReturnValue({
            isOpen: true,
            userId: 'user-123',
            userName: 'Alice',
            userImage: 'https://example.com/avatar.png',
            onClose: mockOnClose,
            onOpen: mockOnOpen,
        } as any);

        vi.mocked(axios.get).mockResolvedValue({
            data: [
                {
                    id: 'recipe-1',
                    title: 'Chocolate Cake',
                    steps: ['Bake it'],
                    ingredients: ['Chocolate'],
                },
            ],
        });

        // Mock URL.createObjectURL and URL.revokeObjectURL
        global.URL.createObjectURL = vi
            .fn()
            .mockReturnValue('blob:http://localhost/pdf');
        global.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the configuration options when open', () => {
        render(<RecipeBookModal />);

        expect(screen.getByTestId('modal-title').textContent).toContain(
            'recipe_book'
        );
        expect(screen.getByText('recipe_image_display')).toBeDefined();
        expect(screen.getByText('display_extra_images')).toBeDefined();
        expect(screen.getByText('display_user_image_in_cover')).toBeDefined();
    });

    it('toggles display extra images switch', async () => {
        render(<RecipeBookModal />);

        const extraImagesToggle = screen.getByTestId('extra-images-toggle');
        expect(extraImagesToggle.getAttribute('aria-checked')).toBe('true');

        fireEvent.click(extraImagesToggle);
        expect(extraImagesToggle.getAttribute('aria-checked')).toBe('false');
    });

    it('toggles display user image switch', async () => {
        render(<RecipeBookModal />);

        const userImageToggle = screen.getByTestId('user-image-toggle');
        expect(userImageToggle.getAttribute('aria-checked')).toBe('true');

        fireEvent.click(userImageToggle);
        expect(userImageToggle.getAttribute('aria-checked')).toBe('false');
    });

    it('triggers PDF generation and calls onClose on submit', async () => {
        render(<RecipeBookModal />);

        const actionButton = screen.getByTestId('action-button');
        fireEvent.click(actionButton);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                '/api/user/user-123/recipes'
            );
            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
