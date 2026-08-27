import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import DraftsModal from '@/app/components/modals/DraftsModal';
import useDraftsModal from '@/app/hooks/useDraftsModal';
import useRecipeModal from '@/app/hooks/useRecipeModal';
import useSWR from 'swr';
import { SafeUser } from '@/app/types';

vi.mock('@/app/hooks/useDraftsModal');
vi.mock('@/app/hooks/useRecipeModal');
vi.mock('swr');

const mockCreateDraft = vi.fn();
const mockDeleteDraft = vi.fn();
const mockDuplicateDraft = vi.fn();
const mockShareDraft = vi.fn();

vi.mock('@/app/hooks/useDraftActions', () => ({
    useDraftActions: () => ({
        createDraft: mockCreateDraft,
        deleteDraft: mockDeleteDraft,
        duplicateDraft: mockDuplicateDraft,
        shareDraft: mockShareDraft,
        isLoading: false,
    }),
}));

const mockCurrentUser: SafeUser = {
    id: 'user-1',
    name: 'Chef Tester',
    email: 'test@example.com',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
};

describe('DraftsModal component', () => {
    const mockDraftsModal = {
        isOpen: true,
        onClose: vi.fn(),
        onOpen: vi.fn(),
    };

    const mockRecipeModal = {
        isOpen: false,
        onOpen: vi.fn(),
        onOpenSharedDraft: vi.fn(),
        onOpenCreate: vi.fn(),
        onClose: vi.fn(),
    };

    const mockMutate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useDraftsModal as any).mockReturnValue(mockDraftsModal);
        (useRecipeModal as any).mockReturnValue(mockRecipeModal);
    });

    it('renders empty state when there are no drafts', () => {
        (useSWR as any).mockReturnValue({
            data: [],
            isLoading: false,
            mutate: mockMutate,
        });

        render(<DraftsModal currentUser={mockCurrentUser} />);

        expect(
            screen.getByTestId('drafts-modal-empty-state')
        ).toBeInTheDocument();
        expect(screen.getByText('no_drafts_yet')).toBeInTheDocument();
        expect(screen.getByText('start_first_recipe')).toBeInTheDocument();
    });

    it('creates a new draft and opens recipe modal on empty state create button click', async () => {
        (useSWR as any).mockReturnValue({
            data: [],
            isLoading: false,
            mutate: mockMutate,
        });
        mockCreateDraft.mockResolvedValueOnce('new-draft-123');

        render(<DraftsModal currentUser={mockCurrentUser} />);

        const createBtn = screen.getByTestId('drafts-modal-empty-create-btn');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(mockCreateDraft).toHaveBeenCalledWith('solo');
            expect(mockDraftsModal.onClose).toHaveBeenCalled();
            expect(mockRecipeModal.onOpenSharedDraft).toHaveBeenCalledWith(
                'new-draft-123'
            );
        });
    });

    it('renders draft cards when drafts are available', () => {
        const mockDrafts = [
            {
                draftId: 'draft-1',
                type: 'solo',
                title: 'Paella Valenciana',
                categories: ['rice'],
                ingredients: ['Rice', 'Saffron'],
                steps: ['Cook'],
                ownerId: 'user-1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            },
            {
                draftId: 'draft-2',
                type: 'shared',
                title: 'Tacos Al Pastor',
                categories: ['mexican'],
                ingredients: ['Pork', 'Pineapple'],
                steps: ['Marinate'],
                ownerId: 'user-1',
                coCooksIds: ['user-2'],
                updatedAt: new Date().toISOString(),
            },
        ];

        (useSWR as any).mockReturnValue({
            data: mockDrafts,
            isLoading: false,
            mutate: mockMutate,
        });

        render(<DraftsModal currentUser={mockCurrentUser} />);

        const cards = screen.getAllByTestId('draft-card');
        expect(cards.length).toBe(2);
        expect(screen.getByText('Paella Valenciana')).toBeInTheDocument();
        expect(screen.getByText('Tacos Al Pastor')).toBeInTheDocument();
    });

    it('opens draft in recipe modal when a draft card is clicked', () => {
        const mockDrafts = [
            {
                draftId: 'draft-target',
                type: 'solo',
                title: 'Ramen',
                ownerId: 'user-1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            },
        ];

        (useSWR as any).mockReturnValue({
            data: mockDrafts,
            isLoading: false,
            mutate: mockMutate,
        });

        render(<DraftsModal currentUser={mockCurrentUser} />);

        fireEvent.click(screen.getByTestId('draft-card'));

        expect(mockDraftsModal.onClose).toHaveBeenCalled();
        expect(mockRecipeModal.onOpenSharedDraft).toHaveBeenCalledWith(
            'draft-target'
        );
    });

    it('shows confirmation dialog when delete button is clicked and deletes on confirm', async () => {
        const mockDrafts = [
            {
                draftId: 'draft-to-delete',
                type: 'solo',
                title: 'Delete Me',
                ownerId: 'user-1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            },
        ];

        (useSWR as any).mockReturnValue({
            data: mockDrafts,
            isLoading: false,
            mutate: mockMutate,
        });
        mockDeleteDraft.mockResolvedValueOnce(true);

        render(<DraftsModal currentUser={mockCurrentUser} />);

        // Click delete on card
        fireEvent.click(screen.getByTestId('draft-card-delete'));

        // Delete confirmation box appears
        expect(
            screen.getByTestId('draft-delete-confirmation')
        ).toBeInTheDocument();
        expect(screen.getByText('delete_draft_confirm')).toBeInTheDocument();

        // Confirm delete
        fireEvent.click(screen.getByText('delete_draft'));

        await waitFor(() => {
            expect(mockDeleteDraft).toHaveBeenCalledWith('draft-to-delete');
        });
    });

    it('cancels delete when cancel button is clicked in confirmation dialog', () => {
        const mockDrafts = [
            {
                draftId: 'draft-to-keep',
                type: 'solo',
                title: 'Keep Me',
                ownerId: 'user-1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            },
        ];

        (useSWR as any).mockReturnValue({
            data: mockDrafts,
            isLoading: false,
            mutate: mockMutate,
        });

        render(<DraftsModal currentUser={mockCurrentUser} />);

        // Click delete on card
        fireEvent.click(screen.getByTestId('draft-card-delete'));
        expect(
            screen.getByTestId('draft-delete-confirmation')
        ).toBeInTheDocument();

        // Click cancel
        fireEvent.click(screen.getByText('cancel'));

        expect(
            screen.queryByTestId('draft-delete-confirmation')
        ).not.toBeInTheDocument();
        expect(mockDeleteDraft).not.toHaveBeenCalled();
    });

    it('calls duplicateDraft when duplicate icon is clicked', async () => {
        const mockDrafts = [
            {
                draftId: 'draft-to-duplicate',
                type: 'solo',
                title: 'Duplicate Me',
                ownerId: 'user-1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            },
        ];

        (useSWR as any).mockReturnValue({
            data: mockDrafts,
            isLoading: false,
            mutate: mockMutate,
        });
        mockDuplicateDraft.mockResolvedValueOnce('new-cloned-id');

        render(<DraftsModal currentUser={mockCurrentUser} />);

        fireEvent.click(screen.getByTestId('draft-card-duplicate'));

        await waitFor(() => {
            expect(mockDuplicateDraft).toHaveBeenCalledWith(
                'draft-to-duplicate'
            );
        });
    });

    it('calls shareDraft when share icon is clicked', async () => {
        const mockDrafts = [
            {
                draftId: 'draft-to-share',
                type: 'solo',
                title: 'Share Me',
                ownerId: 'user-1',
                coCooksIds: [],
                updatedAt: new Date().toISOString(),
            },
        ];

        (useSWR as any).mockReturnValue({
            data: mockDrafts,
            isLoading: false,
            mutate: mockMutate,
        });
        mockShareDraft.mockResolvedValueOnce(
            'http://localhost:3000/?draft=draft-to-share&token=123'
        );

        render(<DraftsModal currentUser={mockCurrentUser} />);

        fireEvent.click(screen.getByTestId('draft-card-share'));

        await waitFor(() => {
            expect(mockShareDraft).toHaveBeenCalledWith('draft-to-share');
        });
    });
});
