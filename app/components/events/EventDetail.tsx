'use client';

import { Event } from '@/app/utils/markdownUtils';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft, FiShare2, FiCalendar } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Heading from '@/app/components/navigation/Heading';
import Image from 'next/image';
import Link from 'next/link';
import { Components } from 'react-markdown';
import { formatDateRange } from '@/app/utils/date-utils';
import useShare from '@/app/hooks/useShare';
import useIsMounted from '@/app/hooks/useIsMounted';

interface EventDetailProps {
    event: Event;
}

const EventDetail: React.FC<EventDetailProps> = ({ event }) => {
    const { back } = useRouter() || {};
    const { share } = useShare();
    const { i18n, t } = useTranslation();
    const mounted = useIsMounted();

    // Don't process dates for permanent events
    const isPermanent = event.frontmatter.permanent === true;
    const isRecurrent = event.frontmatter.recurrent === true;

    let dateDisplay;
    if (!isPermanent) {
        if (isRecurrent && event.frontmatter.dayOfMonth) {
            dateDisplay = t('each_month', {
                day: event.frontmatter.dayOfMonth,
            });
        } else {
            dateDisplay = formatDateRange(
                event.frontmatter.date,
                event.frontmatter.endDate,
                i18n.language
            );
        }
    }

    const markdownComponents: Components = {
        h1: ({ children, ...props }) => (
            <h1
                className="mt-6 mb-4 text-3xl font-semibold"
                {...props}
            >
                {children}
            </h1>
        ),
        h2: ({ children, ...props }) => (
            <h2
                className="mt-5 mb-3 text-2xl font-semibold"
                {...props}
            >
                {children}
            </h2>
        ),
        h3: ({ children, ...props }) => (
            <h3
                className="mt-4 mb-2 text-xl font-semibold"
                {...props}
            >
                {children}
            </h3>
        ),
        p: (props) => (
            <p
                className="mb-4"
                {...props}
            />
        ),
        a: ({ href, children, ...props }) => (
            <Link
                href={href || '#'}
                className="decoration-green-450 hover:text-green-450 dark:hover:text-green-450 font-medium text-neutral-900 underline decoration-2 underline-offset-4 transition-colors duration-200 dark:text-neutral-100"
                {...props}
            >
                {children}
            </Link>
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
                className="font-semibold"
                {...props}
            />
        ),
        em: (props) => (
            <em
                className="italic"
                {...props}
            />
        ),
        table: ({ children, node: _node, ...props }: any) => (
            <div className="my-6 w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
                <table
                    className="w-full border-collapse text-left text-sm"
                    {...props}
                >
                    {children}
                </table>
            </div>
        ),
        thead: ({ children, node: _node, ...props }: any) => (
            <thead
                className="border-b border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/80"
                {...props}
            >
                {children}
            </thead>
        ),
        th: ({ children, node: _node, ...props }: any) => (
            <th
                className="px-4 py-3 font-semibold whitespace-nowrap text-neutral-800 dark:text-neutral-200"
                {...props}
            >
                {children}
            </th>
        ),
        tbody: ({ children, node: _node, ...props }: any) => (
            <tbody
                className="divide-y divide-neutral-200 dark:divide-neutral-700"
                {...props}
            >
                {children}
            </tbody>
        ),
        tr: ({ children, node: _node, ...props }: any) => (
            <tr
                className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                {...props}
            >
                {children}
            </tr>
        ),
        td: ({ children, node: _node, ...props }: any) => (
            <td
                className="px-4 py-3 whitespace-nowrap text-neutral-700 dark:text-neutral-300"
                {...props}
            >
                {children}
            </td>
        ),
    };

    return (
        <div className="mx-auto max-w-[800px] px-4 py-6 dark:text-neutral-100">
            {/* Header: Back, Title, Share aligned in the same row */}
            <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6 sm:gap-4 sm:px-2">
                <button
                    type="button"
                    className="group inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:text-neutral-900 focus:outline-hidden md:w-auto dark:text-neutral-400 dark:hover:text-white"
                    onClick={() => back()}
                    aria-label="Back"
                    data-cy="back-button"
                >
                    <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 group-hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:border-neutral-600">
                        <FiChevronLeft size={18} />
                    </div>
                    <span className="hidden text-xs font-semibold md:inline">
                        {mounted ? t('back') || 'Back' : 'Back'}
                    </span>
                </button>

                <div className="min-w-0 flex-1">
                    <Heading
                        title={event.frontmatter.title}
                        center
                        dataCy="event-title-display"
                    />
                    {!isPermanent && dateDisplay && (
                        <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                            <FiCalendar
                                size={14}
                                className="shrink-0"
                            />
                            <span>{dateDisplay}</span>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 focus:outline-hidden md:w-auto md:gap-2 md:px-3 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                    onClick={() => share({ title: event.frontmatter.title })}
                    aria-label="Share"
                    data-cy="share-button"
                >
                    <FiShare2 size={16} />
                    <span className="hidden text-xs font-semibold md:inline">
                        {mounted ? t('share') || 'Share' : 'Share'}
                    </span>
                </button>
            </div>

            <div className="relative mb-6 overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-xs dark:border-neutral-800 dark:bg-neutral-800/60">
                <Image
                    src={event.frontmatter.image || '/jorbites-social.jpg'}
                    alt={event.frontmatter.title}
                    width={800}
                    height={600}
                    className="h-auto w-full object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                    priority
                />
            </div>

            <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                >
                    {event.content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export const EventDetailSkeleton = () => {
    return (
        <div className="mx-auto max-w-[800px] px-4 py-6">
            <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6 sm:gap-4 sm:px-2">
                <div className="flex items-center gap-2">
                    <div className="size-9 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="hidden h-4 w-10 animate-pulse rounded bg-neutral-200 md:inline dark:bg-neutral-700"></div>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="mx-auto h-8 w-2/3 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="mx-auto h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-9 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="hidden h-4 w-10 animate-pulse rounded bg-neutral-200 md:inline dark:bg-neutral-700"></div>
                </div>
            </div>

            <div className="mb-6 w-full animate-pulse overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80">
                <div className="aspect-[4/3] w-full bg-neutral-200 dark:bg-neutral-700"></div>
            </div>

            <div className="flex flex-col gap-4">
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
