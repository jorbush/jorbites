'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { HiThumbUp, HiThumbDown } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface EmailNotificationProps {
  currentUser?: SafeUser | null 
}
const EmailNotificationsSelector: React.FC<EmailNotificationProps> = ({
  currentUser
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleButtonClick = () => {
    if (!isDisabled) {
      toggleEmailNotifications();
      setIsDisabled(true);
    }
  };

  useEffect(() => {
    if (isDisabled) {
      const timeout = setTimeout(() => {
        setIsDisabled(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isDisabled]);

  const toggleEmailNotifications = () => {
    setIsLoading(true);
    axios.put(`/api/emailNotifications/${currentUser?.id}`)
    .then(() => {
      toast.success('Email notifications updated!');
    })
    .catch(() => {
      toast.error('Something went wrong.');
    })
    .finally(() => {
      setIsLoading(false);
      router.refresh()
    })
    
  };

  return (
    <div className="flex items-center">
      <div className="flex-1">
        <p className="text-left">{t('enable_email_notifications')}</p>
      </div>
      <div className="flex items-center">
        <button
          disabled={isLoading || isDisabled}
          onClick={handleButtonClick}
          className="relative inline-flex flex-shrink-0 h-6 w-11 rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-0 border border-gray-50"
        >
          <span className="sr-only">Toggle</span>
          <span
            className={`${
              !currentUser?.emailNotifications ? 'translate-x-5' : 'translate-x-0'
            } relative inline-block h-5 w-5 mt-[1.2px] ml-[1.2px] rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
          >
            <span
              className={`${
                !currentUser?.emailNotifications ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'
              } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
              aria-hidden="true"
            >
              <HiThumbUp className="h-3 w-3 text-gray-400" />
            </span>
            <span
              className={`${
                !currentUser?.emailNotifications ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'
              } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
              aria-hidden="true"
            >
              <HiThumbDown className="h-3 w-3 text-gray-400" />
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default EmailNotificationsSelector;
