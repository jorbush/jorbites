import { create } from 'zustand';
import { SafeUser } from '@/app/types';

export interface EditWorkshopData {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    isRecurrent: boolean;
    recurrencePattern?: string | null;
    isPrivate: boolean;
    whitelistedUserIds: string[];
    imageSrc?: string | null;
    price: number;
    ingredients: string[];
    previousSteps: string[];
    whitelistedUsers?: SafeUser[];
}

interface WorkshopModalStore {
    isOpen: boolean;
    isEditMode: boolean;
    editWorkshopData: EditWorkshopData | null;
    onOpen: () => void;
    onOpenCreate: () => void;
    onOpenEdit: (workshopData: EditWorkshopData) => void;
    onClose: () => void;
}

const useWorkshopModal = create<WorkshopModalStore>((set) => ({
    isOpen: false,
    isEditMode: false,
    editWorkshopData: null,
    onOpen: () =>
        set({ isOpen: true, isEditMode: false, editWorkshopData: null }),
    onOpenCreate: () =>
        set({ isOpen: true, isEditMode: false, editWorkshopData: null }),
    onOpenEdit: (workshopData: EditWorkshopData) =>
        set({
            isOpen: true,
            isEditMode: true,
            editWorkshopData: workshopData,
        }),
    onClose: () =>
        set({
            isOpen: false,
            isEditMode: false,
            editWorkshopData: null,
        }),
}));

export default useWorkshopModal;
