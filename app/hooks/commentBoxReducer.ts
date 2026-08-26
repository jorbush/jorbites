export interface CommentBoxState {
    comment: string;
    rating: number | null;
    showRating: boolean;
    isCooked: boolean;
    selectedFile: File | null;
    previewUrl: string | null;
    isUploading: boolean;
    isButtonDisabled: boolean;
}

export type CommentBoxAction =
    | { type: 'SET_COMMENT'; payload: string }
    | { type: 'SET_RATING'; payload: number | null }
    | { type: 'TOGGLE_RATING' }
    | { type: 'CLEAR_RATING' }
    | { type: 'SET_COOKED'; payload: boolean }
    | { type: 'SELECT_FILE'; payload: { file: File; previewUrl: string } }
    | { type: 'REMOVE_FILE' }
    | { type: 'SET_UPLOADING'; payload: boolean }
    | { type: 'SET_BUTTON_DISABLED'; payload: boolean }
    | { type: 'RESET' };

export const DEFAULT_COMMENT_BOX_STATE: CommentBoxState = {
    comment: '',
    rating: null,
    showRating: false,
    isCooked: false,
    selectedFile: null,
    previewUrl: null,
    isUploading: false,
    isButtonDisabled: false,
};

export const initialCommentBoxState: CommentBoxState =
    DEFAULT_COMMENT_BOX_STATE;

export function commentBoxReducer(
    state: CommentBoxState,
    action: CommentBoxAction
): CommentBoxState {
    switch (action.type) {
        case 'SET_COMMENT':
            return { ...state, comment: action.payload };
        case 'SET_RATING':
            return { ...state, rating: action.payload };
        case 'TOGGLE_RATING':
            return { ...state, showRating: !state.showRating };
        case 'CLEAR_RATING':
            return { ...state, rating: null, showRating: false };
        case 'SET_COOKED':
            return { ...state, isCooked: action.payload };
        case 'SELECT_FILE':
            return {
                ...state,
                selectedFile: action.payload.file,
                previewUrl: action.payload.previewUrl,
                isCooked: true,
            };
        case 'REMOVE_FILE':
            return {
                ...state,
                selectedFile: null,
                previewUrl: null,
            };
        case 'SET_UPLOADING':
            return { ...state, isUploading: action.payload };
        case 'SET_BUTTON_DISABLED':
            return { ...state, isButtonDisabled: action.payload };
        case 'RESET':
            return { ...DEFAULT_COMMENT_BOX_STATE };
        default:
            return state;
    }
}
