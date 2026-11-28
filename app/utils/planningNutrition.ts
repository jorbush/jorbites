import { IconType } from 'react-icons';
import { MAX_RECIPES_PER_MEAL, MEAL_TYPES } from '@/app/utils/constants';
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

export interface DailyNutritionTargets {
    targetCalories?: number | null;
    targetProtein?: number | null;
    targetCarbohydrates?: number | null;
    targetFat?: number | null;
}

export type DailyTargetField = keyof DailyNutritionTargets;

export type TargetMacroKey = 'calories' | 'protein' | 'carbohydrates' | 'fat';

export type MacroProgressStatus = 'under' | 'met' | 'over';

export interface MacroProgressItem {
    key: TargetMacroKey;
    current: number;
    target: number;
    percentage: number;
    clampedPercent: number;
    remaining: number;
    overBy: number;
    status: MacroProgressStatus;
}

export interface MacroBudgetFilter {
    maxCalories?: number | null;
    minProtein?: number | null;
    maxCarbohydrates?: number | null;
    maxFat?: number | null;
}

export interface RemainingMacroBudget {
    remainingCalories: number | null;
    remainingProtein: number | null;
    remainingCarbohydrates: number | null;
    remainingFat: number | null;
    initialFilters: MacroBudgetFilter;
    optionalFilters: MacroBudgetFilter;
    hasRemaining: boolean;
}

export const DAILY_TARGET_LIMITS: Record<DailyTargetField, number> = {
    targetCalories: 20000,
    targetProtein: 2000,
    targetCarbohydrates: 2000,
    targetFat: 2000,
};

const TARGET_FIELD_SPECS: ReadonlyArray<{
    field: DailyTargetField;
    macroKey: TargetMacroKey;
}> = [
    { field: 'targetCalories', macroKey: 'calories' },
    { field: 'targetProtein', macroKey: 'protein' },
    { field: 'targetCarbohydrates', macroKey: 'carbohydrates' },
    { field: 'targetFat', macroKey: 'fat' },
];

const SUGGESTED_EMPTY_SLOT_ORDER = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
] as const;

const SUGGESTED_FALLBACK_SLOT_ORDER = [
    'dinner',
    'snack',
    'lunch',
    'breakfast',
] as const;

const isValidPositiveTarget = (value: unknown, max: number): value is number =>
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= max;

export type ParseDailyTargetsResult =
    | {
          valid: true;
          provided: Partial<Record<DailyTargetField, number | null>>;
      }
    | {
          valid: false;
          error: string;
      };

/**
 * Validates and normalizes optional daily nutrition target fields from an API payload.
 * Omitted (`undefined`) fields are excluded from `provided`; `null` or empty strings clear the target.
 */
export function parseDailyNutritionTargets(
    payload: Record<string, unknown>
): ParseDailyTargetsResult {
    const provided: Partial<Record<DailyTargetField, number | null>> = {};

    for (const { field } of TARGET_FIELD_SPECS) {
        if (!(field in payload) || payload[field] === undefined) {
            continue;
        }

        const raw = payload[field];
        const max = DAILY_TARGET_LIMITS[field];

        if (raw === null) {
            provided[field] = null;
            continue;
        }

        if (typeof raw === 'string') {
            const trimmed = raw.trim();
            if (trimmed === '') {
                provided[field] = null;
                continue;
            }
            if (!/^\d+$/.test(trimmed)) {
                return {
                    valid: false,
                    error: `Invalid ${field}: must be an integer between 1 and ${max}`,
                };
            }
            const parsed = Number.parseInt(trimmed, 10);
            if (!isValidPositiveTarget(parsed, max)) {
                return {
                    valid: false,
                    error: `Invalid ${field}: must be an integer between 1 and ${max}`,
                };
            }
            provided[field] = parsed;
            continue;
        }

        if (isValidPositiveTarget(raw, max)) {
            provided[field] = raw;
            continue;
        }

        return {
            valid: false,
            error: `Invalid ${field}: must be an integer between 1 and ${max}`,
        };
    }

    return { valid: true, provided };
}

/**
 * Returns true if at least one daily nutrition target is configured as a valid positive integer.
 */
export function hasAnyDailyTarget(
    targets?: DailyNutritionTargets | null
): boolean {
    if (!targets) return false;
    return TARGET_FIELD_SPECS.some(({ field }) =>
        isValidPositiveTarget(targets[field], DAILY_TARGET_LIMITS[field])
    );
}

/**
 * Computes per-macro progress items for a single day against configured daily nutrition targets.
 */
export function computeDayGoalProgress(
    dayMacros: MacroTotals,
    targets?: DailyNutritionTargets | null
): MacroProgressItem[] {
    if (!targets) return [];

    const items: MacroProgressItem[] = [];

    for (const { field, macroKey } of TARGET_FIELD_SPECS) {
        const target = targets[field];
        if (!isValidPositiveTarget(target, DAILY_TARGET_LIMITS[field])) {
            continue;
        }

        const rawCurrent = dayMacros[macroKey];
        const current =
            typeof rawCurrent === 'number' &&
            Number.isFinite(rawCurrent) &&
            rawCurrent >= 0
                ? rawCurrent
                : 0;

        const percentage = Math.round((current / target) * 100);
        const clampedPercent = Math.min(100, Math.max(0, percentage));
        const remaining = Math.max(0, target - current);
        const overBy = Math.max(0, current - target);
        const status: MacroProgressStatus =
            current > target
                ? 'over'
                : current >= target * 0.9
                  ? 'met'
                  : 'under';

        items.push({
            key: macroKey,
            current,
            target,
            percentage,
            clampedPercent,
            remaining,
            overBy,
            status,
        });
    }

    return items;
}

