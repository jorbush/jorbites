import {
    render,
    screen,
    fireEvent,
    act,
    cleanup,
    waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import QuestModal from '@/app/components/modals/QuestModal';
import useQuestModal from '@/app/hooks/useQuestModal';

const mockOnClose = vi.fn();
const mockRefresh = vi.fn();
const mockPush = vi.fn();

// Mock the custom hooks
vi.mock('@/app/hooks/useQuestModal', () => ({
    default: vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key,
    })),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: mockRefresh,
        push: mockPush,
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
        vi.mocked(useQuestModal).mockReturnValue({
            isOpen: true,
            isEditMode: false,
            editQuestData: null,
            onOpen: vi.fn(),
            onOpenCreate: vi.fn(),
            onOpenEdit: vi.fn(),
            onClose: mockOnClose,
        });
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

    it('submits new quest in create mode and navigates to open quests', async () => {
        vi.mocked(axios.post).mockResolvedValueOnce({ data: { id: 'q-1' } });
        renderComponent();

        fireEvent.change(screen.getByLabelText('title'), {
            target: { value: 'New Quest' },
        });
        fireEvent.change(screen.getByLabelText('description'), {
            target: { value: 'Looking for a ramen recipe' },
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'create' }));
        });

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/quests', {
                title: 'New Quest',
                description: 'Looking for a ramen recipe',
                status: 'open',
                recipeId: '',
            });
        });

        expect(toast.success).toHaveBeenCalledWith('quest_created');
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/quests?status=open');
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('shows API error message when quest submission fails', async () => {
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        vi.mocked(axios.post).mockRejectedValueOnce({
            response: { data: { error: 'Custom API error' } },
        });
        renderComponent();

        fireEvent.change(screen.getByLabelText('title'), {
            target: { value: 'New Quest' },
        });
        fireEvent.change(screen.getByLabelText('description'), {
            target: { value: 'Looking for a ramen recipe' },
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'create' }));
        });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Custom API error');
        });
        expect(mockOnClose).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    describe('Edit Mode', () => {
        it('should show edit mode title when in edit mode', async () => {
            vi.mocked(useQuestModal).mockReturnValue({
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
                onClose: mockOnClose,
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

            vi.mocked(useQuestModal).mockReturnValue({
                isOpen: true,
                isEditMode: true,
                editQuestData: mockEditData,
                onOpen: vi.fn(),
                onOpenCreate: vi.fn(),
                onOpenEdit: vi.fn(),
                onClose: mockOnClose,
            });

            await act(async () => {
                render(<QuestModal />);
            });

            expect(
                (screen.getByLabelText('title') as HTMLInputElement).value
            ).toBe('Test Quest');
            expect(
                (screen.getByLabelText('description') as HTMLTextAreaElement)
                    .value
            ).toBe('Test description');
            expect(
                (screen.getByLabelText('status') as HTMLSelectElement).value
            ).toBe('in_progress');
        });

        it('should show status dropdown in edit mode', async () => {
            vi.mocked(useQuestModal).mockReturnValue({
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
                onClose: mockOnClose,
            });

            await act(async () => {
                render(<QuestModal />);
            });

            const statusDropdown = screen.getByLabelText('status');
            expect(statusDropdown).toBeDefined();
        });

        it('submits updated quest in edit mode without navigating', async () => {
            vi.mocked(axios.patch).mockResolvedValueOnce({ data: { id: '1' } });
            vi.mocked(useQuestModal).mockReturnValue({
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
                onClose: mockOnClose,
            });

            await act(async () => {
                render(<QuestModal />);
            });

            fireEvent.change(screen.getByLabelText('status'), {
                target: { value: 'in_progress' },
            });

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'update' }));
            });

            await waitFor(() => {
                expect(axios.patch).toHaveBeenCalledWith('/api/quest/1', {
                    title: 'Test Quest',
                    description: 'Test description',
                    status: 'in_progress',
                    recipeId: '',
                });
            });

            expect(toast.success).toHaveBeenCalledWith('quest_updated');
            expect(mockOnClose).toHaveBeenCalled();
            expect(mockPush).not.toHaveBeenCalled();
            expect(mockRefresh).toHaveBeenCalled();
        });

        it('shows accepted recipe selector only when status is completed and recipes exist', async () => {
            vi.mocked(useQuestModal).mockReturnValue({
                isOpen: true,
                isEditMode: true,
                editQuestData: {
                    id: '1',
                    title: 'Test Quest',
                    description: 'Test description',
                    status: 'open',
                    recipes: [
                        {
                            id: 'r-1',
                            title: 'Ramen Bowl',
                            userId: 'u-1',
                            user: { name: 'Chef Alice' },
                        },
                        {
                            id: 'r-2',
                            title: 'Miso Ramen',
                            userId: 'u-2',
                        },
                    ],
                },
                onOpen: vi.fn(),
                onOpenCreate: vi.fn(),
                onOpenEdit: vi.fn(),
                onClose: mockOnClose,
            });

            await act(async () => {
                render(<QuestModal />);
            });

            expect(screen.queryByLabelText('accepted_recipe')).toBeNull();

            fireEvent.change(screen.getByLabelText('status'), {
                target: { value: 'completed' },
            });

            const acceptedSelect = screen.getByLabelText(
                'accepted_recipe'
            ) as HTMLSelectElement;
            expect(acceptedSelect).toBeDefined();
            expect(
                screen.getByText('Ramen Bowl (by Chef Alice)')
            ).toBeDefined();
            expect(screen.getByText('Miso Ramen')).toBeDefined();
        });
    });
});
