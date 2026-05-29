import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ExportCalendarModal from '@/app/components/modals/ExportCalendarModal';
import { SafePlanningMeal } from '@/app/types';

describe('ExportCalendarModal', () => {
    afterEach(() => {
        cleanup();
    });

    const mockMeals: SafePlanningMeal[] = [
        {
            id: 'meal-1',
            planningId: 'plan-1',
            day: 'monday',
            mealType: 'breakfast',
            recipeId: 'recipe-1',
            recipe: {
                id: 'recipe-1',
                title: 'Oatmeal',
                description: 'Healthy morning oats',
                imageSrc: '/oatmeal.jpg',
                createdAt: '2026-05-25',
                categories: ['Breakfast'],
                method: 'no-cook',
                minutes: 5,
                numLikes: 3,
                ingredients: ['1 cup oats', '1 cup milk'],
                steps: ['Mix together'],
                userId: 'user-1',
            },
        },
    ];

    it('renders title, description and input date', () => {
        render(
            <ExportCalendarModal
                isOpen={true}
                onClose={vi.fn()}
                planningName="My Oats Week"
                meals={mockMeals}
            />
        );

        expect(screen.getByText('export_calendar')).toBeDefined();
        expect(screen.getByText('calendar_export_description')).toBeDefined();
        expect(screen.getByText('select_week_start')).toBeDefined();
    });

    it('creates object url and triggers link click on download', () => {
        const mockClose = vi.fn();
        const createObjectURLMock = vi.fn().mockReturnValue('blob:url');
        const revokeObjectURLMock = vi.fn();

        global.URL.createObjectURL = createObjectURLMock;
        global.URL.revokeObjectURL = revokeObjectURLMock;

        render(
            <ExportCalendarModal
                isOpen={true}
                onClose={mockClose}
                planningName="My Oats Week"
                meals={mockMeals}
            />
        );

        const downloadButton = screen.getByText('download_ics');
        fireEvent.click(downloadButton);

        expect(createObjectURLMock).toHaveBeenCalled();
        expect(mockClose).toHaveBeenCalledTimes(1);
    });
});
