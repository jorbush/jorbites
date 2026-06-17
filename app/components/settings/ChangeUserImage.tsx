'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useState, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CldUploadWidget } from 'next-cloudinary';
import { FaRegSave } from 'react-icons/fa';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';

interface ChangeUserImageProps {
    currentUser?: SafeUser | null;
    ref?: React.Ref<ChangeUserImageRef>;
}

export interface ChangeUserImageRef {
    save: () => void;
}

const ChangeUserImageSelector = ({
    currentUser,
    ref,
}: ChangeUserImageProps) => {
    const { refresh } = useRouter() || {};
    const { t } = useTranslation();
    const [newImage, setNewImage] = useState(currentUser?.image);
    const [canSave, setCanSave] = useState(false);

    const updateUserProfile = useCallback(() => {
        axios
            .put(`/api/userImage/${currentUser?.id}`, {
                userImage: newImage,
            })
            .then(() => {
                toast.success(t('image_updated'));
            })
            .catch(() => {
                toast.error(t('something_went_wrong'));
            })
            .finally(() => {
                setCanSave(false);
                refresh();
            });
    }, [currentUser?.id, newImage, refresh, t]);

    const handleUpload = useCallback((result: any) => {
        setNewImage(result.info.secure_url);
        setCanSave(true);
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            save: () => {
                if (canSave) {
                    updateUserProfile();
                }
            },
        }),
        [canSave, updateUserProfile]
    );

    return (
        <div className="flex items-center">
            <div className="flex-1">
                <p className="text-left">{t('update_user_image')}</p>
            </div>
            <div className="flex items-center">
                <CldUploadWidget
                    onSuccess={handleUpload}
                    uploadPreset={
                        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                    }
                    options={{
                        maxFiles: 1,
                    }}
                >
                    {({ open }) => {
                        return (
                            <>
                                {
                                    <div className="flex flex-row">
                                        <button
                                            type="button"
                                            className="cursor-pointer border-0 bg-transparent p-0 focus:outline-hidden"
                                            onClick={() => open?.()}
                                        >
                                            <CustomProxyImage
                                                src={
                                                    newImage ||
                                                    '/images/placeholder.webp'
                                                }
                                                alt="Upload"
                                                width={60}
                                                height={60}
                                                circular
                                                quality="auto:good"
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </button>

                                        {canSave && (
                                            <FaRegSave
                                                data-testid="save-icon"
                                                className="text-green-450 mt-1 ml-2 size-5"
                                                onClick={updateUserProfile}
                                            />
                                        )}
                                    </div>
                                }
                            </>
                        );
                    }}
                </CldUploadWidget>
            </div>
        </div>
    );
};

export default ChangeUserImageSelector;
