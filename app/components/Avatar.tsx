'use client';

import Image from 'next/image';

interface AvatarProps {
    src: string | null | undefined;
    size?: number;
    extraClasses?: string;
    onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ src, size = 30, extraClasses, onClick }) => {
    return (
        <Image
            className={`rounded-full ${onClick ? 'cursor-pointer' : ''} ${extraClasses}`}
            height={size}
            width={size}
            alt="Avatar"
            onClick={onClick}
            src={src || '/images/placeholder.webp'}
            style={{
                objectFit: 'cover',
                aspectRatio: '1/1',
            }}
        />
    );
};

export default Avatar;
