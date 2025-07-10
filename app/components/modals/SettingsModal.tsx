'use client';

import useSettingsModal from '@/app/hooks/useSettingsModal';
import Modal from '@/app/components/modals/Modal';
import ThemeSelector from '@/app/components/settings/ThemeSelector';
import LanguageSelector from '@/app/components/settings/LanguageSelector';
import { useTranslation } from 'react-i18next';
import EmailNotificationsSelector from '@/app/components/settings/EmailNotificationsSelector';
import { SafeUser } from '@/app/types';
import ChangeUserImageSelector from '@/app/components/settings/ChangeUserImage';
import ChangeUserNameSelector from '@/app/components/settings/ChangeUserName';
import ChangePassword from '@/app/components/settings/ChangePassword';
import DeleteAccount from '@/app/components/settings/DeleteAccount';
import { useCallback, useState } from 'react';
import { FcSettings } from 'react-icons/fc';
import Tabs, { Tab } from '@/app/components/utils/Tabs';
import { FiSettings, FiUser } from 'react-icons/fi';

interface SettingsProps {
    currentUser?: SafeUser | null;
}

const SettingsModal: React.FC<SettingsProps> = ({ currentUser }) => {
    const settingsModal = useSettingsModal();
    const { t } = useTranslation();
    const [saveImage, setSaveImage] = useState(false);
    const [saveUserName, setSaveUserName] = useState(false);
    const [savePassword, setSavePassword] = useState(false);
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
                    <div className="flex flex-col gap-4">
                        <ThemeSelector />
                        <LanguageSelector />
                    </div>
                );
            case 'account':
                return currentUser ? (
                    <div className="flex flex-col gap-4">
                        <EmailNotificationsSelector currentUser={currentUser} />
                        <ChangeUserImageSelector
                            currentUser={currentUser}
                            saveImage={saveImage}
                            setSaveImage={setSaveImage}
                            onSave={() => settingsModal.onClose()}
                        />
                        <ChangeUserNameSelector
                            currentUser={currentUser}
                            saveUserName={saveUserName}
                            setSaveUserName={setSaveUserName}
                            onSave={() => settingsModal.onClose()}
                        />
                        <ChangePassword
                            currentUser={currentUser}
                            savePassword={savePassword}
                            setSavePassword={setSavePassword}
                            onSave={() => settingsModal.onClose()}
                        />
                        <DeleteAccount currentUser={currentUser} />
                    </div>
                ) : null;
            default:
                return null;
        }
    };

    const bodyContent = (
        <div className="flex flex-col gap-6">
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                data-testid="settings-tabs"
            />
            <div>{renderTabContent()}</div>
        </div>
    );

    const handleSaveClick = useCallback(() => {
        if (!currentUser) {
            settingsModal.onClose();
            return;
        }
        setSaveImage(true);
        setSaveUserName(true);
        setSavePassword(true);
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
