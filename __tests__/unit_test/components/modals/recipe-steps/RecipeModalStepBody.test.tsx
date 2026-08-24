import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeModalStepBody from '@/app/components/modals/recipe-steps/RecipeModalStepBody';
import { STEPS } from '@/app/utils/constants';

vi.mock('@/app/components/modals/recipe-steps/CategoryStep', () => ({
    default: ({ selectedCategories }: any) => (
        <div data-testid="mock-category-step">
            CategoryStep: {selectedCategories?.join(',')}
        </div>
    ),
}));

vi.mock('@/app/components/modals/recipe-steps/IngredientsStep', () => ({
    default: ({ isLocked }: any) => (
        <div data-testid="mock-ingredients-step">
            IngredientsStep: {isLocked ? 'locked' : 'unlocked'}
        </div>
    ),
}));

vi.mock('@/app/components/modals/recipe-steps/RecipeStepsStep', () => ({
    default: ({ isLocked }: any) => (
        <div data-testid="mock-recipe-steps-step">
            RecipeStepsStep: {isLocked ? 'locked' : 'unlocked'}
        </div>
    ),
}));

vi.mock('@/app/components/modals/recipe-steps/DescriptionStep', () => ({
    default: ({ minutes }: any) => (
        <div data-testid="mock-description-step">
            DescriptionStep: {minutes}
        </div>
    ),
}));

vi.mock('@/app/components/modals/recipe-steps/MethodsStep', () => ({
    default: ({ selectedMethod }: any) => (
        <div data-testid="mock-methods-step">MethodsStep: {selectedMethod}</div>
    ),
}));

vi.mock('@/app/components/modals/recipe-steps/RelatedContentStep', () => ({
    default: () => (
        <div data-testid="mock-related-content-step">RelatedContentStep</div>
    ),
}));

vi.mock('@/app/components/modals/recipe-steps/ImagesStep', () => ({
    default: ({ imageSrc }: any) => (
        <div data-testid="mock-images-step">ImagesStep: {imageSrc}</div>
    ),
}));

vi.mock('@/app/components/modals/recipe-steps/RecipeLockBanner', () => ({
    default: ({ isCurrentStepLocked }: any) => (
        <div data-testid="mock-lock-banner">
            LockBanner: {isCurrentStepLocked ? 'locked' : 'unlocked'}
        </div>
    ),
}));

describe('RecipeModalStepBody', () => {
    const defaultProps = {
        step: STEPS.CATEGORY,
        isCurrentStepLocked: false,
        lockOwner: null,
        isSharedSession: false,
        otherActiveLocks: [],
        categories: ['Breakfast'],
        setCustomValue: vi.fn(),
        numIngredients: 1,
        register: vi.fn(),
        errors: {},
        addIngredientInput: vi.fn(),
        removeIngredientInput: vi.fn(),
        setIngredients: vi.fn(),
        getValues: vi.fn().mockReturnValue(''),
        setValue: vi.fn(),
        ingredientsInputMode: 'custom',
        setIngredientsInputMode: vi.fn(),
        numSteps: 1,
        addStepInput: vi.fn(),
        removeStepInput: vi.fn(),
        setSteps: vi.fn(),
        stepsInputMode: 'custom',
        setStepsInputMode: vi.fn(),
        isLoading: false,
        minutes: 20,
        prepTime: 10,
        cookTime: 10,
        method: 'Baking',
        selectedCoCooks: [],
        selectedLinkedRecipes: [],
        selectedQuest: null,
        addCoCook: vi.fn(),
        removeCoCook: vi.fn(),
        addLinkedRecipe: vi.fn(),
        removeLinkedRecipe: vi.fn(),
        selectQuest: vi.fn(),
        removeQuest: vi.fn(),
        imageSrc: 'http://example.com/food.jpg',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders CategoryStep for STEPS.CATEGORY', () => {
        render(
            <RecipeModalStepBody
                {...defaultProps}
                step={STEPS.CATEGORY}
            />
        );
        expect(screen.getByTestId('mock-category-step')).toBeDefined();
        expect(screen.getByText('CategoryStep: Breakfast')).toBeDefined();
    });

    it('renders IngredientsStep for STEPS.INGREDIENTS', () => {
        render(
            <RecipeModalStepBody
                {...defaultProps}
                step={STEPS.INGREDIENTS}
            />
        );
        expect(screen.getByTestId('mock-ingredients-step')).toBeDefined();
    });

    it('renders RecipeStepsStep for STEPS.STEPS', () => {
        render(
            <RecipeModalStepBody
                {...defaultProps}
                step={STEPS.STEPS}
            />
        );
        expect(screen.getByTestId('mock-recipe-steps-step')).toBeDefined();
    });

    it('renders DescriptionStep for STEPS.DESCRIPTION', () => {
        render(
            <RecipeModalStepBody
                {...defaultProps}
                step={STEPS.DESCRIPTION}
            />
        );
        expect(screen.getByTestId('mock-description-step')).toBeDefined();
    });

    it('renders MethodsStep for STEPS.METHODS', () => {
        render(
            <RecipeModalStepBody
                {...defaultProps}
                step={STEPS.METHODS}
            />
        );
        expect(screen.getByTestId('mock-methods-step')).toBeDefined();
    });

    it('renders RelatedContentStep for STEPS.RELATED_CONTENT', () => {
        render(
            <RecipeModalStepBody
                {...defaultProps}
                step={STEPS.RELATED_CONTENT}
            />
        );
        expect(screen.getByTestId('mock-related-content-step')).toBeDefined();
    });

    it('renders ImagesStep for STEPS.IMAGES', () => {
        render(
            <RecipeModalStepBody
                {...defaultProps}
                step={STEPS.IMAGES}
            />
        );
        expect(screen.getByTestId('mock-images-step')).toBeDefined();
    });

    it('applies locked styling when isCurrentStepLocked is true', () => {
        const { container } = render(
            <RecipeModalStepBody
                {...defaultProps}
                step={STEPS.INGREDIENTS}
                isCurrentStepLocked={true}
            />
        );

        expect(screen.getByTestId('mock-lock-banner')).toBeDefined();
        const lockedWrapper = container.querySelector(
            '.pointer-events-none.opacity-60'
        );
        expect(lockedWrapper).toBeDefined();
    });
});
