'use client';

import { useRouter } from 'next/navigation';
import React, {
    useCallback,
    useState,
    useTransition,
    useImperativeHandle,
} from 'react';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    FaRegSave,
    FaInstagram,
    FaTwitter,
    FaYoutube,
    FaTiktok,
    FaGlobe,
} from 'react-icons/fa';
import { FiEdit3 } from 'react-icons/fi';

export interface ChangeProfileDetailsRef {
    save: () => void;
}

interface ChangeProfileDetailsProps {
    currentUser?: SafeUser | null;
    ref?: React.Ref<ChangeProfileDetailsRef>;
}

const ChangeProfileDetails = ({
    currentUser,
    ref,
}: ChangeProfileDetailsProps) => {
    let router: any = null;
    try {
        router = useRouter();
    } catch {
        // Fallback when rendered outside Next.js Router context
    }
    const refresh = router?.refresh;
    const { t } = useTranslation();

    const [bio, setBio] = useState(currentUser?.bio || '');
    const [websiteUrl, setWebsiteUrl] = useState(currentUser?.websiteUrl || '');
    const [instagram, setInstagram] = useState(currentUser?.instagram || '');
    const [twitter, setTwitter] = useState(currentUser?.twitter || '');
    const [youtube, setYoutube] = useState(currentUser?.youtube || '');
    const [tiktok, setTiktok] = useState(currentUser?.tiktok || '');

    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();

    const isDirty =
        bio !== (currentUser?.bio || '') ||
        websiteUrl !== (currentUser?.websiteUrl || '') ||
        instagram !== (currentUser?.instagram || '') ||
        twitter !== (currentUser?.twitter || '') ||
        youtube !== (currentUser?.youtube || '') ||
        tiktok !== (currentUser?.tiktok || '');

    const handleSave = useCallback(() => {
        if (isPending || !currentUser?.id) return;

        startTransition(async () => {
            try {
                await axios.patch(`/api/user/${currentUser.id}`, {
                    bio,
                    websiteUrl,
                    instagram,
                    twitter,
                    youtube,
                    tiktok,
                });
                toast.success(
                    t('profile_updated') ||
                        'Profile details updated successfully'
                );
                setIsEditing(false);
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.error || t('something_went_wrong');
                toast.error(errorMessage);
            } finally {
                refresh?.();
            }
        });
    }, [
        currentUser?.id,
        bio,
        websiteUrl,
        instagram,
        twitter,
        youtube,
        tiktok,
        isPending,
        refresh,
        t,
    ]);

    const handleCancel = () => {
        setBio(currentUser?.bio || '');
        setWebsiteUrl(currentUser?.websiteUrl || '');
        setInstagram(currentUser?.instagram || '');
        setTwitter(currentUser?.twitter || '');
        setYoutube(currentUser?.youtube || '');
        setTiktok(currentUser?.tiktok || '');
        setIsEditing(false);
    };

    useImperativeHandle(
        ref,
        () => ({
            save: () => {
                if (isDirty) {
                    handleSave();
                }
            },
        }),
        [isDirty, handleSave]
    );

    return (
        <div
            className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
            data-testid="profile-details-section"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                        {t('profile_details') || 'Creator Profile'}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t('profile_details_description') ||
                            'Customize your bio, website, and social links.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            {isDirty && (
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isPending}
                                    className="text-green-450 dark:text-green-450 cursor-pointer transition hover:opacity-70"
                                    title={t('save') || 'Save'}
                                    data-testid="save-profile-details"
                                >
                                    <FaRegSave className="size-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isPending}
                                className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                                data-testid="cancel-profile-details"
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="flex cursor-pointer items-center gap-1 text-xs text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                            data-testid="edit-profile-details"
                        >
                            <FiEdit3 className="size-3.5" />
                            <span>{t('edit') || 'Edit'}</span>
                        </button>
                    )}
                </div>
            </div>

            {isEditing ? (
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
                            onChange={(e) =>
                                setBio(e.target.value.slice(0, 250))
                            }
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
                                t('website_placeholder') ||
                                'https://myfoodblog.com'
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
                                    onChange={(e) =>
                                        setInstagram(e.target.value)
                                    }
                                    placeholder={
                                        t('instagram_placeholder') ||
                                        'Instagram handle'
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
                                        t('twitter_placeholder') ||
                                        'X / Twitter handle'
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
                                        t('youtube_placeholder') ||
                                        'YouTube channel'
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
                                        t('tiktok_placeholder') ||
                                        'TikTok handle'
                                    }
                                    className="focus:ring-green-450 w-full bg-transparent text-xs focus:outline-none dark:text-white"
                                    data-testid="tiktok-input"
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                    {currentUser?.bio ? (
                        <p className="line-clamp-2 italic">
                            "{currentUser.bio}"
                        </p>
                    ) : (
                        <p className="text-neutral-400 italic">
                            {t('no_bio_yet') || 'No creator bio added yet.'}
                        </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-neutral-500 dark:text-neutral-400">
                        {currentUser?.websiteUrl && (
                            <span className="flex items-center gap-1">
                                <FaGlobe className="text-green-450 size-3" />
                                <span className="max-w-[150px] truncate">
                                    {currentUser.websiteUrl.replace(
                                        /^https?:\/\//,
                                        ''
                                    )}
                                </span>
                            </span>
                        )}
                        {currentUser?.instagram && (
                            <span className="flex items-center gap-1">
                                <FaInstagram className="size-3 text-pink-500" />
                                <span>
                                    @{currentUser.instagram.replace(/^@/, '')}
                                </span>
                            </span>
                        )}
                        {currentUser?.twitter && (
                            <span className="flex items-center gap-1">
                                <FaTwitter className="size-3 text-blue-400" />
                                <span>
                                    @{currentUser.twitter.replace(/^@/, '')}
                                </span>
                            </span>
                        )}
                        {currentUser?.youtube && (
                            <span className="flex items-center gap-1">
                                <FaYoutube className="size-3 text-red-500" />
                                <span>{currentUser.youtube}</span>
                            </span>
                        )}
                        {currentUser?.tiktok && (
                            <span className="flex items-center gap-1">
                                <FaTiktok className="size-3" />
                                <span>
                                    @{currentUser.tiktok.replace(/^@/, '')}
                                </span>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangeProfileDetails;
