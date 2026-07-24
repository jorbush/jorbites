import {
    render,
    screen,
    cleanup,
    fireEvent,
    createEvent,
} from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import BiteCard from '@/app/components/recipes/BiteCard';
import { SafeRecipe } from '@/app/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
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

const mockRecipe: SafeRecipe & {
    user?: { id?: string; name?: string | null; image?: string | null } | null;
} = {
    id: 'recipe-test-1',
    title: 'Gazpacho Andaluz',
    description: 'Refreshing cold tomato soup',
    imageSrc: '/gazpacho.jpg',
    createdAt: '2026-01-01T00:00:00.000Z',
    categories: ['Soup'],
    method: 'No-cook',
    recipeCuisine: 'Spanish',
    minutes: 10,
    calories: 180,
    numLikes: 50,
    averageRating: 4.9,
    ratingCount: 25,
    ingredients: ['Tomato', 'Cucumber', 'Olive Oil'],
    steps: ['Blend ingredients', 'Serve cold'],
    userId: 'chef-1',
    user: {
        id: 'chef-1',
        name: 'Chef Maria',
        image: '/chef.jpg',
    },
};

describe('<BiteCard />', () => {
    const defaultProps = {
        recipe: mockRecipe,
        isTop: true,
        onSwipeRight: vi.fn(),
        onSwipeLeft: vi.fn(),
        onSwipeUp: vi.fn(),
    };

    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('renders card title, metadata, author, and image', () => {
        render(<BiteCard {...defaultProps} />);

        expect(screen.getByTestId('bite-card-recipe-test-1')).toBeDefined();
        expect(screen.getByText('Gazpacho Andaluz')).toBeDefined();
        expect(screen.getByText('Refreshing cold tomato soup')).toBeDefined();
        expect(screen.getByText('4.9')).toBeDefined();
        expect(screen.getByText('10 min')).toBeDefined();
        expect(screen.getByText('180 kcal')).toBeDefined();
        expect(screen.getByText('Chef Maria')).toBeDefined();
        expect(screen.getByTestId('custom-proxy-image')).toBeDefined();
    });

    it('handles pointer drag gestures for swiping right', () => {
        render(<BiteCard {...defaultProps} />);

        const card = screen.getByTestId('bite-card-recipe-test-1');
        card.setPointerCapture = vi.fn();

        const downEvent = createEvent.pointerDown(card, { pointerId: 1 });
        Object.defineProperty(downEvent, 'clientX', { value: 100 });
        Object.defineProperty(downEvent, 'clientY', { value: 100 });
        fireEvent(card, downEvent);

        const moveEvent = createEvent.pointerMove(card, { pointerId: 1 });
        Object.defineProperty(moveEvent, 'clientX', { value: 250 });
        Object.defineProperty(moveEvent, 'clientY', { value: 100 });
        fireEvent(card, moveEvent);

        fireEvent.pointerUp(card);

        expect(defaultProps.onSwipeRight).toHaveBeenCalledWith(mockRecipe);
    });

    it('handles pointer drag gestures for swiping left', () => {
        render(<BiteCard {...defaultProps} />);

        const card = screen.getByTestId('bite-card-recipe-test-1');
        card.setPointerCapture = vi.fn();

        const downEvent = createEvent.pointerDown(card, { pointerId: 1 });
        Object.defineProperty(downEvent, 'clientX', { value: 200 });
        Object.defineProperty(downEvent, 'clientY', { value: 100 });
        fireEvent(card, downEvent);

        const moveEvent = createEvent.pointerMove(card, { pointerId: 1 });
        Object.defineProperty(moveEvent, 'clientX', { value: 50 });
        Object.defineProperty(moveEvent, 'clientY', { value: 100 });
        fireEvent(card, moveEvent);

        fireEvent.pointerUp(card);

        expect(defaultProps.onSwipeLeft).toHaveBeenCalledWith(mockRecipe);
    });
});
