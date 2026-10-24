import { describe, it, expect } from 'vitest';
import {
    normalizeSocialHandle,
    normalizeWebsiteUrl,
    formatExternalUrl,
    formatDomainDisplay,
    getSocialLink,
    getCreatorSameAsLinks,
    getProfilePreferences,
    DEFAULT_PROFILE_PREFERENCES,
} from '@/app/utils/profile-utils';

describe('profile-utils', () => {
    describe('normalizeSocialHandle', () => {
        it('returns undefined when input is undefined', () => {
            expect(normalizeSocialHandle(undefined)).toEqual({
                handle: undefined,
            });
        });

        it('returns null when input is null', () => {
            expect(normalizeSocialHandle(null)).toEqual({ handle: null });
        });

        it('returns error when input is not a string', () => {
            expect(normalizeSocialHandle(12345, 'Instagram')).toEqual({
                error: 'Instagram handle must be a string',
            });
            expect(
                normalizeSocialHandle({ handle: 'test' }, 'Twitter')
            ).toEqual({
                error: 'Twitter handle must be a string',
            });
        });

        it('returns null when input is empty or whitespace only', () => {
            expect(normalizeSocialHandle('')).toEqual({ handle: null });
            expect(normalizeSocialHandle('   ')).toEqual({ handle: null });
        });

        it('normalizes clean handle without modifications', () => {
            expect(normalizeSocialHandle('chef_alice')).toEqual({
                handle: 'chef_alice',
            });
            expect(normalizeSocialHandle('baker-123.pro')).toEqual({
                handle: 'baker-123.pro',
            });
        });

        it('strips leading @ symbols', () => {
            expect(normalizeSocialHandle('@chef_alice')).toEqual({
                handle: 'chef_alice',
            });
            expect(normalizeSocialHandle('@@@chef_alice')).toEqual({
                handle: 'chef_alice',
            });
        });

        it('extracts handle from full URL', () => {
            expect(
                normalizeSocialHandle('https://instagram.com/chef_alice')
            ).toEqual({
                handle: 'chef_alice',
            });
            expect(normalizeSocialHandle('https://x.com/chef_alice/')).toEqual({
                handle: 'chef_alice',
            });
        });

        it('strips query strings and hash anchors from URL or handle', () => {
            expect(
                normalizeSocialHandle(
                    'https://x.com/chef_alice?utm_source=twitter#profile'
                )
            ).toEqual({
                handle: 'chef_alice',
            });
            expect(normalizeSocialHandle('@chef_alice?test=1')).toEqual({
                handle: 'chef_alice',
            });
        });

        it('returns error on invalid characters', () => {
            expect(normalizeSocialHandle('chef alice', 'Instagram')).toEqual({
                error: 'Invalid Instagram handle format',
            });
            expect(normalizeSocialHandle('chef<script>', 'TikTok')).toEqual({
                error: 'Invalid TikTok handle format',
            });
            expect(normalizeSocialHandle('chef!@#', 'YouTube')).toEqual({
                error: 'Invalid YouTube handle format',
            });
        });

        it('truncates handle to maximum of 100 characters', () => {
            const longHandle = 'a'.repeat(120);
            const result = normalizeSocialHandle(longHandle);
            expect(result.handle).toBe('a'.repeat(100));
        });
    });

    describe('normalizeWebsiteUrl', () => {
        it('returns undefined when input is undefined', () => {
            expect(normalizeWebsiteUrl(undefined)).toEqual({ url: undefined });
        });

        it('returns null when input is null', () => {
            expect(normalizeWebsiteUrl(null)).toEqual({ url: null });
        });

        it('returns error when input is not a string', () => {
            expect(normalizeWebsiteUrl(12345)).toEqual({
                error: 'Website URL must be a string',
            });
        });

        it('returns null when input is empty or whitespace only', () => {
            expect(normalizeWebsiteUrl('')).toEqual({ url: null });
            expect(normalizeWebsiteUrl('   ')).toEqual({ url: null });
        });

        it('prepends https:// when protocol is missing', () => {
            expect(normalizeWebsiteUrl('myfoodblog.com')).toEqual({
                url: 'https://myfoodblog.com',
            });
            expect(normalizeWebsiteUrl('www.myfoodblog.com/recipes')).toEqual({
                url: 'https://www.myfoodblog.com/recipes',
            });
        });

        it('preserves valid http and https protocols', () => {
            expect(normalizeWebsiteUrl('http://myfoodblog.com')).toEqual({
                url: 'http://myfoodblog.com',
            });
            expect(normalizeWebsiteUrl('https://myfoodblog.com')).toEqual({
                url: 'https://myfoodblog.com',
            });
        });

        it('rejects dangerous URI schemes', () => {
            expect(normalizeWebsiteUrl('javascript:alert(1)')).toEqual({
                error: 'Invalid website URL',
            });
            expect(normalizeWebsiteUrl('data:text/html,<script>')).toEqual({
                error: 'Invalid website URL',
            });
            expect(normalizeWebsiteUrl('vbscript:msgbox(1)')).toEqual({
                error: 'Invalid website URL',
            });
        });

        it('rejects unsupported protocols like ftp or file', () => {
            expect(normalizeWebsiteUrl('ftp://myfoodblog.com')).toEqual({
                error: 'Website URL must use http or https',
            });
        });

        it('rejects malformed URLs', () => {
            expect(normalizeWebsiteUrl('http://')).toEqual({
                error: 'Invalid website URL format',
            });
        });
    });

    describe('formatExternalUrl', () => {
        it('returns empty string for falsy input', () => {
            expect(formatExternalUrl('')).toBe('');
            expect(formatExternalUrl(null)).toBe('');
            expect(formatExternalUrl(undefined)).toBe('');
        });

        it('blocks dangerous schemes and returns #', () => {
            expect(formatExternalUrl('javascript:alert(1)')).toBe('#');
            expect(formatExternalUrl('data:text/html,hack')).toBe('#');
            expect(formatExternalUrl('vbscript:msgbox(1)')).toBe('#');
        });

        it('adds https:// if protocol is missing', () => {
            expect(formatExternalUrl('myfoodblog.com')).toBe(
                'https://myfoodblog.com'
            );
        });

        it('preserves existing http or https protocol', () => {
            expect(formatExternalUrl('https://myfoodblog.com')).toBe(
                'https://myfoodblog.com'
            );
            expect(formatExternalUrl('http://myfoodblog.com')).toBe(
                'http://myfoodblog.com'
            );
        });
    });

    describe('formatDomainDisplay', () => {
        it('returns empty string for falsy input', () => {
            expect(formatDomainDisplay('')).toBe('');
            expect(formatDomainDisplay(null)).toBe('');
            expect(formatDomainDisplay(undefined)).toBe('');
        });

        it('extracts domain without www prefix', () => {
            expect(
                formatDomainDisplay('https://www.myfoodblog.com/recipes')
            ).toBe('myfoodblog.com');
            expect(formatDomainDisplay('https://myfoodblog.com')).toBe(
                'myfoodblog.com'
            );
            expect(formatDomainDisplay('http://bakery.co.uk/about')).toBe(
                'bakery.co.uk'
            );
        });

        it('handles URL string without protocol', () => {
            expect(formatDomainDisplay('www.myfoodblog.com')).toBe(
                'myfoodblog.com'
            );
            expect(formatDomainDisplay('myfoodblog.com')).toBe(
                'myfoodblog.com'
            );
        });
    });

    describe('getSocialLink', () => {
        it('returns empty string for empty input', () => {
            expect(getSocialLink('instagram', '')).toBe('');
            expect(getSocialLink('twitter', null)).toBe('');
            expect(getSocialLink('youtube', undefined)).toBe('');
        });

        it('formats Instagram URLs', () => {
            expect(getSocialLink('instagram', 'chef_alice')).toBe(
                'https://instagram.com/chef_alice'
            );
            expect(getSocialLink('instagram', '@chef_alice')).toBe(
                'https://instagram.com/chef_alice'
            );
        });

        it('formats Twitter / X URLs', () => {
            expect(getSocialLink('twitter', 'chef_alice')).toBe(
                'https://x.com/chef_alice'
            );
            expect(getSocialLink('twitter', '@chef_alice')).toBe(
                'https://x.com/chef_alice'
            );
        });

        it('formats YouTube URLs for handles and full URLs', () => {
            expect(getSocialLink('youtube', 'chef_alice')).toBe(
                'https://youtube.com/@chef_alice'
            );
            expect(getSocialLink('youtube', '@chef_alice')).toBe(
                'https://youtube.com/@chef_alice'
            );
            expect(
                getSocialLink('youtube', 'https://youtube.com/@chef_alice')
            ).toBe('https://youtube.com/@chef_alice');
            expect(
                getSocialLink(
                    'youtube',
                    'https://www.youtube.com/c/CookingChef'
                )
            ).toBe('https://www.youtube.com/c/CookingChef');
            expect(
                getSocialLink('youtube', 'https://youtu.be/channel123')
            ).toBe('https://youtu.be/channel123');
        });

        it('formats TikTok URLs', () => {
            expect(getSocialLink('tiktok', 'chef_alice')).toBe(
                'https://tiktok.com/@chef_alice'
            );
            expect(getSocialLink('tiktok', '@chef_alice')).toBe(
                'https://tiktok.com/@chef_alice'
            );
        });
    });

    describe('getCreatorSameAsLinks', () => {
        it('returns empty array when user is null or undefined', () => {
            expect(getCreatorSameAsLinks(null)).toEqual([]);
            expect(getCreatorSameAsLinks(undefined)).toEqual([]);
        });

        it('returns all populated social and website links', () => {
            const user = {
                websiteUrl: 'https://pastrychef.com',
                instagram: 'alice_pastry',
                twitter: 'alice_pastry',
                youtube: 'alice_pastry',
                tiktok: 'alice_pastry',
            };

            const links = getCreatorSameAsLinks(user);
            expect(links).toEqual([
                'https://pastrychef.com',
                'https://instagram.com/alice_pastry',
                'https://x.com/alice_pastry',
                'https://youtube.com/@alice_pastry',
                'https://tiktok.com/@alice_pastry',
            ]);
        });

        it('omits empty or dangerous links', () => {
            const user = {
                websiteUrl: 'javascript:alert(1)',
                instagram: 'alice_pastry',
                twitter: null,
                youtube: undefined,
                tiktok: '',
            };

            const links = getCreatorSameAsLinks(user);
            expect(links).toEqual(['https://instagram.com/alice_pastry']);
        });
    });

    describe('getProfilePreferences', () => {
        it('returns default preferences when user is null or undefined', () => {
            expect(getProfilePreferences(null)).toEqual(
                DEFAULT_PROFILE_PREFERENCES
            );
            expect(getProfilePreferences(undefined)).toEqual({
                showStats: true,
                showActivityGraph: false,
                showArticles: false,
            });
        });

        it('returns default preferences when user.profilePreferences is missing', () => {
            const user = { id: 'user-1' } as any;
            expect(getProfilePreferences(user)).toEqual({
                showStats: true,
                showActivityGraph: false,
                showArticles: false,
            });
        });

        it('returns saved preferences with fallbacks for partial configs', () => {
            const user = {
                id: 'user-1',
                profilePreferences: {
                    showStats: false,
                },
            } as any;

            expect(getProfilePreferences(user)).toEqual({
                showStats: false,
                showActivityGraph: false,
                showArticles: false,
            });
        });
    });
});
