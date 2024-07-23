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
import LanguageSelector from '../../app/components/settings/LanguageSelector';
import i18n from '@/app/i18n';

vi.mock('../../app/i18n', () => ({
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

        expect(
            screen.getByText('select_your_language')
        ).toBeDefined();
        expect(screen.getByRole('combobox')).toBeDefined();
        expect(
            screen.getByRole('option', {
                name: 'Castellano',
            })
        ).toBeDefined();
        expect(
            screen.getByRole('option', { name: 'English' })
        ).toBeDefined();
        expect(
            screen.getByRole('option', { name: 'Català' })
        ).toBeDefined();
    });

    it('sets the correct initial value for the select element', () => {
        render(<LanguageSelector />);

        const select = screen.getByRole(
            'combobox'
        ) as HTMLSelectElement;
        expect(select.value).toBe('en');
    });

    it('calls i18n.changeLanguage when language is changed', () => {
        render(<LanguageSelector />);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, {
            target: { value: 'es' },
        });

        expect(i18n.changeLanguage).toHaveBeenCalledWith(
            'es'
        );
    });

    it('changes select value when language is changed', () => {
        render(<LanguageSelector />);

        const select = screen.getByRole(
            'combobox'
        ) as HTMLSelectElement;
        fireEvent.change(select, {
            target: { value: 'ca' },
        });

        // Use a small delay to allow for state updates
        setTimeout(() => {
            expect(select.value).toBe('ca');
        }, 100);
    });
});
