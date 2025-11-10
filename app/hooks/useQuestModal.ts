import { create } from 'zustand';

export interface EditQuestData {
    id: string;
    title: string;
    description: string;
    status: string;
}

interface QuestModalStore {
    isOpen: boolean;
    isEditMode: boolean;
    editQuestData: EditQuestData | null;
    onOpen: () => void;
    onOpenCreate: () => void;
    onOpenEdit: (questData: EditQuestData) => void;
    onClose: () => void;
}

const useQuestModal = create<QuestModalStore>((set) => ({
    isOpen: false,
    isEditMode: false,
    editQuestData: null,
    onOpen: () => set({ isOpen: true, isEditMode: false, editQuestData: null }),
    onOpenCreate: () =>
        set({ isOpen: true, isEditMode: false, editQuestData: null }),
    onOpenEdit: (questData: EditQuestData) =>
        set({
            isOpen: true,
            isEditMode: true,
            editQuestData: questData,
        }),
    onClose: () =>
        set({
            isOpen: false,
            isEditMode: false,
            editQuestData: null,
        }),
}));

export default useQuestModal;
