import { render, screen, cleanup } from '@testing-library/react';
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
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the modal when open', () => {
        render(<AddToListModal />);
        expect(screen.getByText('save_to_list')).toBeDefined();
    });

    it('shows loading state initially', () => {
        render(<AddToListModal />);
        expect(screen.getByText('loading')).toBeDefined();
    });
});
