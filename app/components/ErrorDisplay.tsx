// app/components/ErrorDisplay.tsx
'use client';

import { useTranslation } from 'react-i18next';
import Button from '@/app/components/Button';

interface ErrorDisplayProps {
    code: string;
    message: string;
}

export default function ErrorDisplay({ code, message }: ErrorDisplayProps) {
    const { t } = useTranslation();

    const handleReset = () => {
        window.location.reload();
    };

    const getErrorMessage = (message: string, statusCode?: number ) => {
        if (message.startsWith('You have made too many requests')) {
            return message;
        }

        switch (statusCode) {
            case 429:
                return t('too_many_requests');
            case 404:
                return t('not_found');
            case 403:
                return t('forbidden');
            default:
                return t('something_went_wrong');
        }
    };

    return (
        <div className="flex h-[60vh] flex-col items-center justify-center">
            <h2 className="mb-4 font-semibold text-2xl text-center dark:text-neutral-100">{t('something_went_wrong')}</h2>
            <p className="mb-4 text-center">{getErrorMessage(message, parseInt(code))}</p>
            <div className="mt-4 w-48">
                <Button
                    outline
                    onClick={handleReset}
                    label={t('reload')}
                />
            </div>
        </div>
    );
}
