import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CmsSubmitButton from '@/app/components/cms/CmsSubmitButton';
import { CMS_URL, CMS_EVENTS_URL, CMS_BLOGS_URL } from '@/app/utils/constants';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultValue?: string) => defaultValue || key,
    }),
}));

describe('<CmsSubmitButton />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders single link for target="events"', () => {
        render(<CmsSubmitButton target="events" />);
        const button = screen.getByTestId('cms-submit-event-btn');

        expect(button).toBeDefined();
        expect(button.getAttribute('href')).toBe(CMS_EVENTS_URL);
        expect(button.getAttribute('target')).toBe('_blank');
        expect(button.getAttribute('rel')).toBe('noopener noreferrer');
        expect(button.textContent).toContain('Propose Event');
    });

    it('renders single link for target="blogs"', () => {
        render(<CmsSubmitButton target="blogs" />);
        const button = screen.getByTestId('cms-submit-blog-btn');

        expect(button).toBeDefined();
        expect(button.getAttribute('href')).toBe(CMS_BLOGS_URL);
        expect(button.getAttribute('target')).toBe('_blank');
        expect(button.getAttribute('rel')).toBe('noopener noreferrer');
        expect(button.textContent).toContain('Propose Article');
    });

    it('renders dropdown toggle when target="all"', () => {
        render(<CmsSubmitButton target="all" />);
        const toggle = screen.getByTestId('cms-submit-content-btn');

        expect(toggle).toBeDefined();
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        expect(screen.queryByText('Cooking contests & challenges')).toBeNull();
    });

    it('opens and closes dropdown when toggled and closes on outside click', () => {
        render(
            <div>
                <span data-testid="outside">Outside</span>
                <CmsSubmitButton target="all" />
            </div>
        );

        const toggle = screen.getByTestId('cms-submit-content-btn');
        fireEvent.click(toggle);

        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        expect(screen.getByText('Cooking contests & challenges')).toBeDefined();
        expect(screen.getByText('Stories, recipes & news')).toBeDefined();

        const eventLink = screen.getByRole('link', { name: /Propose Event/i });
        expect(eventLink.getAttribute('href')).toBe(CMS_EVENTS_URL);

        const blogLink = screen.getByRole('link', { name: /Propose Article/i });
        expect(blogLink.getAttribute('href')).toBe(CMS_BLOGS_URL);

        const cmsHomeLink = screen.getByRole('link', {
            name: /Content Manager/i,
        });
        expect(cmsHomeLink.getAttribute('href')).toBe(CMS_URL);

        // Click outside closes dropdown
        fireEvent.mouseDown(screen.getByTestId('outside'));
        expect(screen.queryByText('Cooking contests & challenges')).toBeNull();
    });

    it('closes dropdown when an item is clicked', () => {
        render(<CmsSubmitButton target="all" />);
        const toggle = screen.getByTestId('cms-submit-content-btn');
        fireEvent.click(toggle);

        const eventLink = screen.getByRole('link', { name: /Propose Event/i });
        fireEvent.click(eventLink);

        expect(screen.queryByText('Cooking contests & challenges')).toBeNull();
    });

    it('applies custom className and md size classes', () => {
        render(
            <CmsSubmitButton
                target="events"
                size="md"
                className="custom-class"
            />
        );
        const button = screen.getByTestId('cms-submit-event-btn');

        expect(button.className).toContain('custom-class');
        expect(button.className).toContain('px-4 py-2');
    });
});
