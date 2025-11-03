import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LanguageSelector from '@/app/components/settings/LanguageSelector';
import i18n from '@/app/i18n';

// Mock the icons
vi.mock('react-icons/fi', () => ({
    FiChevronDown: () => <div data-testid="chevron-down-icon" />,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
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
        expect(screen.getByRole('button')).toBeDefined();
        expect(screen.getByText('English')).toBeDefined();
    });

    it('displays the current language in the button', () => {
        render(<LanguageSelector />);

        const button = screen.getByRole('button');
        expect(button.textContent).toContain('English');
    });

    it('opens dropdown when button is clicked', () => {
        render(<LanguageSelector />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByText('Castellano')).toBeDefined();
        expect(screen.getAllByText('English').length).toBeGreaterThan(0);
        expect(screen.getByText('Català')).toBeDefined();
    });

    it('calls i18n.changeLanguage when language is changed', () => {
        render(<LanguageSelector />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const spanishOption = screen.getByText('Castellano');
        fireEvent.click(spanishOption);

        expect(i18n.changeLanguage).toHaveBeenCalledWith('es');
    });

    it('closes dropdown when clicking outside', () => {
        render(<LanguageSelector />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Dropdown should be open
        expect(screen.getByText('Castellano')).toBeDefined();

        // Click outside (simulate by clicking document body)
        fireEvent.mouseDown(document.body);

        // Dropdown should be closed (options no longer visible except button text)
        const englishElements = screen.getAllByText('English');
        // Only the button should show English
        expect(englishElements.length).toBe(1);
    });

    it('closes dropdown after selecting an option', () => {
        render(<LanguageSelector />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const catalanOption = screen.getByText('Català');
        fireEvent.click(catalanOption);

        // Dropdown should close - Castellano should not be visible
        expect(screen.queryByText('Castellano')).toBeNull();
    });

    it('highlights current language in dropdown', () => {
        render(<LanguageSelector />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const englishOptions = screen.getAllByText('English');
        const dropdownOption = englishOptions.find((option) =>
            option.className.includes('whitespace-nowrap')
        );

        expect(dropdownOption?.parentElement?.className).toContain(
            'text-green-450'
        );
    });

    it('has proper ARIA attributes', () => {
        render(<LanguageSelector />);

        const button = screen.getByRole('button');
        expect(button.getAttribute('aria-label')).toBe('select_your_language');
        expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('updates aria-expanded when dropdown is opened', () => {
        render(<LanguageSelector />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(button.getAttribute('aria-expanded')).toBe('true');
    });
});
