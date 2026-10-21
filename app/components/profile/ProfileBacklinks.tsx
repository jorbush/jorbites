'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe, FiExternalLink } from 'react-icons/fi';
import { FaInstagram, FaTwitter, FaYoutube, FaTiktok } from 'react-icons/fa';
import {
    formatExternalUrl,
    formatDomainDisplay,
    getSocialLink,
} from '@/app/utils/profile-utils';

interface ProfileBacklinksProps {
    bio?: string | null;
    websiteUrl?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
}

type SocialPlatform = 'instagram' | 'twitter' | 'youtube' | 'tiktok';

interface SocialItemConfig {
    id: SocialPlatform;
    icon: React.ComponentType<{ className?: string }>;
    testId: string;
    label: string;
    hoverClass: string;
}

const SOCIAL_CONFIGS: SocialItemConfig[] = [
    {
        id: 'instagram',
        icon: FaInstagram,
        testId: 'profile-instagram-link',
        label: 'Instagram',
        hoverClass:
            'text-neutral-500 hover:text-pink-600 dark:text-neutral-400 dark:hover:text-pink-400',
    },
    {
        id: 'twitter',
        icon: FaTwitter,
        testId: 'profile-twitter-link',
        label: 'X / Twitter',
        hoverClass:
            'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
    },
    {
        id: 'youtube',
        icon: FaYoutube,
        testId: 'profile-youtube-link',
        label: 'YouTube',
        hoverClass:
            'text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400',
    },
    {
        id: 'tiktok',
        icon: FaTiktok,
        testId: 'profile-tiktok-link',
        label: 'TikTok',
        hoverClass:
            'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
    },
];

const ProfileWebsiteLink: React.FC<{ websiteUrl?: string | null }> = ({
    websiteUrl,
}) => {
    const { t } = useTranslation();
    if (!websiteUrl) return null;

    return (
        <a
            href={formatExternalUrl(websiteUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            data-testid="profile-website-link"
            aria-label={t('visit_website') || 'Visit website'}
        >
            <FiGlobe className="text-green-450 size-3.5" />
            <span className="max-w-[200px] truncate">
                {formatDomainDisplay(websiteUrl)}
            </span>
            <FiExternalLink className="size-3 opacity-60" />
        </a>
    );
};

interface ProfileSocialLinksProps {
    instagram?: string | null;
    twitter?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
}

const ProfileSocialLinks: React.FC<ProfileSocialLinksProps> = (props) => {
    const activeItems = SOCIAL_CONFIGS.filter((item) =>
        Boolean(props[item.id as keyof ProfileSocialLinksProps])
    );

    if (activeItems.length === 0) return null;

    return (
        <>
            {activeItems.map(
                ({ id, icon: Icon, testId, label, hoverClass }) => {
                    const handle =
                        props[id as keyof ProfileSocialLinksProps] || '';
                    return (
                        <a
                            key={id}
                            href={getSocialLink(id, handle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1 transition ${hoverClass}`}
                            aria-label={label}
                            data-testid={testId}
                        >
                            <Icon className="size-5" />
                        </a>
                    );
                }
            )}
        </>
    );
};

const ProfileBacklinks: React.FC<ProfileBacklinksProps> = ({
    bio,
    websiteUrl,
    instagram,
    twitter,
    youtube,
    tiktok,
}) => {
    const hasAnySocial = Boolean(instagram || twitter || youtube || tiktok);
    const hasLinks = Boolean(websiteUrl || hasAnySocial);

    if (!bio && !hasLinks) {
        return null;
    }

    return (
        <div className="mt-1 px-2 pb-2">
            {bio && (
                <p
                    className="max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-300"
                    data-testid="profile-bio"
                >
                    {bio}
                </p>
            )}
            {hasLinks && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <ProfileWebsiteLink websiteUrl={websiteUrl} />
                    <ProfileSocialLinks
                        instagram={instagram}
                        twitter={twitter}
                        youtube={youtube}
                        tiktok={tiktok}
                    />
                </div>
            )}
        </div>
    );
};

export default ProfileBacklinks;
