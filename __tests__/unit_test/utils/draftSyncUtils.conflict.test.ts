import { describe, it, expect, vi } from 'vitest';
import {
    detectStepConflict,
    forceApplyStepFields,
    isFieldLocallyEdited,
    syncRemoteDraftToForm,
} from '@/app/utils/draftSyncUtils';
import { STEPS } from '@/app/utils/constants';

describe('draftSyncUtils - Conflict Detection & Resolution', () => {
    describe('detectStepConflict', () => {
        const mockGetValues =
            (values: Record<string, unknown>) => (key: string) =>
                values[key];

        it('detects a conflict when remote modifies an active step with local edits by another user', () => {
            const prevDraft = {
                draftId: 'draft-123',
                title: 'Original Recipe Title',
                description: 'Original Description',
            };

            const remoteDraft = {
                draftId: 'draft-123',
                title: 'Remote Co-Cook Title',
                description: 'Original Description',
                lastModifiedBy: { id: 'user-cocook-2', name: 'Alice' },
            };

            // Local user has typed something different from prevDraft
            const getValues = mockGetValues({
                title: 'My Local Recipe Title',
                description: 'Original Description',
            });

            const conflict = detectStepConflict(
                STEPS.DESCRIPTION,
                remoteDraft,
                prevDraft,
                getValues,
                'user-local-1',
                null
            );

            expect(conflict.hasConflict).toBe(true);
            expect(conflict.stepIndex).toBe(STEPS.DESCRIPTION);
            expect(conflict.stepKey).toBe('description');
            expect(conflict.authorName).toBe('Alice');
        });

        it('does not flag conflict if remote changes were made by the current user', () => {
            const prevDraft = {
                draftId: 'draft-123',
                title: 'Original Title',
            };

            const remoteDraft = {
                draftId: 'draft-123',
                title: 'My Own Remote Saved Title',
                lastModifiedBy: { id: 'user-local-1' },
            };

            const getValues = mockGetValues({
                title: 'My Own Typing',
            });

            const conflict = detectStepConflict(
                STEPS.DESCRIPTION,
                remoteDraft,
                prevDraft,
                getValues,
                'user-local-1',
                null
            );

            expect(conflict.hasConflict).toBe(false);
        });

        it('does not flag conflict if the active step is locked by another user (soft-lock takes precedence)', () => {
            const prevDraft = {
                draftId: 'draft-123',
                title: 'Original Title',
            };

            const remoteDraft = {
                draftId: 'draft-123',
                title: 'Remote Title',
                lastModifiedBy: { id: 'user-cocook-2' },
            };

            const getValues = mockGetValues({
                title: 'Local Typing',
            });

            const mockLock = {
                isLockedByOther: vi.fn((key: string) => key === 'step:1'),
            };

            const conflict = detectStepConflict(
                STEPS.DESCRIPTION,
                remoteDraft,
                prevDraft,
                getValues,
                'user-local-1',
                mockLock
            );

            expect(conflict.hasConflict).toBe(false);
        });

        it('does not flag conflict if user has not locally edited the field', () => {
            const prevDraft = {
                draftId: 'draft-123',
                title: 'Original Title',
                description: 'Original Description',
            };

            const remoteDraft = {
                draftId: 'draft-123',
                title: 'Remote Title',
                description: 'Original Description',
                lastModifiedBy: { id: 'user-cocook-2' },
            };

            // Local form matches prevDraft exactly (unmodified)
            const getValues = mockGetValues({
                title: 'Original Title',
                description: 'Original Description',
            });

            const conflict = detectStepConflict(
                STEPS.DESCRIPTION,
                remoteDraft,
                prevDraft,
                getValues,
                'user-local-1',
                null
            );

            expect(conflict.hasConflict).toBe(false);
        });

        it('does not flag conflict if remote draft values on active step are identical to prevDraft', () => {
            const prevDraft = {
                draftId: 'draft-123',
                title: 'Original Title',
                description: 'Original Description',
                categories: ['Dessert'],
            };

            // Remote draft changed fields on ANOTHER step (categories on step 0)
            const remoteDraft = {
                draftId: 'draft-123',
                title: 'Original Title',
                description: 'Original Description',
                categories: ['Vegan'],
                lastModifiedBy: { id: 'user-cocook-2' },
            };

            const getValues = mockGetValues({
                title: 'Local Modified Title',
                description: 'Original Description',
            });

            // On Step 1 (Description), remote title & description are unchanged
            const conflict = detectStepConflict(
                STEPS.DESCRIPTION,
                remoteDraft,
                prevDraft,
                getValues,
                'user-local-1',
                null
            );

            expect(conflict.hasConflict).toBe(false);
        });
    });

    describe('forceApplyStepFields', () => {
        it('forces setValue on all fields of the specified step from remote draft', () => {
            const remoteDraft = {
                title: 'Authoritative Remote Title',
                description: 'Authoritative Remote Description',
                minutes: 60,
                prepTime: 20,
                cookTime: 40,
            };

            const setValue = vi.fn();

            forceApplyStepFields(STEPS.DESCRIPTION, remoteDraft, setValue);

            expect(setValue).toHaveBeenCalledWith(
                'title',
                'Authoritative Remote Title',
                expect.objectContaining({ shouldDirty: false })
            );
            expect(setValue).toHaveBeenCalledWith(
                'description',
                'Authoritative Remote Description',
                expect.objectContaining({ shouldDirty: false })
            );
            expect(setValue).toHaveBeenCalledWith(
                'minutes',
                60,
                expect.objectContaining({ shouldDirty: false })
            );
            expect(setValue).toHaveBeenCalledWith(
                'prepTime',
                20,
                expect.objectContaining({ shouldDirty: false })
            );
            expect(setValue).toHaveBeenCalledWith(
                'cookTime',
                40,
                expect.objectContaining({ shouldDirty: false })
            );
        });

        it('forces setValue on ingredients step', () => {
            const remoteDraft = {
                ingredients: ['2 cups flour', '1 cup sugar'],
            };

            const setValue = vi.fn();

            forceApplyStepFields(STEPS.INGREDIENTS, remoteDraft, setValue);

            expect(setValue).toHaveBeenCalledWith(
                'ingredients',
                ['2 cups flour', '1 cup sugar'],
                expect.objectContaining({ shouldDirty: false })
            );
        });
    });

    describe('isFieldLocallyEdited - Default Value & False-Positive Prevention', () => {
        it('does not consider default minutes (30) as locally edited when remote draft had no minutes set', () => {
            expect(isFieldLocallyEdited(30, undefined, 'minutes')).toBe(false);
            expect(isFieldLocallyEdited(30, null, 'minutes')).toBe(false);
            expect(isFieldLocallyEdited(30, '', 'minutes')).toBe(false);
            expect(isFieldLocallyEdited('30', undefined, 'minutes')).toBe(
                false
            );
        });

        it('considers non-default minutes as locally edited when remote had no value', () => {
            expect(isFieldLocallyEdited(45, undefined, 'minutes')).toBe(true);
            expect(isFieldLocallyEdited(15, null, 'minutes')).toBe(true);
        });

        it('considers default minutes as locally edited if previous draft had an explicit different value', () => {
            expect(isFieldLocallyEdited(30, 45, 'minutes')).toBe(true);
        });

        it('correctly checks string and array fields', () => {
            expect(isFieldLocallyEdited('', undefined, 'title')).toBe(false);
            expect(isFieldLocallyEdited('Cake', undefined, 'title')).toBe(true);
            expect(isFieldLocallyEdited([], undefined, 'categories')).toBe(
                false
            );
            expect(
                isFieldLocallyEdited(['Dessert'], ['Dessert'], 'categories')
            ).toBe(false);
            expect(
                isFieldLocallyEdited(['Dessert'], ['Vegan'], 'categories')
            ).toBe(true);
        });
    });

    describe('syncRemoteDraftToForm - Safe Auto-Apply & Keystroke Protection', () => {
        it('auto-applies untouched remote fields directly into the form on the active step', () => {
            const remoteDraft = {
                draftId: 'draft-123',
                title: 'Remote Updated Title',
                description: 'Remote Description',
                minutes: 45,
            };
            const prevDraft = {
                draftId: 'draft-123',
                title: 'Original Title',
                description: 'Original Description',
                minutes: 30,
            };

            // Local user hasn't edited anything on description step (matches prevDraft)
            const localValues: Record<string, unknown> = {
                title: 'Original Title',
                description: 'Original Description',
                minutes: 30,
            };
            const getValues = (key: string) => localValues[key];
            const setValue = vi.fn();

            syncRemoteDraftToForm(
                remoteDraft,
                prevDraft,
                STEPS.DESCRIPTION,
                null,
                getValues,
                setValue
            );

            expect(setValue).toHaveBeenCalledWith(
                'title',
                'Remote Updated Title',
                expect.objectContaining({ shouldDirty: false })
            );
            expect(setValue).toHaveBeenCalledWith(
                'minutes',
                45,
                expect.objectContaining({ shouldDirty: false })
            );
        });

        it('protects dirty fields on the active step from being overwritten while auto-applying untouched fields', () => {
            const remoteDraft = {
                draftId: 'draft-123',
                title: 'Bob New Title',
                description: 'Bob Updated Description',
                cookTime: 50,
            };
            const prevDraft = {
                draftId: 'draft-123',
                title: 'Original Title',
                description: 'Original Description',
                cookTime: 20,
            };

            // Local user has actively typed a new title, but did NOT touch description or cookTime
            const localValues: Record<string, unknown> = {
                title: 'Alice Typing In Progress...', // Locally modified!
                description: 'Original Description', // Untouched
                cookTime: 20, // Untouched
            };
            const getValues = (key: string) => localValues[key];
            const setValue = vi.fn();

            syncRemoteDraftToForm(
                remoteDraft,
                prevDraft,
                STEPS.DESCRIPTION,
                null,
                getValues,
                setValue
            );

            // Alice's active typing on 'title' must NEVER be overwritten!
            expect(setValue).not.toHaveBeenCalledWith(
                'title',
                expect.anything(),
                expect.anything()
            );

            // Untouched fields ('description' and 'cookTime') must be auto-applied!
            expect(setValue).toHaveBeenCalledWith(
                'description',
                'Bob Updated Description',
                expect.objectContaining({ shouldDirty: false })
            );
            expect(setValue).toHaveBeenCalledWith(
                'cookTime',
                50,
                expect.objectContaining({ shouldDirty: false })
            );
        });

        it('always auto-applies remote updates on inactive steps even if fields differ', () => {
            const remoteDraft = {
                draftId: 'draft-123',
                title: 'Updated Title on Step 1',
                categories: ['Vegetarian'],
            };
            const prevDraft = {
                draftId: 'draft-123',
                title: 'Old Title',
                categories: ['Meat'],
            };

            // Current user is on Step 2 (Ingredients), so Step 1 (Description) and Step 0 (Category) are inactive
            const localValues: Record<string, unknown> = {
                title: 'Old Title',
                categories: ['Meat'],
            };
            const getValues = (key: string) => localValues[key];
            const setValue = vi.fn();

            syncRemoteDraftToForm(
                remoteDraft,
                prevDraft,
                STEPS.INGREDIENTS, // Active step is 2
                null,
                getValues,
                setValue
            );

            expect(setValue).toHaveBeenCalledWith(
                'title',
                'Updated Title on Step 1',
                expect.objectContaining({ shouldDirty: false })
            );
            expect(setValue).toHaveBeenCalledWith(
                'categories',
                ['Vegetarian'],
                expect.objectContaining({ shouldDirty: false })
            );
        });
    });
});
