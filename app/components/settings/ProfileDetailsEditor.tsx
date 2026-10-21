import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    FaInstagram,
    FaTwitter,
    FaYoutube,
    FaTiktok,
    FaGlobe,
} from 'react-icons/fa';

interface ProfileDetailsEditorProps {
    bio: string;
    setBio: (bio: string) => void;
    websiteUrl: string;
    setWebsiteUrl: (url: string) => void;
    instagram: string;
    setInstagram: (handle: string) => void;
    twitter: string;
    setTwitter: (handle: string) => void;
    youtube: string;
    setYoutube: (channel: string) => void;
    tiktok: string;
    setTiktok: (handle: string) => void;
    isPending: boolean;
}

const ProfileDetailsEditor: React.FC<ProfileDetailsEditorProps> = ({
    bio,
    setBio,
    websiteUrl,
    setWebsiteUrl,
    instagram,
    setInstagram,
    twitter,
    setTwitter,
    youtube,
    setYoutube,
    tiktok,
    setTiktok,
    isPending,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-3 pt-2 text-sm">
            {/* Bio Field */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <label
                        htmlFor="creator-bio-input"
                        className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                    >
                        {t('creator_bio') || 'Creator Bio'}
                    </label>
                    <span className="text-xs text-neutral-400">
                        {bio.length}/250
                    </span>
                </div>
                <textarea
                    id="creator-bio-input"
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 250))}
                    maxLength={250}
                    rows={3}
                    placeholder={
                        t('bio_placeholder') ||
                        'Tell us about your culinary background, specialties, or food philosophy...'
                    }
                    className="focus:ring-green-450 w-full rounded border border-neutral-300 p-2 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                    data-testid="bio-input"
                    disabled={isPending}
                />
            </div>

            {/* Website URL */}
            <div className="flex flex-col gap-1">
                <label
                    htmlFor="creator-website-input"
                    className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                    <FaGlobe className="text-neutral-400" />
                    <span>{t('website_url') || 'Website / Blog'}</span>
                </label>
                <input
                    id="creator-website-input"
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder={
                        t('website_placeholder') || 'https://myfoodblog.com'
                    }
                    className="focus:ring-green-450 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                    data-testid="website-input"
                    disabled={isPending}
                />
            </div>

            {/* Social Handles Grid */}
            <div className="flex flex-col gap-2 pt-1">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {t('social_profiles') || 'Social Profiles'}
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {/* Instagram */}
                    <div className="flex items-center gap-1.5 rounded border border-neutral-300 px-2 py-1 dark:border-neutral-600 dark:bg-neutral-800">
                        <FaInstagram className="shrink-0 text-pink-500" />
                        <input
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder={
                                t('instagram_placeholder') || 'Instagram handle'
                            }
                            className="focus:ring-green-450 w-full bg-transparent text-xs focus:outline-none dark:text-white"
                            data-testid="instagram-input"
                            disabled={isPending}
                        />
                    </div>

                    {/* X / Twitter */}
                    <div className="flex items-center gap-1.5 rounded border border-neutral-300 px-2 py-1 dark:border-neutral-600 dark:bg-neutral-800">
                        <FaTwitter className="shrink-0 text-blue-400" />
                        <input
                            type="text"
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            placeholder={
                                t('twitter_placeholder') || 'X / Twitter handle'
                            }
                            className="focus:ring-green-450 w-full bg-transparent text-xs focus:outline-none dark:text-white"
                            data-testid="twitter-input"
                            disabled={isPending}
                        />
                    </div>

                    {/* YouTube */}
                    <div className="flex items-center gap-1.5 rounded border border-neutral-300 px-2 py-1 dark:border-neutral-600 dark:bg-neutral-800">
                        <FaYoutube className="shrink-0 text-red-500" />
                        <input
                            type="text"
                            value={youtube}
                            onChange={(e) => setYoutube(e.target.value)}
                            placeholder={
                                t('youtube_placeholder') || 'YouTube channel'
                            }
                            className="focus:ring-green-450 w-full bg-transparent text-xs focus:outline-none dark:text-white"
                            data-testid="youtube-input"
                            disabled={isPending}
                        />
                    </div>

                    {/* TikTok */}
                    <div className="flex items-center gap-1.5 rounded border border-neutral-300 px-2 py-1 dark:border-neutral-600 dark:bg-neutral-800">
                        <FaTiktok className="shrink-0 text-neutral-800 dark:text-white" />
                        <input
                            type="text"
                            value={tiktok}
                            onChange={(e) => setTiktok(e.target.value)}
                            placeholder={
                                t('tiktok_placeholder') || 'TikTok handle'
                            }
                            className="focus:ring-green-450 w-full bg-transparent text-xs focus:outline-none dark:text-white"
                            data-testid="tiktok-input"
                            disabled={isPending}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetailsEditor;
