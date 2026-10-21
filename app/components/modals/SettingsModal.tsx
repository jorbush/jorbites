'use client';

import useSettingsModal from '@/app/hooks/useSettingsModal';
import Modal from '@/app/components/modals/Modal';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import { ChangeUserImageRef } from '@/app/components/settings/ChangeUserImage';
import { ChangeUserNameRef } from '@/app/components/settings/ChangeUserName';
import { ChangePasswordRef } from '@/app/components/settings/ChangePassword';
import { ChangeProfileDetailsRef } from '@/app/components/settings/ChangeProfileDetails';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FcSettings } from 'react-icons/fc';
import Tabs, { Tab } from '@/app/components/utils/Tabs';
import { FiSettings, FiUser } from 'react-icons/fi';
import SettingsTabContent from './SettingsTabContent';

interface SettingsProps {
    currentUser?: SafeUser | null;
}

const SettingsModal: React.FC<SettingsProps> = ({ currentUser }) => {
    const settingsModal = useSettingsModal();
    const { t } = useTranslation();
    const userImageRef = useRef<ChangeUserImageRef>(null);
    const userNameRef = useRef<ChangeUserNameRef>(null);
    const passwordRef = useRef<ChangePasswordRef>(null);
    const profileDetailsRef = useRef<ChangeProfileDetailsRef>(null);
    const [activeTab, setActiveTab] = useState(
        settingsModal.initialTab || 'preferences'
    );

    useEffect(() => {
        if (settingsModal.initialTab) {
            setActiveTab(settingsModal.initialTab);
        }
    }, [settingsModal.initialTab]);

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
            <div data-cy="settings-tab-content">
                <SettingsTabContent
                    activeTab={activeTab}
                    currentUser={currentUser}
                    userImageRef={userImageRef}
                    userNameRef={userNameRef}
                    passwordRef={passwordRef}
                    profileDetailsRef={profileDetailsRef}
                />
            </div>
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
        profileDetailsRef.current?.save();

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
