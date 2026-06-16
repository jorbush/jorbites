export enum WORKSHOP_STEPS {
    INFO = 0,
    REQUIREMENTS = 1,
    PRIVACY = 2,
    IMAGE = 3,
}

export interface WorkshopState {
    step: WORKSHOP_STEPS;
    isLoading: boolean;
    numIngredients: number;
    numPreviousSteps: number;
    selectedUsers: any[];
}

export type WorkshopAction =
    | { type: 'SET_STEP'; payload: WORKSHOP_STEPS }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_NUM_INGREDIENTS'; payload: number }
    | { type: 'SET_NUM_PREVIOUS_STEPS'; payload: number }
    | { type: 'SET_SELECTED_USERS'; payload: any[] }
    | { type: 'RESET_MODAL' };

export function workshopReducer(
    state: WorkshopState,
    action: WorkshopAction
): WorkshopState {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, step: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_NUM_INGREDIENTS':
            return { ...state, numIngredients: action.payload };
        case 'SET_NUM_PREVIOUS_STEPS':
            return { ...state, numPreviousSteps: action.payload };
        case 'SET_SELECTED_USERS':
            return { ...state, selectedUsers: action.payload };
        case 'RESET_MODAL':
            return {
                step: WORKSHOP_STEPS.INFO,
                isLoading: false,
                numIngredients: 0,
                numPreviousSteps: 0,
                selectedUsers: [],
            };
        default:
            return state;
    }
}
