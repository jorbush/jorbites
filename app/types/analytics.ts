export type AnalyticsEventCategory =
    | 'page'
    | 'feature'
    | 'discovery'
    | 'funnel'
    | 'content';

export type AnalyticsDeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export type AnalyticsPropValue = string | number | boolean;

export type AnalyticsProps = Record<string, AnalyticsPropValue>;

export const ALLOWED_ANALYTICS_CATEGORIES: ReadonlySet<AnalyticsEventCategory> =
    new Set<AnalyticsEventCategory>([
        'page',
        'feature',
        'discovery',
        'funnel',
        'content',
    ]);

export const ALLOWED_ANALYTICS_EVENTS: ReadonlySet<string> = new Set([
    // page
    'page_view',
    // feature
    'cooking_audio_toggle',
    'step_guide_open',
    'ingredient_scaler_used',
    'recipe_book_export',
    'recipe_share',
    'weekly_shopping_list_open',
    'calendar_export',
    'theme_change',
    'language_change',
    'push_permission',
    // discovery
    'search_executed',
    'bite_card_swipe',
    'bite_card_open',
    'weekly_challenge_click',
    // funnel
    'recipe_create_step',
    'collab_draft_step',
    'course_step',
    // content (primarily server-emitted)
    'recipe_published',
    'recipe_forked',
    'cooksnap_created',
    'comment_created',
    'quest_created',
    'quest_completed',
    'workshop_joined',
    'vote_cast',
    'planning_created',
    'list_created',
    'certificate_issued',
]);

export type AnalyticsEventName =
    | 'page_view'
    | 'cooking_audio_toggle'
    | 'step_guide_open'
    | 'ingredient_scaler_used'
    | 'recipe_book_export'
    | 'recipe_share'
    | 'weekly_shopping_list_open'
    | 'calendar_export'
    | 'theme_change'
    | 'language_change'
    | 'push_permission'
    | 'search_executed'
    | 'bite_card_swipe'
    | 'bite_card_open'
    | 'weekly_challenge_click'
    | 'recipe_create_step'
    | 'collab_draft_step'
    | 'course_step'
    | 'recipe_published'
    | 'recipe_forked'
    | 'cooksnap_created'
    | 'comment_created'
    | 'quest_created'
    | 'quest_completed'
    | 'workshop_joined'
    | 'vote_cast'
    | 'planning_created'
    | 'list_created'
    | 'certificate_issued';

export interface ClientAnalyticsInput {
    category: AnalyticsEventCategory;
    name: AnalyticsEventName;
    path?: string;
    locale?: string;
    referrer?: string;
    props?: Record<string, unknown>;
    ts?: string;
}

export interface AnalyticsEventPayload {
    v: 1;
    id: string;
    ts: string;
    category: AnalyticsEventCategory;
    name: AnalyticsEventName;
    path: string;
    locale: string;
    device: AnalyticsDeviceType;
    country: string;
    referrer: string;
    props: AnalyticsProps;
}

export const ANALYTICS_TOPIC =
    process.env.KAFKA_ANALYTICS_TOPIC || 'analytics-events';

const MAX_PROPS_KEYS = 8;
const MAX_PROP_KEY_LEN = 32;
const MAX_PROP_VAL_LEN = 64;
const ALLOWED_LOCALES = new Set(['en', 'es', 'ca']);

const FORBIDDEN_PROP_KEYS = new Set([
    'userid',
    'user_id',
    'email',
    'ip',
    'ipaddress',
    'ip_address',
    'token',
    'password',
    'session',
    'sessionid',
    'session_id',
    'cookie',
    'name',
    'username',
]);

const ROUTE_NORMALIZATION_RULES: Array<[RegExp, string]> = [
    [/^\/recipes\/[^/]+(\/.*)?$/, '/recipes/[id]$1'],
    [/^\/profile\/[^/]+(\/.*)?$/, '/profile/[id]$1'],
    [/^\/quests\/[^/]+(\/.*)?$/, '/quests/[id]$1'],
    [/^\/workshops\/[^/]+(\/.*)?$/, '/workshops/[id]$1'],
    [/^\/plannings\/[^/]+(\/.*)?$/, '/plannings/[id]$1'],
    [/^\/lists\/[^/]+(\/.*)?$/, '/lists/[id]$1'],
    [/^\/certificates\/[^/]+(\/.*)?$/, '/certificates/[id]$1'],
    [/^\/reset-password\/[^/]+(\/.*)?$/, '/reset-password/[token]'],
    [/^\/blog\/[^/]+(\/.*)?$/, '/blog/[slug]'],
    [/^\/events\/[^/]+(\/.*)?$/, '/events/[slug]'],
];

