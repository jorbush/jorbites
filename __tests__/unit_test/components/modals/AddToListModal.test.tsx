import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AddToListModal from '@/app/components/modals/AddToListModal';
import useAddToListModal from '@/app/hooks/useAddToListModal';
import axios from 'axios';

vi.mock('@/app/hooks/useAddToListModal');
vi.mock('axios');
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('AddToListModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAddToListModal).mockReturnValue({
            isOpen: true,
            recipeId: 'recipe-id',
            onClose: vi.fn(),
            onOpen: vi.fn(),
        } as any);
        vi.mocked(axios.get).mockResolvedValue({ data: [] });
        vi.mocked(axios.post).mockResolvedValue({
            data: {
                id: 'list-1',
                name: 'to cook later',
                isDefault: true,
                recipeIds: [],
            },
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the modal when open', () => {
        render(<AddToListModal />);
        // Title should be in the modal (passed as title prop)
        const titleElement = screen.getByTestId('modal-title');
        expect(titleElement.textContent).toContain('save_to_list');
        // Description should be in the body
        expect(screen.getByText('add_to_list_description')).toBeDefined();
    });

    it('shows loading state initially', () => {
        render(<AddToListModal />);
        expect(screen.getByText('loading')).toBeDefined();
    });

    it('renders the tick with text-green-450 when a list contains the recipe', async () => {
        vi.mocked(axios.get).mockResolvedValue({
            data: [
                {
                    id: 'list-1',
                    name: 'to cook later',
                    isDefault: true,
                    recipeIds: ['recipe-id'],
                },
            ],
        });

        render(<AddToListModal />);

        const checkIconContainer =
            await screen.findByTestId('list-item-selected');
        expect(checkIconContainer).toBeDefined();
        const icon = checkIconContainer.querySelector('svg');
        expect(icon?.getAttribute('class')).toContain('text-green-450');
    });

    it('renders the Private list checkbox with green-450 styling when creating a new list', async () => {
        vi.mocked(axios.get).mockResolvedValue({
            data: [
                {
                    id: 'list-1',
                    name: 'to cook later',
                    isDefault: true,
                    recipeIds: [],
                },
            ],
        });

        render(<AddToListModal />);

        const createButton = await screen.findByText('create_new_list');
        fireEvent.click(createButton);

        const checkbox = screen.getByLabelText('private_list');
        expect(checkbox).toBeDefined();
        expect(checkbox.className).toContain('accent-green-450');
        expect(checkbox.className).toContain('text-green-450');
        expect(checkbox.className).toContain('focus:ring-green-450');
    });
});
