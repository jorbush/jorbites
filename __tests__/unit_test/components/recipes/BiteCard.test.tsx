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

    it('has touch-none class to disable iOS Safari gesture conflicts', () => {
        render(<BiteCard {...defaultProps} />);
        const card = screen.getByTestId('bite-card-recipe-test-1');
        expect(card.classList.contains('touch-none')).toBe(true);
    });

    it('releases pointer capture on pointerUp and pointerCancel', () => {
        render(<BiteCard {...defaultProps} />);
        const card = screen.getByTestId('bite-card-recipe-test-1');
        card.setPointerCapture = vi.fn();
        card.releasePointerCapture = vi.fn();
        card.hasPointerCapture = vi.fn().mockReturnValue(true);

        // Pointer Down
        const downEvent = createEvent.pointerDown(card);
        Object.defineProperty(downEvent, 'pointerId', { value: 42 });
        fireEvent(card, downEvent);
        expect(card.setPointerCapture).toHaveBeenCalledWith(42);

        // Pointer Up releases capture
        const upEvent = createEvent.pointerUp(card);
        Object.defineProperty(upEvent, 'pointerId', { value: 42 });
        fireEvent(card, upEvent);
        expect(card.releasePointerCapture).toHaveBeenCalledWith(42);

        // Pointer Cancel also releases capture safely
        const cancelDownEvent = createEvent.pointerDown(card);
        Object.defineProperty(cancelDownEvent, 'pointerId', { value: 99 });
        fireEvent(card, cancelDownEvent);
        const cancelEvent = createEvent.pointerCancel(card);
        Object.defineProperty(cancelEvent, 'pointerId', { value: 99 });
        fireEvent(card, cancelEvent);
        expect(card.releasePointerCapture).toHaveBeenCalledWith(99);
    });

    it('gracefully tolerates errors in setPointerCapture and releasePointerCapture', () => {
        render(<BiteCard {...defaultProps} />);
        const card = screen.getByTestId('bite-card-recipe-test-1');
        card.setPointerCapture = vi.fn().mockImplementation(() => {
            throw new Error('Pointer capture not supported');
        });
        card.releasePointerCapture = vi.fn().mockImplementation(() => {
            throw new Error('Pointer capture release failed');
        });

        expect(() => {
            const downEvent = createEvent.pointerDown(card, { pointerId: 1 });
            fireEvent(card, downEvent);
            const upEvent = createEvent.pointerUp(card, { pointerId: 1 });
            fireEvent(card, upEvent);
        }).not.toThrow();
    });

    it('prevents Safari edge-swipe back navigation on touchstart near edges', () => {
        render(<BiteCard {...defaultProps} />);
        const card = screen.getByTestId('bite-card-recipe-test-1');

        // Touch near left edge (Safari back gesture zone: clientX < 28)
        const leftEdgeEvent = new Event('touchstart', {
            bubbles: true,
            cancelable: true,
        });
        Object.defineProperty(leftEdgeEvent, 'touches', {
            value: [{ clientX: 15, clientY: 100 }],
        });
        const preventDefaultLeftSpy = vi.spyOn(leftEdgeEvent, 'preventDefault');
        card.dispatchEvent(leftEdgeEvent);
        expect(preventDefaultLeftSpy).toHaveBeenCalled();

        // Touch near right edge (Safari forward gesture zone: clientX > innerWidth - 28)
        const rightEdgeEvent = new Event('touchstart', {
            bubbles: true,
            cancelable: true,
        });
        Object.defineProperty(rightEdgeEvent, 'touches', {
            value: [{ clientX: window.innerWidth - 10, clientY: 100 }],
        });
        const preventDefaultRightSpy = vi.spyOn(
            rightEdgeEvent,
            'preventDefault'
        );
        card.dispatchEvent(rightEdgeEvent);
        expect(preventDefaultRightSpy).toHaveBeenCalled();

        // Touch in middle (normal card swipe interaction) should NOT be prevented
        const middleEvent = new Event('touchstart', {
            bubbles: true,
            cancelable: true,
        });
        Object.defineProperty(middleEvent, 'touches', {
            value: [{ clientX: 150, clientY: 100 }],
        });
        const preventDefaultMiddleSpy = vi.spyOn(middleEvent, 'preventDefault');
        card.dispatchEvent(middleEvent);
        expect(preventDefaultMiddleSpy).not.toHaveBeenCalled();
    });
});
