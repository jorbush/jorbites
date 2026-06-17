'use client';

import useSettingsModal from '@/app/hooks/useSettingsModal';
import Modal from '@/app/components/modals/Modal';
import ThemeSelector from '@/app/components/settings/ThemeSelector';
import LanguageSelector from '@/app/components/settings/LanguageSelector';
import { useTranslation } from 'react-i18next';
import EmailNotificationsSelector from '@/app/components/settings/EmailNotificationsSelector';
import PushNotificationManager from '@/app/components/settings/PushNotificationManager';
import { SafeUser } from '@/app/types';
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
import { useCallback, useRef, useState } from 'react';
import { FcSettings } from 'react-icons/fc';
import Tabs, { Tab } from '@/app/components/utils/Tabs';
import { FiSettings, FiUser } from 'react-icons/fi';

interface SettingsProps {
    currentUser?: SafeUser | null;
}

const SettingsModal: React.FC<SettingsProps> = ({ currentUser }) => {
    const settingsModal = useSettingsModal();
    const { t } = useTranslation();
    const userImageRef = useRef<ChangeUserImageRef>(null);
    const userNameRef = useRef<ChangeUserNameRef>(null);
    const passwordRef = useRef<ChangePasswordRef>(null);
    const [activeTab, setActiveTab] = useState('preferences');

    const tabs: Tab[] = [
        {
            id: 'preferences',
            label: t('preferences') || 'Preferences',
            icon: <FiSettings />,
        },
        ...(currentUser
            ? [
                  {
                      id: 'account',
                      label: t('account') || 'Account',
                      icon: <FiUser />,
                  },
              ]
            : []),
    ];

    const renderTabContent = () => {
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

    const bodyContent = (
        <div
            className="flex flex-col gap-6"
            data-cy="settings-modal-content"
        >
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                data-testid="settings-tabs"
                data-cy="settings-tabs"
            />
            <div data-cy="settings-tab-content">{renderTabContent()}</div>
        </div>
    );

    const handleSaveClick = useCallback(() => {
        if (!currentUser) {
            settingsModal.onClose();
            return;
        }
        userImageRef.current?.save();
        userNameRef.current?.save();
        passwordRef.current?.save();

        // Close modal after a short delay to allow components to save
        setTimeout(() => {
            settingsModal.onClose();
        }, 100);
    }, [settingsModal, currentUser]);

    return (
        <Modal
            isOpen={settingsModal.isOpen}
            title={t('settings') ?? 'Settings'}
            actionLabel={t('save')}
            onClose={settingsModal.onClose}
            onSubmit={handleSaveClick}
            body={bodyContent}
            footer={<div></div>}
            icon={FcSettings}
        />
    );
};

export default SettingsModal;
