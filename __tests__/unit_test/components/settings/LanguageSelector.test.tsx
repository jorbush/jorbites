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

        expect(screen.getByText('select_your_language')).toBeDefined();
        expect(screen.getByRole('button')).toBeDefined();
        expect(screen.getByText('English')).toBeDefined();
    });

    it('opens the dropdown and shows language options when clicked', () => {
        render(<LanguageSelector />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByText('Castellano')).toBeDefined();
        expect(screen.getAllByText('English').length).toBe(2);
        expect(screen.getByText('Català')).toBeDefined();
    });

    it('calls i18n.changeLanguage when a language is selected', () => {
        render(<LanguageSelector />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const spanishOption = screen.getByText('Castellano');
        fireEvent.click(spanishOption);

        expect(i18n.changeLanguage).toHaveBeenCalledWith('es');
    });
});
