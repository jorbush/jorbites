'use client';

import { Toaster } from 'react-hot-toast';

const ToasterProvider = () => {
    return (
        <Toaster
            containerStyle={{
                top: 'calc(1rem + env(safe-area-inset-top, 0px))',
                bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
                left: 'calc(1rem + env(safe-area-inset-left, 0px))',
                right: 'calc(1rem + env(safe-area-inset-right, 0px))',
            }}
        />
    );
};

export default ToasterProvider;
