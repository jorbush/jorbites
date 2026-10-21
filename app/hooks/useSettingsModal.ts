import { create } from 'zustand';

interface SettingsModalStore {
    isOpen: boolean;
    initialTab?: string;
    onOpen: (tab?: string) => void;
    onClose: () => void;
}

const useSettingsModal = create<SettingsModalStore>((set) => ({
    isOpen: false,
    initialTab: undefined,
    onOpen: (tab?: string) => set({ isOpen: true, initialTab: tab }),
    onClose: () => set({ isOpen: false, initialTab: undefined }),
}));

export default useSettingsModal;
