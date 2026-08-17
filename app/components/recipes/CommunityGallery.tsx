'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeComment } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import StarRating from '@/app/components/utils/StarRating';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import PhotoLightbox from '@/app/components/modals/PhotoLightbox';
import useIsMounted from '@/app/hooks/useIsMounted';

const DEFAULT_COMMENTS: SafeComment[] = [];

interface CommunityGalleryProps {
    comments?: SafeComment[];
}

const CommunityGallery: React.FC<CommunityGalleryProps> = ({
    comments = DEFAULT_COMMENTS,
}) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const mounted = useIsMounted();
    const { t } = useTranslation();

    const remakes = useMemo(
        () =>
            comments.filter(
                (comment) =>
                    Boolean(comment.imageSrc) && (comment.isCooked || true)
            ),
        [comments]
    );

    if (remakes.length === 0) {
        return null;
    }

    return (
        <div
            className="flex flex-col pr-2 pl-2"
            data-testid="community-gallery"
            data-cy="community-gallery"
        >
            <hr />
            <div className="mt-8 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {mounted
                            ? String(
                                  t('community_remakes') &&
                                      t('community_remakes') !==
                                          'community_remakes'
                                      ? t('community_remakes')
                                      : 'Community Remakes 🥑'
                              )
                            : 'Community Remakes 🥑'}
                    </h3>
                    <span className="text-md ml-2 text-neutral-500">
                        {remakes.length}
                    </span>
                </div>
            </div>

            <div className="scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 flex gap-x-4 overflow-x-auto pt-1 pb-4">
                {remakes.map((remake) => (
                    <div
                        key={remake.id}
                        className="group relative flex shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                        style={{ width: '220px' }}
                        data-testid={`remake-card-${remake.id}`}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedImage(remake.imageSrc!)}
                            className="relative h-40 w-full cursor-pointer overflow-hidden focus:outline-hidden"
                        >
                            <CustomProxyImage
                                src={remake.imageSrc!}
                                alt={`Remake by ${remake.user.name}`}
                                width={220}
                                height={160}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="bg-green-450 absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-green-950 shadow-xs">
                                🥑{' '}
                                {mounted
                                    ? String(
                                          t('cooked_short') &&
                                              t('cooked_short') !==
                                                  'cooked_short'
                                              ? t('cooked_short')
                                              : 'Cooked'
                                      )
                                    : 'Cooked'}
                            </div>
                        </button>

                        <div className="flex flex-col p-3">
                            <div className="flex items-center gap-2">
                                <Avatar
                                    src={remake.user.image}
                                    quality="auto:eco"
                                />
                                <span className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                    {remake.user.name}
                                </span>
                            </div>

                            {remake.rating ? (
                                <div className="mt-2 flex items-center">
                                    <StarRating
                                        rating={remake.rating}
                                        size={12}
                                    />
                                </div>
                            ) : null}

                            <p className="mt-1 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
                                {remake.comment}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <PhotoLightbox
                src={selectedImage}
                alt="Community remake full size"
                isOpen={Boolean(selectedImage)}
                onClose={() => setSelectedImage(null)}
                testId="gallery-lightbox"
            />
        </div>
    );
};

export default CommunityGallery;
