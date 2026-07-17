'use client';

import { useTranslation } from 'react-i18next';
import { FaCamera } from 'react-icons/fa';
import useOcrScan from '@/app/hooks/useOcrScan';

interface OcrTextScannerProps {
    onResult: (text: string) => void;
}

const OcrTextScanner: React.FC<OcrTextScannerProps> = ({ onResult }) => {
    const { t } = useTranslation();
    const {
        isScanning,
        scanProgress,
        triggerScan,
        fileInputRef,
        handleFileChange,
    } = useOcrScan({ onResult });

    return (
        <div className="flex items-center">
            <button
                type="button"
                onClick={triggerScan}
                disabled={isScanning}
                title={t('scan_handwriting') || 'Scan text from photo'}
                aria-label={t('scan_handwriting') || 'Scan text from photo'}
                data-testid="ocr-scan-button"
                className="flex size-10 items-center justify-center rounded-full transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800"
            >
                {isScanning ? (
                    <div className="relative flex size-full items-center justify-center">
                        <div className="size-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700 dark:border-neutral-600 dark:border-t-neutral-200" />
                        {scanProgress > 0 && (
                            <span className="absolute text-[8px] font-bold text-neutral-600 dark:text-neutral-300">
                                {scanProgress}
                            </span>
                        )}
                    </div>
                ) : (
                    <FaCamera className="size-5 text-neutral-600 dark:text-neutral-300" />
                )}
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                data-testid="ocr-file-input"
            />
        </div>
    );
};

export default OcrTextScanner;
