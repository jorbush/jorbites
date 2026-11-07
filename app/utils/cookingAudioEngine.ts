export type MusicVibe = 'lofi' | 'acoustic' | 'zen';

const LOFI_CHORDS: number[][] = [
    [261.63, 329.63, 392.0, 493.88], // Cmaj7 (C4, E4, G4, B4)
    [220.0, 261.63, 329.63, 392.0], // Am7 (A3, C4, E4, G4)
    [293.66, 349.23, 440.0, 523.25], // Dm7 (D4, F4, A4, C5)
    [196.0, 246.94, 293.66, 349.23], // G7 (G3, B3, D4, F4)
];

const ACOUSTIC_NOTES: number[] = [
    261.63, // C4
    329.63, // E4
    392.0, // G4
    440.0, // A4
    523.25, // C5
    440.0, // A4
    392.0, // G4
    293.66, // D4
    329.63, // E4
    392.0, // G4
    523.25, // C5
    587.33, // D5
    523.25, // C5
    392.0, // G4
    329.63, // E4
    293.66, // D4
];

const ZEN_PADS: number[][] = [
    [261.63, 329.63, 392.0, 587.33], // Cmaj9
    [220.0, 329.63, 392.0, 493.88], // Am9
    [174.61, 261.63, 329.63, 440.0], // Fmaj7
    [196.0, 293.66, 392.0, 493.88], // G6
];

// Minimal 1-sample silent WAV data URI to switch iOS WebKit AVAudioSession to Playback mode
const SILENT_WAV_DATA_URI =
    'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

let sharedAudioContext: AudioContext | null = null;
let silentHtmlAudio: HTMLAudioElement | null = null;

function getAudioContextConstructor(): typeof AudioContext | null {
    if (typeof window === 'undefined') return null;
    return (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext ||
        null
    );
}

function getOrCreateSharedContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (sharedAudioContext && sharedAudioContext.state !== 'closed') {
        return sharedAudioContext;
    }
    const AudioCtx = getAudioContextConstructor();
    if (!AudioCtx) return null;
    try {
        sharedAudioContext = new AudioCtx();
        return sharedAudioContext;
    } catch {
        return null;
    }
}

/**
 * Synchronously unlocks Web Audio on iOS Safari and iOS standalone PWA.
 * Must be called directly inside a user gesture handler (click / touchstart / pointerdown).
 */
export function unlockCookingAudio(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    // 1. iOS 16.4+ / 17+ / 18+ navigator.audioSession API:
    // Routes Web Audio to the media 'playback' channel so it plays even when the iPhone hardware Ring/Silent switch is on Silent.
    try {
        const nav = navigator as Navigator & {
            audioSession?: { type: string };
        };
        if (nav.audioSession) {
            nav.audioSession.type = 'playback';
        }
    } catch {
        // Ignore on browsers without audioSession
    }

    // 2. Fallback for older iOS WebKit: playing an HTML5 <audio> element promotes the page audio session to playback
    try {
        if (typeof Audio !== 'undefined') {
            if (!silentHtmlAudio) {
                silentHtmlAudio = new Audio(SILENT_WAV_DATA_URI);
                silentHtmlAudio.volume = 0.01;
            }
            const playPromise = silentHtmlAudio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {});
            }
        }
    } catch {
        // Ignore in test environments
    }

    // 3. Create or resume Web Audio context and play a 1-frame silent buffer synchronously
    const ctx = getOrCreateSharedContext();
    if (!ctx) return null;

    try {
        if (ctx.state !== 'running' && typeof ctx.resume === 'function') {
            ctx.resume().catch(() => {});
        }
        if (
            typeof ctx.createBuffer === 'function' &&
            typeof ctx.createBufferSource === 'function'
        ) {
            const buffer = ctx.createBuffer(1, 1, 22050);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
        }
    } catch {
        // Ignore unlock errors in mock/restricted environments
    }

    return ctx;
}

