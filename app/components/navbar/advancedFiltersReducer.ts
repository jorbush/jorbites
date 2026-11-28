export interface AdvancedFiltersState {
    tempMinCalories: string;
    tempMaxCalories: string;
    tempMinYield: string;
    tempMaxYield: string;
    tempCuisine: string;
    tempStartDate: string;
    tempEndDate: string;
    tempDifficulty: string;
    tempDietaryTags: string[];
    tempExcludeAllergens: string[];
    tempMinProtein: string;
    tempMaxCarbohydrates: string;
    tempMaxFat: string;
}

export interface SyncFiltersPayload {
    minCalories: string;
    maxCalories: string;
    minYield: string;
    maxYield: string;
    recipeCuisine: string;
    startDate: string;
    endDate: string;
    difficulty: string;
    dietaryTags: string[];
    excludeAllergens: string[];
    minProtein: string;
    maxCarbohydrates: string;
    maxFat: string;
}

export type AdvancedFiltersAction =
    | { type: 'SET_MIN_CALORIES'; payload: string }
    | { type: 'SET_MAX_CALORIES'; payload: string }
    | { type: 'SET_MIN_YIELD'; payload: string }
    | { type: 'SET_MAX_YIELD'; payload: string }
    | { type: 'SET_CUISINE'; payload: string }
    | { type: 'SET_START_DATE'; payload: string }
    | { type: 'SET_END_DATE'; payload: string }
    | { type: 'SET_DIFFICULTY'; payload: string }
    | { type: 'TOGGLE_DIETARY_TAG'; payload: string }
    | { type: 'TOGGLE_EXCLUDE_ALLERGEN'; payload: string }
    | { type: 'SET_MIN_PROTEIN'; payload: string }
    | { type: 'SET_MAX_CARBOHYDRATES'; payload: string }
    | { type: 'SET_MAX_FAT'; payload: string }
    | { type: 'SYNC_FILTERS'; payload: SyncFiltersPayload }
    | { type: 'CLEAR_FILTERS' };

const toggleListItem = (items: string[], target: string): string[] => {
    const normalized = target.trim().toLowerCase();
    if (!normalized) return items;
    return items.includes(normalized)
        ? items.filter((item) => item !== normalized)
        : [...items, normalized];
};

export function advancedFiltersReducer(
    state: AdvancedFiltersState,
    action: AdvancedFiltersAction
): AdvancedFiltersState {
    switch (action.type) {
        case 'SET_MIN_CALORIES':
            return { ...state, tempMinCalories: action.payload };
        case 'SET_MAX_CALORIES':
            return { ...state, tempMaxCalories: action.payload };
        case 'SET_MIN_YIELD':
            return { ...state, tempMinYield: action.payload };
        case 'SET_MAX_YIELD':
            return { ...state, tempMaxYield: action.payload };
        case 'SET_CUISINE':
            return { ...state, tempCuisine: action.payload };
        case 'SET_START_DATE':
            return { ...state, tempStartDate: action.payload };
        case 'SET_END_DATE':
            return { ...state, tempEndDate: action.payload };
        case 'SET_DIFFICULTY':
            return { ...state, tempDifficulty: action.payload };
        case 'TOGGLE_DIETARY_TAG':
            return {
                ...state,
                tempDietaryTags: toggleListItem(
                    state.tempDietaryTags,
                    action.payload
                ),
            };
        case 'TOGGLE_EXCLUDE_ALLERGEN':
            return {
                ...state,
                tempExcludeAllergens: toggleListItem(
                    state.tempExcludeAllergens,
                    action.payload
                ),
            };
        case 'SET_MIN_PROTEIN':
            return { ...state, tempMinProtein: action.payload };
        case 'SET_MAX_CARBOHYDRATES':
            return { ...state, tempMaxCarbohydrates: action.payload };
        case 'SET_MAX_FAT':
            return { ...state, tempMaxFat: action.payload };
        case 'SYNC_FILTERS':
            return {
                ...state,
                tempMinCalories: action.payload.minCalories,
                tempMaxCalories: action.payload.maxCalories,
                tempMinYield: action.payload.minYield,
                tempMaxYield: action.payload.maxYield,
                tempCuisine: action.payload.recipeCuisine,
                tempStartDate: action.payload.startDate,
                tempEndDate: action.payload.endDate,
                tempDifficulty: action.payload.difficulty,
                tempDietaryTags: action.payload.dietaryTags,
                tempExcludeAllergens: action.payload.excludeAllergens,
                tempMinProtein: action.payload.minProtein,
                tempMaxCarbohydrates: action.payload.maxCarbohydrates,
                tempMaxFat: action.payload.maxFat,
            };
        case 'CLEAR_FILTERS':
            return {
                ...state,
                tempMinCalories: '',
                tempMaxCalories: '',
                tempMinYield: '',
                tempMaxYield: '',
                tempCuisine: '',
                tempStartDate: '',
                tempEndDate: '',
                tempDifficulty: '',
                tempDietaryTags: [],
                tempExcludeAllergens: [],
                tempMinProtein: '',
                tempMaxCarbohydrates: '',
                tempMaxFat: '',
            };
        default:
            return state;
    }
}
