import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RecipeCategoryAndMethod from '@/app/components/recipes/RecipeCategoryAndMethod';
import { FaUtensils, FaFire } from 'react-icons/fa';

// Mock the RecipeCategoryView component
vi.mock('@/app/components/recipes/RecipeCategory', () => ({
    default: vi.fn(({ icon: Icon, label }) => (
        <div data-testid="mocked-recipe-category">
            <Icon data-testid="mocked-icon" />
            <span>{label}</span>
        </div>
    )),
}));

describe('<RecipeCategoryAndMethod />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders correctly with both category and method', () => {
        const props = {
            categories: [
                {
                    icon: FaUtensils,
                    label: 'Italian',
                    description: 'Italian cuisine',
                },
            ],
            method: {
                icon: FaFire,
                label: 'Grilling',
            },
        };

        render(<RecipeCategoryAndMethod {...props} />);

        expect(screen.getByTestId('recipe-category-and-method')).toBeDefined();
        expect(screen.getAllByTestId('mocked-recipe-category')).toHaveLength(2);
        expect(screen.getByText('Italian')).toBeDefined();
        expect(screen.getByText('Grilling')).toBeDefined();
    });

    it('renders correctly with only category', () => {
        const props = {
            categories: [
                {
                    icon: FaUtensils,
                    label: 'Italian',
                    description: 'Italian cuisine',
                },
            ],
            method: undefined,
        };

        render(<RecipeCategoryAndMethod {...props} />);

        expect(screen.getByTestId('recipe-category-and-method')).toBeDefined();
        expect(screen.getAllByTestId('mocked-recipe-category')).toHaveLength(1);
        expect(screen.getByText('Italian')).toBeDefined();
    });

    it('renders correctly with only method', () => {
        const props = {
            categories: undefined,
            method: {
                icon: FaFire,
                label: 'Grilling',
            },
        };

        render(<RecipeCategoryAndMethod {...props} />);

        expect(screen.getByTestId('recipe-category-and-method')).toBeDefined();
        expect(screen.getAllByTestId('mocked-recipe-category')).toHaveLength(1);
        expect(screen.getByText('Grilling')).toBeDefined();
    });

    it('renders correctly with neither category nor method', () => {
        const props = {
            categories: undefined,
            method: undefined,
        };

        render(<RecipeCategoryAndMethod {...props} />);

        expect(screen.getByTestId('recipe-category-and-method')).toBeDefined();
        expect(screen.queryAllByTestId('mocked-recipe-category')).toHaveLength(
            0
        );
    });

    it('passes correct props to RecipeCategoryView', () => {
        const props = {
            categories: [
                {
                    icon: FaUtensils,
                    label: 'Italian',
                    description: 'Italian cuisine',
                },
            ],
            method: {
                icon: FaFire,
                label: 'Grilling',
            },
        };

        render(<RecipeCategoryAndMethod {...props} />);

        const categoryViews = screen.getAllByTestId('mocked-recipe-category');
        expect(categoryViews[0].textContent).toBe('Italian');
        expect(categoryViews[1].textContent).toBe('Grilling');
    });

    it('renders multiple categories correctly', () => {
        const props = {
            categories: [
                {
                    icon: FaUtensils,
                    label: 'Italian',
                    description: 'Italian cuisine',
                },
                {
                    icon: FaFire,
                    label: 'Vegetarian',
                    description: 'Vegetarian recipes',
                },
            ],
            method: {
                icon: FaFire,
                label: 'Grilling',
            },
        };

        render(<RecipeCategoryAndMethod {...props} />);

        expect(screen.getByTestId('recipe-category-and-method')).toBeDefined();
        expect(screen.getAllByTestId('mocked-recipe-category')).toHaveLength(3);
        expect(screen.getByText('Italian')).toBeDefined();
        expect(screen.getByText('Vegetarian')).toBeDefined();
        expect(screen.getByText('Grilling')).toBeDefined();
    });
});
