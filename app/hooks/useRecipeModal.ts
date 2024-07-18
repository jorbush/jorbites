import { create } from 'zustand';

interface RecipeModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useRecipeModal = create<RecipeModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));

export default useRecipeModal;
