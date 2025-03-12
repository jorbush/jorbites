'use client';

import useSettingsModal from '@/app/hooks/useSettingsModal';
import Modal from '@/app/components/modals/Modal';
import Heading from '@/app/components/Heading';
import ThemeSelector from '@/app/components/settings/ThemeSelector';
import LanguageSelector from '@/app/components/settings/LanguageSelector';
import { useTranslation } from 'react-i18next';
import EmailNotificationsSelector from '@/app/components/settings/EmailNotificationsSelector';
import { SafeUser } from '@/app/types';
import ChangeUserImageSelector from '@/app/components/settings/ChangeUserImage';
import { useCallback, useState } from 'react';

interface SettingsProps {
    currentUser?: SafeUser | null;
}

const SettingsModal: React.FC<SettingsProps> = ({ currentUser }) => {
    const settingsModal = useSettingsModal();
    const { t } = useTranslation();
    const [saveImage, setSaveImage] = useState(false);

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading title={t('set_your_preferences')} />
            <ThemeSelector />
            <LanguageSelector />
            {currentUser && (
                <>
                    <EmailNotificationsSelector currentUser={currentUser} />
                    <ChangeUserImageSelector
                        currentUser={currentUser}
                        saveImage={saveImage}
                        setSaveImage={setSaveImage}
                        onSave={() => settingsModal.onClose()}
                    />
                </>
            )}
        </div>
    );

    const handleSaveClick = useCallback(() => {
        setSaveImage(true);
        if (!currentUser) {
            settingsModal.onClose();
        }
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
        />
    );
};

export default SettingsModal;
