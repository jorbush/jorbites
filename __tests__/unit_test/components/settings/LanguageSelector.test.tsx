import {
    render,
    screen,
    fireEvent,
    cleanup,
    waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LanguageSelector from '@/app/components/settings/LanguageSelector';
import i18n from '@/app/i18n';


// Mock the icons
vi.mock('react-icons/fi', () => ({
    FiChevronDown: () => <div data-testid="chevron-down-icon" />,
}));

vi.mock('@/app/i18n', () => ({
    default: {
        language: 'en',
        changeLanguage: vi.fn(),
    },
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
            changeLanguage: vi.fn(),
        },
    }),
}));

describe('<LanguageSelector />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders correctly with initial language', () => {
        render(<LanguageSelector />);

        expect(screen.getByText('select_your_language')).toBeDefined();
        expect(screen.getByText('English')).toBeDefined();
    });

    it('opens dropdown when button is clicked', () => {
        render(<LanguageSelector />);

        const dropdownButton = screen.getByRole('button');
        fireEvent.click(dropdownButton);

        expect(screen.getByText('Castellano')).toBeDefined();
        expect(screen.getByText('Català')).toBeDefined();
    });

    it('calls i18n.changeLanguage when language is changed', async () => {
        render(<LanguageSelector />);

        const dropdownButton = screen.getByRole('button');
        fireEvent.click(dropdownButton);

        const spanishOption = screen.getByText('Castellano');
        fireEvent.click(spanishOption);

        expect(i18n.changeLanguage).toHaveBeenCalledWith('es');
    });

    it('closes dropdown after selecting an option', async () => {
        render(<LanguageSelector />);

        const dropdownButton = screen.getByRole('button');
        fireEvent.click(dropdownButton);

        const catalanOption = screen.getByText('Català');
        fireEvent.click(catalanOption);

        // Dropdown should close after selection
        await waitFor(() => {
            expect(screen.queryByText('Castellano')).toBeNull();
        });
    });
});
