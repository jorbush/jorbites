import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LanguageSelector from '@/app/components/settings/LanguageSelector';
import i18n from '@/app/i18n';

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

        expect(screen.getByText('select_your_language')).toBeInTheDocument();
        const button = screen.getByRole('button', {
            name: 'select_your_language',
        });
        expect(button).toBeInTheDocument();

        // Check that the initial value is displayed
        expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('opens the dropdown and shows options when clicked', () => {
        render(<LanguageSelector />);
        const button = screen.getByRole('button', {
            name: 'select_your_language',
        });
        fireEvent.click(button);

        expect(screen.getByText('Castellano')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('Català')).toBeInTheDocument();
    });

    it('calls i18n.changeLanguage when a new language is selected', () => {
        render(<LanguageSelector />);
        const button = screen.getByRole('button', {
            name: 'select_your_language',
        });
        fireEvent.click(button);

        const spanishOption = screen.getByText('Castellano');
        fireEvent.click(spanishOption);

        expect(i18n.changeLanguage).toHaveBeenCalledWith('es');
    });
});
