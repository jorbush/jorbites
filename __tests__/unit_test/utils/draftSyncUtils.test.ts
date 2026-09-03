import { describe, it, expect, vi } from 'vitest';
import {
    valuesEqual,
    isFieldLocallyEdited,
    shouldApplyStep,
    isIngredientsLocallyEdited,
    isStepsLocallyEdited,
    syncRemoteDraftToForm,
} from '@/app/utils/draftSyncUtils';
import { STEPS } from '@/app/utils/constants';

describe('draftSyncUtils', () => {
    describe('valuesEqual', () => {
        it('correctly compares primitive values', () => {
            expect(valuesEqual('hello', 'hello')).toBe(true);
            expect(valuesEqual('hello', 'world')).toBe(false);
            expect(valuesEqual(123, 123)).toBe(true);
            expect(valuesEqual(123, 456)).toBe(false);
            expect(valuesEqual(true, true)).toBe(true);
            expect(valuesEqual(true, false)).toBe(false);
            expect(valuesEqual(null, null)).toBe(true);
            expect(valuesEqual(undefined, undefined)).toBe(true);
            expect(valuesEqual(null, undefined)).toBe(false);
        });

        it('correctly compares arrays', () => {
            expect(valuesEqual(['a', 'b'], ['a', 'b'])).toBe(true);
            expect(valuesEqual(['a', 'b'], ['b', 'a'])).toBe(false);
            expect(valuesEqual(['a'], ['a', 'b'])).toBe(false);
            expect(valuesEqual([], [])).toBe(true);
            expect(valuesEqual([], ['a'])).toBe(false);
        });
    });

    describe('isFieldLocallyEdited', () => {
        it('returns false when both current value and previous value are empty', () => {
            expect(isFieldLocallyEdited('', '')).toBe(false);
            expect(isFieldLocallyEdited(null, null)).toBe(false);
            expect(isFieldLocallyEdited(undefined, undefined)).toBe(false);
            expect(isFieldLocallyEdited([], [])).toBe(false);
            expect(isFieldLocallyEdited('', null)).toBe(false);
            expect(isFieldLocallyEdited([], null)).toBe(false);
        });

        it('returns true when user intentionally clears a field that had previous content (H4 ghost write prevention)', () => {
            expect(isFieldLocallyEdited('', 'previous')).toBe(true);
            expect(isFieldLocallyEdited([], ['item'])).toBe(true);
        });

        it('returns false when current value equals previous value', () => {
            expect(isFieldLocallyEdited('same', 'same')).toBe(false);
            expect(isFieldLocallyEdited(['egg', 'milk'], ['egg', 'milk'])).toBe(
                false
            );
        });

        it('returns true when current value differs from previous value', () => {
            expect(isFieldLocallyEdited('changed', 'original')).toBe(true);
            expect(
                isFieldLocallyEdited(['egg', 'milk', 'sugar'], ['egg', 'milk'])
            ).toBe(true);
        });
    });

    describe('shouldApplyStep', () => {
        const mockGetValues =
            (values: Record<string, unknown>) => (key: string) =>
                values[key];

        it('returns true if the user is on a different step', () => {
            const getValues = mockGetValues({ title: 'My Local Title' });
            const prevDraft = { title: 'Old Remote Title' };
            const result = shouldApplyStep(
                STEPS.DESCRIPTION,
                STEPS.INGREDIENTS,
                ['title', 'description'],
                getValues,
                prevDraft
            );
            expect(result).toBe(true);
        });

        it('returns true if the active step is locked by another user', () => {
            const getValues = mockGetValues({ title: 'My Local Title' });
            const prevDraft = { title: 'Old Remote Title' };
            const mockLock = {
                isLockedByOther: vi.fn((key: string) => key === 'step:1'),
            };

            const result = shouldApplyStep(
                STEPS.DESCRIPTION,
                STEPS.DESCRIPTION,
                ['title', 'description'],
                getValues,
                prevDraft,
                mockLock
            );
            expect(result).toBe(true);
        });

        it('returns true on active step if none of the fields were locally edited', () => {
            const getValues = mockGetValues({
                title: 'Original Title',
                description: 'Original Desc',
            });
            const prevDraft = {
                title: 'Original Title',
                description: 'Original Desc',
            };

            const result = shouldApplyStep(
                STEPS.DESCRIPTION,
                STEPS.DESCRIPTION,
                ['title', 'description'],
                getValues,
                prevDraft
            );
            expect(result).toBe(true);
        });

        it('returns false on active step if any field was locally edited', () => {
            const getValues = mockGetValues({
                title: 'Edited Title Locally',
                description: 'Original Desc',
            });
            const prevDraft = {
                title: 'Original Title',
                description: 'Original Desc',
            };

            const result = shouldApplyStep(
                STEPS.DESCRIPTION,
                STEPS.DESCRIPTION,
                ['title', 'description'],
                getValues,
                prevDraft
            );
            expect(result).toBe(false);
        });
    });

    describe('isIngredientsLocallyEdited', () => {
        it('returns false if user is on a different step', () => {
            const getValues = () => 'edited';
            expect(
                isIngredientsLocallyEdited(STEPS.DESCRIPTION, getValues, {
                    ingredients: ['old'],
                })
            ).toBe(false);
        });

        it('returns false if step is locked by another co-cook', () => {
            const getValues = () => 'edited';
            const mockLock = {
                isLockedByOther: vi.fn((key) => key === 'step:2'),
            };
            expect(
                isIngredientsLocallyEdited(
                    STEPS.INGREDIENTS,
                    getValues,
                    { ingredients: ['old'] },
                    mockLock
                )
            ).toBe(false);
        });

        it('returns false if ingredients array and slots match previous draft', () => {
            const getValues = (key: string) => {
                if (key === 'ingredients') return ['Flour', 'Sugar'];
                if (key === 'ingredient-0') return 'Flour';
                if (key === 'ingredient-1') return 'Sugar';
                return '';
            };
            expect(
                isIngredientsLocallyEdited(STEPS.INGREDIENTS, getValues, {
                    ingredients: ['Flour', 'Sugar'],
                })
            ).toBe(false);
        });

        it('returns true if an individual ingredient slot was modified', () => {
            const getValues = (key: string) => {
                if (key === 'ingredient-0') return 'Flour Edited';
                if (key === 'ingredient-1') return 'Sugar';
                return '';
            };
            expect(
                isIngredientsLocallyEdited(STEPS.INGREDIENTS, getValues, {
                    ingredients: ['Flour', 'Sugar'],
                })
            ).toBe(true);
        });
    });

    describe('isStepsLocallyEdited', () => {
        it('returns false if user is on a different step', () => {
            const getValues = () => 'edited';
            expect(
                isStepsLocallyEdited(STEPS.INGREDIENTS, getValues, {
                    steps: ['old'],
                })
            ).toBe(false);
        });

        it('returns false if step is locked by another co-cook', () => {
            const getValues = () => 'edited';
            const mockLock = {
                isLockedByOther: vi.fn((key) => key === 'step:4'),
            };
            expect(
                isStepsLocallyEdited(
                    STEPS.STEPS,
                    getValues,
                    { steps: ['old'] },
                    mockLock
                )
            ).toBe(false);
        });

        it('returns true if an individual step slot was modified', () => {
            const getValues = (key: string) => {
                if (key === 'step-0') return 'Whisk eggs thoroughly';
                return '';
            };
            expect(
                isStepsLocallyEdited(STEPS.STEPS, getValues, {
                    steps: ['Whisk eggs'],
                })
            ).toBe(true);
        });
    });

    describe('syncRemoteDraftToForm', () => {
        it('synchronizes remote fields for inactive steps and sets validation/dirty flags', () => {
            const incomingDraft = {
                title: 'Remote Pasta',
                description: 'Remote Description',
                categories: ['Pasta'],
                method: 'Boil',
                ingredients: ['Pasta', 'Salt', 'Water'],
                steps: ['Boil water', 'Cook pasta'],
                coCooksIds: ['cook-1'],
                draftId: 'd-123',
                inviteToken: 'tok-123',
            };

            const formState: Record<string, unknown> = {
                title: 'Local Pasta',
                description: 'Local Description',
                categories: [],
                method: '',
                ingredients: [],
                steps: [],
                coCooksIds: [],
                draftId: '',
                inviteToken: '',
            };

            const getValues = (key: string) => formState[key];
            const setValue = vi.fn((key: string, val: unknown) => {
                formState[key] = val;
            });

            // Active step is Category (Step 0), so Description, Ingredients, Steps, Methods should sync
            syncRemoteDraftToForm(
                incomingDraft,
                null,
                STEPS.CATEGORY,
                null,
                getValues,
                setValue
            );

            expect(setValue).toHaveBeenCalledWith(
                'title',
                'Remote Pasta',
                expect.objectContaining({
                    shouldDirty: false,
                    shouldTouch: false,
                })
            );
            expect(setValue).toHaveBeenCalledWith(
                'method',
                'Boil',
                expect.objectContaining({
                    shouldDirty: false,
                    shouldTouch: false,
                })
            );
            expect(setValue).toHaveBeenCalledWith(
                'ingredient-0',
                'Pasta',
                expect.objectContaining({
                    shouldDirty: false,
                    shouldTouch: false,
                })
            );
            expect(setValue).toHaveBeenCalledWith(
                'ingredient-1',
                'Salt',
                expect.objectContaining({
                    shouldDirty: false,
                    shouldTouch: false,
                })
            );
            expect(setValue).toHaveBeenCalledWith(
                'step-0',
                'Boil water',
                expect.objectContaining({
                    shouldDirty: false,
                    shouldTouch: false,
                })
            );
            expect(setValue).toHaveBeenCalledWith(
                'draftId',
                'd-123',
                expect.anything()
            );
        });

        it('does not overwrite active step inputs when modified locally', () => {
            const prevDraft = {
                title: 'Initial Title',
            };

            const incomingDraft = {
                title: 'Remote Updated Title',
                description: 'Remote Updated Description',
            };

            const formState: Record<string, unknown> = {
                title: 'User Local Typing', // Diverged from Initial Title
                description: 'Initial Description',
            };

            const getValues = (key: string) => formState[key];
            const setValue = vi.fn((key: string, val: unknown) => {
                formState[key] = val;
            });

            // User is actively on Step 1 (Description)
            syncRemoteDraftToForm(
                incomingDraft,
                prevDraft,
                STEPS.DESCRIPTION,
                null,
                getValues,
                setValue
            );

            // title should NOT be overwritten because it was locally edited
            expect(setValue).not.toHaveBeenCalledWith(
                'title',
                'Remote Updated Title',
                expect.anything()
            );
        });

        it('applies remote updates to active step when that step is locked by another co-cook', () => {
            const incomingDraft = {
                title: 'Collaborator Remote Title',
                description: 'Collaborator Remote Description',
            };
            const formState: Record<string, unknown> = {
                title: 'Stale Local Title',
                description: 'Stale Local Description',
            };

            const getValues = (key: string) => formState[key];
            const setValue = vi.fn((key: string, val: unknown) => {
                formState[key] = val;
            });
            const mockLock = {
                isLockedByOther: vi.fn((key: string) => key === 'step:1'),
            };

            syncRemoteDraftToForm(
                incomingDraft,
                null,
                STEPS.DESCRIPTION,
                mockLock,
                getValues,
                setValue
            );

            expect(setValue).toHaveBeenCalledWith(
                'title',
                'Collaborator Remote Title',
                expect.objectContaining({
                    shouldDirty: false,
                    shouldTouch: false,
                })
            );
        });
    });
});
