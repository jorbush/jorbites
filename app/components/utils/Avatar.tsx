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
                className={extraClasses || ''}
                width={size * 2}
                height={size * 2}
                alt="Avatar"
                src={src || '/images/placeholder.webp'}
                quality={quality}
                circular={true}
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
