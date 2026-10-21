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

const ProfileBacklinks: React.FC<ProfileBacklinksProps> = ({
    bio,
    websiteUrl,
    instagram,
    twitter,
    youtube,
    tiktok,
}) => {
    const { t } = useTranslation();

    const hasBio = Boolean(bio);
    const hasWebsite = Boolean(websiteUrl);
    const hasSocials = Boolean(instagram || twitter || youtube || tiktok);

    if (!hasBio && !hasWebsite && !hasSocials) {
        return null;
    }

    return (
        <div className="mt-1 px-2 pb-2">
            {hasBio && (
                <p
                    className="max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-300"
                    data-testid="profile-bio"
                >
                    {bio}
                </p>
            )}
            {(hasWebsite || hasSocials) && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    {websiteUrl && (
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
                    )}
                    {instagram && (
                        <a
                            href={getSocialLink('instagram', instagram)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-neutral-500 transition hover:text-pink-600 dark:text-neutral-400 dark:hover:text-pink-400"
                            aria-label="Instagram"
                            data-testid="profile-instagram-link"
                        >
                            <FaInstagram className="size-5" />
                        </a>
                    )}
                    {twitter && (
                        <a
                            href={getSocialLink('twitter', twitter)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                            aria-label="X / Twitter"
                            data-testid="profile-twitter-link"
                        >
                            <FaTwitter className="size-5" />
                        </a>
                    )}
                    {youtube && (
                        <a
                            href={getSocialLink('youtube', youtube)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-neutral-500 transition hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
                            aria-label="YouTube"
                            data-testid="profile-youtube-link"
                        >
                            <FaYoutube className="size-5" />
                        </a>
                    )}
                    {tiktok && (
                        <a
                            href={getSocialLink('tiktok', tiktok)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                            aria-label="TikTok"
                            data-testid="profile-tiktok-link"
                        >
                            <FaTiktok className="size-5" />
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileBacklinks;
