import { RecipeBookConfig } from '@/app/utils/recipeBookUtils';

export type RecipeBookAction =
    | { type: 'RESET' }
    | { type: 'SET_IMAGE_DISPLAY'; payload: RecipeBookConfig['imageDisplay'] }
    | { type: 'TOGGLE_EXTRA_IMAGES' }
    | { type: 'TOGGLE_USER_IMAGE' };

export function recipeBookReducer(
    state: RecipeBookConfig,
    action: RecipeBookAction
): RecipeBookConfig {
    switch (action.type) {
        case 'RESET':
            return {
                imageDisplay: 'random',
                displayExtraImages: true,
                displayUserImage: true,
            };
        case 'SET_IMAGE_DISPLAY':
            return { ...state, imageDisplay: action.payload };
        case 'TOGGLE_EXTRA_IMAGES':
            return { ...state, displayExtraImages: !state.displayExtraImages };
        case 'TOGGLE_USER_IMAGE':
            return { ...state, displayUserImage: !state.displayUserImage };
        default:
            return state;
    }
}
