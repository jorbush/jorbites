import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { formatText } from '@/app/utils/textFormatting';

describe('formatText', () => {
    it('formats @username[userId] mentions as clickable links', () => {
        const text = 'Hello @John Doe[user123] how are you?';
        const result = formatText(text);

        const { container } = render(<>{result}</>);

        // Check that the mention is rendered as a link
        const link = container.querySelector('a[href="/profile/user123"]');
        expect(link).toBeDefined();
        expect(link?.textContent).toBe('@John Doe');
        expect(link?.className).toContain('text-blue-500');
        expect(link?.className).toContain('hover:underline');
    });

    it('handles multiple mentions in the same text', () => {
        const text = 'Hey @Alice[user1] and @Bob[user2], check this out!';
        const result = formatText(text);

        const { container } = render(<>{result}</>);

        // Check first mention
        const aliceLink = container.querySelector('a[href="/profile/user1"]');
        expect(aliceLink).toBeDefined();
        expect(aliceLink?.textContent).toBe('@Alice');

        // Check second mention
        const bobLink = container.querySelector('a[href="/profile/user2"]');
        expect(bobLink).toBeDefined();
        expect(bobLink?.textContent).toBe('@Bob');
    });

    it('preserves other formatting while parsing mentions', () => {
        const text = 'Check this **bold** text and @User[userId] mention';
        const result = formatText(text);

        const { container } = render(<>{result}</>);

        // Check bold formatting is preserved
        const bold = container.querySelector('strong');
        expect(bold).toBeDefined();
        expect(bold?.textContent).toBe('bold');

        // Check mention is formatted
        const link = container.querySelector('a[href="/profile/userId"]');
        expect(link).toBeDefined();
        expect(link?.textContent).toBe('@User');
    });

    it('handles mentions with spaces in usernames', () => {
        const text = 'Hello @John Smith[user456] welcome!';
        const result = formatText(text);

        const { container } = render(<>{result}</>);

        const link = container.querySelector('a[href="/profile/user456"]');
        expect(link).toBeDefined();
        expect(link?.textContent).toBe('@John Smith');
    });

    it('handles text without mentions normally', () => {
        const text = 'This is just normal text with no mentions';
        const result = formatText(text);

        const { container } = render(<>{result}</>);

        // Should not contain any links
        const links = container.querySelectorAll('a');
        expect(links.length).toBe(0);
        expect(container.textContent).toBe(text);
    });
});
