import { IconType } from 'react-icons';
import { MEAL_TYPES } from '@/app/utils/constants';
import {
    AllergenId,
    EU_ALLERGEN_DEFINITIONS,
    resolveRecipeAllergens,
} from '@/app/utils/allergenDetector';

export interface PlanningNutritionRecipe {
    id?: string;
    title?: string;
    calories?: number | null;
    protein?: number | null;
    carbohydrates?: number | null;
    fat?: number | null;
    fiber?: number | null;
    ingredients?: string[] | null;
    categories?: string[] | null;
    allergens?: string[] | null;
}

export interface PlanningMealLike {
    day?: string;
    mealType?: string;
    recipe?: PlanningNutritionRecipe | null;
}

export interface MacroTotals {
    calories: number | null;
    protein: number | null;
    carbohydrates: number | null;
    fat: number | null;
    fiber: number | null;
}

export interface PlanAllergen {
    id: AllergenId;
    icon: IconType;
    recipeCount: number;
    recipeTitles: string[];
}

export interface WeeklyNutritionSummary {
    populatedDays: number;
    dailyAverages: MacroTotals;
    totals: MacroTotals;
    allergens: PlanAllergen[];
}

const MACRO_FIELDS: readonly (keyof MacroTotals)[] = [
    'calories',
    'protein',
    'carbohydrates',
    'fat',
    'fiber',
];

const isValidNutrient = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0;

/**
 * Aggregates per-serving nutrition fields across a list of meals.
 * Preserves explicit `0` values as `0` and ignores unaudited `null`/`undefined` fields
 * (returning `null` for a field only when no meal has an audited numeric value for it).
 */
export function aggregateMealsMacros(meals: PlanningMealLike[]): MacroTotals {
    const totals: MacroTotals = {
        calories: null,
        protein: null,
        carbohydrates: null,
        fat: null,
        fiber: null,
    };

    if (!Array.isArray(meals) || meals.length === 0) {
        return totals;
    }

    for (const meal of meals) {
        const recipe = meal?.recipe;
        if (!recipe) continue;

        for (const field of MACRO_FIELDS) {
            const value = recipe[field];
            if (isValidNutrient(value)) {
                totals[field] = (totals[field] ?? 0) + value;
            }
        }
    }

    return totals;
}

/**
 * Collects all meals across all meal slots for a single day from a grouped meals map.
 */
export function getDayMeals(
    day: string,
    groupedMeals: Record<string, PlanningMealLike[]>
): PlanningMealLike[] {
    if (!groupedMeals || !day) {
        return [];
    }

    const normalizedDay = day.toLowerCase();
    const dayMeals: PlanningMealLike[] = [];

    for (const mealType of MEAL_TYPES) {
        const primaryKey = `${day}-${mealType}`;
        const normalizedKey = `${normalizedDay}-${mealType}`;
        const slotMeals =
            groupedMeals[primaryKey] ??
            (normalizedKey !== primaryKey
                ? groupedMeals[normalizedKey]
                : undefined);

        if (Array.isArray(slotMeals) && slotMeals.length > 0) {
            dayMeals.push(...slotMeals);
        }
    }

    return dayMeals;
}

/**
 * Aggregates daily calories and macros for a single day from a grouped meals map.
 */
export function aggregateDayMacros(
    day: string,
    groupedMeals: Record<string, PlanningMealLike[]>
): MacroTotals {
    return aggregateMealsMacros(getDayMeals(day, groupedMeals));
}

/**
 * Returns true if at least one macro or calorie field has an audited numeric value (including 0).
 */
export function hasAnyMacro(macros: MacroTotals): boolean {
    return MACRO_FIELDS.some((field) => macros[field] !== null);
}

/**
 * Aggregates EU-14 allergens across all recipes in a meal plan,
 * combining stored/audited allergens with ingredient-based detection.
 * Returned in canonical EU_ALLERGEN_DEFINITIONS order.
 */
