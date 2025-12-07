'use client';

import { motion } from 'framer-motion';
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
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: 'easeInOut',
                }}
            >
                <Image
                    src={avocadoLogo}
                    alt="Loading..."
                    width={80}
                    height={80}
                />
            </motion.div>
        </div>
    );
};

export default Loader;
