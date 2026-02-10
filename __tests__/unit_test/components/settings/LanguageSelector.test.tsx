import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LanguageSelector from '@/app/components/settings/LanguageSelector';
import i18n from '@/app/i18n';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/i18n', () => ({
    default: {
        language: 'en',
        changeLanguage: vi.fn(),
    },
}));

// Mock Dropdown component
vi.mock('@/app/components/utils/Dropdown', () => {
    return {
        default: ({ onChange, value, options }: any) => (
            <select
                data-testid="language-dropdown"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((opt: any) => (
                    <option
                        key={opt.value}
                        value={opt.value}
                    >
                        {opt.label}
                    </option>
                ))}
            </select>
        ),
    };
});

describe('<LanguageSelector />', () => {
    const mockUser: any = {
        id: '1',
        language: 'es',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset i18n language
        (i18n.language as string) = 'en';
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders correctly', () => {
        render(<LanguageSelector />);
        expect(screen.getByText('select_your_language')).toBeDefined();
        expect(screen.getByTestId('language-dropdown')).toBeDefined();
    });

    it('calls API when language is changed locally and currentUser exists', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        render(<LanguageSelector currentUser={mockUser} />);

        const dropdown = screen.getByTestId('language-dropdown');
        fireEvent.change(dropdown, { target: { value: 'ca' } });

        await waitFor(() => {
            expect(i18n.changeLanguage).toHaveBeenCalledWith('ca');
            expect(global.fetch).toHaveBeenCalledWith('/api/user/language', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language: 'ca',
                }),
            });
        });
    });

    it('does not call API if currentUser does not exist', async () => {
        global.fetch = vi.fn();

        render(<LanguageSelector />);

        const dropdown = screen.getByTestId('language-dropdown');
        fireEvent.change(dropdown, { target: { value: 'ca' } });

        await waitFor(() => {
            expect(i18n.changeLanguage).toHaveBeenCalledWith('ca');
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });
});
