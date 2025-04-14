// app/components/ErrorDisplay.tsx
'use client';

import { useTranslation } from 'react-i18next';
import Button from '@/app/components/buttons/Button';
import { useRouter } from 'next/navigation';

interface ErrorDisplayProps {
    code: string;
    message: string;
}

export default function ErrorDisplay({ code, message }: ErrorDisplayProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const handleReset = () => {
        router.refresh();
    };

    const getErrorMessage = (message: string, statusCode?: number) => {
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
                return t('error');
        }
    };

    return (
        <div className="flex h-[60vh] flex-col items-center justify-center">
            <h2 className="mb-4 text-center text-2xl font-semibold dark:text-neutral-100">
                {t('something_went_wrong')}
            </h2>
            <p className="mb-4 text-center dark:text-neutral-100">
                {getErrorMessage(message, parseInt(code))}
            </p>
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
