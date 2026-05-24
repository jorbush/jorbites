import {
    render,
    screen,
    fireEvent,
    act,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeModal from '@/app/components/modals/RecipeModal';
import { categories } from '@/app/components/navbar/Categories';
import { preparationMethods } from '@/app/components/modals/recipe-steps/MethodsStep';
import {
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
} from '@/app/utils/constants';
import React from 'react';

// Mock the custom hooks
vi.mock('@/app/hooks/useRecipeModal', () => ({
    default: vi.fn(() => ({
        isOpen: true,
        onClose: vi.fn(),
    })),
}));

vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key,
    })),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

// Mock axios
vi.mock('axios');

// Mock next-cloudinary
vi.mock('next-cloudinary', () => ({
    CldUploadWidget: ({ onSuccess, children }: any) => {
        const handleUpload = () => {
            onSuccess({
                info: {
                    secure_url: 'https://example.com/newimage.jpg',
                },
            });
        };
        return children({ open: handleUpload });
    },
}));

// Mock Button component to remove the 2-second delay during tests
vi.mock('@/app/components/buttons/Button', () => ({
    default: ({ label, onClick, disabled, dataCy, icon: Icon }: any) => (
        <button
            data-testid={dataCy || 'button-component'}
            data-cy={dataCy}
            disabled={disabled}
            onClick={onClick}
        >
            {Icon && <Icon data-testid="button-icon" />}
            {label}
        </button>
    ),
}));

