import { create } from 'zustand';
import type { EditRecipeData } from '@/app/types';

export type { EditRecipeData };

export interface RecipeModalStore {
    isOpen: boolean;
    isEditMode: boolean;
    editRecipeData: EditRecipeData | null;
    forkRecipeData: Partial<EditRecipeData> | null;
    forkedFromRecipeId: string | null;
    questId: string | null;
    activeDraftId: string | null;
    onCloseCallback?: (() => void) | null;
    onOpen: (onCloseCallback?: () => void) => void;
    onOpenCreate: (questId?: string, onCloseCallback?: () => void) => void;
    onOpenFork: (
        forkData: Partial<EditRecipeData>,
        forkedFromRecipeId: string,
        onCloseCallback?: () => void
    ) => void;
    onOpenDraft: (draftId: string, onCloseCallback?: () => void) => void;
    onOpenSharedDraft: (draftId: string, onCloseCallback?: () => void) => void;
    onOpenEdit: (
        recipeData: EditRecipeData,
        onCloseCallback?: () => void
    ) => void;
    onClose: () => void;
}

const useRecipeModal = create<RecipeModalStore>((set, get) => ({
    isOpen: false,
    isEditMode: false,
    editRecipeData: null,
    forkRecipeData: null,
    forkedFromRecipeId: null,
    questId: null,
    activeDraftId: null,
    onCloseCallback: null,
    onOpen: (onCloseCallback) =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            forkRecipeData: null,
            forkedFromRecipeId: null,
            questId: null,
            activeDraftId: null,
            onCloseCallback: onCloseCallback || null,
        }),
    onOpenCreate: (questId?: string, onCloseCallback?: () => void) =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            forkRecipeData: null,
            forkedFromRecipeId: null,
            questId: questId || null,
            activeDraftId: null,
            onCloseCallback: onCloseCallback || null,
        }),
    onOpenFork: (
        forkData: Partial<EditRecipeData>,
        forkedFromRecipeId: string,
        onCloseCallback?: () => void
    ) =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            forkRecipeData: forkData,
            forkedFromRecipeId: forkedFromRecipeId,
            questId: forkData.questId || null,
            activeDraftId: null,
            onCloseCallback: onCloseCallback || null,
        }),
    onOpenDraft: (draftId: string, onCloseCallback?: () => void) =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            forkRecipeData: null,
            forkedFromRecipeId: null,
            questId: null,
            activeDraftId: draftId,
            onCloseCallback: onCloseCallback || null,
        }),
    onOpenSharedDraft: (draftId: string, onCloseCallback?: () => void) =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            forkRecipeData: null,
            forkedFromRecipeId: null,
            questId: null,
            activeDraftId: draftId,
            onCloseCallback: onCloseCallback || null,
        }),
    onOpenEdit: (recipeData: EditRecipeData, onCloseCallback?: () => void) =>
        set({
            isOpen: true,
            isEditMode: true,
            editRecipeData: recipeData,
            forkRecipeData: null,
            forkedFromRecipeId: null,
            questId: recipeData.questId ?? null,
            activeDraftId: null,
            onCloseCallback: onCloseCallback || null,
        }),
    onClose: () => {
        const callback = get().onCloseCallback;
        set({
            isOpen: false,
            isEditMode: false,
            editRecipeData: null,
            forkRecipeData: null,
            forkedFromRecipeId: null,
            questId: null,
            activeDraftId: null,
            onCloseCallback: null,
        });
        if (callback) {
            callback();
        }
    },
}));

export default useRecipeModal;
