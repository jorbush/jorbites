import { create } from 'zustand';

interface CooksnapModalStore {
    isOpen: boolean;
    recipeId: string | null;
    recipeTitle: string | null;
    onOpen: (recipeId: string, recipeTitle?: string) => void;
    onClose: () => void;
}

const useCooksnapModal = create<CooksnapModalStore>((set) => ({
    isOpen: false,
    recipeId: null,
    recipeTitle: null,
    onOpen: (recipeId, recipeTitle = '') =>
        set({ isOpen: true, recipeId, recipeTitle }),
    onClose: () => set({ isOpen: false, recipeId: null, recipeTitle: null }),
}));

export default useCooksnapModal;
