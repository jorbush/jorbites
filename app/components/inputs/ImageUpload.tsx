'use client';

import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { useCallback } from 'react';
import { TbPhotoPlus } from 'react-icons/tb';

/* eslint-disable unused-imports/no-unused-vars */
interface ImageUploadProps {
    onChange: (value: string) => void;
    value: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    onChange,
    value,
}) => {
    const handleUpload = useCallback(
        (result: any) => {
            onChange(result.info.secure_url);
        },
        [onChange]
    );

    return (
        <CldUploadWidget
            onUpload={handleUpload}
            uploadPreset={
                process.env
                    .NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
            }
            options={{
                maxFiles: 1,
            }}
        >
            {({ open }) => {
                return (
                    <div
                        onClick={() => open?.()}
                        className="h-50 relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-neutral-300 p-20 text-neutral-600 transition hover:opacity-70"
                    >
                        <TbPhotoPlus
                            size={50}
                            data-testid="TbPhotoPlus"
                        />
                        {value && (
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
                        )}
                    </div>
                );
            }}
        </CldUploadWidget>
    );
};

export default ImageUpload;
