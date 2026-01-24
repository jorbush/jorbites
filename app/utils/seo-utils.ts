export const getHighResImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('cloudinary.com')) {
        try {
            const matches = url.match(
                /^(https?:\/\/res\.cloudinary\.com\/[^/]+)\/image\/upload(?:\/([^/]+))?\/(.+)$/
            );
            if (matches) {
                const [, baseUrl, segment, imagePath] = matches;
                // Force 4:3 aspect ratio (w_1200, h_900) and fill crop

                // Check if segment is a version (starts with 'v' followed by numbers)
                // If it's transformations (e.g. w_800,h_600), we discard it to avoid duplication
                const isVersion = segment && /^v\d+$/.test(segment);

                const fullPath = isVersion
                    ? `${segment}/${imagePath}`
                    : imagePath;
                return `${baseUrl}/image/upload/w_1200,h_900,c_fill,q_auto:good/${fullPath}`;
            }
        } catch (e) {
            console.error('Error transforming Cloudinary URL for schema:', e);
        }
    }
    return url;
};

export const getYoutubeVideoId = (urlOrId: string) => {
    if (!urlOrId) return null;
    const input = urlOrId.trim();
    // If it looks like a bare YouTube ID, return it directly
    if (
        !input.includes('://') &&
        input.length === 11 &&
        /^[a-zA-Z0-9_-]+$/.test(input)
    ) {
        return input;
    }
    try {
        const url = new URL(input);
        const hostname = url.hostname.replace(/^www\./, '');
        // Handle standard youtube.com URLs with ?v= parameter
        if (
            hostname === 'youtube.com' ||
            hostname === 'm.youtube.com' ||
            hostname === 'music.youtube.com'
        ) {
            const vParam = url.searchParams.get('v');
            if (vParam && vParam.length === 11) {
                return vParam;
            }
            const segments = url.pathname.split('/').filter(Boolean);
            if (segments.length >= 2) {
                const [first, second] = segments;
                if (first === 'embed' || first === 'v' || first === 'shorts') {
                    if (second && second.length === 11) {
                        return second;
                    }
                }
            }
        }
        // Handle youtu.be short URLs
        if (hostname === 'youtu.be') {
            const segments = url.pathname.split('/').filter(Boolean);
            const id = segments[0];
            if (id && id.length === 11) {
                return id;
            }
        }
    } catch {
        // If input is not a valid URL, fall back to regex-based extraction below
    }
    const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = input.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};
