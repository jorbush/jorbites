import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RecipeBookClient from '@/app/courses/recipe-book-builder/RecipeBookClient';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
        },
    }),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: vi.fn(),
    }),
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

describe('RecipeBookClient', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the course layout and initial overview step', () => {
        render(<RecipeBookClient currentUser={null} />);

        // Layout elements
        expect(screen.getByText('course_recipe_book_builder')).toBeDefined();
        expect(
            screen.getByText('recipe_book_course_details.course_description')
        ).toBeDefined();

        // Renders sidebar steps
        expect(screen.getAllByText('requirements').length).toBeGreaterThan(0);
        expect(screen.getAllByText('workflow').length).toBeGreaterThan(0);
        expect(
            screen.getAllByText('recipe_book_course_details.req_styles_label')
                .length
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText(
                'recipe_book_course_details.req_selection_label'
            ).length
        ).toBeGreaterThan(0);
        expect(screen.getAllByText('final_test').length).toBeGreaterThan(0);

        // Renders requirements checklist content
        expect(
            screen.getByText('recipe_book_course_details.requirements_title')
        ).toBeDefined();
    });
});
