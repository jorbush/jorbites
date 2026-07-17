'use client';

import { useRef, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface UseOcrScanOptions {
    onResult: (text: string) => void;
}

export default function useOcrScan({ onResult }: UseOcrScanOptions) {
    const { t } = useTranslation();
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const triggerScan = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            // Reset the input so the same file can be selected again
            event.target.value = '';

            setIsScanning(true);
            setScanProgress(0);

            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/ocr', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('OCR proxy request failed');
                }

                const data = await response.json();

                if (data.success && data.text && data.text.trim()) {
                    onResult(data.text.trim());
                    toast.success(
                        t('scan_complete') || 'Text detected and added'
                    );
                } else {
                    toast.error(
                        t('scan_no_text') || 'No text was detected in the image'
                    );
                }
            } catch (error) {
                console.error('OCR scan failed:', error);
                toast.error(
                    t('scan_failed') ||
                        'Could not detect text. Try with clearer handwriting.'
                );
            } finally {
                setIsScanning(false);
                setScanProgress(0);
            }
        },
        [onResult, t]
    );

    return {
        isScanning,
        scanProgress,
        triggerScan,
        fileInputRef,
        handleFileChange,
    };
}