export function aggregatePlanAllergens(
    meals: PlanningMealLike[]
): PlanAllergen[] {
    if (!Array.isArray(meals) || meals.length === 0) {
        return [];
    }

    const byId = new Map<
        AllergenId,
        { icon: IconType; seenKeys: Set<string>; recipeTitles: string[] }
    >();

    for (const meal of meals) {
        const recipe = meal?.recipe;
        if (!recipe) continue;

        const resolved = resolveRecipeAllergens(
            Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
            Array.isArray(recipe.categories) ? recipe.categories : undefined,
            Array.isArray(recipe.allergens) ? recipe.allergens : undefined
        );

        if (resolved.length === 0) continue;

        const recipeTitle =
            typeof recipe.title === 'string' ? recipe.title.trim() : '';
        const recipeKey =
            typeof recipe.id === 'string' && recipe.id.trim()
                ? recipe.id.trim()
                : recipeTitle;

        for (const allergen of resolved) {
            let entry = byId.get(allergen.id);
            if (!entry) {
                entry = {
                    icon: allergen.icon,
                    seenKeys: new Set<string>(),
                    recipeTitles: [],
                };
                byId.set(allergen.id, entry);
            }

            if (recipeKey) {
                if (!entry.seenKeys.has(recipeKey)) {
                    entry.seenKeys.add(recipeKey);
                    if (recipeTitle) {
                        entry.recipeTitles.push(recipeTitle);
                    }
                }
            } else if (
                recipeTitle &&
                !entry.recipeTitles.includes(recipeTitle)
            ) {
                entry.recipeTitles.push(recipeTitle);
            }
        }
    }

    const result: PlanAllergen[] = [];
    for (const def of EU_ALLERGEN_DEFINITIONS) {
        const entry = byId.get(def.id);
        if (entry) {
            result.push({
                id: def.id,
                icon: entry.icon,
                recipeCount: Math.max(
                    entry.seenKeys.size,
                    entry.recipeTitles.length,
                    1
                ),
                recipeTitles: entry.recipeTitles,
            });
        }
    }

    return result;
}

/**
 * Aggregates weekly totals, per-populated-day macro averages, and plan-wide EU-14 allergens.
 * Averages each metric over the number of populated days that have at least one audited
 * numeric value for that metric so unaudited `null` recipes do not dilute daily averages.
 */
export function aggregateWeeklyNutrition(
    meals: PlanningMealLike[]
): WeeklyNutritionSummary {
    const emptyTotals: MacroTotals = {
        calories: null,
        protein: null,
        carbohydrates: null,
        fat: null,
        fiber: null,
    };

    if (!Array.isArray(meals) || meals.length === 0) {
        return {
            populatedDays: 0,
            dailyAverages: { ...emptyTotals },
            totals: { ...emptyTotals },
            allergens: [],
        };
    }

    const mealsByDay = new Map<string, PlanningMealLike[]>();

    for (const meal of meals) {
        if (!meal?.recipe) continue;
        const dayKey =
            typeof meal.day === 'string' ? meal.day.trim().toLowerCase() : '';
        if (!dayKey) continue;

        const existing = mealsByDay.get(dayKey);
        if (existing) {
            existing.push(meal);
        } else {
            mealsByDay.set(dayKey, [meal]);
        }
    }

    const totals: MacroTotals = { ...emptyTotals };
    const daysWithField: Record<keyof MacroTotals, number> = {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
    };

    for (const dayMeals of Array.from(mealsByDay.values())) {
        const dayMacros = aggregateMealsMacros(dayMeals);
        for (const field of MACRO_FIELDS) {
            const value = dayMacros[field];
            if (value !== null) {
                totals[field] = (totals[field] ?? 0) + value;
                daysWithField[field] += 1;
            }
        }
    }

    const dailyAverages: MacroTotals = { ...emptyTotals };
    for (const field of MACRO_FIELDS) {
        const total = totals[field];
        const count = daysWithField[field];
        if (total !== null && count > 0) {
            dailyAverages[field] = Math.round(total / count);
        }
    }

    return {
        populatedDays: mealsByDay.size,
        dailyAverages,
        totals,
        allergens: aggregatePlanAllergens(meals),
    };
}
