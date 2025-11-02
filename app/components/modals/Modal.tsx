'use client';

import { useCallback, useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { IconType } from 'react-icons';

import Button from '@/app/components/buttons/Button';
import useTheme from '@/app/hooks/useTheme';

interface ModalProps {
    isOpen?: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title?: string;
    body?: React.ReactElement<object>;
    footer?: React.ReactElement<object>;
    actionLabel: string;
    disabled?: boolean;
    isLoading?: boolean;
    secondaryAction?: () => void;
    secondaryActionLabel?: string;
    topButton?: React.ReactElement<object>;
    icon?: IconType;
    insideModal?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    body,
    actionLabel,
    footer,
    disabled,
    isLoading,
    secondaryAction,
    secondaryActionLabel,
    topButton,
    icon: Icon,
    insideModal,
}) => {
    const [showModal, setShowModal] = useState(isOpen);

    useEffect(() => {
        setShowModal(isOpen);
    }, [isOpen]);

    useTheme();

    const handleClose = useCallback(() => {
        if (disabled) {
            return;
        }

        setShowModal(false);
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose, disabled]);

    const handleSubmit = useCallback(() => {
        if (disabled) {
            return;
        }

        onSubmit();
    }, [onSubmit, disabled]);

    const handleSecondaryAction = useCallback(() => {
        if (disabled || !secondaryAction) {
            return;
        }

        secondaryAction();
    }, [secondaryAction, disabled]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't submit if user is typing in a textarea (e.g., plain text mode)
            const target = event.target as HTMLElement;
            const isTextarea = target?.tagName === 'TEXTAREA';
            
            if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !disabled &&
                isOpen &&
                !isTextarea
            ) {
                handleSubmit();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [disabled, isOpen, handleSubmit]);

    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-neutral-800/70 outline-hidden focus:outline-hidden">
                <div
                    className={`relative mx-auto h-full max-h-[100vh] w-full md:h-auto md:max-h-[calc(100vh-6rem)] lg:h-auto ${insideModal ? 'md:w-5/6' : 'md:w-4/6 lg:w-3/6 xl:w-2/5'}`}
                >
                    <div
                        className={`translate h-full duration-300 ${showModal ? 'translate-y-0' : 'translate-y-full'} ${showModal ? 'opacity-100' : 'opacity-0'} `}
                    >
                        <div className="translate dark:bg-dark relative flex h-full w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-hidden focus:outline-hidden md:h-auto lg:h-auto">
                            <div className="relative flex flex-shrink-0 items-center justify-center rounded-t border-b-[1px] p-6">
                                <button
                                    className="absolute left-9 border-0 p-1 text-black transition hover:opacity-70 dark:text-neutral-100"
                                    onClick={handleClose}
                                    data-testid="close-modal-button"
                                >
                                    <IoMdClose size={18} />
                                </button>
                                <div
                                    data-testid="modal-title"
                                    className="flex items-center justify-center text-lg font-semibold text-black dark:text-neutral-100"
                                >
                                    {Icon && <Icon className="mr-2 text-xl" />}
                                    {title}
                                </div>
                                <div className="absolute right-9 p-1">
                                    {topButton}
                                </div>
                            </div>
                            <div className="relative min-h-0 flex-auto overflow-y-auto p-6 text-black dark:text-neutral-100">
                                {body}
                            </div>
                            <div className="flex flex-shrink-0 flex-col gap-2 border-t border-gray-200 p-6 dark:border-neutral-600">
                                <div className="flex w-full flex-row items-center gap-4">
                                    {secondaryAction &&
                                        secondaryActionLabel && (
                                            <Button
                                                data-testid="secondary-action-button"
                                                disabled={disabled || isLoading}
                                                label={secondaryActionLabel}
                                                onClick={handleSecondaryAction}
                                                outline
                                            />
                                        )}
                                    <Button
                                        data-testid="action-button"
                                        disabled={disabled || isLoading}
                                        label={actionLabel}
                                        onClick={handleSubmit}
                                        withDelay
                                        dataCy="modal-action-button"
                                    />
                                </div>
                                {footer}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Modal;