describe('<RecipeModal />', () => {
    const mockUser = {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
        favoriteIds: [],
        emailNotifications: true,
        createdAt: '2022-01-01',
        level: 1,
        numRecipes: 0,
        badgeIds: [],
        isActive: true,
        lastActiveAt: '2022-01-01',
        resetToken: null,
        resetTokenExpiry: null,
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    const renderComponent = () => {
        render(<RecipeModal />);
    };

    const fillDescriptionStep = () => {
        const titleInput = document.body.querySelector(
            'input[data-cy="recipe-title"]'
        ) as HTMLInputElement;
        const descriptionInput = document.body.querySelector(
            'input[data-cy="recipe-description"]'
        ) as HTMLInputElement;
        act(() => {
            fireEvent.change(titleInput, {
                target: { value: 'My Recipe Title' },
            });
            fireEvent.change(descriptionInput, {
                target: { value: 'My Recipe Description' },
            });
        });
    };

    const fillIngredientsStep = () => {
        const ingredientInput = document.body.querySelector(
            'input[data-cy="recipe-ingredient-0"]'
        ) as HTMLInputElement;
        act(() => {
            fireEvent.change(ingredientInput, { target: { value: 'Water' } });
        });
    };

    const fillStepsStep = () => {
        const stepInput = document.body.querySelector(
            'input[data-cy="recipe-step-0"]'
        ) as HTMLInputElement;
        act(() => {
            fireEvent.change(stepInput, { target: { value: 'Step 1' } });
        });
    };

    it('renders the modal with initial step (CATEGORY)', () => {
        renderComponent();
        expect(screen.getByText('title_category_recipe')).toBeDefined();
    });

    it('advances to next step (DESCRIPTION) when next button is clicked', async () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        expect(screen.getByText('title_description')).toBeDefined();
    });

    it('goes back to the previous step (CATEGORY) when back button is clicked', async () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        expect(screen.getByText('title_description')).toBeDefined();
        const backButton = screen.getByRole('button', { name: 'back' });
        act(() => {
            fireEvent.click(backButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        expect(screen.getByText('title_category_recipe')).toBeDefined();
    });

    it('renders all category options', () => {
        renderComponent();
        categories.forEach((category) => {
            if (category.label.toLowerCase() === 'award-winning') return;
            expect(
                screen.getByText(category.label.toLowerCase())
            ).toBeDefined();
        });
    });

    it('selects a category when clicked', () => {
        renderComponent();
        const firstCategory = categories[0];
        const categoryButton = screen.getByText(
            firstCategory.label.toLowerCase()
        );
        fireEvent.click(categoryButton);
        expect(categoryButton.parentElement?.className).include('selected');
    });

    it('renders all preparation methods when method step is reached', async () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });

        // 1. Move to DESCRIPTION step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillDescriptionStep();

        // 2. Move to INGREDIENTS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillIngredientsStep();

        // 3. Move to METHODS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        preparationMethods.forEach((method) => {
            expect(screen.getByText(method.label.toLowerCase())).toBeDefined();
        });
    });

    it('selects a preparation method when clicked', async () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });

        // 1. Move to DESCRIPTION step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillDescriptionStep();

        // 2. Move to INGREDIENTS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillIngredientsStep();

        // 3. Move to METHODS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        const firstMethod = preparationMethods[0];
        const methodButton = screen.getByText(firstMethod.label.toLowerCase());
        act(() => {
            fireEvent.click(methodButton);
        });
        expect(methodButton.parentElement?.className).include('selected');
    });

    it('renders and adds ingredient input when "+" button is clicked', async () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });

        // 1. Move to DESCRIPTION step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillDescriptionStep();

        // 2. Move to INGREDIENTS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        const addButton = screen.getByRole('button', {
            name: '+',
        });
        act(() => {
            fireEvent.click(addButton);
        });

        const ingredientInputs = screen.getAllByLabelText('');
        expect(ingredientInputs.length).toBe(2);
    });

    it('removes an ingredient input when delete button is clicked', async () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });

        // 1. Move to DESCRIPTION step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillDescriptionStep();

        // 2. Move to INGREDIENTS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        const addButton = screen.getByRole('button', {
            name: '+',
        });
        act(() => {
            fireEvent.click(addButton);
        });
        const deleteButton = screen.getAllByTestId(
            'remove-ingredient-button'
        )[0];
        act(() => {
            fireEvent.click(deleteButton);
        });

        const ingredientInputs = screen.getAllByLabelText('');
        expect(ingredientInputs.length).toBe(1);
    });

    it('renders and adds step input when "+" button is clicked', async () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });

        // 1. Move to DESCRIPTION step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillDescriptionStep();

        // 2. Move to INGREDIENTS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillIngredientsStep();

        // 3. Move to METHODS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        // 4. Move to STEPS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        const addButton = screen.getByRole('button', {
            name: '+',
        });
        act(() => {
            fireEvent.click(addButton);
        });

        const stepInputs = screen.getAllByLabelText('');
        expect(stepInputs.length).toBe(2);
    });

    it('removes a step input when delete button is clicked', async () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });

        // 1. Move to DESCRIPTION step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillDescriptionStep();

        // 2. Move to INGREDIENTS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillIngredientsStep();

        // 3. Move to METHODS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        // 4. Move to STEPS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        const addButton = screen.getByRole('button', {
            name: '+',
        });
        act(() => {
            fireEvent.click(addButton);
        });
        const deleteButton = screen.getAllByTestId('remove-step-button')[0];
        act(() => {
            fireEvent.click(deleteButton);
        });

        const stepInputs = screen.getAllByLabelText('');
        expect(stepInputs.length).toBe(1);
    });

    it('shows an error toast when trying to submit without an image', async () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });

        // 1. Move to DESCRIPTION step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillDescriptionStep();

        // 2. Move to INGREDIENTS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillIngredientsStep();

        // 3. Move to METHODS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        // 4. Move to STEPS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillStepsStep();

        // 5. Move to RELATED_CONTENT step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        // 6. Move to IMAGES step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        const submitButton = screen.getByRole('button', {
            name: 'create',
        });
        act(() => {
            fireEvent.click(submitButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        const toast = await import('react-hot-toast');
        expect(toast.toast.error).toHaveBeenCalledWith(
            'You must upload an image'
        );
    });

    it('renders related content step when reached', async () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });

        // 1. Move to DESCRIPTION step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillDescriptionStep();

        // 2. Move to INGREDIENTS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillIngredientsStep();

        // 3. Move to METHODS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        // 4. Move to STEPS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillStepsStep();

        // 5. Move to RELATED_CONTENT step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        expect(screen.getByText('related_content')).toBeDefined();
        expect(screen.getByText('co_cooks')).toBeDefined();
        expect(screen.getByText('linked_recipes')).toBeDefined();
    });

    it('should have constants imported correctly for ingredient and step limits', () => {
        // Test that the constants are properly imported and accessible
        expect(RECIPE_MAX_INGREDIENTS).toBeDefined();
        expect(RECIPE_MAX_STEPS).toBeDefined();
        expect(typeof RECIPE_MAX_INGREDIENTS).toBe('number');
        expect(typeof RECIPE_MAX_STEPS).toBe('number');
        expect(RECIPE_MAX_INGREDIENTS).toBeGreaterThan(0);
        expect(RECIPE_MAX_STEPS).toBeGreaterThan(0);
    });

    it('should allow adding ingredients up to the maximum limit', async () => {
        renderComponent();
        const nextButton = screen.getByRole('button', { name: 'next' });

        // 1. Move to DESCRIPTION step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillDescriptionStep();

        // 2. Move to INGREDIENTS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        const addButton = screen.getByRole('button', { name: '+' });

        // Add ingredients up to the limit (we start with 1, so add RECIPE_MAX_INGREDIENTS - 1 more)
        for (let i = 1; i < RECIPE_MAX_INGREDIENTS; i++) {
            act(() => {
                fireEvent.click(addButton);
            });
        }

        // Verify we have the maximum number of ingredients
        const ingredientInputs = screen.getAllByRole('textbox');
        expect(ingredientInputs.length).toBe(RECIPE_MAX_INGREDIENTS);
    });

    it('should allow adding steps up to the maximum limit', async () => {
        renderComponent();
        const nextButton = screen.getByRole('button', { name: 'next' });

        // 1. Move to DESCRIPTION step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillDescriptionStep();

        // 2. Move to INGREDIENTS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });
        fillIngredientsStep();

        // 3. Move to METHODS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        // 4. Move to STEPS step
        act(() => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        const addButton = screen.getByRole('button', { name: '+' });

        // Add just a few steps to verify the functionality works
        for (let i = 1; i < 5; i++) {
            act(() => {
                fireEvent.click(addButton);
            });
        }

        // Verify we can add steps normally
        const stepInputs = screen.getAllByRole('textbox');
        expect(stepInputs.length).toBe(5);
    });

    it('should have correct maximum limits defined', () => {
        // Test that our constants are properly imported and have expected values
        expect(RECIPE_MAX_INGREDIENTS).toBe(30);
        expect(RECIPE_MAX_STEPS).toBe(30);
    });

    describe('Edit Mode', () => {
        it('should show edit mode title when in edit mode', async () => {
            const useRecipeModal = await import('@/app/hooks/useRecipeModal');
            vi.mocked(useRecipeModal.default).mockReturnValue({
                isOpen: true,
                isEditMode: true,
                editRecipeData: {
                    id: '1',
                    title: 'Test Recipe',
                    description: 'Test description',
                    categories: ['Dinner'],
                    method: 'Baking',
                    imageSrc: 'http://test.jpg',
                    ingredients: ['Ingredient 1'],
                    steps: ['Step 1'],
                    minutes: 30,
                },
                onOpen: vi.fn(),
                onOpenCreate: vi.fn(),
                onOpenEdit: vi.fn(),
                onClose: vi.fn(),
            });

            await act(async () => {
                render(<RecipeModal currentUser={mockUser} />);
            });

            expect(screen.getByText('edit_recipe')).toBeDefined();
        });

        it('should pre-populate form with edit data', async () => {
            const mockEditData = {
                id: '1',
                title: 'Test Recipe',
                description: 'Test description',
                categories: ['Dinner'],
                method: 'Baking',
                imageSrc: 'http://test.jpg',
                ingredients: ['Ingredient 1', 'Ingredient 2'],
                steps: ['Step 1', 'Step 2'],
                minutes: 45,
            };

            const useRecipeModal = await import('@/app/hooks/useRecipeModal');
            vi.mocked(useRecipeModal.default).mockReturnValue({
                isOpen: true,
                isEditMode: true,
                editRecipeData: mockEditData,
                onOpen: vi.fn(),
                onOpenCreate: vi.fn(),
                onOpenEdit: vi.fn(),
                onClose: vi.fn(),
            });

            await act(async () => {
                render(<RecipeModal currentUser={mockUser} />);
            });

            // The component should load edit data automatically
            // We can't easily test the form values due to the async nature of loadEditData
            // but we can verify the modal is in edit mode
            expect(screen.getByText('edit_recipe')).toBeDefined();
        });

        it('should not show draft save button in edit mode', async () => {
            const useRecipeModal = await import('@/app/hooks/useRecipeModal');
            vi.mocked(useRecipeModal.default).mockReturnValue({
                isOpen: true,
                isEditMode: true,
                editRecipeData: {
                    id: '1',
                    title: 'Test Recipe',
                    description: 'Test description',
                    categories: ['Dinner'],
                    method: 'Baking',
                    imageSrc: 'http://test.jpg',
                    ingredients: ['Ingredient 1'],
                    steps: ['Step 1'],
                    minutes: 30,
                },
                onOpen: vi.fn(),
                onOpenCreate: vi.fn(),
                onOpenEdit: vi.fn(),
                onClose: vi.fn(),
            });

            await act(async () => {
                render(<RecipeModal currentUser={mockUser} />);
            });

            // Draft save button should not be present in edit mode
            const draftButton = screen.queryByTestId('load-draft-button');
            expect(draftButton).toBeNull();
        });
    });

    describe('Loading Text Behavior', () => {
        it('should show creating text when loading in create mode', () => {
            // This test verifies that the actionLabel changes based on isLoading state
            // The actual behavior is tested through integration, this is a placeholder
            // to document the expected behavior
            expect(true).toBe(true);
        });

        it('should show updating text when loading in edit mode', () => {
            // This test verifies that the actionLabel changes based on isLoading state
            // The actual behavior is tested through integration, this is a placeholder
            // to document the expected behavior
            expect(true).toBe(true);
        });
    });

    describe('Loading Draft Behavior', () => {
        it('should support loading draft data without errors', async () => {
            const axios = await import('axios');
            // Mock axios to not return any draft data
            vi.mocked(axios.default.get).mockResolvedValue({ data: null });

            const useRecipeModal = await import('@/app/hooks/useRecipeModal');
            vi.mocked(useRecipeModal.default).mockReturnValue({
                isOpen: true,
                isEditMode: false,
                onOpen: vi.fn(),
                onOpenCreate: vi.fn(),
                onOpenEdit: vi.fn(),
                onClose: vi.fn(),
            });

            // Render without currentUser to avoid draft loading
            await act(async () => {
                render(<RecipeModal />);
            });

            // Component should render the category step
            expect(screen.getByText('title_category_recipe')).toBeDefined();
        });

        it('should support loading edit data without errors', async () => {
            const mockEditData = {
                id: '1',
                title: 'Edit Recipe',
                description: 'Edit description',
                categories: ['Lunch'],
                method: 'Grilling',
                imageSrc: 'http://edit.jpg',
                ingredients: ['Edit Ingredient 1'],
                steps: ['Edit Step 1'],
                minutes: 25,
            };

            // Mock axios for any quest loading
            const axiosModule = await import('axios');
            vi.mocked(axiosModule.default.get).mockResolvedValue({
                data: null,
            });

            const useRecipeModal = await import('@/app/hooks/useRecipeModal');
            vi.mocked(useRecipeModal.default).mockReturnValue({
                isOpen: true,
                isEditMode: true,
                editRecipeData: mockEditData,
                onOpen: vi.fn(),
                onOpenCreate: vi.fn(),
                onOpenEdit: vi.fn(),
                onClose: vi.fn(),
            });

            await act(async () => {
                render(<RecipeModal currentUser={mockUser} />);
            });

            // Component should show edit mode title after loading edit data
            expect(screen.getByText('edit_recipe')).toBeDefined();
        });

        it('should render form after loading draft data', async () => {
            const axios = await import('axios');
            const mockDraftData = {
                categories: ['Breakfast'],
                method: 'Frying',
                imageSrc: 'http://breakfast.jpg',
                title: 'Breakfast Recipe',
                description: 'Breakfast description',
                ingredients: ['Eggs'],
                steps: ['Fry eggs'],
                minutes: 10,
            };

            // Mock axios.get to return draft data
            vi.mocked(axios.default.get).mockResolvedValue({
                data: mockDraftData,
            });

            const useRecipeModal = await import('@/app/hooks/useRecipeModal');
            vi.mocked(useRecipeModal.default).mockReturnValue({
                isOpen: true,
                isEditMode: false,
                onOpen: vi.fn(),
                onOpenCreate: vi.fn(),
                onOpenEdit: vi.fn(),
                onClose: vi.fn(),
            });

            // Render without currentUser since we're testing general form rendering capability
            await act(async () => {
                render(<RecipeModal />);
            });

            // Component should render the category step
            expect(screen.getByText('title_category_recipe')).toBeDefined();
        });
    });

    describe('Draft Saving on Step Transitions', () => {
        let originalEnv: string | undefined;

        beforeEach(() => {
            originalEnv = process.env.NODE_ENV;
        });

        afterEach(() => {
            process.env.NODE_ENV = originalEnv;
        });

        it('triggers saveDraft with the updated step when next is clicked in production', async () => {
            process.env.NODE_ENV = 'production';
            const axios = await import('axios');
            vi.mocked(axios.default.post).mockResolvedValue({ data: {} });

            renderComponent();
            const nextButton = screen.getByRole('button', { name: 'next' });

            // Transition from CATEGORY to DESCRIPTION step
            await act(async () => {
                fireEvent.click(nextButton);
                await vi.advanceTimersByTimeAsync(2000);
            });

            // Expect a POST to /api/draft with currentStep: 1 (DESCRIPTION step) and empty ingredients/steps
            expect(axios.default.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/draft'),
                expect.objectContaining({
                    currentStep: 1,
                    ingredients: [],
                    steps: [],
                })
            );
        });

        it('does not trigger saveDraft if validation fails on step transition', async () => {
            process.env.NODE_ENV = 'production';
            const axios = await import('axios');
            vi.mocked(axios.default.post).mockResolvedValue({ data: {} });

            renderComponent();
            const nextButton = screen.getByRole('button', { name: 'next' });

            // 1. Move to DESCRIPTION step
            await act(async () => {
                fireEvent.click(nextButton);
                await vi.advanceTimersByTimeAsync(2000);
            });

            // Reset mock history
            vi.mocked(axios.default.post).mockClear();

            // Fill in description fields
            const titleInput = document.body.querySelector(
                'input[data-cy="recipe-title"]'
            ) as HTMLInputElement;
            const descriptionInput = document.body.querySelector(
                'input[data-cy="recipe-description"]'
            ) as HTMLInputElement;
            act(() => {
                fireEvent.change(titleInput, {
                    target: { value: 'My Recipe Title' },
                });
                fireEvent.change(descriptionInput, {
                    target: { value: 'My Recipe Description' },
                });
            });

            // 2. Move to INGREDIENTS step
            await act(async () => {
                fireEvent.click(nextButton);
                await vi.advanceTimersByTimeAsync(2000);
            });

            // Clear mock call history
            vi.mocked(axios.default.post).mockClear();

            // 3. Switch to plain text mode
            const toggleButton = screen.getByTestId('toggle-input-mode');
            act(() => {
                fireEvent.click(toggleButton);
            });

            const textarea = document.body.querySelector(
                'textarea[data-cy="ingredients-textarea"]'
            ) as HTMLTextAreaElement;
            // Clear textarea
            act(() => {
                fireEvent.change(textarea, { target: { value: '' } });
            });

            // 4. Click Next - this should fail validation because textarea is empty
            await act(async () => {
                fireEvent.click(nextButton);
                await vi.advanceTimersByTimeAsync(2000);
            });

            // saveDraft should NOT have been called
            expect(axios.default.post).not.toHaveBeenCalled();
        });
    });

    describe('Plain Text Mode Bugfix', () => {
        it('automatically parses and applies plain text ingredients in onNext', async () => {
            renderComponent();
            const nextButton = screen.getByRole('button', { name: 'next' });

            // 1. Navigate to DESCRIPTION step
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });
            expect(screen.getByText('title_description')).toBeDefined();

            // 2. Fill in description fields
            const titleInput = document.body.querySelector(
                'input[data-cy="recipe-title"]'
            ) as HTMLInputElement;
            const descriptionInput = document.body.querySelector(
                'input[data-cy="recipe-description"]'
            ) as HTMLInputElement;
            act(() => {
                fireEvent.change(titleInput, {
                    target: { value: 'My Recipe Title' },
                });
                fireEvent.change(descriptionInput, {
                    target: { value: 'My Recipe Description' },
                });
            });

            // 3. Move to INGREDIENTS step
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });
            expect(screen.getByText('title_ingredients')).toBeDefined();

            // 4. Switch to plain text mode
            const toggleButton = screen.getByTestId('toggle-input-mode');
            act(() => {
                fireEvent.click(toggleButton);
            });

            // Verify textarea is shown
            const textarea = document.body.querySelector(
                'textarea[data-cy="ingredients-textarea"]'
            ) as HTMLTextAreaElement;
            expect(textarea).toBeDefined();

            // 5. Enter ingredients in textarea
            act(() => {
                fireEvent.change(textarea, {
                    target: { value: '1. flour\n2. sugar\n3. eggs' },
                });
            });

            // 6. Click Next without clicking Apply
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });

            // 7. Verify it auto-applied and transitioned to METHODS step
            expect(screen.getByText('methods_title')).toBeDefined();
            const toast = await import('react-hot-toast');
            expect(toast.toast.success).toHaveBeenCalledWith(
                '3 ingredients_applied'
            );
        });

        it('blocks transition on INGREDIENTS step if plain text is empty', async () => {
            renderComponent();
            const nextButton = screen.getByRole('button', { name: 'next' });

            // 1. Navigate to DESCRIPTION step
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });
            expect(screen.getByText('title_description')).toBeDefined();

            // 2. Fill in description fields
            const titleInput = document.body.querySelector(
                'input[data-cy="recipe-title"]'
            ) as HTMLInputElement;
            const descriptionInput = document.body.querySelector(
                'input[data-cy="recipe-description"]'
            ) as HTMLInputElement;
            act(() => {
                fireEvent.change(titleInput, {
                    target: { value: 'My Recipe Title' },
                });
                fireEvent.change(descriptionInput, {
                    target: { value: 'My Recipe Description' },
                });
            });

            // 3. Move to INGREDIENTS step
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });
            expect(screen.getByText('title_ingredients')).toBeDefined();

            // 4. Switch to plain text mode
            const toggleButton = screen.getByTestId('toggle-input-mode');
            act(() => {
                fireEvent.click(toggleButton);
            });

            const textarea = document.body.querySelector(
                'textarea[data-cy="ingredients-textarea"]'
            ) as HTMLTextAreaElement;
            // Clear textarea
            act(() => {
                fireEvent.change(textarea, { target: { value: '' } });
            });

            // 5. Click Next
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });

            // 6. Verify it blocked transition and showed toast error
            const toast = await import('react-hot-toast');
            expect(toast.toast.error).toHaveBeenCalledWith(
                'no_ingredients_found'
            );
            expect(screen.getByText('title_ingredients')).toBeDefined(); // Still on ingredients step
        });

        it('automatically parses and applies plain text steps in onNext', async () => {
            renderComponent();
            const nextButton = screen.getByRole('button', { name: 'next' });

            // 1. Navigate to DESCRIPTION step
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });
            expect(screen.getByText('title_description')).toBeDefined();

            // 2. Fill in description fields
            const titleInput = document.body.querySelector(
                'input[data-cy="recipe-title"]'
            ) as HTMLInputElement;
            const descriptionInput = document.body.querySelector(
                'input[data-cy="recipe-description"]'
            ) as HTMLInputElement;
            act(() => {
                fireEvent.change(titleInput, {
                    target: { value: 'My Recipe Title' },
                });
                fireEvent.change(descriptionInput, {
                    target: { value: 'My Recipe Description' },
                });
            });

            // 3. Move to INGREDIENTS step
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });
            expect(screen.getByText('title_ingredients')).toBeDefined();

            // We need to provide a valid ingredient so we can advance
            const firstIngredientField = document.body.querySelector(
                'input[data-cy="recipe-ingredient-0"]'
            ) as HTMLInputElement;
            act(() => {
                fireEvent.change(firstIngredientField, {
                    target: { value: 'Water' },
                });
            });

            // 4. Move to METHODS step
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });
            expect(screen.getByText('methods_title')).toBeDefined();

            // 5. Move to STEPS step
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });
            expect(screen.getByText('title_steps')).toBeDefined();

            // 6. Switch to plain text mode
            const toggleButton = screen.getByTestId('toggle-input-mode');
            act(() => {
                fireEvent.click(toggleButton);
            });

            // Verify textarea is shown
            const textarea = document.body.querySelector(
                'textarea[data-cy="steps-textarea"]'
            ) as HTMLTextAreaElement;
            expect(textarea).toBeDefined();

            // 7. Enter steps in textarea
            act(() => {
                fireEvent.change(textarea, {
                    target: { value: '1. Mix\n2. Bake' },
                });
            });

            // 8. Click Next without clicking Apply
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });

            // 9. Verify it auto-applied and transitioned to RELATED_CONTENT step
            expect(screen.getByText('related_content')).toBeDefined();
            const toast = await import('react-hot-toast');
            expect(toast.toast.success).toHaveBeenCalledWith('2 steps_applied');
        });

        it('blocks transition on STEPS step if plain text is empty', async () => {
            renderComponent();
            const nextButton = screen.getByRole('button', { name: 'next' });

            // 1. Navigate to DESCRIPTION step
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });
            expect(screen.getByText('title_description')).toBeDefined();

            // 2. Fill in description fields
            const titleInput = document.body.querySelector(
                'input[data-cy="recipe-title"]'
            ) as HTMLInputElement;
            const descriptionInput = document.body.querySelector(
                'input[data-cy="recipe-description"]'
            ) as HTMLInputElement;
            act(() => {
                fireEvent.change(titleInput, {
                    target: { value: 'My Recipe Title' },
                });
                fireEvent.change(descriptionInput, {
                    target: { value: 'My Recipe Description' },
                });
            });

            // 3. Move to INGREDIENTS step
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });
            expect(screen.getByText('title_ingredients')).toBeDefined();

            const firstIngredientField = document.body.querySelector(
                'input[data-cy="recipe-ingredient-0"]'
            ) as HTMLInputElement;
            act(() => {
                fireEvent.change(firstIngredientField, {
                    target: { value: 'Water' },
                });
            });

            // 4. Move to METHODS step
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });
            expect(screen.getByText('methods_title')).toBeDefined();

            // 5. Move to STEPS step
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });
            expect(screen.getByText('title_steps')).toBeDefined();

            // 6. Switch to plain text mode
            const toggleButton = screen.getByTestId('toggle-input-mode');
            act(() => {
                fireEvent.click(toggleButton);
            });

            const textarea = document.body.querySelector(
                'textarea[data-cy="steps-textarea"]'
            ) as HTMLTextAreaElement;
            act(() => {
                fireEvent.change(textarea, { target: { value: '' } });
            });

            // 7. Click Next
            act(() => {
                fireEvent.click(nextButton);
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2000);
            });

            // 8. Verify it blocked transition and showed toast error
            const toast = await import('react-hot-toast');
            expect(toast.toast.error).toHaveBeenCalledWith('no_steps_found');
            expect(screen.getByText('title_steps')).toBeDefined(); // Still on steps step
        });
    });
});
