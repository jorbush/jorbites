'use client';

import Image from 'next/image';

interface AvatarProps {
    src: string | null | undefined;
    size?: number;
    props?: string;
    onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ src, size = 30, props, onClick }) => {
    return (
        <Image
            className={`rounded-full ${onClick ? 'cursor-pointer' : ''} ${props}`}
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
