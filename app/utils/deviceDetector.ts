export const isMobile = (userAgent: string): boolean => {
    return /Mobi|Android|iPhone|iPad|iPod/.test(userAgent);
};
