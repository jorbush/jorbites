'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MdDelete } from 'react-icons/md';
import { SafeCooksnap, SafeUser } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import PhotoLightbox from '@/app/components/modals/PhotoLightbox';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import ScrollableContainer from '@/app/components/utils/ScrollableContainer';
import useIsMounted from '@/app/hooks/useIsMounted';

interface CookedGalleryProps {
    cooksnaps?: SafeCooksnap[];
    currentUser?: SafeUser | null;
    recipeAuthorId?: string;
}

const EMPTY_COOKSNAPS: SafeCooksnap[] = [];

const CookedGallery: React.FC<CookedGalleryProps> = ({
    cooksnaps = EMPTY_COOKSNAPS,
    currentUser,
    recipeAuthorId,
}) => {
    const { push, refresh } = useRouter() || {};
    const { t } = useTranslation();
    const mounted = useIsMounted();
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [cooksnapToDelete, setCooksnapToDelete] = useState<string | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteCooksnap = async () => {
        if (!cooksnapToDelete) return;
        setIsDeleting(true);
        try {
            await axios.delete(`/api/cooksnaps/${cooksnapToDelete}`);
            toast.success(
                mounted
                    ? t('cooksnap_deleted', {
                          defaultValue: 'Cooksnap deleted',
                      })
                    : 'Cooksnap deleted'
            );
            refresh?.();
        } catch {
            toast.error(
                mounted
                    ? t('something_went_wrong', {
                          defaultValue: 'Something went wrong',
                      })
                    : 'Something went wrong'
            );
        } finally {
            setIsDeleting(false);
            setCooksnapToDelete(null);
        }
    };

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
                {cooksnaps.map((item) => {
                    const canDelete =
                        Boolean(currentUser) &&
                        (currentUser?.id === item.userId ||
                            currentUser?.id === recipeAuthorId);

                    return (
                        <div
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                                item.imageSrc && setLightboxSrc(item.imageSrc)
                            }
                            onKeyDown={(e) => {
                                if (
                                    (e.key === 'Enter' || e.key === ' ') &&
                                    item.imageSrc
                                ) {
                                    e.preventDefault();
                                    setLightboxSrc(item.imageSrc);
                                }
                            }}
                            className="group w-40 shrink-0 cursor-pointer text-left focus:outline-hidden"
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
                                {canDelete && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCooksnapToDelete(item.id);
                                        }}
                                        disabled={isDeleting}
                                        aria-label="Delete cooksnap"
                                        className="absolute right-2 bottom-2 z-10 flex size-7 cursor-pointer items-center justify-center rounded-full bg-neutral-900/70 text-white transition hover:bg-rose-500 focus:outline-hidden"
                                        data-testid={`delete-cooksnap-${item.id}`}
                                    >
                                        <MdDelete size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Card Footer / Cook Info */}
                            <div className="mt-2 flex items-center gap-2">
                                {item.user?.id ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.user?.id) {
                                                push(
                                                    '/profile/' + item.user.id
                                                );
                                            }
                                        }}
                                        className="flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left focus:outline-hidden"
                                    >
                                        <Avatar
                                            src={item.user?.image}
                                            size={20}
                                        />
                                        <span className="truncate text-xs font-medium text-neutral-700 hover:underline dark:text-neutral-300">
                                            {item.user?.name || 'Jorbiter'}
                                        </span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Avatar
                                            src={item.user?.image}
                                            size={20}
                                        />
                                        <span className="truncate text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                            {item.user?.name || 'Jorbiter'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {item.comment && (
                                <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    {item.comment}
                                </p>
                            )}
                        </div>
                    );
                })}
            </ScrollableContainer>

            {/* Photo Lightbox */}
            <PhotoLightbox
                src={lightboxSrc}
                alt="Community Cooksnap"
                isOpen={Boolean(lightboxSrc)}
                onClose={() => setLightboxSrc(null)}
            />

            <ConfirmModal
                open={Boolean(cooksnapToDelete)}
                setIsOpen={(open) => !open && setCooksnapToDelete(null)}
                onConfirm={handleDeleteCooksnap}
            />
        </div>
    );
};

export default CookedGallery;
