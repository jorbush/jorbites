'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CookingAudioEngine, MusicVibe } from '@/app/utils/cookingAudioEngine';

interface UseCookingGuideControllerParams {
    steps: string[];
    ingredientsCount: number;
    isStepCompleted: (index: number) => boolean;
    onToggleStep: (index: number) => void;
    onClose: () => void;
}

export function useCookingGuideController({
    steps,
    ingredientsCount,
    isStepCompleted,
    onToggleStep,
    onClose,
}: UseCookingGuideControllerParams) {
    const audioEngineRef = useRef<CookingAudioEngine | null>(null);

    const [currentIndex, setCurrentIndex] = useState<number>(() => {
        const firstIncomplete = steps.findIndex(
            (_, idx) => !isStepCompleted(idx)
        );
        return firstIncomplete >= 0 ? firstIncomplete : 0;
    });
    const [isCelebration, setIsCelebration] = useState<boolean>(false);
    const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(true);
    const [musicVibe, setMusicVibe] = useState<MusicVibe>('lofi');
    const [isIngredientsOpen, setIsIngredientsOpen] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

    // Manage Audio Engine lifecycle
    useEffect(() => {
        if (!audioEngineRef.current) {
            audioEngineRef.current = new CookingAudioEngine();
        }

        if (isMusicPlaying) {
            audioEngineRef.current.startMusic(musicVibe);
        } else {
            audioEngineRef.current.stopMusic();
        }

        return () => {
            audioEngineRef.current?.stopMusic();
        };
    }, [isMusicPlaying, musicVibe]);

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            audioEngineRef.current?.dispose();
            audioEngineRef.current = null;
        };
    }, []);

    // Lock body scroll & request screen wake lock while mounted
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        let wakeLockSentinel: { release: () => Promise<void> } | null = null;
        const nav = navigator as Navigator & {
            wakeLock?: {
                request: (
                    type: 'screen'
                ) => Promise<{ release: () => Promise<void> }>;
            };
        };
        if (nav.wakeLock?.request) {
            nav.wakeLock
                .request('screen')
                .then((sentinel) => {
                    wakeLockSentinel = sentinel;
                })
                .catch(() => {});
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            wakeLockSentinel?.release().catch(() => {});
        };
    }, []);

    const currentStepText = steps[currentIndex] || '';
    const currentStepDone = isStepCompleted(currentIndex);

    const stopSpeech = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    }, []);

    const handleReadAloud = useCallback(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            return;
        }
        if (isSpeaking) {
            stopSpeech();
            return;
        }
        try {
            window.speechSynthesis.cancel();
            const cleanText = currentStepText.replace(/[*_]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        } catch {
            setIsSpeaking(false);
        }
    }, [currentStepText, isSpeaking, stopSpeech]);

    const handleGoToStep = useCallback(
        (index: number) => {
            if (index < 0 || index >= steps.length) return;
            stopSpeech();
            setIsCelebration(false);
            setCurrentIndex(index);
            audioEngineRef.current?.playStepAdvance();
        },
        [steps.length, stopSpeech]
    );

    const handlePrevious = useCallback(() => {
        if (isCelebration) {
            setIsCelebration(false);
            return;
        }
        if (currentIndex > 0) {
            handleGoToStep(currentIndex - 1);
        }
    }, [currentIndex, handleGoToStep, isCelebration]);

    const handleNext = useCallback(() => {
        stopSpeech();
        if (currentIndex < steps.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            audioEngineRef.current?.playStepAdvance();
        } else {
            setIsCelebration(true);
            audioEngineRef.current?.playCelebrationFanfare();
        }
    }, [currentIndex, steps.length, stopSpeech]);

    const handleCompleteAndNext = useCallback(() => {
        stopSpeech();
        if (!currentStepDone) {
            onToggleStep(currentIndex);
            audioEngineRef.current?.playStepComplete();
        } else {
            audioEngineRef.current?.playStepAdvance();
        }

        if (currentIndex < steps.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setIsCelebration(true);
            audioEngineRef.current?.playCelebrationFanfare();
        }
    }, [currentIndex, currentStepDone, onToggleStep, steps.length, stopSpeech]);

    const handleToggleCurrentStep = useCallback(() => {
        onToggleStep(currentIndex);
        audioEngineRef.current?.playStepComplete();
    }, [currentIndex, onToggleStep]);

    const handleTimerComplete = useCallback(() => {
        audioEngineRef.current?.playTimerAlarm();
    }, []);

    const handleToggleMusic = useCallback(() => {
        setIsMusicPlaying((prev) => !prev);
    }, []);

    const handleSelectVibe = useCallback((vibe: MusicVibe) => {
        setMusicVibe(vibe);
        setIsMusicPlaying(true);
    }, []);

    const handleRestart = useCallback(() => {
        setIsCelebration(false);
        setCurrentIndex(0);
    }, []);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isIngredientsOpen) {
                    setIsIngredientsOpen(false);
                } else {
                    onClose();
                }
            } else if (e.key === 'ArrowRight' && !isCelebration) {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrevious();
            } else if (
                (e.key === 'm' || e.key === 'M') &&
                !e.metaKey &&
                !e.ctrlKey
            ) {
                handleToggleMusic();
            } else if (
                (e.key === 'i' || e.key === 'I') &&
                !e.metaKey &&
                !e.ctrlKey &&
                ingredientsCount > 0
            ) {
                setIsIngredientsOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [
        isIngredientsOpen,
        isCelebration,
        onClose,
        handleNext,
        handlePrevious,
        handleToggleMusic,
        ingredientsCount,
    ]);

    return {
        currentIndex,
        currentStepText,
        currentStepDone,
        isCelebration,
        isMusicPlaying,
        musicVibe,
        isIngredientsOpen,
        isSpeaking,
        setIsIngredientsOpen,
        handleReadAloud,
        handleGoToStep,
        handlePrevious,
        handleNext,
        handleCompleteAndNext,
        handleToggleCurrentStep,
        handleTimerComplete,
        handleToggleMusic,
        handleSelectVibe,
        handleRestart,
    };
}
