import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useDraftPersistence } from '@/app/hooks/useDraftPersistence';
import { STEPS } from '@/app/utils/constants';

vi.mock('axios');
vi.mock('react-hot-toast');
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));
vi.mock('swr', () => ({
    mutate: vi.fn(),
}));

describe('useDraftPersistence hook', () => {
    const mockOnOpenSharedDraft = vi.fn();
    const mockMutateDraft = vi.fn();
    const recipeModal = {
        activeDraftId: undefined,
        onOpenSharedDraft: mockOnOpenSharedDraft,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('saves draft successfully and updates form and active draft state', async () => {
        const mockedAxios = vi.mocked(axios);
        mockedAxios.post.mockResolvedValueOnce({
            data: { draftId: 'draft-abc', inviteToken: 'token-xyz' },
        });

        const formValues: Record<string, any> = {
            title: 'Test Soup',
            categories: ['soup'],
        };
        const form = {
            getValues: vi.fn((key: string) => formValues[key]),
            setValue: vi.fn((key: string, val: any) => {
                formValues[key] = val;
            }),
        };

        const { result } = renderHook(() =>
            useDraftPersistence({ recipeModal, mutateDraft: mockMutateDraft })
        );

        await act(async () => {
            await result.current.saveDraft(
                form,
                STEPS.DESCRIPTION,
                null,
                0,
                0,
                'list',
                'list'
            );
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            '/api/draft',
            expect.objectContaining({
                title: 'Test Soup',
                categories: ['soup'],
                currentStep: STEPS.DESCRIPTION,
            })
        );
        expect(form.setValue).toHaveBeenCalledWith('draftId', 'draft-abc');
        expect(form.setValue).toHaveBeenCalledWith('inviteToken', 'token-xyz');
        expect(mockOnOpenSharedDraft).toHaveBeenCalledWith('draft-abc');
        expect(mockMutateDraft).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('draft_saved');
    });

    it('handles save draft error gracefully', async () => {
        const mockedAxios = vi.mocked(axios);
        mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

        const form = {
            getValues: vi.fn(() => undefined),
            setValue: vi.fn(),
        };

        const { result } = renderHook(() =>
            useDraftPersistence({ recipeModal, mutateDraft: mockMutateDraft })
        );

        await act(async () => {
            await result.current.saveDraft(
                form,
                STEPS.CATEGORY,
                null,
                0,
                0,
                'list',
                'list'
            );
        });

        expect(toast.error).toHaveBeenCalledWith('error_saving_draft');
    });

    it('deletes draft and clears form identifiers', async () => {
        const mockedAxios = vi.mocked(axios);
        mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

        const form = {
            getValues: vi.fn((key: string) =>
                key === 'draftId' ? 'draft-to-delete' : undefined
            ),
            setValue: vi.fn(),
        };

        const { result } = renderHook(() =>
            useDraftPersistence({ recipeModal, mutateDraft: mockMutateDraft })
        );

        await act(async () => {
            await result.current.deleteDraft(form, null);
        });

        expect(mockedAxios.delete).toHaveBeenCalledWith(
            '/api/draft?draftId=draft-to-delete'
        );
        expect(form.setValue).toHaveBeenCalledWith('draftId', '');
        expect(form.setValue).toHaveBeenCalledWith('inviteToken', '');
        expect(mockMutateDraft).toHaveBeenCalled();
    });
});
