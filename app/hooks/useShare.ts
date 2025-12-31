import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

interface UseShareOptions {
    title?: string;
    url?: string;
}

const useShare = () => {
    const { t } = useTranslation();

    const copyToClipboard = async (url?: string) => {
        const urlToCopy = url || window.location.href;
        try {
            await navigator.clipboard.writeText(urlToCopy);
            toast.success(t('link_copied'));
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            toast.error(t('copy_failed') || 'Failed to copy link');
        }
    };

    const share = async (options?: UseShareOptions) => {
        const shareTitle = options?.title || document.title;
        const shareUrl = options?.url || window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    url: shareUrl,
                });
                console.log('Successfully shared');
            } catch (error) {
                // User canceled the share dialog; ignore silently
                if ((error as DOMException)?.name === 'AbortError') {
                    return;
                }
                console.error('Error sharing:', error);
            }
        } else {
            await copyToClipboard(shareUrl);
        }
    };

    return { share, copyToClipboard };
};

export default useShare;
