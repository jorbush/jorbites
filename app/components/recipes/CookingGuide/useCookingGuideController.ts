'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CookingAudioEngine, MusicVibe } from '@/app/utils/cookingAudioEngine';
import {
    sanitizeStepTextForSpeech,
    resolveSpeechLang,
} from '@/app/utils/stepGuideUtils';
import { useCookingTimer } from './useCookingTimer';

const MUSIC_PREF_STORAGE_KEY = 'jorbites_cooking_guide_music';

interface MusicPreference {
    isPlaying: boolean;
    vibe: MusicVibe;
}

function readMusicPreference(): MusicPreference {
    if (typeof window === 'undefined') {
        return { isPlaying: true, vibe: 'lofi' };
    }
    try {
        const raw = localStorage.getItem(MUSIC_PREF_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<MusicPreference>;
            const validVibe =
                parsed.vibe === 'lofi' ||
                parsed.vibe === 'acoustic' ||
                parsed.vibe === 'zen'
                    ? parsed.vibe
                    : 'lofi';
            return {
                isPlaying:
                    typeof parsed.isPlaying === 'boolean'
                        ? parsed.isPlaying
                        : true,
                vibe: validVibe,
            };
        }
    } catch {
        // Ignore storage read errors
    }
    return { isPlaying: true, vibe: 'lofi' };
}

function saveMusicPreference(pref: MusicPreference): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(MUSIC_PREF_STORAGE_KEY, JSON.stringify(pref));
    } catch {
        // Ignore storage write errors
    }
}

function useWakeLockAndScrollLock(): void {
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

        const acquireWakeLock = () => {
            if (!nav.wakeLock?.request) return;
            nav.wakeLock
                .request('screen')
                .then((sentinel) => {
                    wakeLockSentinel = sentinel;
                })
                .catch(() => {});
        };

        acquireWakeLock();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                acquireWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
            wakeLockSentinel?.release().catch(() => {});
        };
    }, []);
}

interface UseCookingGuideControllerParams {
    steps: string[];
    ingredientsCount: number;
    language?: string;
    isStepCompleted: (index: number) => boolean;
    onToggleStep: (index: number) => void;
    onClose: () => void;
}

export function useCookingGuideController({
    steps,
    ingredientsCount,
    language,
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
    const [musicPref, setMusicPref] = useState<MusicPreference>(() =>
        readMusicPreference()
    );
    const [isIngredientsOpen, setIsIngredientsOpen] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

    const { isPlaying: isMusicPlaying, vibe: musicVibe } = musicPref;

    useWakeLockAndScrollLock();

    const handleTimerComplete = useCallback(() => {
        audioEngineRef.current?.playTimerAlarm();
    }, []);

    const timer = useCookingTimer(handleTimerComplete);

    // Manage Audio Engine lifecycle & persist music preference
    useEffect(() => {
        saveMusicPreference({ isPlaying: isMusicPlaying, vibe: musicVibe });

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
            const cleanText = sanitizeStepTextForSpeech(currentStepText);
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = resolveSpeechLang(language);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        } catch {
            setIsSpeaking(false);
        }
    }, [currentStepText, isSpeaking, language, stopSpeech]);

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

    const handleToggleMusic = useCallback(() => {
        setMusicPref((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    }, []);

    const handleSelectVibe = useCallback((vibe: MusicVibe) => {
        setMusicPref({ isPlaying: true, vibe });
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
        timer,
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
