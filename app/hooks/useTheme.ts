import { useEffect } from 'react';

const useTheme = () => {
    useEffect(() => {
        const cachedTheme = localStorage.getItem('theme');
        if (cachedTheme) {
            document.documentElement.classList.toggle(
                'dark',
                cachedTheme === 'dark'
            );
        }
    }, []);
};

export default useTheme;
