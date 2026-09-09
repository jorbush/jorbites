import { describe, it, expect, vi } from 'vitest';
import {
    detectStepConflict,
    forceApplyStepFields,
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
});
