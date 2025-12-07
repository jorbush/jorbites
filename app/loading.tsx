'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import avocadoLogo from '@/public/avocado.webp';

export default function Loading() {
    return (
        <div className="flex h-[70vh] flex-col items-center justify-center">
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
}
