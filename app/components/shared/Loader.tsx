'use client';

import Image from 'next/image';
import avocadoLogo from '@/public/avocado.webp';

interface LoaderProps {
    height?: string;
}

const Loader: React.FC<LoaderProps> = ({ height = '70vh' }) => {
    return (
        <div
            className="flex flex-col items-center justify-center"
            style={{ height }}
        >
            <div className="animate-pulse-scale">
                <Image
                    src={avocadoLogo}
                    alt="Loading..."
                    width={80}
                    height={80}
                />
            </div>
        </div>
    );
};

export default Loader;
