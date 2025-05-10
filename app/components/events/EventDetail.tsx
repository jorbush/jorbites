'use client';

import { Event } from '@/app/utils/markdownUtils';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { FiChevronLeft } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

interface EventDetailProps {
    event: Event;
}

const EventDetail: React.FC<EventDetailProps> = ({ event }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const startDate = new Date(event.frontmatter.date);
    const endDate = new Date(event.frontmatter.endDate);

    const isSameDay = startDate.toDateString() === endDate.toDateString();

    let dateDisplay;
    if (isSameDay) {
        dateDisplay = format(startDate, 'PPP');
    } else {
        dateDisplay = `${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`;
    }

    return (
        <div className="mx-auto max-w-[800px] px-4 py-6 dark:text-neutral-100">
            <div className="mb-5 flex items-center">
                <button
                    className="flex items-center space-x-2 text-gray-600 focus:outline-hidden dark:text-neutral-100"
                    onClick={() => router.back()}
                >
                    <FiChevronLeft className="text-xl" />
                    <span>{t('back')}</span>
                </button>
            </div>

            <h1 className="mb-4 text-3xl font-bold">
                {event.frontmatter.title}
            </h1>

            <div className="mb-6 flex flex-col gap-2 text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{t('date')}:</span>
                    <span>{dateDisplay}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{t('location')}:</span>
                    <span>{event.frontmatter.location}</span>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{event.content}</ReactMarkdown>
            </div>
        </div>
    );
};

export default EventDetail;
