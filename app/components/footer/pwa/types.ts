import { IconType } from 'react-icons';

export type Platform = 'ios' | 'android' | 'desktop';

export interface PwaStep {
    number: number;
    icon: IconType;
    title: string;
    desc: string;
}

export interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
}
