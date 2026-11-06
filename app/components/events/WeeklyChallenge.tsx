'use client';

import { useTranslation } from 'react-i18next';
import { FiAward } from 'react-icons/fi';
import { IoTimeOutline } from 'react-icons/io5';
import { SafeWeeklyChallenge } from '@/app/types';
import Link from 'next/link';
import { formatDateLanguage } from '@/app/utils/date-utils';

interface WeeklyChallengeProps {
    challenge: SafeWeeklyChallenge | null;
}

const WeeklyChallenge: React.FC<WeeklyChallengeProps> = ({ challenge }) => {
    const { t, i18n } = useTranslation();

    if (!challenge) return null;

    return (
        <Link
            href="/events/challenge_of_the_week"
            className="block"
        >
            <div className="mb-10 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-colors duration-200 hover:border-neutral-300 sm:p-6 dark:border-neutral-800 dark:bg-neutral-800/90 dark:hover:border-neutral-700">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 sm:size-11 dark:bg-neutral-800 dark:text-neutral-300">
                            <FiAward className="size-5" />
                        </div>
                        <span className="border-green-450/30 bg-green-450/15 dark:text-green-450 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold text-neutral-800">
                            {t('weekly_challenge')}
                        </span>
                    </div>
                </div>
                <h3 className="mb-2 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
                    {t(`challenge_${challenge.type}`)}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-300">
                    {t(`challenge_description_${challenge.type}`, {
                        [challenge.type]: t(
                            `challenge_value_${challenge.type}_${challenge.value.toLowerCase().replace(/\s+/g, '_')}`
                        ),
                    })}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <IoTimeOutline className="size-3.5" />
                    <span>
                        {t('challenge_ends')}:{' '}
                        {formatDateLanguage(
                            new Date(challenge.endDate),
                            'PPP',
                            i18n.language
                        )}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default WeeklyChallenge;
