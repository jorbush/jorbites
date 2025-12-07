import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import OrderBy from '@/app/components/utils/OrderBy';
import { vi, it, describe, expect } from 'vitest';

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        replace: vi.fn(),
    })),
    useSearchParams: vi.fn(() => ({
        get: vi.fn(),
    })),
    usePathname: vi.fn(() => '/'),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === 'newest_first') return 'Newest';
            if (key === 'oldest_first') return 'Oldest';
            if (key === 'title_a_z') return 'Title A-Z';
            if (key === 'title_z_a') return 'Title Z-A';
            if (key === 'most_liked') return 'Likes';
            return key;
        },
    }),
}));

describe('OrderBy', () => {
    it('renders correctly', () => {
        const { getByText } = render(<OrderBy />);
        expect(getByText('Newest')).toBeDefined();
    });

    it('changes the order when a new option is selected', () => {
        const { getByText, getByTestId } = render(<OrderBy />);
        const dropdownButton = getByTestId('order-by-dropdown');
        fireEvent.click(dropdownButton);
        const oldestOption = getByText('Oldest');
        fireEvent.click(oldestOption);
        expect(getByText('Oldest')).toBeDefined();
    });
});
