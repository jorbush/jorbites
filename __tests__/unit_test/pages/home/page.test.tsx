import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '@/app/page';

// Mocks
vi.mock('@/app/components/utils/Container', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="container">{children}</div>
    ),
}));

vi.mock('@/app/components/recipes/RecipeCard', () => ({
    default: ({ data }: { data: any }) => (
        <div data-testid={`recipe-card-${data.id}`}>{data.title}</div>
    ),
}));

vi.mock('@/app/components/utils/EmptyState', () => ({
    default: () => <div data-testid="empty-state">Empty State</div>,
}));

vi.mock('@/app/components/navigation/Pagination', () => ({
    default: () => <div data-testid="pagination">Pagination</div>,
}));

vi.mock('@/app/components/utils/ClientOnly', () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/app/utils/deviceDetector', () => ({
    isMobile: vi.fn(),
}));

vi.mock('@/app/actions/getRecipes');
vi.mock('@/app/actions/getCurrentUser');

vi.mock('next/headers', () => ({
    headers: () => ({
        get: vi.fn(),
    }),
}));

describe('Home', () => {
    const mockRecipes = [
        {
            id: '1',
            title: 'Recipe 1',
            createdAt: '',
            description: '',
            imageSrc: '',
            category: '',
            method: '',
            minutes: 0,
            numLikes: 0,
            ingredients: [],
            steps: [],
            extraImages: [],
            userId: '',
        },
        {
            id: '2',
            title: 'Recipe 2',
            createdAt: '',
            description: '',
            imageSrc: '',
            category: '',
            method: '',
            minutes: 0,
            numLikes: 0,
            ingredients: [],
            steps: [],
            extraImages: [],
            userId: '',
        },
    ];

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders recipes when available', async () => {
        const getRecipesMock = await import('@/app/actions/getRecipes');
        vi.mocked(getRecipesMock.default).mockResolvedValue({
            data: {
                recipes: mockRecipes,
                totalPages: 1,
                currentPage: 1,
                totalRecipes: 2,
            },
            error: null,
        });

        const getCurrentUserMock = await import('@/app/actions/getCurrentUser');
        vi.mocked(getCurrentUserMock.default).mockResolvedValue({} as any);

        const component = await Home({ searchParams: Promise.resolve({}) });
        const { findByTestId } = render(component);

        // Use findByTestId to wait for async elements to appear
        const container = await findByTestId('container');
        expect(container).toBeDefined();

        const recipeCard1 = await findByTestId('recipe-card-1');
        expect(recipeCard1).toBeDefined();

        const recipeCard2 = await findByTestId('recipe-card-2');
        expect(recipeCard2).toBeDefined();

        const pagination = await findByTestId('pagination');
        expect(pagination).toBeDefined();
    });

    it('renders empty state when no recipes', async () => {
        const getRecipesMock = await import('@/app/actions/getRecipes');
        vi.mocked(getRecipesMock.default).mockResolvedValue({
            data: {
                recipes: [],
                totalPages: 1,
                currentPage: 1,
                totalRecipes: 0,
            },
            error: null,
        });

        const getCurrentUserMock = await import('@/app/actions/getCurrentUser');
        vi.mocked(getCurrentUserMock.default).mockResolvedValue(null);

        const component = await Home({ searchParams: Promise.resolve({}) });
        const { findByTestId } = render(component);

        expect(await findByTestId('empty-state')).toBeDefined();
    });

    it('uses mobile limit when on mobile device', async () => {
        const deviceDetectorMock = await import('@/app/utils/deviceDetector');
        vi.mocked(deviceDetectorMock.isMobile).mockReturnValue(true);

        const getRecipesMock = await import('@/app/actions/getRecipes');
        vi.mocked(getRecipesMock.default).mockResolvedValue({
            data: {
                recipes: mockRecipes,
                totalPages: 1,
                currentPage: 1,
                totalRecipes: 2,
            },
            error: null,
        });

        await Home({ searchParams: Promise.resolve({}) });

        expect(getRecipesMock.default).toHaveBeenCalledWith(
            expect.objectContaining({ limit: 6 })
        );
    });

    it('uses desktop limit when not on mobile device', async () => {
        const deviceDetectorMock = await import('@/app/utils/deviceDetector');
        vi.mocked(deviceDetectorMock.isMobile).mockReturnValue(false);

        const getRecipesMock = await import('@/app/actions/getRecipes');
        vi.mocked(getRecipesMock.default).mockResolvedValue({
            data: {
                recipes: mockRecipes,
                totalPages: 1,
                currentPage: 1,
                totalRecipes: 2,
            },
            error: null,
        });

        await Home({ searchParams: Promise.resolve({}) });

        expect(getRecipesMock.default).toHaveBeenCalledWith(
            expect.objectContaining({ limit: 12 })
        );
    });
});
