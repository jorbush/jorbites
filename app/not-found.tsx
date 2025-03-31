'use client';

import { FaHome } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/buttons/Button';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="bg-background flex h-[90%] w-full flex-col items-center justify-center">
            <div className="space-y-5 text-center dark:text-white">
                <h1 className="from-primary to-primary/50 bg-linear-to-r bg-clip-text text-8xl font-bold text-transparent">
                    404
                </h1>
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Page Not Found</h2>
                    <p className="text-muted-foreground max-w-md">
                        The page you are looking for might have been removed,
                        had its name changed, or is temporarily unavailable.
                    </p>
                </div>
                <div className="mt-8 flex justify-center gap-4">
                    <div className="w-48">
                        <Button
                            label="Go Home"
                            onClick={() => router.push('/')}
                            outline
                            icon={FaHome}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
