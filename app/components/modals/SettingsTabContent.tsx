'use client';

import React from 'react';
import ThemeSelector from '@/app/components/settings/ThemeSelector';
import LanguageSelector from '@/app/components/settings/LanguageSelector';
import EmailNotificationsSelector from '@/app/components/settings/EmailNotificationsSelector';
import PushNotificationManager from '@/app/components/settings/PushNotificationManager';
import ChangeUserImageSelector, {
    ChangeUserImageRef,
} from '@/app/components/settings/ChangeUserImage';
import ChangeUserNameSelector, {
    ChangeUserNameRef,
} from '@/app/components/settings/ChangeUserName';
import ChangePassword, {
    ChangePasswordRef,
} from '@/app/components/settings/ChangePassword';
import DeleteAccount from '@/app/components/settings/DeleteAccount';
import { SafeUser } from '@/app/types';

interface SettingsTabContentProps {
    activeTab: string;
    currentUser?: SafeUser | null;
    userImageRef: React.RefObject<ChangeUserImageRef | null>;
    userNameRef: React.RefObject<ChangeUserNameRef | null>;
    passwordRef: React.RefObject<ChangePasswordRef | null>;
}

const SettingsTabContent: React.FC<SettingsTabContentProps> = ({
    activeTab,
    currentUser,
    userImageRef,
    userNameRef,
    passwordRef,
}) => {
    switch (activeTab) {
        case 'preferences':
            return (
                <div
                    className="flex flex-col gap-4 pb-32"
                    data-cy="preferences-content"
                >
                    <ThemeSelector />
                    <LanguageSelector currentUser={currentUser} />
                </div>
            );
        case 'account':
            return currentUser ? (
                <div className="flex flex-col gap-4">
                    <EmailNotificationsSelector currentUser={currentUser} />
                    <PushNotificationManager />
                    <ChangeUserImageSelector
                        ref={userImageRef}
                        currentUser={currentUser}
                    />
                    <ChangeUserNameSelector
                        ref={userNameRef}
                        currentUser={currentUser}
                    />
                    <ChangePassword
                        ref={passwordRef}
                        currentUser={currentUser}
                    />
                    <DeleteAccount currentUser={currentUser} />
                </div>
            ) : null;
        default:
            return null;
    }
};

export default SettingsTabContent;
