'use client';

import Image from "next/image";

interface AvatarProps {
    src: string | null | undefined;
    size?: number
}

const Avatar: React.FC<AvatarProps> = ({
    src,
    size = 30
}) => {
    return (
        <Image 
            className="rounded-full"
            height={size}
            width={size}
            alt="Avatar"
            src= {src || "/images/placeholder.jpg"}
            style={{
                objectFit: 'cover',
                aspectRatio: '1/1',
            }}
        />
    );
}

export default Avatar