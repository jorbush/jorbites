'use client';

import React, { useImperativeHandle } from 'react';
import { SafeUser } from '@/app/types';
import ProfileDetailsView from './ProfileDetailsView';
import ProfileDetailsEditor from './ProfileDetailsEditor';
import ChangeProfileDetailsHeader from './ChangeProfileDetailsHeader';
import { useProfileDetailsForm } from './useProfileDetailsForm';

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
    const {
        formState,
        updateField,
        isEditing,
        setIsEditing,
        isDirty,
        isPending,
        handleSave,
        handleCancel,
    } = useProfileDetailsForm(currentUser);

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
            <ChangeProfileDetailsHeader
                isEditing={isEditing}
                isDirty={isDirty}
                isPending={isPending}
                onEdit={() => setIsEditing(true)}
                onSave={handleSave}
                onCancel={handleCancel}
            />

            {isEditing ? (
                <ProfileDetailsEditor
                    bio={formState.bio}
                    setBio={(bio) => updateField('bio', bio)}
                    websiteUrl={formState.websiteUrl}
                    setWebsiteUrl={(websiteUrl) =>
                        updateField('websiteUrl', websiteUrl)
                    }
                    instagram={formState.instagram}
                    setInstagram={(instagram) =>
                        updateField('instagram', instagram)
                    }
                    twitter={formState.twitter}
                    setTwitter={(twitter) => updateField('twitter', twitter)}
                    youtube={formState.youtube}
                    setYoutube={(youtube) => updateField('youtube', youtube)}
                    tiktok={formState.tiktok}
                    setTiktok={(tiktok) => updateField('tiktok', tiktok)}
                    isPending={isPending}
                />
            ) : (
                <ProfileDetailsView currentUser={currentUser} />
            )}
        </div>
    );
};

export default ChangeProfileDetails;