/**
 * Computes remaining daily macro budget and pre-filled recipe search filters for a day.
 * Pre-applies remaining calories (`maxCalories`) and protein (`minProtein`) by default,
 * exposing remaining carbs/fat as optional one-click toggles (or pre-applying them if no
 * calorie/protein budget is configured).
 */
export function computeRemainingMacroBudget(
    dayMacros: MacroTotals,
    targets?: DailyNutritionTargets | null
): RemainingMacroBudget {
    const empty: RemainingMacroBudget = {
        remainingCalories: null,
        remainingProtein: null,
        remainingCarbohydrates: null,
        remainingFat: null,
        initialFilters: {},
        optionalFilters: {},
        hasRemaining: false,
    };

    if (!targets) {
        return empty;
    }

    const calcRemaining = (
        field: DailyTargetField,
        macroKey: TargetMacroKey
    ): number | null => {
        const target = targets[field];
        if (!isValidPositiveTarget(target, DAILY_TARGET_LIMITS[field])) {
            return null;
        }
        const current =
            typeof dayMacros[macroKey] === 'number' &&
            Number.isFinite(dayMacros[macroKey]) &&
            dayMacros[macroKey]! >= 0
                ? dayMacros[macroKey]!
                : 0;
        return Math.max(0, target - current);
    };

    const remainingCalories = calcRemaining('targetCalories', 'calories');
    const remainingProtein = calcRemaining('targetProtein', 'protein');
    const remainingCarbohydrates = calcRemaining(
        'targetCarbohydrates',
        'carbohydrates'
    );
    const remainingFat = calcRemaining('targetFat', 'fat');

    const caloriesExhausted = remainingCalories === 0;
    const initialFilters: MacroBudgetFilter = {};
    const optionalFilters: MacroBudgetFilter = {};

    if (!caloriesExhausted) {
        if (remainingCalories !== null && remainingCalories > 0) {
            initialFilters.maxCalories = remainingCalories;
        }
        if (remainingProtein !== null && remainingProtein > 0) {
            initialFilters.minProtein = remainingProtein;
        }

        const hasPrimary =
            Boolean(initialFilters.maxCalories) ||
            Boolean(initialFilters.minProtein);

        if (remainingCarbohydrates !== null && remainingCarbohydrates > 0) {
            if (hasPrimary) {
                optionalFilters.maxCarbohydrates = remainingCarbohydrates;
            } else {
                initialFilters.maxCarbohydrates = remainingCarbohydrates;
            }
        }

        if (remainingFat !== null && remainingFat > 0) {
            if (hasPrimary) {
                optionalFilters.maxFat = remainingFat;
            } else {
                initialFilters.maxFat = remainingFat;
            }
        }
    }

    const hasRemaining = Boolean(
        initialFilters.maxCalories ||
        initialFilters.minProtein ||
        initialFilters.maxCarbohydrates ||
        initialFilters.maxFat
    );

    return {
        remainingCalories,
        remainingProtein,
        remainingCarbohydrates,
        remainingFat,
        initialFilters,
        optionalFilters,
        hasRemaining,
    };
}

/**
 * Picks the best default meal slot for "Fill remaining macros" on a given day,
 * prioritizing the first empty main meal slot (`breakfast` -> `lunch` -> `dinner` -> `snack`)
 * before falling back to any slot that still has capacity.
 */
export function getSuggestedMealSlotForDay(
    day: string,
    groupedMeals: Record<string, PlanningMealLike[]>
): { suggestedSlot: string | null; availableSlots: string[] } {
    const normalizedDay = day.toLowerCase();

    const getSlotLength = (mealType: string): number => {
        const primary = groupedMeals?.[`${day}-${mealType}`];
        const fallback = groupedMeals?.[`${normalizedDay}-${mealType}`];
        const list = primary ?? fallback ?? [];
        return Array.isArray(list) ? list.length : 0;
    };

    const availableSlots = MEAL_TYPES.filter(
        (mealType) => getSlotLength(mealType) < MAX_RECIPES_PER_MEAL
    );

    if (availableSlots.length === 0) {
        return { suggestedSlot: null, availableSlots: [] };
    }

    const firstEmpty = SUGGESTED_EMPTY_SLOT_ORDER.find(
        (mealType) => getSlotLength(mealType) === 0
    );
    if (firstEmpty) {
        return { suggestedSlot: firstEmpty, availableSlots };
    }

    const fallbackSlot =
        SUGGESTED_FALLBACK_SLOT_ORDER.find((mealType) =>
            availableSlots.includes(mealType)
        ) ?? availableSlots[0];

    return { suggestedSlot: fallbackSlot, availableSlots };
}
