import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RecipeListsClient from '@/app/courses/recipe-lists/RecipeListsClient';
import React from 'react';

afterEach(() => {
    cleanup();
    localStorage.clear();
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === 'contest_manager_course_details.next_step')
                return 'Next Step';
            if (key === 'contest_manager_course_details.mark_completed')
                return 'Mark Completed';
            return key;
        },
        i18n: {
            language: 'en',
        },
    }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

// Mock CertificateGenerator
vi.mock('@/app/components/courses/certificate/CertificateGenerator', () => ({
    default: () => (
        <div data-testid="certificate-generator">Certificate Generator</div>
    ),
}));

describe('RecipeListsClient', () => {
    it('renders the overview checklist screen first', () => {
        render(<RecipeListsClient currentUser={null} />);

        expect(
            screen.getByText('recipe_lists_course_details.requirements_title')
        ).toBeDefined();
        expect(
            screen.getByText('recipe_lists_course_details.action_required')
        ).toBeDefined();
    });

    it('next step button is disabled initially until checklist is verified', () => {
        render(<RecipeListsClient currentUser={null} />);

        const nextBtn = screen.getByText('Next Step');
        expect(nextBtn).toBeDefined();
        expect((nextBtn as HTMLButtonElement).disabled).toBe(true);
    });

    it('enables the next step button when all checklist items are ticked', () => {
        render(<RecipeListsClient currentUser={null} />);

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBe(4);

        checkboxes.forEach((cb) => {
            fireEvent.click(cb);
        });

        const nextBtn = screen.getByText('Next Step');
        expect((nextBtn as HTMLButtonElement).disabled).toBe(false);

        // Click next step to navigate to creation
        fireEvent.click(nextBtn);

        // Should now show the Creation Step 1 details
        expect(
            screen.getByText('recipe_lists_course_details.workflow_step1_title')
        ).toBeDefined();
    });
});
