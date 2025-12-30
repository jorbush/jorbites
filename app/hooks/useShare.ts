import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

interface UseShareOptions {
    title?: string;
    url?: string;
}

const useShare = () => {
    const { t } = useTranslation();

    const copyToClipboard = (url?: string) => {
        const urlToCopy = url || window.location.href;
        navigator.clipboard.writeText(urlToCopy);
        toast.success(t('link_copied'));
    };

    const share = (options?: UseShareOptions) => {
        const shareTitle = options?.title || document.title;
        const shareUrl = options?.url || window.location.href;

        if (navigator.share) {
            navigator
                .share({
                    title: shareTitle,
                    url: shareUrl,
                })
                .then(() => {
                    console.log('Successfully shared');
                })
                .catch((error) => {
                    console.error('Error sharing:', error);
                });
        } else {
            copyToClipboard(shareUrl);
        }
    };

    return { share, copyToClipboard };
};

export default useShare;
