import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    CookingAudioEngine,
    unlockCookingAudio,
} from '@/app/utils/cookingAudioEngine';

describe('CookingAudioEngine', () => {
    let mockStart: ReturnType<typeof vi.fn>;
    let mockStop: ReturnType<typeof vi.fn>;
    let mockClose: ReturnType<typeof vi.fn>;
    let mockResume: ReturnType<typeof vi.fn>;
    let mockBufferSourceStart: ReturnType<typeof vi.fn>;
    let originalAudioContext: typeof window.AudioContext;

    beforeEach(() => {
        vi.useFakeTimers();
        mockStart = vi.fn();
        mockStop = vi.fn();
        mockClose = vi.fn().mockResolvedValue(undefined);
        mockResume = vi.fn().mockResolvedValue(undefined);
        mockBufferSourceStart = vi.fn();

        originalAudioContext = window.AudioContext;

        class MockAudioContext {
            state = 'suspended';
            currentTime = 0;
            destination = {};
            resume = mockResume;
            close = mockClose;
            createBuffer = vi.fn().mockReturnValue({});
            createBufferSource = () => ({
                buffer: null,
                connect: vi.fn(),
                start: mockBufferSourceStart,
            });
            createOscillator = () => ({
                type: 'sine',
                frequency: { setValueAtTime: vi.fn() },
                connect: vi.fn(),
                start: mockStart,
                stop: mockStop,
            });
            createGain = () => ({
                gain: {
                    setValueAtTime: vi.fn(),
                    linearRampToValueAtTime: vi.fn(),
                    exponentialRampToValueAtTime: vi.fn(),
                },
                connect: vi.fn(),
            });
            createBiquadFilter = () => ({
                type: 'lowpass',
                frequency: { setValueAtTime: vi.fn() },
                connect: vi.fn(),
            });
        }

        Object.defineProperty(window, 'AudioContext', {
            writable: true,
            configurable: true,
            value: MockAudioContext,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        Object.defineProperty(window, 'AudioContext', {
            writable: true,
            configurable: true,
            value: originalAudioContext,
        });
    });

    it('unlocks iOS Safari and PWA audio synchronously with audioSession playback and silent buffer', () => {
        const mockAudioSession = { type: 'ambient' };
        Object.defineProperty(navigator, 'audioSession', {
            writable: true,
            configurable: true,
            value: mockAudioSession,
        });

        const ctx = unlockCookingAudio();
        expect(ctx).not.toBeNull();
        expect(mockAudioSession.type).toBe('playback');
        expect(mockResume).toHaveBeenCalledTimes(1);
        expect(mockBufferSourceStart).toHaveBeenCalledTimes(1);
        expect(mockBufferSourceStart).toHaveBeenCalledWith(0);

        // Once running, subsequent unlock calls short-circuit without spawning new buffer sources
        if (ctx) {
            Object.defineProperty(ctx, 'state', {
                value: 'running',
                configurable: true,
            });
        }
        unlockCookingAudio();
        expect(mockBufferSourceStart).toHaveBeenCalledTimes(1);

        const engine = new CookingAudioEngine();
        engine.unlock();
        engine.dispose();
    });

    it('starts and loops ambient music across lofi, acoustic, and zen vibes', () => {
        const engine = new CookingAudioEngine();

        engine.startMusic('lofi');
        expect(mockResume).toHaveBeenCalled();
        expect(mockStart).toHaveBeenCalled();

        const initialCalls = mockStart.mock.calls.length;
        vi.advanceTimersByTime(1200);
        expect(mockStart.mock.calls.length).toBeGreaterThan(initialCalls);

        // Switch to acoustic vibe
        const beforeAcoustic = mockStart.mock.calls.length;
        engine.startMusic('acoustic');
        vi.advanceTimersByTime(840);
        expect(mockStart.mock.calls.length).toBeGreaterThan(beforeAcoustic);

        // Switch to zen vibe
        const beforeZen = mockStart.mock.calls.length;
        engine.startMusic('zen');
        vi.advanceTimersByTime(3200);
        expect(mockStart.mock.calls.length).toBeGreaterThan(beforeZen);

        engine.stopMusic();
        const afterStop = mockStart.mock.calls.length;
        vi.advanceTimersByTime(5000);
        expect(mockStart.mock.calls.length).toBe(afterStop);

        engine.dispose();
        expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('plays sound effects for step advance, step complete, timer alarm, and celebration fanfare', () => {
        const engine = new CookingAudioEngine();

        engine.playStepAdvance();
        expect(mockStart).toHaveBeenCalledTimes(2);

        mockStart.mockClear();
        engine.playStepComplete();
        expect(mockStart).toHaveBeenCalledTimes(2);

        mockStart.mockClear();
        engine.playTimerAlarm();
        expect(mockStart).toHaveBeenCalledTimes(4);

        mockStart.mockClear();
        engine.playCelebrationFanfare();
        expect(mockStart).toHaveBeenCalledTimes(6);

        engine.dispose();
    });

    it('gracefully handles environments without Web Audio API support', () => {
        Object.defineProperty(window, 'AudioContext', {
            writable: true,
            configurable: true,
            value: undefined,
        });

        const engine = new CookingAudioEngine();
        expect(() => {
            engine.startMusic('lofi');
            engine.playStepAdvance();
            engine.playTimerAlarm();
            engine.dispose();
        }).not.toThrow();
    });
});
