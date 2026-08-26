import { describe, it, expect } from 'vitest';
import {
    commentBoxReducer,
    DEFAULT_COMMENT_BOX_STATE,
    CommentBoxState,
    CommentBoxAction,
} from '@/app/hooks/commentBoxReducer';

const initialState: CommentBoxState = {
    ...DEFAULT_COMMENT_BOX_STATE,
};

describe('commentBoxReducer', () => {
    describe('SET_COMMENT', () => {
        it('updates comment text', () => {
            const result = commentBoxReducer(initialState, {
                type: 'SET_COMMENT',
                payload: 'Delicious meal!',
            });
            expect(result.comment).toBe('Delicious meal!');
        });

        it('preserves other state fields', () => {
            const modified: CommentBoxState = {
                ...initialState,
                rating: 5,
                isCooked: true,
            };
            const result = commentBoxReducer(modified, {
                type: 'SET_COMMENT',
                payload: 'Updated comment',
            });
            expect(result.comment).toBe('Updated comment');
            expect(result.rating).toBe(5);
            expect(result.isCooked).toBe(true);
        });
    });

    describe('SET_RATING', () => {
        it('sets rating to a numeric value', () => {
            const result = commentBoxReducer(initialState, {
                type: 'SET_RATING',
                payload: 4,
            });
            expect(result.rating).toBe(4);
        });

        it('sets rating to null', () => {
            const stateWithRating: CommentBoxState = {
                ...initialState,
                rating: 3,
            };
            const result = commentBoxReducer(stateWithRating, {
                type: 'SET_RATING',
                payload: null,
            });
            expect(result.rating).toBeNull();
        });
    });

    describe('TOGGLE_RATING', () => {
        it('toggles showRating from false to true', () => {
            const result = commentBoxReducer(initialState, {
                type: 'TOGGLE_RATING',
            });
            expect(result.showRating).toBe(true);
        });

        it('toggles showRating from true to false', () => {
            const state: CommentBoxState = {
                ...initialState,
                showRating: true,
            };
            const result = commentBoxReducer(state, {
                type: 'TOGGLE_RATING',
            });
            expect(result.showRating).toBe(false);
        });
    });

    describe('CLEAR_RATING', () => {
        it('resets rating to null and showRating to false', () => {
            const stateWithRating: CommentBoxState = {
                ...initialState,
                rating: 5,
                showRating: true,
            };
            const result = commentBoxReducer(stateWithRating, {
                type: 'CLEAR_RATING',
            });
            expect(result.rating).toBeNull();
            expect(result.showRating).toBe(false);
        });
    });

    describe('SET_COOKED', () => {
        it('updates isCooked flag', () => {
            const result = commentBoxReducer(initialState, {
                type: 'SET_COOKED',
                payload: true,
            });
            expect(result.isCooked).toBe(true);

            const turnedOff = commentBoxReducer(result, {
                type: 'SET_COOKED',
                payload: false,
            });
            expect(turnedOff.isCooked).toBe(false);
        });
    });

    describe('SELECT_FILE', () => {
        it('sets selectedFile, previewUrl, and automatically sets isCooked to true', () => {
            const file = new File(['fake data'], 'cooked-dish.png', {
                type: 'image/png',
            });
            const result = commentBoxReducer(initialState, {
                type: 'SELECT_FILE',
                payload: {
                    file,
                    previewUrl: 'blob:http://localhost/dish-preview',
                },
            });
            expect(result.selectedFile).toBe(file);
            expect(result.previewUrl).toBe(
                'blob:http://localhost/dish-preview'
            );
            expect(result.isCooked).toBe(true);
        });
    });

    describe('REMOVE_FILE', () => {
        it('clears selectedFile and previewUrl', () => {
            const file = new File(['fake data'], 'dish.png', {
                type: 'image/png',
            });
            const stateWithFile: CommentBoxState = {
                ...initialState,
                selectedFile: file,
                previewUrl: 'blob:http://localhost/dish-preview',
                isCooked: true,
            };
            const result = commentBoxReducer(stateWithFile, {
                type: 'REMOVE_FILE',
            });
            expect(result.selectedFile).toBeNull();
            expect(result.previewUrl).toBeNull();
            // isCooked is preserved
            expect(result.isCooked).toBe(true);
        });
    });

    describe('SET_UPLOADING', () => {
        it('updates isUploading flag', () => {
            const uploading = commentBoxReducer(initialState, {
                type: 'SET_UPLOADING',
                payload: true,
            });
            expect(uploading.isUploading).toBe(true);

            const doneUploading = commentBoxReducer(uploading, {
                type: 'SET_UPLOADING',
                payload: false,
            });
            expect(doneUploading.isUploading).toBe(false);
        });
    });

    describe('SET_BUTTON_DISABLED', () => {
        it('updates isButtonDisabled flag', () => {
            const disabled = commentBoxReducer(initialState, {
                type: 'SET_BUTTON_DISABLED',
                payload: true,
            });
            expect(disabled.isButtonDisabled).toBe(true);

            const enabled = commentBoxReducer(disabled, {
                type: 'SET_BUTTON_DISABLED',
                payload: false,
            });
            expect(enabled.isButtonDisabled).toBe(false);
        });
    });

    describe('RESET', () => {
        it('resets state back to DEFAULT_COMMENT_BOX_STATE', () => {
            const file = new File(['fake data'], 'test.png', {
                type: 'image/png',
            });
            const modifiedState: CommentBoxState = {
                comment: 'Great recipe!',
                rating: 5,
                showRating: true,
                isCooked: true,
                selectedFile: file,
                previewUrl: 'blob:http://localhost/test',
                isUploading: true,
                isButtonDisabled: true,
            };
            const result = commentBoxReducer(modifiedState, {
                type: 'RESET',
            });
            expect(result).toEqual(DEFAULT_COMMENT_BOX_STATE);
        });
    });

    describe('unknown action', () => {
        it('returns current state unchanged for unrecognized action', () => {
            const result = commentBoxReducer(initialState, {
                type: 'UNKNOWN',
            } as unknown as CommentBoxAction);
            expect(result).toBe(initialState);
        });
    });
});
