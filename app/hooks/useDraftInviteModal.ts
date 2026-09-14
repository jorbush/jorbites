import { create } from 'zustand';

interface DraftInviteModalStore {
    isOpen: boolean;
    draftId: string | null;
    onOpen: (draftId: string) => void;
    onClose: () => void;
}

const useDraftInviteModal = create<DraftInviteModalStore>((set) => ({
    isOpen: false,
    draftId: null,
    onOpen: (draftId: string) => set({ isOpen: true, draftId }),
    onClose: () => set({ isOpen: false, draftId: null }),
}));

export default useDraftInviteModal;
