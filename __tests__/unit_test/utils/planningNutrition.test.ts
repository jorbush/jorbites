import { describe, it, expect } from 'vitest';
import {
    aggregateDayMacros,
    aggregateMealsMacros,
    aggregatePlanAllergens,
    aggregateWeeklyNutrition,
    getDayMeals,
    hasAnyMacro,
} from '@/app/utils/planningNutrition';

describe('planningNutrition helpers', () => {
    describe('aggregateMealsMacros', () => {
        it('returns all nulls for empty meals or unaudited recipes', () => {
            expect(aggregateMealsMacros([])).toEqual({
                calories: null,
                protein: null,
                carbohydrates: null,
                fat: null,
                fiber: null,
            });

            expect(
                aggregateMealsMacros([
                    {
                        recipe: {
                            calories: null,
                            protein: undefined,
                            carbohydrates: null,
                            fat: null,
                            fiber: null,
                        },
                    },
                ])
            ).toEqual({
                calories: null,
                protein: null,
                carbohydrates: null,
                fat: null,
                fiber: null,
            });
        });

        it('aggregates calories, protein, carbohydrates, fat, and fiber across meals', () => {
            const totals = aggregateMealsMacros([
                {
                    recipe: {
                        calories: 450,
                        protein: 30,
                        carbohydrates: 50,
                        fat: 14,
                        fiber: 8,
                    },
                },
                {
                    recipe: {
                        calories: 650,
                        protein: 45,
                        carbohydrates: 60,
                        fat: 22,
                        fiber: 10,
                    },
                },
            ]);

            expect(totals).toEqual({
                calories: 1100,
                protein: 75,
                carbohydrates: 110,
                fat: 36,
                fiber: 18,
            });
        });

        it('preserves explicit 0 values and ignores unaudited null fields', () => {
            const totals = aggregateMealsMacros([
                {
                    recipe: {
                        calories: 320,
                        protein: 35,
                        carbohydrates: 0,
                        fat: 18,
                        fiber: 0,
                    },
                },
                {
                    recipe: {
                        calories: null,
                        protein: null,
                        carbohydrates: null,
                        fat: null,
                        fiber: null,
                    },
                },
            ]);

            expect(totals).toEqual({
                calories: 320,
                protein: 35,
                carbohydrates: 0,
                fat: 18,
                fiber: 0,
            });
        });

        it('ignores negative and NaN values', () => {
            const totals = aggregateMealsMacros([
                {
                    recipe: {
                        calories: -100,
                        protein: Number.NaN,
                        carbohydrates: 0,
                        fat: 10,
                        fiber: Number.POSITIVE_INFINITY,
                    },
                },
            ]);

            expect(totals).toEqual({
                calories: null,
                protein: null,
                carbohydrates: 0,
                fat: 10,
                fiber: null,
            });
        });
    });

    describe('getDayMeals & aggregateDayMacros', () => {
        it('collects and sums meals across all 4 meal slots for a day', () => {
            const groupedMeals = {
                'monday-breakfast': [
                    {
                        recipe: {
                            calories: 350,
                            protein: 20,
                            carbohydrates: 40,
                            fat: 10,
                            fiber: 5,
                        },
                    },
                ],
                'monday-lunch': [
                    {
                        recipe: {
                            calories: 650,
                            protein: 45,
                            carbohydrates: 70,
                            fat: 20,
                            fiber: 9,
                        },
                    },
                ],
                'monday-snack': [
                    {
                        recipe: {
                            calories: 200,
                            protein: 10,
                            carbohydrates: 20,
                            fat: 8,
                            fiber: 4,
                        },
                    },
                ],
                'monday-dinner': [
                    {
                        recipe: {
                            calories: 650,
                            protein: 40,
                            carbohydrates: 50,
                            fat: 24,
                            fiber: 6,
                        },
                    },
                ],
                'tuesday-breakfast': [
                    {
                        recipe: {
                            calories: 999,
                            protein: 99,
                        },
                    },
                ],
            };

            expect(getDayMeals('monday', groupedMeals)).toHaveLength(4);
            expect(aggregateDayMacros('monday', groupedMeals)).toEqual({
                calories: 1850,
                protein: 115,
                carbohydrates: 180,
                fat: 62,
                fiber: 24,
            });
        });
    });

    describe('hasAnyMacro', () => {
        it('returns false when all fields are null and true when any field is 0 or positive', () => {
            expect(
                hasAnyMacro({
                    calories: null,
                    protein: null,
                    carbohydrates: null,
                    fat: null,
                    fiber: null,
                })
            ).toBe(false);

            expect(
                hasAnyMacro({
                    calories: null,
                    protein: null,
                    carbohydrates: 0,
                    fat: null,
                    fiber: null,
                })
            ).toBe(true);
        });
    });

    describe('aggregatePlanAllergens', () => {
        it('combines stored allergens and ingredient detection in canonical EU-14 order', () => {
            const allergens = aggregatePlanAllergens([
                {
                    day: 'monday',
                    recipe: {
                        id: 'r1',
                        title: 'Creamy Pasta',
                        allergens: ['milk', 'gluten'],
                        ingredients: ['200g spaghetti', '100ml cream'],
                    },
                },
                {
                    day: 'tuesday',
                    recipe: {
                        id: 'r2',
                        title: 'Peanut Stir Fry',
                        allergens: [],
                        ingredients: ['50g peanuts', '2 tbsp soy sauce'],
                    },
                },
                {
                    day: 'wednesday',
                    recipe: {
                        id: 'r1',
                        title: 'Creamy Pasta',
                        allergens: ['milk', 'gluten'],
                        ingredients: ['200g spaghetti', '100ml cream'],
                    },
                },
            ]);

            expect(allergens.map((a) => a.id)).toEqual([
                'gluten',
                'peanuts',
                'soy',
                'milk',
            ]);

            const gluten = allergens.find((a) => a.id === 'gluten');
            expect(gluten?.recipeTitles).toEqual([
                'Creamy Pasta',
                'Peanut Stir Fry',
            ]);
            expect(gluten?.recipeCount).toBe(2);

            const milk = allergens.find((a) => a.id === 'milk');
            expect(milk?.recipeTitles).toEqual(['Creamy Pasta']);
            expect(milk?.recipeCount).toBe(1);
        });

        it('returns empty array when no allergens are present', () => {
            const allergens = aggregatePlanAllergens([
                {
                    day: 'monday',
                    recipe: {
                        id: 'r1',
                        title: 'Roasted Veggies',
                        ingredients: ['carrots', 'broccoli', 'olive oil'],
                        allergens: [],
                    },
                },
            ]);

            expect(allergens).toEqual([]);
        });
    });

    describe('aggregateWeeklyNutrition', () => {
        it('returns empty summary for empty plan', () => {
            const summary = aggregateWeeklyNutrition([]);
            expect(summary.populatedDays).toBe(0);
            expect(summary.dailyAverages).toEqual({
                calories: null,
                protein: null,
                carbohydrates: null,
                fat: null,
                fiber: null,
            });
            expect(summary.allergens).toEqual([]);
        });

        it('averages daily macros over populated days with audited values and ignores unaudited days per metric', () => {
            const summary = aggregateWeeklyNutrition([
                {
                    day: 'monday',
                    mealType: 'breakfast',
                    recipe: {
                        id: 'r1',
                        title: 'Oatmeal',
                        calories: 400,
                        protein: 20,
                        carbohydrates: 60,
                        fat: 8,
                        fiber: 10,
                        allergens: ['gluten'],
                    },
                },
                {
                    day: 'monday',
                    mealType: 'lunch',
                    recipe: {
                        id: 'r2',
                        title: 'Chicken Salad',
                        calories: 600,
                        protein: 50,
                        carbohydrates: 20,
                        fat: 22,
                        fiber: 6,
                    },
                },
                {
                    day: 'tuesday',
                    mealType: 'dinner',
                    recipe: {
                        id: 'r3',
                        title: 'Grilled Salmon',
                        calories: 800,
                        protein: 60,
                        carbohydrates: 0,
                        fat: 30,
                        fiber: null,
                        allergens: ['fish'],
                    },
                },
                {
                    day: 'wednesday',
                    mealType: 'lunch',
                    recipe: {
                        id: 'r4',
                        title: 'Unaudited Soup',
                        calories: null,
                        protein: null,
                        carbohydrates: null,
                        fat: null,
                        fiber: null,
                    },
                },
            ]);

            // 3 populated days (mon, tue, wed)
            expect(summary.populatedDays).toBe(3);

            // Calories: mon=1000, tue=800, wed=null -> avg over 2 audited days = 900
            // Protein: mon=70, tue=60, wed=null -> avg over 2 audited days = 65
            // Carbs: mon=80, tue=0 (explicit 0!), wed=null -> avg over 2 audited days = 40
            // Fat: mon=30, tue=30, wed=null -> avg over 2 audited days = 30
            // Fiber: mon=16, tue=null, wed=null -> avg over 1 audited day = 16
            expect(summary.dailyAverages).toEqual({
                calories: 900,
                protein: 65,
                carbohydrates: 40,
                fat: 30,
                fiber: 16,
            });

            expect(summary.totals).toEqual({
                calories: 1800,
                protein: 130,
                carbohydrates: 80,
                fat: 60,
                fiber: 16,
            });

            expect(summary.allergens.map((a) => a.id)).toEqual([
                'gluten',
                'fish',
            ]);
        });
    });
});
