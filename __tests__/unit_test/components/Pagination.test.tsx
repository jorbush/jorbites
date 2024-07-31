import {
    render,
    screen,
    fireEvent,
    cleanup,
} from '@testing-library/react';
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
} from 'vitest';
import Pagination from '@/app/components/Pagination';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

// Mock the react-i18next module
vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(),
}));

describe('<Pagination />', () => {
    const mockPush = vi.fn();
    const mockTranslate = vi.fn((key) => key);

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue({
            push: mockPush,
        });
        (useTranslation as any).mockReturnValue({
            t: mockTranslate,
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly with given props', () => {
        render(
            <Pagination
                totalPages={5}
                currentPage={2}
                searchParams={{}}
            />
        );

        expect(screen.getByText('2 of 5')).toBeDefined();
        expect(screen.getAllByRole('button')).toHaveLength(
            2
        );
    });

    it('disables previous button on first page', () => {
        render(
            <Pagination
                totalPages={5}
                currentPage={1}
                searchParams={{}}
            />
        );

        const prevButton = screen.getAllByRole('button')[0];
        expect(prevButton).toHaveProperty('disabled');
    });

    it('disables next button on last page', () => {
        render(
            <Pagination
                totalPages={5}
                currentPage={5}
                searchParams={{}}
            />
        );

        const nextButton = screen.getAllByRole('button')[1];
        expect(nextButton).toHaveProperty('disabled');
    });

    it('calls router.push with correct URL when previous button is clicked', () => {
        render(
            <Pagination
                totalPages={5}
                currentPage={3}
                searchParams={{ foo: 'bar' }}
            />
        );

        const prevButton = screen.getAllByRole('button')[0];
        fireEvent.click(prevButton);

        expect(mockPush).toHaveBeenCalledWith(
            '?foo=bar&page=2'
        );
    });

    it('calls router.push with correct URL when next button is clicked', () => {
        render(
            <Pagination
                totalPages={5}
                currentPage={3}
                searchParams={{ foo: 'bar' }}
            />
        );

        const nextButton = screen.getAllByRole('button')[1];
        fireEvent.click(nextButton);

        expect(mockPush).toHaveBeenCalledWith(
            '?foo=bar&page=4'
        );
    });

    it('uses translation for "of"', () => {
        render(
            <Pagination
                totalPages={5}
                currentPage={3}
                searchParams={{}}
            />
        );

        expect(mockTranslate).toHaveBeenCalledWith('of');
    });
});
