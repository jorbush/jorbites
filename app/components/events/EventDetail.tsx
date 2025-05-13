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
import Link from 'next/link';
import { Components } from 'react-markdown';

interface EventDetailProps {
    event: Event;
}

const EventDetail: React.FC<EventDetailProps> = ({ event }) => {
    const { t } = useTranslation();
    const router = useRouter();

    // Don't process dates for permanent events
    const isPermanent = event.frontmatter.permanent === true;

    let dateDisplay;
    if (!isPermanent) {
        const startDate = new Date(event.frontmatter.date);
        const endDate = new Date(event.frontmatter.endDate);
        const isSameDay = startDate.toDateString() === endDate.toDateString();

        if (isSameDay) {
            dateDisplay = format(startDate, 'PPP');
        } else {
            dateDisplay = `${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`;
        }
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

    const markdownComponents: Components = {
        h1: (props) => (
            <h1
                className="mt-6 mb-4 text-3xl font-bold"
                {...props}
            />
        ),
        h2: (props) => (
            <h2
                className="mt-5 mb-3 text-2xl font-bold"
                {...props}
            />
        ),
        h3: (props) => (
            <h3
                className="mt-4 mb-2 text-xl font-bold"
                {...props}
            />
        ),
        p: (props) => (
            <p
                className="mb-4"
                {...props}
            />
        ),
        a: ({ href, ...props }) => (
            <Link
                href={href || '#'}
                className="text-green-450 hover:underline"
                {...props}
            />
        ),
        ul: (props) => (
            <ul
                className="mb-4 ml-6 list-disc"
                {...props}
            />
        ),
        ol: (props) => (
            <ol
                className="mb-4 ml-6 list-decimal"
                {...props}
            />
        ),
        li: (props) => (
            <li
                className="mb-1"
                {...props}
            />
        ),
        strong: (props) => (
            <strong
                className="font-bold"
                {...props}
            />
        ),
        em: (props) => (
            <em
                className="italic"
                {...props}
            />
        ),
    };

    return (
        <div className="mx-auto max-w-[800px] px-4 py-6 dark:text-neutral-100">
            <div className="mb-6 flex items-baseline justify-between">
                <Link
                    href="/events"
                    className="mr-4 flex translate-y-3 items-center space-x-2 text-gray-600 focus:outline-hidden md:translate-y-0 dark:text-neutral-100"
                    onClick={(e) => {
                        e.preventDefault();
                        // Force a focus update before navigating back
                        document.getElementById('main-content')?.focus();
                        // Small delay to ensure the focus is processed
                        setTimeout(() => {
                            router.back();
                        }, 10);
                    }}
                >
                    <FiChevronLeft className="text-xl" />
                </Link>
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

            <div className="mb-6 w-full overflow-hidden rounded-xl">
                <Image
                    src={event.frontmatter.image || '/jorbites-social.jpg'}
                    alt={event.frontmatter.title}
                    width={800}
                    height={600}
                    className="w-full object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                    priority
                />
            </div>

            {!isPermanent && dateDisplay && (
                <div className="mb-6 flex items-center text-neutral-500 dark:text-neutral-400">
                    <FiCalendar className="mr-2 text-lg" />
                    <span>{dateDisplay}</span>
                </div>
            )}

            <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown components={markdownComponents}>
                    {event.content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export const EventDetailSkeleton = () => {
    return (
        <div className="mx-auto max-w-[800px] px-4 py-6">
            <div className="mb-6 flex items-baseline justify-between">
                <div className="h-6 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="mx-auto h-8 w-2/3 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-6 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            </div>

            <div className="mb-6 w-full animate-pulse overflow-hidden rounded-xl">
                <div className="aspect-[4/3] w-full bg-neutral-200 dark:bg-neutral-700"></div>
            </div>

            <div className="mb-6 flex items-center">
                <div className="mr-2 h-4 w-4 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            </div>

            <div className="space-y-4">
                <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
        </div>
    );
};

export default EventDetail;
