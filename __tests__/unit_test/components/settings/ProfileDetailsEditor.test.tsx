import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ProfileDetailsEditor from '@/app/components/settings/ProfileDetailsEditor';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('ProfileDetailsEditor Component', () => {
    afterEach(() => {
        cleanup();
    });

    const defaultProps = {
        bio: 'Culinary explorer',
        setBio: vi.fn(),
        websiteUrl: 'https://foodie.com',
        setWebsiteUrl: vi.fn(),
        instagram: 'foodie_gram',
        setInstagram: vi.fn(),
        twitter: 'foodie_tw',
        setTwitter: vi.fn(),
        youtube: 'foodie_yt',
        setYoutube: vi.fn(),
        tiktok: 'foodie_tk',
        setTiktok: vi.fn(),
        isPending: false,
    };

    it('renders all fields with initial values and character count', () => {
        render(<ProfileDetailsEditor {...defaultProps} />);

        const bioInput = screen.getByTestId('bio-input') as HTMLTextAreaElement;
        expect(bioInput.value).toBe('Culinary explorer');
        expect(
            screen.getByText(`${'Culinary explorer'.length}/250`)
        ).toBeDefined();

        expect(
            (screen.getByTestId('website-input') as HTMLInputElement).value
        ).toBe('https://foodie.com');
        expect(
            (screen.getByTestId('instagram-input') as HTMLInputElement).value
        ).toBe('foodie_gram');
        expect(
            (screen.getByTestId('twitter-input') as HTMLInputElement).value
        ).toBe('foodie_tw');
        expect(
            (screen.getByTestId('youtube-input') as HTMLInputElement).value
        ).toBe('foodie_yt');
        expect(
            (screen.getByTestId('tiktok-input') as HTMLInputElement).value
        ).toBe('foodie_tk');
    });

    it('invokes setters when input values change', () => {
        const setBio = vi.fn();
        const setWebsiteUrl = vi.fn();
        const setInstagram = vi.fn();
        const setTwitter = vi.fn();
        const setYoutube = vi.fn();
        const setTiktok = vi.fn();

        render(
            <ProfileDetailsEditor
                {...defaultProps}
                setBio={setBio}
                setWebsiteUrl={setWebsiteUrl}
                setInstagram={setInstagram}
                setTwitter={setTwitter}
                setYoutube={setYoutube}
                setTiktok={setTiktok}
            />
        );

        fireEvent.change(screen.getByTestId('bio-input'), {
            target: { value: 'New bio content' },
        });
        expect(setBio).toHaveBeenCalledWith('New bio content');

        fireEvent.change(screen.getByTestId('website-input'), {
            target: { value: 'https://newsite.com' },
        });
        expect(setWebsiteUrl).toHaveBeenCalledWith('https://newsite.com');

        fireEvent.change(screen.getByTestId('instagram-input'), {
            target: { value: 'new_ig' },
        });
        expect(setInstagram).toHaveBeenCalledWith('new_ig');

        fireEvent.change(screen.getByTestId('twitter-input'), {
            target: { value: 'new_tw' },
        });
        expect(setTwitter).toHaveBeenCalledWith('new_tw');

        fireEvent.change(screen.getByTestId('youtube-input'), {
            target: { value: 'new_yt' },
        });
        expect(setYoutube).toHaveBeenCalledWith('new_yt');

        fireEvent.change(screen.getByTestId('tiktok-input'), {
            target: { value: 'new_tk' },
        });
        expect(setTiktok).toHaveBeenCalledWith('new_tk');
    });

    it('enforces 250 character limit on bio change', () => {
        const setBio = vi.fn();
        render(
            <ProfileDetailsEditor
                {...defaultProps}
                setBio={setBio}
            />
        );

        const longText = 'a'.repeat(260);
        fireEvent.change(screen.getByTestId('bio-input'), {
            target: { value: longText },
        });
        expect(setBio).toHaveBeenCalledWith('a'.repeat(250));
    });

    it('disables all inputs when isPending is true', () => {
        render(
            <ProfileDetailsEditor
                {...defaultProps}
                isPending={true}
            />
        );

        expect(
            (screen.getByTestId('bio-input') as HTMLTextAreaElement).disabled
        ).toBe(true);
        expect(
            (screen.getByTestId('website-input') as HTMLInputElement).disabled
        ).toBe(true);
        expect(
            (screen.getByTestId('instagram-input') as HTMLInputElement).disabled
        ).toBe(true);
        expect(
            (screen.getByTestId('twitter-input') as HTMLInputElement).disabled
        ).toBe(true);
        expect(
            (screen.getByTestId('youtube-input') as HTMLInputElement).disabled
        ).toBe(true);
        expect(
            (screen.getByTestId('tiktok-input') as HTMLInputElement).disabled
        ).toBe(true);
    });
});