export function normalizeAnalyticsPath(rawPath?: string): string {
    if (!rawPath || typeof rawPath !== 'string') {
        return '/';
    }

    const stripped = rawPath.split('?')[0].split('#')[0].trim();
    if (!stripped.startsWith('/')) {
        return '/';
    }

    const collapsed = stripped.replace(/\/+/g, '/').replace(/\/$/, '') || '/';

    for (const [pattern, replacement] of ROUTE_NORMALIZATION_RULES) {
        if (pattern.test(collapsed)) {
            return collapsed.replace(pattern, replacement).slice(0, 128);
        }
    }

    return collapsed.slice(0, 128);
}

export function normalizeAnalyticsLocale(rawLocale?: string): string {
    if (!rawLocale || typeof rawLocale !== 'string') {
        return 'unknown';
    }
    const base = rawLocale.toLowerCase().split(/[-_]/)[0].trim();
    return ALLOWED_LOCALES.has(base) ? base : 'other';
}

export function extractReferrerHost(rawReferrer?: string): string {
    if (!rawReferrer || typeof rawReferrer !== 'string') {
        return 'direct';
    }
    const trimmed = rawReferrer.trim();
    if (!trimmed) {
        return 'direct';
    }
    try {
        const parsed = new URL(
            trimmed.includes('://') ? trimmed : `https://${trimmed}`
        );
        const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
        if (
            !host ||
            host === 'jorbites.com' ||
            host.endsWith('.jorbites.com')
        ) {
            return 'internal';
        }
        return host.slice(0, 64);
    } catch {
        return 'direct';
    }
}

export function detectCoarseDevice(
    userAgent?: string | null
): AnalyticsDeviceType {
    if (!userAgent) {
        return 'unknown';
    }
    const ua = userAgent.toLowerCase();
    if (/(ipad|tablet|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (
        /(mobi|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop|android.*mobile)/i.test(
            ua
        )
    ) {
        return 'mobile';
    }
    if (/(mozilla|chrome|safari|firefox|edg|opera)/i.test(ua)) {
        return 'desktop';
    }
    return 'unknown';
}

const BOT_UA_PATTERN =
    /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|linkedinbot|headlesschrome|lighthouse|pagespeed|pingdom|uptimerobot|curl|wget|python-requests|go-http-client|axios|node-fetch|playwright|cypress/i;

export function isBotUserAgent(userAgent?: string | null): boolean {
    if (!userAgent) {
        return false;
    }
    return BOT_UA_PATTERN.test(userAgent);
}

export function sanitizeAnalyticsProps(
    rawProps?: Record<string, unknown>
): AnalyticsProps {
    if (!rawProps || typeof rawProps !== 'object' || Array.isArray(rawProps)) {
        return {};
    }

    const sanitized: AnalyticsProps = {};
    let count = 0;

    for (const [rawKey, rawVal] of Object.entries(rawProps)) {
        if (count >= MAX_PROPS_KEYS) {
            break;
        }
        const key = rawKey.trim().slice(0, MAX_PROP_KEY_LEN);
        if (!key || !/^[a-zA-Z0-9_]+$/.test(key)) {
            continue;
        }
        if (FORBIDDEN_PROP_KEYS.has(key.toLowerCase())) {
            continue;
        }

        if (typeof rawVal === 'string') {
            const val = rawVal.trim().slice(0, MAX_PROP_VAL_LEN);
            if (val.length > 0) {
                sanitized[key] = val;
                count += 1;
            }
        } else if (typeof rawVal === 'number' && Number.isFinite(rawVal)) {
            sanitized[key] = rawVal;
            count += 1;
        } else if (typeof rawVal === 'boolean') {
            sanitized[key] = rawVal;
            count += 1;
        }
    }

    return sanitized;
}

export function normalizeCountryCode(rawCountry?: string | null): string {
    if (!rawCountry || typeof rawCountry !== 'string') {
        return 'unknown';
    }
    const clean = rawCountry.trim().toUpperCase();
    return /^[A-Z]{2}$/.test(clean) ? clean : 'unknown';
}
