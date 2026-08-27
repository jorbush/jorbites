import { create } from 'zustand';

interface DraftsModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useDraftsModal = create<DraftsModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));

export default useDraftsModal;
