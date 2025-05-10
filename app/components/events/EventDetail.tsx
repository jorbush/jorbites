'use client';

import { Event } from '@/app/utils/markdownUtils';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiShare2, FiCalendar } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import Heading from '@/app/components/navigation/Heading';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

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

    const copyToClipboard = () => {
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL);
        toast.success(t('link_copied'));
    };

    const share = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: event.frontmatter.title,
                    url: window.location.href,
                })
                .then(() => {
                    console.log('Successfully shared');
                })
                .catch((error) => {
                    console.error('Error sharing:', error);
                });
        } else {
            copyToClipboard();
        }
    };

    return (
        <div className="mx-auto max-w-[800px] px-4 py-6 dark:text-neutral-100">
            <div className="mb-6 flex items-baseline justify-between">
                <button
                    className="mr-4 flex translate-y-3 items-center space-x-2 text-gray-600 focus:outline-hidden md:translate-y-0 dark:text-neutral-100"
                    onClick={() => router.back()}
                >
                    <FiChevronLeft className="text-xl" />
                </button>
                <Heading
                    title={event.frontmatter.title}
                    center
                />
                <button
                    className="ml-4 flex translate-y-3 items-center space-x-2 text-gray-600 focus:outline-hidden md:translate-y-0 dark:text-neutral-100"
                    onClick={share}
                    aria-label="Share"
                >
                    <FiShare2 className="text-xl" />
                </button>
            </div>

            <div className="relative mb-6 h-[300px] w-full overflow-hidden rounded-xl">
                <Image
                    src={event.frontmatter.image || '/jorbites-social.jpg'}
                    alt={event.frontmatter.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                />
            </div>

            <div className="mb-6 flex items-center text-neutral-500 dark:text-neutral-400">
                <FiCalendar className="mr-2" />
                <span>{dateDisplay}</span>
            </div>

            <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{event.content}</ReactMarkdown>
            </div>
        </div>
    );
};

export default EventDetail;
