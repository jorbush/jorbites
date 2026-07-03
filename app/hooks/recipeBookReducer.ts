import { RecipeBookConfig } from '@/app/utils/recipeBookUtils';

export type RecipeBookAction =
    | { type: 'RESET' }
    | { type: 'SET_IMAGE_DISPLAY'; payload: RecipeBookConfig['imageDisplay'] }
    | { type: 'TOGGLE_EXTRA_IMAGES' }
    | { type: 'TOGGLE_USER_IMAGE' }
    | { type: 'SET_RECIPES'; payload: string[] }
    | { type: 'TOGGLE_RECIPE'; payload: string }
    | { type: 'SELECT_ALL_RECIPES' }
    | { type: 'DESELECT_ALL_RECIPES' };

export interface RecipeBookState extends RecipeBookConfig {
    selectedRecipeIds: Set<string>;
    allRecipeIds: string[];
}

const DEFAULT_STATE: RecipeBookState = {
    imageDisplay: 'random',
    displayExtraImages: true,
    displayUserImage: true,
    selectedRecipeIds: new Set<string>(),
    allRecipeIds: [],
};

export function recipeBookReducer(
    state: RecipeBookState,
    action: RecipeBookAction
): RecipeBookState {
    switch (action.type) {
        case 'RESET':
            return { ...DEFAULT_STATE, selectedRecipeIds: new Set<string>() };
        case 'SET_IMAGE_DISPLAY':
            return { ...state, imageDisplay: action.payload };
        case 'TOGGLE_EXTRA_IMAGES':
            return { ...state, displayExtraImages: !state.displayExtraImages };
        case 'TOGGLE_USER_IMAGE':
            return { ...state, displayUserImage: !state.displayUserImage };
        case 'SET_RECIPES': {
            const ids = action.payload;
            return {
                ...state,
                allRecipeIds: ids,
                selectedRecipeIds: new Set<string>(ids),
            };
        }
        case 'TOGGLE_RECIPE': {
            const id = action.payload;
            const next = new Set(state.selectedRecipeIds);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return { ...state, selectedRecipeIds: next };
        }
        case 'SELECT_ALL_RECIPES':
            return {
                ...state,
                selectedRecipeIds: new Set<string>(state.allRecipeIds),
            };
        case 'DESELECT_ALL_RECIPES':
            return { ...state, selectedRecipeIds: new Set<string>() };
        default:
            return state;
    }
}
