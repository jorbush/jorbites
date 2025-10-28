'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiAward } from 'react-icons/fi';
import {
    getCurrentChallenge,
    WeeklyChallenge as WeeklyChallengeType,
} from '@/app/actions/weekly-challenge';
import Link from 'next/link';
import { formatDateLanguage } from '@/app/utils/date-utils';

const WeeklyChallenge = () => {
    const { t } = useTranslation();
    const [challenge, setChallenge] = useState<WeeklyChallengeType | null>(
        null
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const data = await getCurrentChallenge();
                setChallenge(data);
            } catch (error) {
                console.error('Error fetching weekly challenge:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenge();
    }, []);

    if (loading) {
        return (
            <div className="dark:bg-dark mb-10 animate-pulse rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700">
                <div className="mb-4 flex items-center">
                    <div className="mr-2 h-7 w-7 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="h-6 w-48 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
                <div className="mb-2 h-5 w-40 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="mb-4 space-y-2">
                    <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
                <div className="h-4 w-52 rounded bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
        );
    }

    if (!challenge) return null;

    return (
        <Link
            href="/events/challenge_of_the_week"
            className="block"
        >
            <div className="dark:bg-dark mb-10 rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-yellow-500 hover:shadow-lg dark:border-neutral-700 dark:hover:border-yellow-500">
                <div className="mb-4 flex items-center">
                    <FiAward className="mr-2 text-2xl text-yellow-500" />
                    <h2 className="text-2xl font-bold dark:text-neutral-100">
                        {t('weekly_challenge')}
                    </h2>
                </div>
                <h3 className="mb-2 text-xl font-semibold dark:text-neutral-100">
                    {t(`challenge_${challenge.type}`)}
                </h3>
                <p className="mb-4 text-neutral-600 dark:text-neutral-400">
                    {t(`challenge_description_${challenge.type}`, {
                        [challenge.type]: t(
                            `challenge_value_${challenge.type}_${challenge.value.toLowerCase().replace(/\s+/g, '_')}`
                        ),
                    })}
                </p>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t('challenge_ends')}:{' '}
                    {formatDateLanguage(new Date(challenge.endDate), 'PPP')}
                </div>
            </div>
        </Link>
    );
};

export default WeeklyChallenge;
