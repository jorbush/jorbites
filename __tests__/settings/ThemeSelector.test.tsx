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
import {act} from 'react';
import ThemeSelector from '@/app/components/settings/ThemeSelector';
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

describe('<ThemeSelector />', () => {
    const mockRefresh = vi.fn();
    const mockTranslate = vi.fn((key) => key);
    let localStorageMock: { [key: string]: string } = {};

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue({
            refresh: mockRefresh,
        });
        (useTranslation as any).mockReturnValue({
            t: mockTranslate,
        });

        // Mock localStorage
        localStorageMock = {};
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: vi.fn(
                    (key) => localStorageMock[key]
                ),
                setItem: vi.fn((key, value) => {
                    localStorageMock[key] = value;
                }),
            },
            writable: true,
        });

        // Mock classList.toggle on document.documentElement
        document.documentElement.classList.toggle = vi.fn();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders correctly with initial light theme', () => {
        render(<ThemeSelector />);

        expect(
            screen.getByText('dark_theme')
        ).toBeDefined();
        expect(screen.getByRole('button')).toBeDefined();
    });

    it('toggles theme when button is clicked', async () => {
        render(<ThemeSelector />);

        const button = screen.getByRole('button');

        await act(async () => {
            fireEvent.click(button);
        });

        expect(
            screen.getByText('light_theme')
        ).toBeDefined();
        expect(localStorageMock['theme']).toBe('dark');
        expect(
            document.documentElement.classList.toggle
        ).toHaveBeenCalledWith('dark', true);
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('loads theme from localStorage on mount', async () => {
        localStorageMock['theme'] = 'dark';

        await act(async () => {
            render(<ThemeSelector />);
        });

        expect(
            screen.getByText('light_theme')
        ).toBeDefined();
        expect(
            document.documentElement.classList.toggle
        ).toHaveBeenCalledWith('dark', true);
    });

    it('uses translation for theme text', () => {
        render(<ThemeSelector />);

        expect(mockTranslate).toHaveBeenCalledWith(
            'dark_theme'
        );
    });

    it('toggles theme multiple times', async () => {
        render(<ThemeSelector />);

        const button = screen.getByRole('button');

        await act(async () => {
            fireEvent.click(button);
        });

        expect(
            screen.getByText('light_theme')
        ).toBeDefined();
        expect(localStorageMock['theme']).toBe('dark');

        await act(async () => {
            fireEvent.click(button);
        });

        expect(
            screen.getByText('dark_theme')
        ).toBeDefined();
        expect(localStorageMock['theme']).toBe('light');
    });
});
