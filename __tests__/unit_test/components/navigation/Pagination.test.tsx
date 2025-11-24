import { render, fireEvent } from '@testing-library/react';
import Pagination from '@/app/components/navigation/Pagination';
import { useRouter } from 'next/navigation';
import { vi, describe, it, expect } from 'vitest';

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

describe('Pagination component', () => {
    it('should not include undefined searchParams in the URL', () => {
        const push = vi.fn();
        // Set the mock implementation for this specific test
        (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push });

        const { getByLabelText } = render(
            <Pagination
                totalPages={5}
                currentPage={2}
                searchParams={{
                    search: undefined,
                    orderBy: 'trending',
                }}
            />
        );

        const nextPageButton = getByLabelText('Next page');
        fireEvent.click(nextPageButton);

        expect(push).toHaveBeenCalledWith('?orderBy=trending&page=3');
    });
});
