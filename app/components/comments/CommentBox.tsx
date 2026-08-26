'use client';

import { useReducer, useRef } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Avatar from '@/app/components/utils/Avatar';
import CommentInput from './CommentInput';
import CommentPhotoPreview from './CommentPhotoPreview';
import CommentRatingSection from './CommentRatingSection';
import CommentActionBar from './CommentActionBar';
import { compressImage } from '@/app/utils/compressImage';
import {
    commentBoxReducer,
    initialCommentBoxState,
    CommentBoxState,
    CommentBoxAction,
    DEFAULT_COMMENT_BOX_STATE,
} from '@/app/hooks/commentBoxReducer';

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
    const [state, dispatch] = useReducer(
        commentBoxReducer,
        initialCommentBoxState
    );
    const {
        comment,
        rating,
        showRating,
        isCooked,
        selectedFile,
        previewUrl,
        isUploading,
        isButtonDisabled,
    } = state;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (value: string) => {
        dispatch({ type: 'SET_COMMENT', payload: value });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        if (previewUrl) {
            try {
                URL.revokeObjectURL(previewUrl);
            } catch {
                // Ignore
            }
        }

        const objectUrl = URL.createObjectURL(file);
        dispatch({
            type: 'SELECT_FILE',
            payload: { file, previewUrl: objectUrl },
        });
    };

    const handleRemoveFile = () => {
        if (previewUrl) {
            try {
                URL.revokeObjectURL(previewUrl);
            } catch {
                // Ignore
            }
        }
        dispatch({ type: 'REMOVE_FILE' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'SET_BUTTON_DISABLED', payload: true });
        try {
            if (comment.trim() === '') {
                toast.error('Comment cannot be empty');
                return;
            }

            let uploadedImageSrc: string | null = null;

            if (selectedFile) {
                dispatch({ type: 'SET_UPLOADING', payload: true });
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
                    dispatch({ type: 'SET_UPLOADING', payload: false });
                }
            }

            onCreateComment(comment, rating, isCooked, uploadedImageSrc);

            if (previewUrl) {
                try {
                    URL.revokeObjectURL(previewUrl);
                } catch {
                    // Ignore
                }
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            dispatch({ type: 'RESET' });
        } finally {
            dispatch({ type: 'SET_BUTTON_DISABLED', payload: false });
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
                        onChange={(newRating) =>
                            dispatch({
                                type: 'SET_RATING',
                                payload: newRating,
                            })
                        }
                        onClear={() => dispatch({ type: 'CLEAR_RATING' })}
                    />

                    <CommentActionBar
                        rating={rating}
                        showRating={showRating}
                        onToggleRating={() =>
                            dispatch({ type: 'TOGGLE_RATING' })
                        }
                        isCooked={isCooked}
                        onToggleCooked={(cooked) =>
                            dispatch({
                                type: 'SET_COOKED',
                                payload: cooked,
                            })
                        }
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
export {
    CommentBox as CommentForm,
    commentBoxReducer,
    initialCommentBoxState,
    DEFAULT_COMMENT_BOX_STATE,
};
export type { CommentBoxState, CommentBoxAction };
