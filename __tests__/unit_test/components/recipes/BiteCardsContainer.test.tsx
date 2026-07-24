import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import BiteCardsContainer from '@/app/components/recipes/BiteCardsContainer';
import { SafeRecipe } from '@/app/types';

const mockPush = vi.fn();

vi.mock('axios');

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: vi.fn(),
    }),
}));

vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => ({
        onOpen: vi.fn(),
    }),
}));

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt }: any) => (
        <img
            src={src}
            alt={alt}
            data-testid="custom-proxy-image"
        />
    ),
}));

vi.mock('@/app/components/utils/Avatar', () => ({
    default: () => <div data-testid="avatar-mock" />,
}));

const mockRecipes: SafeRecipe[] = [
    {
        id: 'recipe-1',
        title: 'Tacos Al Pastor',
        description: 'Flavorful Mexican tacos with pineapple',
        imageSrc: '/tacos.jpg',
        createdAt: '2026-01-01T00:00:00.000Z',
        categories: ['Mexican'],
        method: 'Grill',
        minutes: 25,
        numLikes: 30,
        averageRating: 4.8,
        ratingCount: 12,
        ingredients: ['Pork', 'Pineapple', 'Tortilla'],
        steps: ['Marinate pork', 'Grill', 'Serve in tortilla'],
        extraImages: [],
        userId: 'user-1',
        coCooksIds: [],
        linkedRecipeIds: [],
        listIds: [],
    },
    {
        id: 'recipe-2',
        title: 'Creamy Carbonara',
        description: 'Classic Italian pasta carbonara',
        imageSrc: '/carbonara.jpg',
        createdAt: '2026-01-02T00:00:00.000Z',
        categories: ['Italian'],
        method: 'Stove',
        minutes: 15,
        numLikes: 45,
        averageRating: 4.9,
        ratingCount: 20,
        ingredients: ['Spaghetti', 'Guanciale', 'Egg', 'Pecorino'],
        steps: ['Boil pasta', 'Fry guanciale', 'Mix with egg cheese'],
        extraImages: [],
        userId: 'user-2',
        coCooksIds: [],
        linkedRecipeIds: [],
        listIds: [],
    },
];

describe('<BiteCardsContainer />', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        sessionStorage.clear();
    });

    it('renders top card title and initial control buttons', () => {
        render(<BiteCardsContainer initialRecipes={mockRecipes} />);

        expect(screen.getByText('Tacos Al Pastor')).toBeDefined();
        expect(screen.getByTestId('bite-cards-skip-btn')).toBeDefined();
        expect(screen.getByTestId('bite-cards-favorite-btn')).toBeDefined();
        expect(screen.getByTestId('bite-cards-view-btn')).toBeDefined();
    });

    it('advances to next card when skip button is clicked', () => {
        render(<BiteCardsContainer initialRecipes={mockRecipes} />);

        const skipButton = screen.getByTestId('bite-cards-skip-btn');
        fireEvent.click(skipButton);

        expect(screen.getByText('Creamy Carbonara')).toBeDefined();
    });

    it('shows empty stack state when all cards are swiped', () => {
        render(<BiteCardsContainer initialRecipes={mockRecipes} />);

        const skipButton = screen.getByTestId('bite-cards-skip-btn');
        fireEvent.click(skipButton); // 1st card skipped
        fireEvent.click(skipButton); // 2nd card skipped

        expect(screen.getByTestId('bite-cards-empty-state')).toBeDefined();
        expect(screen.getByTestId('bite-cards-discover-btn')).toBeDefined();
    });

    it('navigates directly to recipe page when view button is clicked', () => {
        render(<BiteCardsContainer initialRecipes={mockRecipes} />);

        const viewButton = screen.getByTestId('bite-cards-view-btn');
        fireEvent.click(viewButton);

        expect(mockPush).toHaveBeenCalledWith('/recipes/recipe-1');
    });
});
