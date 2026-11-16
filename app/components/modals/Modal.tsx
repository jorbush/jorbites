'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
    actionDisabled?: boolean;
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
    actionDisabled,
    isLoading,
    secondaryAction,
    secondaryActionLabel,
    topButton,
    icon: Icon,
    insideModal,
}) => {
    const [isClosing, setIsClosing] = useState(false);

    const showAnimation = isOpen && !isClosing;

    useTheme();

    const handleClose = useCallback(() => {
        if (disabled) {
            return;
        }

        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    }, [onClose, disabled]);

    const handleSubmit = useCallback(() => {
        if (disabled || actionDisabled || isLoading) {
            return;
        }

        onSubmit();
    }, [onSubmit, disabled, actionDisabled, isLoading]);

    const handleSecondaryAction = useCallback(() => {
        if (disabled || !secondaryAction) {
            return;
        }

        secondaryAction();
    }, [secondaryAction, disabled]);

    const handleSubmitRef = useRef(handleSubmit);
    const disabledRef = useRef(disabled);
    const actionDisabledRef = useRef(actionDisabled || isLoading);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        handleSubmitRef.current = handleSubmit;
        disabledRef.current = disabled;
        actionDisabledRef.current = actionDisabled || isLoading;
    });

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.key !== 'Enter' ||
                event.shiftKey ||
                event.defaultPrevented ||
                event.isComposing ||
                disabledRef.current ||
                actionDisabledRef.current
            ) {
                return;
            }

            // Don't handle Enter if another modal is stacked on top of this one
            const backdrops = document.querySelectorAll(
                '[data-modal-backdrop]'
            );
            if (
                backdrops.length > 0 &&
                backdrops[backdrops.length - 1] !== modalRef.current
            ) {
                return;
            }

            // Don't submit modal if user is typing in a textarea, editable area,
            // nested form (e.g. 2FA/password forms inside Settings), or interactive control
            const target = event.target;
            if (
                target instanceof HTMLElement &&
                (target.tagName === 'TEXTAREA' || target.isContentEditable)
            ) {
                return;
            }
            if (
                target instanceof Element &&
                target.closest('form, button, a, select, [role="button"]')
            ) {
                return;
            }

            handleSubmitRef.current();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div
                ref={modalRef}
                data-modal-backdrop=""
                className="fixed inset-0 isolate z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-neutral-800/70 outline-hidden focus:outline-hidden"
            >
                <div
                    className={`relative mx-auto h-full max-h-[100vh] w-full md:h-auto md:max-h-[calc(100vh-6rem)] lg:h-auto ${insideModal ? 'md:w-5/6' : 'md:w-4/6 lg:w-3/6 xl:w-2/5'}`}
                >
                    <div
                        className={`h-full transition-[transform,opacity] duration-300 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
                    >
                        <div className="dark:bg-dark relative flex size-full flex-col rounded-lg border-0 bg-white shadow-lg outline-hidden focus:outline-hidden md:h-auto lg:h-auto">
                            <div className="relative flex flex-shrink-0 items-center justify-center rounded-t border-b-[1px] px-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-6 md:pt-6">
                                <button
                                    type="button"
                                    className="absolute left-9 cursor-pointer border-0 p-1 text-black transition hover:opacity-70 dark:text-neutral-100"
                                    onClick={handleClose}
                                    aria-label="Close"
                                    data-testid="close-modal-button"
                                >
                                    <IoMdClose size={18} />
                                </button>
                                <div
                                    data-testid="modal-title"
                                    className="flex max-w-[calc(100%-140px)] items-center justify-center truncate text-lg font-semibold text-black dark:text-neutral-100"
                                >
                                    {Icon && (
                                        <Icon className="mr-2 shrink-0 text-xl" />
                                    )}
                                    <span className="truncate">{title}</span>
                                </div>
                                <div className="absolute right-9 p-1">
                                    {topButton}
                                </div>
                            </div>
                            <div className="relative min-h-0 flex-auto overflow-y-auto p-6 text-black dark:text-neutral-100">
                                {body}
                            </div>
                            <div className="flex flex-shrink-0 flex-col gap-2 border-t border-neutral-200 px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] md:pb-6 dark:border-neutral-600">
                                <div className="flex w-full flex-row items-center gap-4">
                                    {secondaryAction &&
                                        secondaryActionLabel && (
                                            <Button
                                                data-testid="secondary-action-button"
                                                dataCy="secondary-action-button"
                                                disabled={disabled || isLoading}
                                                label={secondaryActionLabel}
                                                onClick={handleSecondaryAction}
                                                outline
                                            />
                                        )}
                                    <Button
                                        data-testid="modal-action-button"
                                        disabled={
                                            disabled ||
                                            actionDisabled ||
                                            isLoading
                                        }
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
