import { describe, it, expect } from 'vitest';
import { generateIcsContent } from '@/app/utils/calendar-utils';
import { SafePlanningMeal } from '@/app/types';

describe('calendar-utils', () => {
    describe('generateIcsContent', () => {
        const startMonday = new Date('2026-06-01T00:00:00.000Z'); // June 1st, 2026 is a Monday

        const mockMeals: SafePlanningMeal[] = [
            {
                id: 'meal-1',
                planningId: 'plan-1',
                day: 'monday',
                mealType: 'breakfast',
                recipeId: 'recipe-1',
                recipe: {
                    id: 'recipe-1',
                    title: 'Avocado Toast',
                    description: 'Delicious morning avocado toast',
                    imageSrc: '/avocado.webp',
                    createdAt: '2026-05-25T18:00:00.000Z',
                    categories: ['Breakfast'],
                    method: 'no-cook',
                    minutes: 10,
                    numLikes: 5,
                    ingredients: ['1 avocado', '2 bread slices'],
                    steps: ['Toast bread', 'Mash avocado'],
                    extraImages: [],
                    userId: 'user-1',
                    user: {
                        id: 'user-1',
                        name: 'Chef Jordi',
                        image: null,
                        verified: true,
                        level: 5,
                        badges: [],
                    },
                },
            },
            {
                id: 'meal-2',
                planningId: 'plan-1',
                day: 'wednesday',
                mealType: 'lunch',
                recipeId: 'recipe-2',
                recipe: {
                    id: 'recipe-2',
                    title: 'Healthy Salad',
                    description: 'Green fresh salad',
                    imageSrc: '/salad.webp',
                    createdAt: '2026-05-25T18:00:00.000Z',
                    categories: ['Lunch'],
                    method: 'no-cook',
                    minutes: 15,
                    numLikes: 10,
                    ingredients: ['Lettuce', 'Tomatoes'],
                    steps: ['Wash vegetables', 'Mix together'],
                    extraImages: [],
                    userId: 'user-1',
                    user: {
                        id: 'user-1',
                        name: 'Chef Jordi',
                        image: null,
                        verified: true,
                        level: 5,
                        badges: [],
                    },
                },
            },
        ];

        it('should generate valid iCalendar structure with events', () => {
            const ics = generateIcsContent(
                'My Diet Plan',
                mockMeals,
                startMonday
            );

            // Verify iCal headers
            expect(ics).toContain('BEGIN:VCALENDAR');
            expect(ics).toContain('VERSION:2.0');
            expect(ics).toContain('PRODID:-//Jorbites//Meal Planner//EN');
            expect(ics).toContain('END:VCALENDAR');

            // Verify events are present
            expect(ics).toContain('BEGIN:VEVENT');
            expect(ics).toContain('END:VEVENT');
        });

        it('should format event dates correctly based on day and mealType', () => {
            const ics = generateIcsContent(
                'My Diet Plan',
                mockMeals,
                startMonday
            );

            // Monday Breakfast: June 1st, 2026 at 08:00
            expect(ics).toContain('DTSTART:20260601T080000');
            expect(ics).toContain('DTEND:20260601T084500');
            expect(ics).toContain('SUMMARY:Breakfast: Avocado Toast');

            // Wednesday Lunch: June 3rd, 2026 at 13:00 (offset from Mon June 1st is +2 days)
            expect(ics).toContain('DTSTART:20260603T130000');
            expect(ics).toContain('DTEND:20260603T140000');
            expect(ics).toContain('SUMMARY:Lunch: Healthy Salad');
        });

        it('should fall back gracefully on missing recipe details', () => {
            const emptyRecipeMeal: SafePlanningMeal[] = [
                {
                    id: 'meal-3',
                    planningId: 'plan-1',
                    day: 'friday',
                    mealType: 'dinner',
                    recipeId: 'recipe-empty',
                },
            ];

            const ics = generateIcsContent(
                'Empty Plan',
                emptyRecipeMeal,
                startMonday
            );

            expect(ics).toContain('BEGIN:VEVENT');
            // Friday Dinner: June 5th, 2026 at 20:00 (+4 days offset)
            expect(ics).toContain('DTSTART:20260605T200000');
            expect(ics).toContain('DTEND:20260605T210000');
            expect(ics).toContain('SUMMARY:Dinner: Unknown Recipe');
            expect(ics).toContain('END:VEVENT');
        });
    });
});
