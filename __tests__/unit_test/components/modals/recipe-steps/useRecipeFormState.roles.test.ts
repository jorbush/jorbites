import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import axios from 'axios';
import { useRecipeFormState } from '@/app/components/modals/recipe-steps/useRecipeFormState';
import { SafeUser } from '@/app/types';

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('swr', () => ({
    default: () => ({ data: null, isLoading: false }),
    mutate: vi.fn(),
}));

vi.mock('axios', () => ({
    default: {
        get: vi.fn().mockResolvedValue({ data: {} }),
        post: vi.fn().mockResolvedValue({ data: {} }),
        delete: vi.fn().mockResolvedValue({ data: {} }),
    },
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/app/hooks/useRecipeLock', () => ({
    useRecipeLock: () => ({
        locks: {},
        acquire: vi.fn().mockResolvedValue(true),
        release: vi.fn().mockResolvedValue(undefined),
        isLockedByOther: vi.fn().mockReturnValue(false),
        getLockOwner: vi.fn().mockReturnValue(null),
        fetchLocks: vi.fn().mockResolvedValue(undefined),
    }),
}));

const mockRecipeModal = {
    isOpen: true,
    isEditMode: false,
    onClose: vi.fn(),
    onOpenSharedDraft: vi.fn(),
};

describe('useRecipeFormState - Role Permissions (Editor vs Viewer)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('derives isViewer = true when current user has viewer role in coCookRoles', () => {
        const currentUser: SafeUser = {
            id: 'user-viewer-1',
            name: 'Viewer Bob',
            email: 'bob@example.com',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
        };

        const draftData = {
            draftId: 'shared-draft-1',
            ownerId: 'user-owner-1',
            type: 'shared' as const,
            coCooksIds: ['user-viewer-1'],
            coCookRoles: {
                'user-viewer-1': 'viewer' as const,
            },
        };

        const { result } = renderHook(() =>
            useRecipeFormState({
                recipeModal: mockRecipeModal,
                currentUser,
                draftData,
            })
        );

        expect(result.current.isViewer).toBe(true);
    });

    it('guards saveDraft and returns early false when isViewer is true', async () => {
        const currentUser: SafeUser = {
            id: 'user-viewer-1',
            name: 'Viewer Bob',
            email: 'bob@example.com',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
        };

        const draftData = {
            draftId: 'shared-draft-1',
            ownerId: 'user-owner-1',
            type: 'shared' as const,
            coCooksIds: ['user-viewer-1'],
            coCookRoles: {
                'user-viewer-1': 'viewer' as const,
            },
        };

        const { result } = renderHook(() =>
            useRecipeFormState({
                recipeModal: mockRecipeModal,
                currentUser,
                draftData,
            })
        );

        let saved = true;
        await act(async () => {
            saved = await result.current.saveDraft();
        });

        expect(saved).toBe(false);
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('derives isViewer = false for draft owner even if in coCookRoles', () => {
        const currentUser: SafeUser = {
            id: 'user-owner-1',
            name: 'Owner Chef',
            email: 'owner@example.com',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
        };

        const draftData = {
            draftId: 'shared-draft-1',
            ownerId: 'user-owner-1',
            type: 'shared' as const,
            coCooksIds: ['user-viewer-1'],
            coCookRoles: {
                'user-owner-1': 'viewer' as const,
            },
        };

        const { result } = renderHook(() =>
            useRecipeFormState({
                recipeModal: mockRecipeModal,
                currentUser,
                draftData,
            })
        );

        expect(result.current.isViewer).toBe(false);
    });

    it('derives isViewer = false when current user has editor role', () => {
        const currentUser: SafeUser = {
            id: 'user-editor-1',
            name: 'Editor Alice',
            email: 'alice@example.com',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
        };

        const draftData = {
            draftId: 'shared-draft-1',
            ownerId: 'user-owner-1',
            type: 'shared' as const,
            coCooksIds: ['user-editor-1'],
            coCookRoles: {
                'user-editor-1': 'editor' as const,
            },
        };

        const { result } = renderHook(() =>
            useRecipeFormState({
                recipeModal: mockRecipeModal,
                currentUser,
                draftData,
            })
        );

        expect(result.current.isViewer).toBe(false);
    });
});
