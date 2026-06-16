import { SafePlanning } from '@/app/types';

export interface PlanningsState {
    my: SafePlanning[];
    community: SafePlanning[];
    saved: SafePlanning[];
}

export type PlanningsAction =
    | {
          type: 'SYNC';
          payload: {
              my: SafePlanning[];
              community: SafePlanning[];
              saved: SafePlanning[];
          };
      }
    | { type: 'UNSAVE'; payload: string }
    | { type: 'DELETE'; payload: string };

export function planningsReducer(
    state: PlanningsState,
    action: PlanningsAction
): PlanningsState {
    switch (action.type) {
        case 'SYNC':
            return action.payload;
        case 'UNSAVE':
            return {
                ...state,
                saved: state.saved.filter((p) => p.id !== action.payload),
            };
        case 'DELETE':
            return {
                ...state,
                my: state.my.filter((p) => p.id !== action.payload),
                community: state.community.filter(
                    (p) => p.id !== action.payload
                ),
            };
        default:
            return state;
    }
}
