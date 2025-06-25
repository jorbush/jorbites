'use client';

import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';

interface AvatarProps {
    src: string | null | undefined;
    size?: number;
    extraClasses?: string;
    onClick?: () => void;
    quality?: 'auto:eco' | 'auto:good' | 'auto:best';
}

const Avatar: React.FC<AvatarProps> = ({
    src,
    size = 30,
    extraClasses,
    onClick,
    quality = 'auto:good',
}) => {
    return (
        <div
            className={`inline-block ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <CustomProxyImage
                className={`rounded-full ${extraClasses || ''}`}
                width={size * 2}
                height={size * 2}
                alt="Avatar"
                src={src || '/images/placeholder.webp'}
                removeBackground={true}
                quality={quality}
                style={{
                    width: extraClasses ? undefined : size,
                    height: extraClasses ? undefined : size,
                    objectFit: 'cover',
                }}
            />
        </div>
    );
};

export default Avatar;
