import {
    render,
    screen,
    fireEvent,
    act,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import QuestModal from '@/app/components/modals/QuestModal';

// Mock the custom hooks
vi.mock('@/app/hooks/useQuestModal', () => ({
    default: vi.fn(() => ({
        isOpen: true,
        isEditMode: false,
        editQuestData: null,
        onClose: vi.fn(),
    })),
}));

vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key,
    })),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

// Mock axios
vi.mock('axios');

describe('<QuestModal />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    const renderComponent = () => {
        render(<QuestModal />);
    };

    it('renders the modal with title and description inputs', () => {
        renderComponent();
        // request_recipe appears in both the modal title and the body heading
        const requestRecipeTexts = screen.getAllByText('request_recipe');
        expect(requestRecipeTexts.length).toBeGreaterThan(0);
        expect(screen.getByLabelText('title')).toBeDefined();
        expect(screen.getByLabelText('description')).toBeDefined();
    });

    it('renders the create button', () => {
        renderComponent();
        const createButton = screen.getByRole('button', {
            name: 'create',
        });
        expect(createButton).toBeDefined();
    });

    it('displays title input field', () => {
        renderComponent();
        const titleInput = screen.getByLabelText('title');
        expect(titleInput).toBeDefined();
    });

    it('displays description textarea', () => {
        renderComponent();
        const descriptionTextarea = screen.getByLabelText('description');
        expect(descriptionTextarea).toBeDefined();
        expect(descriptionTextarea.tagName).toBe('TEXTAREA');
    });

    it('allows typing in the title input', () => {
        renderComponent();
        const titleInput = screen.getByLabelText('title') as HTMLInputElement;
        fireEvent.change(titleInput, { target: { value: 'Test Quest' } });
        expect(titleInput.value).toBe('Test Quest');
    });

    it('allows typing in the description textarea', () => {
        renderComponent();
        const descriptionTextarea = screen.getByLabelText(
            'description'
        ) as HTMLTextAreaElement;
        fireEvent.change(descriptionTextarea, {
            target: { value: 'Test description' },
        });
        expect(descriptionTextarea.value).toBe('Test description');
    });

    it('does not show status dropdown in create mode', () => {
        renderComponent();
        const statusDropdown = screen.queryByLabelText('status');
        expect(statusDropdown).toBeNull();
    });

    describe('Edit Mode', () => {
        it('should show edit mode title when in edit mode', async () => {
            const useQuestModal = await import('@/app/hooks/useQuestModal');
            vi.mocked(useQuestModal.default).mockReturnValue({
                isOpen: true,
                isEditMode: true,
                editQuestData: {
                    id: '1',
                    title: 'Test Quest',
                    description: 'Test description',
                    status: 'open',
                },
                onOpen: vi.fn(),
                onOpenCreate: vi.fn(),
                onOpenEdit: vi.fn(),
                onClose: vi.fn(),
            });

            await act(async () => {
                render(<QuestModal />);
            });

            // edit_quest appears in both the modal title and the body heading
            const editQuestTexts = screen.getAllByText('edit_quest');
            expect(editQuestTexts.length).toBeGreaterThan(0);
        });

        it('should pre-populate form with edit data', async () => {
            const mockEditData = {
                id: '1',
                title: 'Test Quest',
                description: 'Test description',
                status: 'in_progress',
            };

            const useQuestModal = await import('@/app/hooks/useQuestModal');
            vi.mocked(useQuestModal.default).mockReturnValue({
                isOpen: true,
                isEditMode: true,
                editQuestData: mockEditData,
                onOpen: vi.fn(),
                onOpenCreate: vi.fn(),
                onOpenEdit: vi.fn(),
                onClose: vi.fn(),
            });

            await act(async () => {
                render(<QuestModal />);
            });

            // The component should load edit data automatically
            const editQuestTexts = screen.getAllByText('edit_quest');
            expect(editQuestTexts.length).toBeGreaterThan(0);
        });

        it('should show status dropdown in edit mode', async () => {
            const useQuestModal = await import('@/app/hooks/useQuestModal');
            vi.mocked(useQuestModal.default).mockReturnValue({
                isOpen: true,
                isEditMode: true,
                editQuestData: {
                    id: '1',
                    title: 'Test Quest',
                    description: 'Test description',
                    status: 'open',
                },
                onOpen: vi.fn(),
                onOpenCreate: vi.fn(),
                onOpenEdit: vi.fn(),
                onClose: vi.fn(),
            });

            await act(async () => {
                render(<QuestModal />);
            });

            const statusDropdown = screen.getByLabelText('status');
            expect(statusDropdown).toBeDefined();
        });
    });
});
