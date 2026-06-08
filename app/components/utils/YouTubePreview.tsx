'use client';

import { useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import Image from 'next/image';

interface YouTubePreviewProps {
    url: string;
    title?: string;
    className?: string;
}

const YouTubePreview: React.FC<YouTubePreviewProps> = ({
    url,
    title = 'YouTube Video',
    className = '',
}) => {
    const [imageError, setImageError] = useState(false);

    const getVideoId = (url: string): string | null => {
        const regex =
            /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const videoId = getVideoId(url);

    if (!videoId) {
        return null;
    }

    const thumbnailUrl = imageError
        ? `https://img.youtube.com/vi/${videoId}/default.jpg`
        : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const openVideo = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openVideo();
        }
    };

    return (
        <button
            type="button"
            className={`relative w-full cursor-pointer overflow-hidden rounded-lg border-0 bg-black p-0 focus:outline-hidden ${className}`}
            onClick={openVideo}
            onKeyDown={handleKeyDown}
        >
            <div className="relative aspect-video w-full">
                <Image
                    src={thumbnailUrl}
                    alt={title}
                    fill
                    className="object-cover transition-opacity duration-200 hover:opacity-80"
                    onError={handleImageError}
                    data-testid="youtube-thumbnail"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-opacity-90 bg-green-450 flex size-16 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110">
                        <FiPlay
                            size={24}
                            className="ml-1"
                        />
                    </div>
                </div>
            </div>
        </button>
    );
};

export default YouTubePreview;
