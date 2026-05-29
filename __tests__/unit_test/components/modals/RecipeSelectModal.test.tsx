import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
    cleanup,
} from '@testing-library/react';
import RecipeSelectModal from '@/app/components/modals/RecipeSelectModal';
import axios from 'axios';

vi.mock('axios');

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('RecipeSelectModal', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders select_recipe title and components when open', () => {
        const mockClose = vi.fn();
        const mockSelect = vi.fn();

        render(
            <RecipeSelectModal
                isOpen={true}
                onClose={mockClose}
                onSelect={mockSelect}
            />
        );

        expect(screen.getByText('select_recipe')).toBeDefined();
        expect(
            screen.getByPlaceholderText('search_recipes_placeholder')
        ).toBeDefined();
        expect(screen.getByText('type_to_search')).toBeDefined();
    });

    it('does not render when closed', () => {
        const { container } = render(
            <RecipeSelectModal
                isOpen={false}
                onClose={vi.fn()}
                onSelect={vi.fn()}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('calls onClose when clicking close button', async () => {
        const mockClose = vi.fn();
        render(
            <RecipeSelectModal
                isOpen={true}
                onClose={mockClose}
                onSelect={vi.fn()}
            />
        );

        const closeButton = screen.getByTestId('close-modal-button');
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(mockClose).toHaveBeenCalled();
        });
    });

    it('performs search and renders results after debounce duration', async () => {
        const mockSelect = vi.fn();
        const mockRecipes = [
            {
                id: 'recipe-1',
                title: 'Spicy Pasta',
                imageSrc: '/pasta.jpg',
                user: { name: 'Chef Mario' },
            },
        ];

        vi.mocked(axios.get).mockResolvedValue({
            data: { recipes: mockRecipes },
        });

        render(
            <RecipeSelectModal
                isOpen={true}
                onClose={vi.fn()}
                onSelect={mockSelect}
            />
        );

        const input = screen.getByPlaceholderText('search_recipes_placeholder');
        fireEvent.change(input, { target: { value: 'Pasta' } });

        // Wait for debounce period (300ms) to resolve
        await act(async () => {
            await sleep(350);
        });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                '/api/search?q=Pasta&type=recipes'
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Spicy Pasta')).toBeDefined();
            expect(screen.getByText('by Chef Mario')).toBeDefined();
        });

        // Click recipe to select it
        const recipeItem = screen.getByText('Spicy Pasta');
        fireEvent.click(recipeItem);

        expect(mockSelect).toHaveBeenCalledWith(mockRecipes[0]);
    });

    it('shows no_recipes_found when api returns empty array', async () => {
        vi.mocked(axios.get).mockResolvedValue({
            data: { recipes: [] },
        });

        render(
            <RecipeSelectModal
                isOpen={true}
                onClose={vi.fn()}
                onSelect={vi.fn()}
            />
        );

        const input = screen.getByPlaceholderText('search_recipes_placeholder');
        fireEvent.change(input, { target: { value: 'Nonexistent' } });

        // Wait for debounce period
        await act(async () => {
            await sleep(350);
        });

        await waitFor(() => {
            expect(screen.getByText('no_recipes_found')).toBeDefined();
        });
    });
});
