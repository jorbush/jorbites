import { create } from 'zustand';

interface AdvancedFiltersModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useAdvancedFiltersModal = create<AdvancedFiltersModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));

export default useAdvancedFiltersModal;
