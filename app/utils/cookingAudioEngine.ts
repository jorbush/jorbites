export type MusicVibe = 'lofi' | 'acoustic' | 'zen';

const LOFI_CHORDS: number[][] = [
    [174.61, 220.0, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
    [164.81, 196.0, 246.94, 293.66], // Em7 (E3, G3, B3, D4)
    [146.83, 174.61, 220.0, 261.63], // Dm7 (D3, F3, A3, C4)
    [130.81, 164.81, 196.0, 246.94], // Cmaj7 (C3, E3, G3, B3)
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
    [130.81, 196.0, 246.94, 293.66, 329.63], // Cmaj9
    [174.61, 220.0, 261.63, 329.63, 392.0], // Fmaj9
    [196.0, 246.94, 293.66, 392.0, 440.0], // G6/9
    [220.0, 261.63, 329.63, 392.0, 493.88], // Am9
];

export class CookingAudioEngine {
    private ctx: AudioContext | null = null;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private isPlaying = false;
    private isMuted = false;
    private vibe: MusicVibe = 'lofi';
    private stepCounter = 0;

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            const AudioCtx =
                window.AudioContext ||
                (
                    window as unknown as {
                        webkitAudioContext?: typeof AudioContext;
                    }
                ).webkitAudioContext;
            if (!AudioCtx) return null;
            try {
                this.ctx = new AudioCtx();
            } catch {
                return null;
            }
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
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
        if (this.isMuted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const {
            type = 'sine',
            duration = 1.2,
            attack = 0.05,
            volume = 0.06,
            delay = 0,
            filterFreq = 1100,
        } = options;

        try {
            const now = ctx.currentTime + delay;
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

    private tickLoop = () => {
        if (!this.isPlaying || this.isMuted) return;

        if (this.vibe === 'lofi') {
            const chordIndex =
                Math.floor(this.stepCounter / 2) % LOFI_CHORDS.length;
            const chord = LOFI_CHORDS[chordIndex];
            const isDownbeat = this.stepCounter % 2 === 0;

            if (isDownbeat) {
                chord.forEach((freq, idx) => {
                    this.playTone(freq, {
                        type: 'triangle',
                        duration: 2.2,
                        attack: 0.08,
                        volume: 0.035,
                        delay: idx * 0.04,
                        filterFreq: 900,
                    });
                });
            } else {
                // Gentle melodic grace note on the off-beat
                const melodyFreq =
                    chord[(this.stepCounter + 1) % chord.length] * 2;
                this.playTone(melodyFreq, {
                    type: 'sine',
                    duration: 1.1,
                    attack: 0.04,
                    volume: 0.025,
                    filterFreq: 1200,
                });
            }
            // Subtle warm sub-pulse
            this.playTone(65.41, {
                type: 'sine',
                duration: 0.25,
                attack: 0.01,
                volume: 0.04,
                filterFreq: 200,
            });
        } else if (this.vibe === 'acoustic') {
            const note =
                ACOUSTIC_NOTES[this.stepCounter % ACOUSTIC_NOTES.length];
            this.playTone(note, {
                type: 'triangle',
                duration: 1.1,
                attack: 0.015,
                volume: 0.045,
                filterFreq: 1600,
            });
            if (this.stepCounter % 4 === 0) {
                this.playTone(note / 2, {
                    type: 'sine',
                    duration: 1.8,
                    attack: 0.03,
                    volume: 0.04,
                    filterFreq: 800,
                });
            }
        } else if (this.vibe === 'zen') {
            const pad = ZEN_PADS[this.stepCounter % ZEN_PADS.length];
            pad.forEach((freq, idx) => {
                this.playTone(freq, {
                    type: 'sine',
                    duration: 3.6,
                    attack: 0.9,
                    volume: 0.028,
                    delay: idx * 0.12,
                    filterFreq: 800,
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

    public setVibe(vibe: MusicVibe) {
        this.vibe = vibe;
        if (this.isPlaying) {
            this.startMusic(vibe);
        }
    }

    public setMuted(muted: boolean) {
        this.isMuted = muted;
    }

    public getIsPlaying(): boolean {
        return this.isPlaying;
    }

    public getVibe(): MusicVibe {
        return this.vibe;
    }

    public playStepAdvance() {
        this.playTone(523.25, {
            type: 'sine',
            duration: 0.16,
            attack: 0.01,
            volume: 0.05,
        });
        this.playTone(659.25, {
            type: 'sine',
            duration: 0.22,
            attack: 0.01,
            volume: 0.05,
            delay: 0.06,
        });
    }

    public playStepComplete() {
        this.playTone(523.25, {
            type: 'triangle',
            duration: 0.2,
            attack: 0.01,
            volume: 0.07,
        });
        this.playTone(783.99, {
            type: 'triangle',
            duration: 0.45,
            attack: 0.01,
            volume: 0.08,
            delay: 0.09,
        });
    }

    public playTimerAlarm() {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
            this.playTone(freq, {
                type: 'triangle',
                duration: 0.35,
                attack: 0.01,
                volume: 0.09,
                delay: idx * 0.14,
                filterFreq: 2000,
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
                volume: 0.08,
                delay: idx * 0.09,
                filterFreq: 1800,
            });
        });
    }

    public dispose() {
        this.stopMusic();
        if (this.ctx) {
            this.ctx.close().catch(() => {});
            this.ctx = null;
        }
    }
}
