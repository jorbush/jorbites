'use client';

import { PuffLoader } from 'react-spinners';

const Loader = () => {
    return (
        <div className="flex h-[70vh] flex-col items-center justify-center">
            <PuffLoader size={100} color="rose" />
        </div>
    );
};

export default Loader;
