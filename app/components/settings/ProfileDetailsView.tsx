import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import {
    FaInstagram,
    FaTwitter,
    FaYoutube,
    FaTiktok,
    FaGlobe,
} from 'react-icons/fa';

interface ProfileDetailsViewProps {
    currentUser?: SafeUser | null;
}

const ProfileDetailsView: React.FC<ProfileDetailsViewProps> = ({
    currentUser,
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
            {currentUser?.bio ? (
                <p className="line-clamp-2 italic">"{currentUser.bio}"</p>
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
                            {currentUser.websiteUrl.replace(/^https?:\/\//, '')}
                        </span>
                    </span>
                )}
                {currentUser?.instagram && (
                    <span className="flex items-center gap-1">
                        <FaInstagram className="size-3 text-pink-500" />
                        <span>@{currentUser.instagram.replace(/^@/, '')}</span>
                    </span>
                )}
                {currentUser?.twitter && (
                    <span className="flex items-center gap-1">
                        <FaTwitter className="size-3 text-blue-400" />
                        <span>@{currentUser.twitter.replace(/^@/, '')}</span>
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
                        <span>@{currentUser.tiktok.replace(/^@/, '')}</span>
                    </span>
                )}
            </div>
        </div>
    );
};

export default ProfileDetailsView;
