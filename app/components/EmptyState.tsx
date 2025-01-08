'use client';

import { useRouter } from 'next/navigation';

import Button from '@/app/components/Button';
import Heading from '@/app/components/Heading';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
    title?: string;
    subtitle?: string;
    showReset?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No exact matches',
    subtitle = 'Try changing or removing some of your filters.',
    showReset,
}) => {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
            <Heading
                center
                title={String(t(title.toLowerCase().replace(/ /g, '_')))}
                subtitle={String(t(subtitle.toLowerCase().replace(/ /g, '_')))}
            />
            <div className="mt-4 w-48">
                {showReset && (
                    <Button
                        outline
                        label={t('remove_all_filters')}
                        onClick={() => router.push('/')}
                    />
                )}
            </div>
        </div>
    );
};

export default EmptyState;
