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
import { toast } from 'react-hot-toast';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('react-hot-toast');

vi.mock('@/app/i18n', () => ({
    default: {
        language: 'en',
        changeLanguage: vi.fn(),
    },
}));

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
        (i18n.language as string) = 'en';
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('renders correctly', () => {
        render(<LanguageSelector />);
        expect(screen.getByText('select_your_language')).toBeDefined();
        expect(screen.getByTestId('language-dropdown')).toBeDefined();
    });

    it('calls API when language is changed locally and currentUser exists', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });
        vi.stubGlobal('fetch', fetchMock);

        render(<LanguageSelector currentUser={mockUser} />);

        const dropdown = screen.getByTestId('language-dropdown');
        fireEvent.change(dropdown, { target: { value: 'ca' } });

        await waitFor(() => {
            expect(i18n.changeLanguage).toHaveBeenCalledWith('ca');
            expect(fetchMock).toHaveBeenCalledWith('/api/user/language', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language: 'ca',
                }),
            });
            expect(toast.success).toHaveBeenCalledWith('success');
        });
    });

    it('shows error toast if API call fails', async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
        vi.stubGlobal('fetch', fetchMock);

        render(<LanguageSelector currentUser={mockUser} />);

        const dropdown = screen.getByTestId('language-dropdown');
        fireEvent.change(dropdown, { target: { value: 'ca' } });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('something_went_wrong');
        });
    });

    it('does not call API if currentUser does not exist', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        render(<LanguageSelector />);

        const dropdown = screen.getByTestId('language-dropdown');
        fireEvent.change(dropdown, { target: { value: 'ca' } });

        await waitFor(() => {
            expect(i18n.changeLanguage).toHaveBeenCalledWith('ca');
            expect(fetchMock).not.toHaveBeenCalled();
        });
    });
});
