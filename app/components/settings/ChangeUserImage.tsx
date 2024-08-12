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
import Image from 'next/image';

interface ChangeUserImageProps {
    currentUser?: SafeUser | null;
    saveImage: boolean;
    setSaveImage: Dispatch<SetStateAction<boolean>>;
    onSave: () => void;
}

const ChangeUserImageSelector: React.FC<ChangeUserImageProps> = ({
    currentUser,
    saveImage,
    setSaveImage,
    onSave,
}) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [newImage, setNewImage] = useState(currentUser?.image);
    const [canSave, setCanSave] = useState(false);

    const updateUserProfile = useCallback(() => {
        axios
            .put(`/api/userImage/${currentUser?.id}`, {
                userImage: newImage,
            })
            .then(() => {
                toast.success('Image updated!');
            })
            .catch(() => {
                toast.error('Something went wrong.');
            })
            .finally(() => {
                setCanSave(false);
                router.refresh();
            });
    }, [currentUser?.id, newImage, router]);

    const handleUpload = useCallback((result: any) => {
        setNewImage(result.info.secure_url);
        setCanSave(true);
    }, []);

    useEffect(() => {
        if (saveImage && canSave) {
            updateUserProfile();
            setSaveImage(false);
            onSave();
        } else if (saveImage) {
            setSaveImage(false);
            onSave();
        }
    }, [saveImage, canSave, setSaveImage, onSave, updateUserProfile]);

    return (
        <div className="flex items-center">
            <div className="flex-1">
                <p className="text-left">{t('update_user_image')}</p>
            </div>
            <div className="flex items-center">
                <CldUploadWidget
                    onUpload={handleUpload}
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
                                        <Image
                                            className="rounded-full"
                                            style={{
                                                objectFit: 'cover',
                                                aspectRatio: '1/1',
                                            }}
                                            height="30"
                                            width="30"
                                            alt="Upload"
                                            src={
                                                newImage ||
                                                '/images/placeholder.jpg'
                                            }
                                            onClick={() => open?.()}
                                        />

                                        {canSave && (
                                            <FaRegSave
                                                data-testid="save-icon"
                                                className="ml-2 mt-1 h-5 w-5 text-green-450"
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
