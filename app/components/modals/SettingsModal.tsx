'use client';

import useSettingsModal from "@/app/hooks/useSettingsModal";
import Modal from "./Modal";
import Heading from "../Heading";
import ThemeSelector from "../ThemeSelector";
import LanguageSelector from "../LanguageSelector";
import { useTranslation } from 'react-i18next';


const SettingsModal = () => {
    const settingsModal = useSettingsModal();
  const { t } = useTranslation();

    const bodyContent = (
        <div className="flex flex-col gap-4">
          <Heading
            title="Set your preferences"
          />
          <ThemeSelector/>
          <h1>{t('greeting')}</h1>
          <LanguageSelector/>
        </div>
      )
    
    return (
        <Modal
          isOpen={settingsModal.isOpen}
          title="Settings"
          actionLabel="Save"
          onClose={settingsModal.onClose}
          onSubmit={settingsModal.onClose}
          body={bodyContent}
          footer={<div></div>}
        />
      );
}

export default SettingsModal