export class CookingAudioEngine {
    private ctx: AudioContext | null = null;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private isPlaying = false;
    private vibe: MusicVibe = 'lofi';
    private stepCounter = 0;

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.ctx || this.ctx.state === 'closed') {
            this.ctx = getOrCreateSharedContext();
        }
        if (
            this.ctx &&
            this.ctx.state !== 'running' &&
            typeof this.ctx.resume === 'function'
        ) {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    public unlock(): void {
        const unlocked = unlockCookingAudio();
        if (unlocked) {
            this.ctx = unlocked;
        }
    }

    private scheduleToneOnContext(
        ctx: AudioContext,
        freq: number,
        options: {
            type?: OscillatorType;
            duration?: number;
            attack?: number;
            volume?: number;
            delay?: number;
            filterFreq?: number;
        }
    ) {
        const {
            type = 'sine',
            duration = 1.2,
            attack = 0.05,
            volume = 0.14,
            delay = 0,
            filterFreq = 1800,
        } = options;

        try {
            const now = ctx.currentTime + Math.max(0.01, delay);
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(filterFreq, now);

            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(volume, now + attack);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + duration + 0.05);
        } catch {
            // Ignore audio scheduling errors in restricted environments
        }
    }

    private playTone(
        freq: number,
        options: {
            type?: OscillatorType;
            duration?: number;
            attack?: number;
            volume?: number;
            delay?: number;
            filterFreq?: number;
        } = {}
    ) {
        const ctx = this.getContext();
        if (!ctx) return;

        this.scheduleToneOnContext(ctx, freq, options);
    }

    private tickLoop = () => {
        if (!this.isPlaying) return;

        if (this.vibe === 'lofi') {
            const chordIndex =
                Math.floor(this.stepCounter / 2) % LOFI_CHORDS.length;
            const chord = LOFI_CHORDS[chordIndex];
            const isDownbeat = this.stepCounter % 2 === 0;

            if (isDownbeat) {
                chord.forEach((freq, idx) => {
                    this.playTone(freq, {
                        type: 'triangle',
                        duration: 2.1,
                        attack: 0.06,
                        volume: 0.12,
                        delay: idx * 0.04,
                        filterFreq: 1800,
                    });
                });
            } else {
                const melodyFreq =
                    chord[(this.stepCounter + 1) % chord.length] * 1.5;
                this.playTone(melodyFreq, {
                    type: 'sine',
                    duration: 1.0,
                    attack: 0.04,
                    volume: 0.1,
                    filterFreq: 2000,
                });
            }
            // Warm bass root note in audible phone speaker range
            this.playTone(chord[0] / 2, {
                type: 'triangle',
                duration: 0.45,
                attack: 0.02,
                volume: 0.14,
                filterFreq: 900,
            });
        } else if (this.vibe === 'acoustic') {
            const note =
                ACOUSTIC_NOTES[this.stepCounter % ACOUSTIC_NOTES.length];
            this.playTone(note, {
                type: 'triangle',
                duration: 1.0,
                attack: 0.015,
                volume: 0.15,
                filterFreq: 2200,
            });
            if (this.stepCounter % 4 === 0) {
                this.playTone(note / 2, {
                    type: 'sine',
                    duration: 1.6,
                    attack: 0.03,
                    volume: 0.13,
                    filterFreq: 1400,
                });
            }
        } else if (this.vibe === 'zen') {
            const pad = ZEN_PADS[this.stepCounter % ZEN_PADS.length];
            pad.forEach((freq, idx) => {
                this.playTone(freq, {
                    type: 'sine',
                    duration: 3.4,
                    attack: 0.6,
                    volume: 0.1,
                    delay: idx * 0.12,
                    filterFreq: 1600,
                });
            });
        }

        this.stepCounter += 1;
    };

    private getIntervalMs(): number {
        switch (this.vibe) {
            case 'lofi':
                return 1200;
            case 'acoustic':
                return 420;
            case 'zen':
                return 3200;
        }
    }

    public startMusic(vibe?: MusicVibe) {
        if (vibe) {
            this.vibe = vibe;
        }
        this.stopLoopOnly();
        this.isPlaying = true;
        this.stepCounter = 0;
        this.tickLoop();
        this.intervalId = setInterval(this.tickLoop, this.getIntervalMs());
    }

    private stopLoopOnly() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    public stopMusic() {
        this.isPlaying = false;
        this.stopLoopOnly();
    }

    public playStepAdvance() {
        this.playTone(523.25, {
            type: 'sine',
            duration: 0.18,
            attack: 0.01,
            volume: 0.16,
            filterFreq: 2400,
        });
        this.playTone(659.25, {
            type: 'sine',
            duration: 0.24,
            attack: 0.01,
            volume: 0.16,
            delay: 0.06,
            filterFreq: 2400,
        });
    }

    public playStepComplete() {
        this.playTone(523.25, {
            type: 'triangle',
            duration: 0.22,
            attack: 0.01,
            volume: 0.2,
            filterFreq: 2400,
        });
        this.playTone(783.99, {
            type: 'triangle',
            duration: 0.45,
            attack: 0.01,
            volume: 0.22,
            delay: 0.09,
            filterFreq: 2400,
        });
    }

    public playTimerAlarm() {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
            this.playTone(freq, {
                type: 'triangle',
                duration: 0.35,
                attack: 0.01,
                volume: 0.24,
                delay: idx * 0.14,
                filterFreq: 2600,
            });
        });
    }

    public playCelebrationFanfare() {
        const fanfare = [261.63, 329.63, 392.0, 493.88, 587.33, 783.99];
        fanfare.forEach((freq, idx) => {
            this.playTone(freq, {
                type: 'triangle',
                duration: 1.1,
                attack: 0.02,
                volume: 0.22,
                delay: idx * 0.09,
                filterFreq: 2400,
            });
        });
    }

    public dispose() {
        this.stopMusic();
        if (this.ctx) {
            this.ctx.close().catch(() => {});
            if (sharedAudioContext === this.ctx) {
                sharedAudioContext = null;
            }
            this.ctx = null;
        }
    }
}
