'use client';

import useSettingsModal from '@/app/hooks/useSettingsModal';
import Modal from './Modal';
import Heading from '../Heading';
import ThemeSelector from '../settings/ThemeSelector';
import LanguageSelector from '../settings/LanguageSelector';
import { useTranslation } from 'react-i18next';
import EmailNotificationsSelector from '../settings/EmailNotificationsSelector';
import { SafeUser } from '@/app/types';
import ChangeUserImageSelector from '../settings/ChangeUserImage';
import { useState } from 'react';

interface SettingsProps {
    currentUser?: SafeUser | null;
}

const SettingsModal: React.FC<SettingsProps> = ({
    currentUser,
}) => {
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
                    <EmailNotificationsSelector
                        currentUser={currentUser}
                    />
                    <ChangeUserImageSelector
                        currentUser={currentUser}
                        saveImage={saveImage}
                        setSaveImage={setSaveImage}
                        onSave={() =>
                            settingsModal.onClose()
                        }
                    />
                </>
            )}
        </div>
    );

    const handleSaveClick = () => {
        setSaveImage(true);
    };

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
