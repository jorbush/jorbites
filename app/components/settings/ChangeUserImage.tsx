'use client';

import { useRouter } from 'next/navigation';
import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CldUploadWidget } from 'next-cloudinary';
import { FaRegSave } from 'react-icons/fa';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import useSettingsModal from '@/app/hooks/useSettingsModal';

interface ChangeUserImageProps {
    currentUser?: SafeUser | null;
    saveImage: boolean;
    setSaveImage: Dispatch<SetStateAction<boolean>>;
}

const ChangeUserImageSelector: React.FC<ChangeUserImageProps> = ({
    currentUser,
    saveImage,
    setSaveImage,
}) => {
    const router = useRouter();
    const { t } = useTranslation();
    const settingsModal = useSettingsModal();
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
                router.refresh();
            });
    }, [currentUser?.id, newImage, router, t]);

    const handleUpload = useCallback((result: any) => {
        setNewImage(result.info.secure_url);
        setCanSave(true);
    }, []);

    useEffect(() => {
        if (!settingsModal.isOpen) {
            setNewImage(currentUser?.image);
            setCanSave(false);
        }
    }, [settingsModal.isOpen, currentUser?.image]);

    useEffect(() => {
        if (saveImage && canSave) {
            updateUserProfile();
            setSaveImage(false);
        } else if (saveImage) {
            setSaveImage(false);
        }
    }, [saveImage, canSave, setSaveImage, updateUserProfile]);

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
                                        <div
                                            className="cursor-pointer"
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
                                        </div>

                                        {canSave && (
                                            <FaRegSave
                                                data-testid="save-icon"
                                                className="text-green-450 mt-1 ml-2 h-5 w-5"
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
