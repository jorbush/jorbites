/**
 * Profile and creator utility functions for normalizing, validating, and formatting
 * creator social handles, website URLs, and backlinks.
 */

import type { ProfilePreferences, SafeUser } from '@/app/types';

export interface NormalizedResult<T> {
    value?: T;
    error?: string;
}

/**
 * Normalizes a social media handle or profile URL for storage.
 * Extracts the handle from URLs, strips leading '@', removes query/hash parameters
 * and trailing slashes, and validates that the handle contains only allowed characters ([a-zA-Z0-9._-]).
 *
 * @param input - The handle or URL string
 * @param platform - Platform name for error reporting (e.g. 'Instagram', 'X/Twitter', 'YouTube', 'TikTok')
 * @returns Object with normalized handle or validation error message
 */
export function normalizeSocialHandle(
    input: unknown,
    platform: string = 'Social'
): {
    handle?: string | null;
    error?: string;
} {
    if (input === undefined) return { handle: undefined };
    if (input === null) return { handle: null };
    if (typeof input !== 'string') {
        return { error: `${platform} handle must be a string` };
    }
    let trimmed = input.trim();
    if (!trimmed) return { handle: null };

    // Strip query or fragment params
    trimmed = trimmed.split(/[?#]/)[0];

    // Remove trailing slashes
    trimmed = trimmed.replace(/\/+$/, '');

    // If it's a full URL, extract the path segment / handle
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        try {
            const parsed = new URL(trimmed);
            const pathParts = parsed.pathname.split('/').filter(Boolean);
            if (pathParts.length > 0) {
                trimmed = pathParts[pathParts.length - 1];
            }
        } catch {
            // Keep trimmed as is if URL parsing fails
        }
    }

    // Strip leading @
    trimmed = trimmed.replace(/^@+/, '');

    if (!trimmed) return { handle: null };

    // Validate characters (alphanumeric, dots, underscores, dashes)
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
        return { error: `Invalid ${platform} handle format` };
    }

    return { handle: trimmed.slice(0, 100) };
}

/**
 * Normalizes and validates a personal website or blog URL for storage.
 * Ensures the URL uses http or https, disallows dangerous schemes,
 * and defaults to https:// if scheme is omitted.
 *
 * @param input - The URL string
 * @returns Object with normalized URL or error message
 */
export function normalizeWebsiteUrl(input: unknown): {
    url?: string | null;
    error?: string;
} {
    if (input === undefined) return { url: undefined };
    if (input === null) return { url: null };
    if (typeof input !== 'string') {
        return { error: 'Website URL must be a string' };
    }
    const trimmed = input.trim();
    if (!trimmed) return { url: null };

    // Disallow dangerous schemes
    if (/^(javascript|data|vbscript):/i.test(trimmed)) {
        return { error: 'Invalid website URL' };
    }

    let urlToTest = trimmed;
    // If an explicit protocol is present, it must be http or https
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(urlToTest)) {
        if (!/^https?:\/\//i.test(urlToTest)) {
            return { error: 'Website URL must use http or https' };
        }
    } else {
        urlToTest = `https://${urlToTest}`;
    }

    try {
        const parsed = new URL(urlToTest);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return { error: 'Website URL must use http or https' };
        }
        return { url: urlToTest };
    } catch {
        return { error: 'Invalid website URL format' };
    }
}

/**
 * Formats an external website URL for safe client-side links.
 * Disallows dangerous schemes (returning '#') and ensures https:// prefix.
 */
export const formatExternalUrl = (url?: string | null): string => {
    if (!url) return '';
    const trimmed = url.trim();
    if (/^(javascript|data|vbscript):/i.test(trimmed)) {
        return '#';
    }
    if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
    }
    return trimmed;
};

/**
 * Formats a website URL into a clean domain name for display (e.g. "myblog.com").
 */
export const formatDomainDisplay = (url?: string | null): string => {
    if (!url) return '';
    try {
        const fullUrl = formatExternalUrl(url);
        const parsed = new URL(fullUrl);
        return parsed.hostname.replace(/^www\./, '');
    } catch {
        return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    }
};

/**
 * Generates an outbound social URL from a handle or existing URL.
 */
export const getSocialLink = (
    platform: 'instagram' | 'twitter' | 'youtube' | 'tiktok',
    handleOrUrl?: string | null
): string => {
    if (!handleOrUrl) return '';
    const trimmed = handleOrUrl.trim();
    if (!trimmed) return '';

    const cleanHandle = trimmed.replace(/^@/, '');

    switch (platform) {
        case 'instagram':
            return `https://instagram.com/${cleanHandle}`;
        case 'twitter':
            return `https://x.com/${cleanHandle}`;
        case 'youtube':
            if (
                /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(trimmed)
            ) {
                return trimmed;
            }
            return `https://youtube.com/@${cleanHandle}`;
        case 'tiktok':
            return `https://tiktok.com/@${cleanHandle}`;
        default:
            return '';
    }
};

/**
 * Generates an array of structured data sameAs URLs for a creator user.
 */
export const getCreatorSameAsLinks = (
    user?: {
        websiteUrl?: string | null;
        instagram?: string | null;
        twitter?: string | null;
        youtube?: string | null;
        tiktok?: string | null;
    } | null
): string[] => {
    if (!user) return [];

    const links: string[] = [];

    if (user.websiteUrl) {
        const formattedWebsite = formatExternalUrl(user.websiteUrl);
        if (formattedWebsite && formattedWebsite !== '#') {
            links.push(formattedWebsite);
        }
    }
    if (user.instagram) {
        links.push(getSocialLink('instagram', user.instagram));
    }
    if (user.twitter) {
        links.push(getSocialLink('twitter', user.twitter));
    }
    if (user.youtube) {
        links.push(getSocialLink('youtube', user.youtube));
    }
    if (user.tiktok) {
        links.push(getSocialLink('tiktok', user.tiktok));
    }

    return links.filter(Boolean);
};

export const DEFAULT_PROFILE_PREFERENCES: Required<ProfilePreferences> = {
    showStats: true,
    showActivityGraph: true,
    showArticles: true,
};

export const getProfilePreferences = (
    user?: SafeUser | null
): Required<ProfilePreferences> => {
    return {
        showStats: user?.profilePreferences?.showStats ?? true,
        showActivityGraph: user?.profilePreferences?.showActivityGraph ?? true,
        showArticles: user?.profilePreferences?.showArticles ?? true,
    };
};
