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
import { FaRegSave } from 'react-icons/fa';
import { FiEdit3 } from 'react-icons/fi';
import ProfileDetailsView from './ProfileDetailsView';
import ProfileDetailsEditor from './ProfileDetailsEditor';

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
    const router = useRouter();
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
                router.refresh();
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
        router,
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
                <ProfileDetailsEditor
                    bio={bio}
                    setBio={setBio}
                    websiteUrl={websiteUrl}
                    setWebsiteUrl={setWebsiteUrl}
                    instagram={instagram}
                    setInstagram={setInstagram}
                    twitter={twitter}
                    setTwitter={setTwitter}
                    youtube={youtube}
                    setYoutube={setYoutube}
                    tiktok={tiktok}
                    setTiktok={setTiktok}
                    isPending={isPending}
                />
            ) : (
                <ProfileDetailsView currentUser={currentUser} />
            )}
        </div>
    );
};

export default ChangeProfileDetails;
