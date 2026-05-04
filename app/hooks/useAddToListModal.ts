import { create } from 'zustand';

interface AddToListModalStore {
    isOpen: boolean;
    recipeId: string | null;
    onOpen: (recipeId: string) => void;
    onClose: () => void;
}

const useAddToListModal = create<AddToListModalStore>((set) => ({
    isOpen: false,
    recipeId: null,
    onOpen: (recipeId) => set({ isOpen: true, recipeId }),
    onClose: () => set({ isOpen: false, recipeId: null }),
}));

export default useAddToListModal;
