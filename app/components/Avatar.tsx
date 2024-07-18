'use client';

import Image from 'next/image';

interface AvatarProps {
    src: string | null | undefined;
    size?: number;
    onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
    src,
    size = 30,
    onClick,
}) => {
    return (
        <Image
            className={`rounded-full ${onClick ? 'cursor-pointer' : ''}`}
            height={size}
            width={size}
            alt="Avatar"
            onClick={onClick}
            src={src || '/images/placeholder.jpg'}
            style={{
                objectFit: 'cover',
                aspectRatio: '1/1',
            }}
        />
    );
};

export default Avatar;
