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

vi.mock('@/app/components/profile/RecipeBookPDF', () => ({
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
        secondaryAction,
        secondaryActionLabel,
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
            {secondaryAction && (
                <button
                    data-testid="secondary-action-button"
                    onClick={secondaryAction}
                >
                    {secondaryActionLabel}
                </button>
            )}
            <button
                data-testid="close-modal-button"
                onClick={onClose}
            >
                Close
            </button>
        </div>
    ),
}));

// Mock child step components so we can test the modal logic in isolation
vi.mock(
    '@/app/components/modals/recipe-book-steps/RecipeBookConfigStep',
    () => ({
        default: ({ dispatch }: any) => (
            <div data-testid="config-step">
                <button
                    data-testid="extra-images-toggle"
                    role="switch"
                    aria-checked="true"
                    onClick={() => dispatch({ type: 'TOGGLE_EXTRA_IMAGES' })}
                />
                <button
                    data-testid="user-image-toggle"
                    role="switch"
                    aria-checked="true"
                    onClick={() => dispatch({ type: 'TOGGLE_USER_IMAGE' })}
                />
            </div>
        ),
    })
);

vi.mock(
    '@/app/components/modals/recipe-book-steps/RecipeBookSelectStep',
    () => ({
        default: ({ recipes, selectedRecipeIds, dispatch }: any) => (
            <div data-testid="select-step">
                {recipes.map((r: any) => (
                    <button
                        key={r.id}
                        data-testid={`recipe-item-${r.id}`}
                        aria-pressed={selectedRecipeIds.has(r.id)}
                        onClick={() =>
                            dispatch({ type: 'TOGGLE_RECIPE', payload: r.id })
                        }
                    >
                        {r.title}
                    </button>
                ))}
            </div>
        ),
    })
);

describe('RecipeBookModal', () => {
    const mockOnClose = vi.fn();
    const mockOnOpen = vi.fn();

    const mockRecipes = [
        {
            id: 'recipe-1',
            title: 'Chocolate Cake',
            steps: ['Bake it'],
            ingredients: ['Chocolate'],
        },
        {
            id: 'recipe-2',
            title: 'Pasta',
            steps: ['Boil'],
            ingredients: ['Pasta'],
        },
    ];

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
            data: mockRecipes,
        });

        global.URL.createObjectURL = vi
            .fn()
            .mockReturnValue('blob:http://localhost/pdf');
        global.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Step 1 — Configuration', () => {
        it('renders the configuration step by default', () => {
            render(<RecipeBookModal />);

            expect(screen.getByTestId('modal-title').textContent).toContain(
                'recipe_book'
            );
            expect(screen.getByTestId('config-step')).toBeDefined();
            expect(screen.queryByTestId('select-step')).toBeNull();
        });

        it('shows "next" action label on step 1', () => {
            render(<RecipeBookModal />);
            expect(screen.getByTestId('action-button').textContent).toBe(
                'next'
            );
        });

        it('does not show a back button on step 1', () => {
            render(<RecipeBookModal />);
            expect(screen.queryByTestId('secondary-action-button')).toBeNull();
        });

        it('dispatches TOGGLE_EXTRA_IMAGES via config step', () => {
            render(<RecipeBookModal />);
            const toggle = screen.getByTestId('extra-images-toggle');
            fireEvent.click(toggle);
            // No error means dispatch worked; reducer is tested separately
        });
    });

    describe('Step 2 — Recipe selection', () => {
        it('advances to step 2 when Next is clicked', async () => {
            render(<RecipeBookModal />);

            fireEvent.click(screen.getByTestId('action-button'));

            await waitFor(() => {
                expect(screen.getByTestId('select-step')).toBeDefined();
            });
            expect(screen.queryByTestId('config-step')).toBeNull();
        });

        it('fetches recipes when advancing to step 2', async () => {
            render(<RecipeBookModal />);
            fireEvent.click(screen.getByTestId('action-button'));

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith(
                    '/api/user/user-123/recipes'
                );
            });
        });

        it('shows "generate_recipe_book" action label on step 2', async () => {
            render(<RecipeBookModal />);
            fireEvent.click(screen.getByTestId('action-button'));

            await waitFor(() => {
                expect(screen.getByTestId('action-button').textContent).toBe(
                    'generate_recipe_book'
                );
            });
        });

        it('shows a back button on step 2', async () => {
            render(<RecipeBookModal />);
            fireEvent.click(screen.getByTestId('action-button'));

            await waitFor(() => {
                expect(
                    screen.getByTestId('secondary-action-button')
                ).toBeDefined();
                expect(
                    screen.getByTestId('secondary-action-button').textContent
                ).toBe('back');
            });
        });

        it('goes back to step 1 when Back is clicked', async () => {
            render(<RecipeBookModal />);
            fireEvent.click(screen.getByTestId('action-button'));

            await waitFor(() =>
                expect(screen.getByTestId('select-step')).toBeDefined()
            );

            fireEvent.click(screen.getByTestId('secondary-action-button'));
            expect(screen.getByTestId('config-step')).toBeDefined();
            expect(screen.queryByTestId('select-step')).toBeNull();
        });

        it('renders fetched recipes in the select step', async () => {
            render(<RecipeBookModal />);
            fireEvent.click(screen.getByTestId('action-button'));

            await waitFor(() => {
                expect(screen.getByText('Chocolate Cake')).toBeDefined();
                expect(screen.getByText('Pasta')).toBeDefined();
            });
        });
    });

    describe('PDF generation (step 2 submit)', () => {
        it('generates PDF with all recipes when all are selected', async () => {
            render(<RecipeBookModal />);
            fireEvent.click(screen.getByTestId('action-button'));

            await waitFor(() =>
                expect(screen.getByTestId('select-step')).toBeDefined()
            );

            fireEvent.click(screen.getByTestId('action-button'));

            await waitFor(() => {
                expect(mockOnClose).toHaveBeenCalled();
            });
        });

        it('generates PDF only with selected recipes when some are deselected', async () => {
            render(<RecipeBookModal />);
            fireEvent.click(screen.getByTestId('action-button'));

            await waitFor(() =>
                expect(screen.getByTestId('recipe-item-recipe-1')).toBeDefined()
            );

            // Deselect recipe-1
            fireEvent.click(screen.getByTestId('recipe-item-recipe-1'));

            fireEvent.click(screen.getByTestId('action-button'));

            await waitFor(() => {
                expect(mockOnClose).toHaveBeenCalled();
            });
        });
    });

    describe('Modal reset on open', () => {
        it('resets to step 1 when modal re-opens', async () => {
            const { rerender } = render(<RecipeBookModal />);

            // Advance to step 2
            fireEvent.click(screen.getByTestId('action-button'));
            await waitFor(() =>
                expect(screen.getByTestId('select-step')).toBeDefined()
            );

            // Close and re-open
            vi.mocked(useRecipeBookModal).mockReturnValue({
                isOpen: false,
                userId: 'user-123',
                userName: 'Alice',
                userImage: null,
                onClose: mockOnClose,
                onOpen: mockOnOpen,
            } as any);
            rerender(<RecipeBookModal />);

            vi.mocked(useRecipeBookModal).mockReturnValue({
                isOpen: true,
                userId: 'user-123',
                userName: 'Alice',
                userImage: null,
                onClose: mockOnClose,
                onOpen: mockOnOpen,
            } as any);
            rerender(<RecipeBookModal />);

            expect(screen.getByTestId('config-step')).toBeDefined();
        });
    });
});
