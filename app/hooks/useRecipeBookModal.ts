import { create } from 'zustand';

interface RecipeBookModalStore {
    isOpen: boolean;
    userId: string;
    userName: string;
    userImage?: string | null;
    onOpen: (
        userId: string,
        userName: string,
        userImage?: string | null
    ) => void;
    onClose: () => void;
}

const useRecipeBookModal = create<RecipeBookModalStore>((set) => ({
    isOpen: false,
    userId: '',
    userName: '',
    userImage: null,
    onOpen: (userId, userName, userImage = null) =>
        set({ isOpen: true, userId, userName, userImage }),
    onClose: () => set({ isOpen: false }),
}));

export default useRecipeBookModal;
