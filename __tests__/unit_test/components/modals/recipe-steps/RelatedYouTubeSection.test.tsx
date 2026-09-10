import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RelatedYouTubeSection from '@/app/components/modals/recipe-steps/RelatedYouTubeSection';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/components/inputs/Input', () => ({
    default: ({ id, label, disabled, dataCy }: any) => (
        <div data-testid={id}>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                data-cy={dataCy}
                disabled={disabled}
            />
        </div>
    ),
}));

describe('RelatedYouTubeSection', () => {
    const defaultProps = {
        isLoading: false,
        register: vi.fn(),
        errors: {},
    };

    it('renders youtube input', () => {
        render(<RelatedYouTubeSection {...defaultProps} />);

        expect(screen.getByTestId('youtubeUrl')).toBeInTheDocument();
        expect(
            screen.getByLabelText('youtube_url_optional')
        ).toBeInTheDocument();
    });

    it('disables input when isLoading is true', () => {
        render(
            <RelatedYouTubeSection
                {...defaultProps}
                isLoading={true}
            />
        );

        const input = screen.getByLabelText('youtube_url_optional');
        expect(input).toBeDisabled();
    });
});
