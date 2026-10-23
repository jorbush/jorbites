'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafeComment } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import PhotoLightbox from '@/app/components/modals/PhotoLightbox';
import ScrollableContainer from '@/app/components/utils/ScrollableContainer';
import useIsMounted from '@/app/hooks/useIsMounted';

interface CookedGalleryProps {
    comments?: SafeComment[];
}

const CookedGallery: React.FC<CookedGalleryProps> = ({ comments = [] }) => {
    const { push } = useRouter() || {};
    const { t } = useTranslation();
    const mounted = useIsMounted();
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    // Filter comments that are strictly marked as isCooked and have an image
    const cooksnaps = useMemo(() => {
        return comments.filter((c) => Boolean(c.isCooked && c.imageSrc));
    }, [comments]);

    if (cooksnaps.length === 0) {
        return null;
    }

    return (
        <div
            className="flex flex-col pr-2 pl-2"
            data-testid="cooked-gallery"
        >
            <hr />
            <div className="mt-8 mb-4 flex flex-row items-center">
                <div className="text-xl font-semibold dark:text-neutral-100">
                    {mounted
                        ? t('cooked_by_community', {
                              defaultValue: 'Cooked by the Community',
                          })
                        : 'Cooked by the Community'}
                </div>
                <div className="text-md ml-2 text-neutral-500">
                    {cooksnaps.length}
                </div>
            </div>

            <ScrollableContainer className="gap-4">
                {cooksnaps.map((item) => (
                    <div
                        key={item.id}
                        onClick={() =>
                            item.imageSrc && setLightboxSrc(item.imageSrc)
                        }
                        className="group w-40 shrink-0 cursor-pointer"
                        data-testid={`cooksnap-card-${item.id}`}
                    >
                        {/* Dish Photo */}
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            {item.imageSrc && (
                                <CustomProxyImage
                                    src={item.imageSrc}
                                    alt={`Cooksnap by ${item.user?.name || 'cook'}`}
                                    fill
                                    className="object-cover transition group-hover:opacity-90"
                                    quality="auto:good"
                                />
                            )}
                            {item.rating && item.rating > 0 ? (
                                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md bg-neutral-950/70 px-1.5 py-0.5 text-xs font-semibold text-amber-300 backdrop-blur-xs">
                                    <span>★</span>
                                    <span>{item.rating}</span>
                                </div>
                            ) : null}
                        </div>

                        {/* Card Footer / Cook Info */}
                        <div className="mt-2 flex items-center gap-2">
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.user?.id) {
                                        push('/profile/' + item.user.id);
                                    }
                                }}
                                className="cursor-pointer"
                            >
                                <Avatar
                                    src={item.user?.image}
                                    size={20}
                                />
                            </div>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.user?.id) {
                                        push('/profile/' + item.user.id);
                                    }
                                }}
                                className="truncate text-xs font-medium text-neutral-700 hover:underline dark:text-neutral-300"
                            >
                                {item.user?.name || 'Jorbiter'}
                            </span>
                        </div>

                        {item.comment && (
                            <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                                {item.comment}
                            </p>
                        )}
                    </div>
                ))}
            </ScrollableContainer>

            {/* Photo Lightbox */}
            <PhotoLightbox
                src={lightboxSrc}
                alt="Community Cooksnap"
                isOpen={Boolean(lightboxSrc)}
                onClose={() => setLightboxSrc(null)}
            />
        </div>
    );
};

export default CookedGallery;
