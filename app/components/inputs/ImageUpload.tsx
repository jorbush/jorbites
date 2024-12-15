'use client';

import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { useCallback } from 'react';
import { TbPhotoPlus } from 'react-icons/tb';
import { AiFillDelete } from 'react-icons/ai';

/* eslint-disable unused-imports/no-unused-vars */
interface ImageUploadProps {
    onChange: (value: string) => void;
    value: string;
    disabled?: boolean;
    canRemove?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    onChange,
    value,
    disabled,
    canRemove = true,
}) => {
    const handleUpload = useCallback(
        (result: any) => {
            onChange(result.info.secure_url);
        },
        [onChange]
    );

    const handleRemove = () => {
        onChange('');
    };

    return (
        <CldUploadWidget
            onSuccess={handleUpload}
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            options={{
                maxFiles: 1,
            }}
        >
            {({ open }) => {
                return (
                    <div
                        onClick={() => {
                            if (!disabled) {
                                open?.();
                            }
                        }}
                        className={`h-50 relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-neutral-300 p-20 text-neutral-600 transition hover:opacity-70 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <TbPhotoPlus
                            size={50}
                            data-testid="TbPhotoPlus"
                        />
                        {value && (
                            <>
                                <div className="absolute inset-0 h-full w-full">
                                    <Image
                                        fill
                                        style={{
                                            objectFit: 'cover',
                                        }}
                                        src={value}
                                        alt="Upload"
                                    />
                                </div>

                                {canRemove && (
                                    <AiFillDelete
                                        data-testid="remove-step-button"
                                        color="#F43F5F"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove();
                                        }}
                                        size={24}
                                        className="absolute right-2 top-2"
                                    />
                                )}
                            </>
                        )}
                    </div>
                );
            }}
        </CldUploadWidget>
    );
};

export default ImageUpload;
