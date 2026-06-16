export interface TranslateableRecipeContentState {
    detectedLanguage: string | null;
    isTranslated: boolean;
    isTranslating: boolean;
    translatedDescription: string | null;
    translatedIngredients: string[] | null;
    translatedSteps: string[] | null;
}

export type TranslateableRecipeContentAction =
    | { type: 'SET_DETECTED_LANGUAGE'; payload: string | null }
    | { type: 'START_TRANSLATING' }
    | { type: 'STOP_TRANSLATING' }
    | {
          type: 'SET_TRANSLATED_CONTENT';
          payload: {
              description: string | null;
              ingredients: string[] | null;
              steps: string[] | null;
          };
      }
    | { type: 'SHOW_ORIGINAL' }
    | { type: 'RESET_TRANSLATION' };

export function translateableRecipeContentReducer(
    state: TranslateableRecipeContentState,
    action: TranslateableRecipeContentAction
): TranslateableRecipeContentState {
    switch (action.type) {
        case 'SET_DETECTED_LANGUAGE':
            return { ...state, detectedLanguage: action.payload };
        case 'START_TRANSLATING':
            return { ...state, isTranslating: true };
        case 'STOP_TRANSLATING':
            return { ...state, isTranslating: false };
        case 'SET_TRANSLATED_CONTENT':
            return {
                ...state,
                isTranslating: false,
                isTranslated: true,
                translatedDescription: action.payload.description,
                translatedIngredients: action.payload.ingredients,
                translatedSteps: action.payload.steps,
            };
        case 'SHOW_ORIGINAL':
            return {
                ...state,
                isTranslated: false,
                translatedDescription: null,
                translatedIngredients: null,
                translatedSteps: null,
            };
        case 'RESET_TRANSLATION':
            return {
                ...state,
                isTranslated: false,
                detectedLanguage: null,
                translatedDescription: null,
                translatedIngredients: null,
                translatedSteps: null,
            };
        default:
            return state;
    }
}
