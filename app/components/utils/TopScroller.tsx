'use client';

import { useEffect } from 'react';

const TopScroller = () => {
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'instant',
        });
    }, []);
    return null;
};

export default TopScroller;
