'use client';

import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Avatar from '@/app/components/utils/Avatar';
import CommentInput from './CommentInput';
import CommentPhotoPreview from './CommentPhotoPreview';
import CommentRatingSection from './CommentRatingSection';
import CommentActionBar from './CommentActionBar';
import { compressImage } from '@/app/utils/compressImage';

export interface CommentBoxProps {
    userImage: string | undefined | null;
    onCreateComment: (
        comment: string,
        rating: number | null,
        isCooked?: boolean,
        imageSrc?: string | null
    ) => void;
    isLoading?: boolean;
}

const CommentBox: React.FC<CommentBoxProps> = ({
    userImage,
    onCreateComment,
    isLoading = false,
}) => {
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState<number | null>(null);
    const [showRating, setShowRating] = useState(false);
    const [isCooked, setIsCooked] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isButtonDisabled, setButtonDisabled] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (value: string) => {
        setComment(value);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        setSelectedFile(file);
        setIsCooked(true);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const handleRemoveFile = () => {
        if (previewUrl) {
            try {
                URL.revokeObjectURL(previewUrl);
            } catch {
                // Ignore
            }
        }
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setButtonDisabled(true);
        try {
            if (comment.trim() === '') {
                toast.error('Comment cannot be empty');
                return;
            }

            let uploadedImageSrc: string | null = null;

            if (selectedFile) {
                setIsUploading(true);
                try {
                    const compressedFile = await compressImage(selectedFile);
                    const response = await axios.post('/api/upload/r2', {
                        filename: compressedFile.name,
                        contentType: compressedFile.type,
                    });

                    const { uploadUrl, publicUrl } = response.data;

                    if (uploadUrl) {
                        await axios.put(uploadUrl, compressedFile, {
                            headers: {
                                'Content-Type': compressedFile.type,
                            },
                        });
                    }
                    uploadedImageSrc = publicUrl;
                } catch (err: unknown) {
                    console.error('Failed to upload image', err);
                    toast.error('Failed to upload photo proof');
                    return;
                } finally {
                    setIsUploading(false);
                }
            }

            onCreateComment(comment, rating, isCooked, uploadedImageSrc);

            setComment('');
            setRating(null);
            setShowRating(false);
            setIsCooked(false);
            handleRemoveFile();
        } finally {
            setButtonDisabled(false);
        }
    };

    const isSubmitting = isLoading || isUploading || isButtonDisabled;

    return (
        <div className="mb-6 flex items-start gap-3">
            <div className="mt-1 shrink-0">
                <Avatar
                    src={userImage}
                    quality="auto:eco"
                />
            </div>

            <form
                onSubmit={handleSubmit}
                className="min-w-0 grow"
            >
                <div className="rounded-xl border border-neutral-200 bg-transparent p-3 transition-colors focus-within:border-neutral-300 dark:border-neutral-700 dark:focus:border-neutral-600">
                    <CommentInput
                        value={comment}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                    />

                    <CommentPhotoPreview
                        previewUrl={previewUrl}
                        onRemove={handleRemoveFile}
                    />

                    <CommentRatingSection
                        rating={rating}
                        showRating={showRating}
                        onChange={setRating}
                        onClear={() => {
                            setRating(null);
                            setShowRating(false);
                        }}
                    />

                    <CommentActionBar
                        rating={rating}
                        showRating={showRating}
                        onToggleRating={() => setShowRating((prev) => !prev)}
                        isCooked={isCooked}
                        onToggleCooked={setIsCooked}
                        selectedFile={selectedFile}
                        onFileSelect={handleFileSelect}
                        fileInputRef={fileInputRef}
                        isSubmitting={isSubmitting}
                        commentEmpty={comment.trim() === ''}
                    />
                </div>
            </form>
        </div>
    );
};

export default CommentBox;
export { CommentBox as CommentForm };
