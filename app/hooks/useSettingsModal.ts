import { create } from 'zustand';

interface SettingsModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useSettingsModal = create<SettingsModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));

export default useSettingsModal;
