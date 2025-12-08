import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EditRecipeButton from '@/app/components/recipes/EditRecipeButton';
import { SafeUser, SafeRecipe } from '@/app/types';

// Mock the custom hooks
vi.mock('@/app/hooks/useRecipeModal', () => ({
    default: vi.fn(() => ({
        onOpenEdit: vi.fn(),
    })),
    EditRecipeData: {},
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('axios');

describe('EditRecipeButton', () => {
    const mockRecipe: SafeRecipe & { user: SafeUser } = {
        id: '1',
        title: 'Test Recipe',
        minutes: 30,
        imageSrc: 'http://test.jpg',
        extraImages: ['http://test1.jpg', 'http://test2.jpg'],
        categories: ['Dinner'],
        method: 'Baking',
        description: 'Test description',
        ingredients: ['Ingredient 1', 'Ingredient 2'],
        steps: ['Step 1', 'Step 2'],
        numLikes: 5,
        userId: 'user1',
        createdAt: '2022-01-01',
        coCooksIds: ['cook1', 'cook2'],
        linkedRecipeIds: ['recipe1'],
        user: {
            id: 'user1',
            name: 'Test User',
        } as SafeUser,
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders edit button correctly', () => {
        const { getByText } = render(<EditRecipeButton recipe={mockRecipe} />);
        expect(getByText('edit_recipe')).toBeDefined();
    });

    it('calls onOpenEdit when clicked', async () => {
        const mockOnOpenEdit = vi.fn();
        const useRecipeModal = await import('@/app/hooks/useRecipeModal');
        vi.mocked(useRecipeModal.default).mockReturnValue({
            isOpen: false,
            isEditMode: false,
            editRecipeData: null,
            onOpen: vi.fn(),
            onOpenCreate: vi.fn(),
            onOpenEdit: mockOnOpenEdit,
            onClose: vi.fn(),
        });

        const axios = await import('axios');
        vi.mocked(axios.default.get).mockResolvedValue({ data: [] });

        const { getByText } = render(<EditRecipeButton recipe={mockRecipe} />);

        fireEvent.click(getByText('edit_recipe'));

        await waitFor(() => {
            expect(mockOnOpenEdit).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: '1',
                    title: 'Test Recipe',
                    description: 'Test description',
                    categories: ['Dinner'],
                    method: 'Baking',
                    imageSrc: 'http://test.jpg',
                    imageSrc1: 'http://test1.jpg',
                    imageSrc2: 'http://test2.jpg',
                    ingredients: ['Ingredient 1', 'Ingredient 2'],
                    steps: ['Step 1', 'Step 2'],
                    minutes: 30,
                    coCooksIds: ['cook1', 'cook2'],
                    linkedRecipeIds: ['recipe1'],
                })
            );
        });
    });

    it('fetches co-cooks data when available', async () => {
        const mockOnOpenEdit = vi.fn();
        const useRecipeModal = await import('@/app/hooks/useRecipeModal');
        vi.mocked(useRecipeModal.default).mockReturnValue({
            isOpen: false,
            isEditMode: false,
            editRecipeData: null,
            onOpen: vi.fn(),
            onOpenCreate: vi.fn(),
            onOpenEdit: mockOnOpenEdit,
            onClose: vi.fn(),
        });

        const axios = await import('axios');
        const mockCooksData = [{ id: 'cook1', name: 'Cook 1' }];
        vi.mocked(axios.default.get).mockResolvedValue({ data: mockCooksData });

        const { getByText } = render(<EditRecipeButton recipe={mockRecipe} />);

        fireEvent.click(getByText('edit_recipe'));

        await waitFor(() => {
            expect(axios.default.get).toHaveBeenCalledWith(
                '/api/users/multiple?ids=cook1,cook2'
            );
            expect(mockOnOpenEdit).toHaveBeenCalledWith(
                expect.objectContaining({
                    coCooks: mockCooksData,
                })
            );
        });
    });

    it('handles errors gracefully', async () => {
        const mockOnOpenEdit = vi.fn();
        const useRecipeModal = await import('@/app/hooks/useRecipeModal');
        vi.mocked(useRecipeModal.default).mockReturnValue({
            isOpen: false,
            isEditMode: false,
            editRecipeData: null,
            onOpen: vi.fn(),
            onOpenCreate: vi.fn(),
            onOpenEdit: mockOnOpenEdit,
            onClose: vi.fn(),
        });

        const axios = await import('axios');
        vi.mocked(axios.default.get).mockRejectedValue(
            new Error('Network error')
        );

        const { getByText } = render(<EditRecipeButton recipe={mockRecipe} />);

        fireEvent.click(getByText('edit_recipe'));

        await waitFor(() => {
            expect(mockOnOpenEdit).toHaveBeenCalled();
        });
    });
});
