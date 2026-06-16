export interface PeriodFilterState {
    isOpen: boolean;
    tempStartDate: string;
    tempEndDate: string;
}

export type PeriodFilterAction =
    | { type: 'SET_OPEN'; payload: boolean }
    | { type: 'SET_START_DATE'; payload: string }
    | { type: 'SET_END_DATE'; payload: string }
    | { type: 'SYNC_DATES'; payload: { startDate: string; endDate: string } }
    | { type: 'CLEAR_DATES' };

export function periodFilterReducer(
    state: PeriodFilterState,
    action: PeriodFilterAction
): PeriodFilterState {
    switch (action.type) {
        case 'SET_OPEN':
            return { ...state, isOpen: action.payload };
        case 'SET_START_DATE':
            return { ...state, tempStartDate: action.payload };
        case 'SET_END_DATE':
            return { ...state, tempEndDate: action.payload };
        case 'SYNC_DATES':
            return {
                ...state,
                tempStartDate: action.payload.startDate,
                tempEndDate: action.payload.endDate,
            };
        case 'CLEAR_DATES':
            return {
                ...state,
                tempStartDate: '',
                tempEndDate: '',
                isOpen: false,
            };
        default:
            return state;
    }
}
