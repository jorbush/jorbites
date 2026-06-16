export interface PullToRefreshState {
    refreshing: boolean;
    displayPullDistance: number;
}

export type PullToRefreshAction =
    | { type: 'SET_PULL_DISTANCE'; payload: number }
    | { type: 'START_REFRESHING' }
    | { type: 'STOP_REFRESHING' }
    | { type: 'RESET' };

export function pullToRefreshReducer(
    state: PullToRefreshState,
    action: PullToRefreshAction
): PullToRefreshState {
    switch (action.type) {
        case 'SET_PULL_DISTANCE':
            return { ...state, displayPullDistance: action.payload };
        case 'START_REFRESHING':
            return { refreshing: true, displayPullDistance: 0 };
        case 'STOP_REFRESHING':
            return { ...state, refreshing: false };
        case 'RESET':
            return { refreshing: false, displayPullDistance: 0 };
        default:
            return state;
    }
}
