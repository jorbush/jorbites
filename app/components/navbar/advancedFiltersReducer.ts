export interface AdvancedFiltersState {
    isOpen: boolean;
    tempMinCalories: string;
    tempMaxCalories: string;
    tempMinYield: string;
    tempMaxYield: string;
    tempCuisine: string;
    tempStartDate: string;
    tempEndDate: string;
}

export type AdvancedFiltersAction =
    | { type: 'SET_OPEN'; payload: boolean }
    | { type: 'SET_MIN_CALORIES'; payload: string }
    | { type: 'SET_MAX_CALORIES'; payload: string }
    | { type: 'SET_MIN_YIELD'; payload: string }
    | { type: 'SET_MAX_YIELD'; payload: string }
    | { type: 'SET_CUISINE'; payload: string }
    | { type: 'SET_START_DATE'; payload: string }
    | { type: 'SET_END_DATE'; payload: string }
    | {
          type: 'SYNC_FILTERS';
          payload: {
              minCalories: string;
              maxCalories: string;
              minYield: string;
              maxYield: string;
              recipeCuisine: string;
              startDate: string;
              endDate: string;
          };
      }
    | { type: 'CLEAR_FILTERS' };

export function advancedFiltersReducer(
    state: AdvancedFiltersState,
    action: AdvancedFiltersAction
): AdvancedFiltersState {
    switch (action.type) {
        case 'SET_OPEN':
            return { ...state, isOpen: action.payload };
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
                isOpen: false,
            };
        default:
            return state;
    }
}
