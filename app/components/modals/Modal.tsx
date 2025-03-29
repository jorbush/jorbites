'use client';

import { useCallback, useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';

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
    minHeight?: string;
    topButton?: React.ReactElement<object>;
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
    minHeight,
    topButton,
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
            if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !disabled &&
                isOpen
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
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-neutral-800/70 outline-none focus:outline-none">
                <div className="relative mx-auto my-6 h-full w-full md:h-auto md:w-4/6 lg:h-auto lg:w-3/6 xl:w-2/5">
                    <div
                        className={`translate h-full duration-300 ${showModal ? 'translate-y-0' : 'translate-y-full'} ${showModal ? 'opacity-100' : 'opacity-0'} `}
                    >
                        <div
                            className="translate relative flex h-full w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none dark:bg-dark md:h-auto lg:h-auto"
                            style={{
                                minHeight: minHeight ? minHeight : '0px',
                            }}
                        >
                            <div className="relative flex items-center justify-center rounded-t border-b-[1px] p-6">
                                <button
                                    className="absolute left-9 border-0 p-1 text-black transition hover:opacity-70 dark:text-neutral-100"
                                    onClick={handleClose}
                                    data-testid="close-modal-button"
                                >
                                    <IoMdClose size={18} />
                                </button>
                                <div
                                    data-testid="modal-title"
                                    className="text-lg font-semibold text-black dark:text-neutral-100"
                                >
                                    {title}
                                </div>
                                <div className="absolute right-9 p-1">
                                    {topButton}
                                </div>
                            </div>
                            <div className="relative flex-auto p-6 text-black dark:text-neutral-100">
                                {body}
                            </div>
                            <div className="flex flex-col gap-2 p-6">
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
