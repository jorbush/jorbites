'use client';

import '../../i18n';

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const ClientOnly: React.FC<ClientOnlyProps> = ({
    children,
    fallback = null,
}) => {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setHasMounted(true);
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    if (!hasMounted) return <>{fallback}</>;

    return <>{children}</>;
};

export default ClientOnly;
