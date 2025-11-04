import {
    render,
    screen,
    fireEvent,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import OrderByDropdown from '@/app/components/navbar/OrderByDropdown';
import React from 'react';

// Mock the icons
vi.mock('react-icons/io5', () => ({
    IoReorderThree: () => <div data-testid="reorder-icon" />,
}));
vi.mock('react-icons/fi', () => ({
    FiChevronDown: () => <div data-testid="chevron-down-icon" />,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: { [key: string]: string } = {
                order_by: 'Order by',
                newest_first: 'Newest first',
                oldest_first: 'Oldest first',
                title_a_z: 'Title A-Z',
                title_z_a: 'Title Z-A',
                most_liked: 'Most liked',
            };
            return translations[key] || key;
        },
    }),
}));

const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockReplace,
    }),
    useSearchParams: () => mockSearchParams,
    usePathname: () => '/',
}));

describe('<OrderByDropdown />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchParams.delete('orderBy');
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the dropdown with the correct initial value', () => {
        render(<OrderByDropdown />);
        expect(screen.getByText('Newest first')).toBeInTheDocument();
    });

    it('opens the dropdown and displays options when clicked', () => {
        render(<OrderByDropdown />);
        fireEvent.click(screen.getByLabelText('Order by'));
        expect(screen.getByText('Oldest first')).toBeInTheDocument();
        expect(screen.getByText('Title A-Z')).toBeInTheDocument();
    });

    it('calls the router with the correct params when an option is selected', () => {
        render(<OrderByDropdown />);
        fireEvent.click(screen.getByLabelText('Order by'));
        fireEvent.click(screen.getByText('Title A-Z'));
        expect(mockReplace).toHaveBeenCalledWith('/?orderBy=title_asc');
    });

    it('removes the orderBy param when the default option is selected', () => {
        mockSearchParams.set('orderBy', 'title_asc');
        render(<OrderByDropdown />);
        fireEvent.click(screen.getByLabelText('Order by'));
        fireEvent.click(screen.getByText('Newest first'));
        expect(mockReplace).toHaveBeenCalledWith('/');
    });
});
