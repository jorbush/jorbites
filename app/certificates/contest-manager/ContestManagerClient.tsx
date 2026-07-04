'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import SectionHeader from '@/app/components/utils/SectionHeader';
import CourseStepper from '@/app/components/certificates/CourseStepper';
import CourseTest from '@/app/components/certificates/CourseTest';
import CertificateGenerator from '@/app/components/certificates/CertificateGenerator';
import { contestManagerQuestions } from './contestManagerQuestions';
import {
    FcDiploma1,
    FcRules,
    FcProcess,
    FcSurvey,
    FcPicture,
    FcFeedback,
    FcGraduationCap,
} from 'react-icons/fc';
import {
    FiCopy,
    FiCheck,
    FiMail,
    FiInstagram,
    FiChevronLeft,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import useIsMounted from '@/app/hooks/useIsMounted';
import Button from '@/app/components/buttons/Button';

// ---------------------------------------------------------------------------
// Storage key constants (versioned to allow future shape changes)
// ---------------------------------------------------------------------------
const MODULES_KEY = 'jorbites_cert_contest_manager_modules:v1';
const PROGRESS_KEY = 'jorbites_cert_contest_manager_progress:v1';

type ModulesState = Record<string, boolean>;

const DEFAULT_MODULES: ModulesState = {
    requirements: false,
    workflow: false,
    voting: false,
    badge: false,
    contact: false,
    test: false,
};

function loadModules(): ModulesState {
    if (typeof window === 'undefined') return DEFAULT_MODULES;
    try {
        const stored = localStorage.getItem(MODULES_KEY);
        if (stored) return JSON.parse(stored) as ModulesState;
    } catch {
        // ignore corrupt data
    }
    return DEFAULT_MODULES;
}

// ---------------------------------------------------------------------------
// Helper: compute and persist progress
// ---------------------------------------------------------------------------
function persistModules(updated: ModulesState) {
    localStorage.setItem(MODULES_KEY, JSON.stringify(updated));
    const keys = Object.keys(updated);
    const completedCount = keys.filter((k) => updated[k]).length;
    const percentage = Math.round((completedCount / keys.length) * 100);
    localStorage.setItem(PROGRESS_KEY, percentage.toString());
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface RequirementsModuleProps {
    reqs: { recipes: boolean; theme: boolean; badge: boolean; announcement: boolean };
    onChange: (key: keyof RequirementsModuleProps['reqs'], value: boolean) => void;
}

const RequirementsModule: React.FC<RequirementsModuleProps> = ({ reqs, onChange }) => (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 flex items-center gap-3">
            <FcRules className="size-8" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Requirements Checklist
            </h2>
        </div>
        <div className="prose prose-neutral dark:prose-invert mb-8 max-w-none text-neutral-600 dark:text-neutral-300">
            <p>
                To maintain the high quality of events in the Jorbites community,
                we have established core requirements for organizing contests:
            </p>
            <ul className="list-disc space-y-2 pl-5">
                <li>
                    <strong>Recipe Commitment:</strong>{' '}
                    You must compromise that the participants of the contest will
                    post at least 5 recipes in total during the event.
                </li>
                <li>
                    <strong>Contest Theme:</strong>{' '}
                    Define a clear culinary theme (e.g. &quot;Best Homemade
                    Pizza&quot; or &quot;Healthy Autumn Soups&quot;) to focus
                    participants.
                </li>
                <li>
                    <strong>Visual Badge:</strong> Every contest needs a unique
                    badge. You can easily generate it using AI (we teach you this
                    in Module 4).
                </li>
                <li>
                    <strong>Announcement details:</strong>{' '}
                    Prep the dates, times, and gathering details so users know
                    where and when the event is happening.
                </li>
            </ul>
        </div>

        <div className="border-t border-neutral-100 pt-6 dark:border-neutral-800">
            <h4 className="mb-4 text-sm font-bold tracking-wider text-neutral-400 uppercase">
                Action Required: Complete Checklist
            </h4>
            <div className="space-y-3">
                {(
                    [
                        {
                            key: 'recipes' as const,
                            id: 'req-recipes',
                            label: 'I compromise that the participants will post at least 5 recipes in total during the contest.',
                        },
                        {
                            key: 'theme' as const,
                            id: 'req-theme',
                            label: 'I have defined a clear culinary theme for my contest.',
                        },
                        {
                            key: 'badge' as const,
                            id: 'req-badge',
                            label: 'I know how to design/generate a badge for the event.',
                        },
                        {
                            key: 'announcement' as const,
                            id: 'req-announcement',
                            label: 'I have drafted the contest dates and location description.',
                        },
                    ] as const
                ).map(({ key, id, label }) => (
                    <label
                        key={key}
                        htmlFor={id}
                        className="flex cursor-pointer items-start gap-3"
                    >
                        <input
                            id={id}
                            type="checkbox"
                            checked={reqs[key]}
                            onChange={(e) => onChange(key, e.target.checked)}
                            className="text-green-450 focus:ring-green-450 mt-1 size-4 rounded-sm border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950"
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            {label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    </div>
);

// ---------------------------------------------------------------------------

interface WorkflowModuleProps {
    workflowStep: number;
    onNextStep: () => void;
    onComplete: () => void;
}

const WORKFLOW_STEPS = [
    {
        step: 1,
        title: 'Step 1: Get Approved',
        desc: 'Contact administrators (email or instagram) with your planned contest theme and confirm you meet the 5-recipe requirement.',
    },
    {
        step: 2,
        title: 'Step 2: Announce on Jorbites',
        desc: 'Once approved, administrators will post your event to the official Jorbites Events calendar so participants can discover it.',
    },
    {
        step: 3,
        title: 'Step 3: Notify & Invite Participants',
        desc: 'Share the events page link with your closed circle, friends, and community members.',
    },
    {
        step: 4,
        title: 'Step 4: Contest Day',
        desc: 'Everyone gathers, preps their ingredients, posts their cooking recipe on the platform, and eats the delicious results together.',
    },
    {
        step: 5,
        title: 'Step 5: Votation',
        desc: 'Once everyone finished eating, participants submit their votes via the Jorbites Google Form template.',
    },
];

const WorkflowModule: React.FC<WorkflowModuleProps> = ({
    workflowStep,
    onNextStep,
    onComplete,
}) => (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 flex items-center gap-3">
            <FcProcess className="size-8" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Contest Workflow
            </h2>
        </div>
        <div className="mb-8 space-y-6">
            {WORKFLOW_STEPS.map((item) => {
                const isActive = workflowStep >= item.step;
                return (
                    <div key={item.step} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex size-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                                    isActive
                                        ? 'bg-green-450 border-green-450 text-neutral-950'
                                        : 'border-neutral-300 bg-neutral-100 text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800'
                                }`}
                            >
                                {item.step}
                            </div>
                            {item.step < 5 && (
                                <div
                                    className={`w-0.5 grow transition-all duration-300 ${
                                        workflowStep > item.step
                                            ? 'bg-green-450'
                                            : 'bg-neutral-200 dark:bg-neutral-800'
                                    }`}
                                />
                            )}
                        </div>
                        <div
                            className={`pb-6 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}
                        >
                            <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                                {item.title}
                            </h4>
                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-100 pt-6 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-500 uppercase">
                Interactive Walkthrough ({workflowStep}/5)
            </span>
            <div className="flex gap-2">
                {workflowStep < 5 ? (
                    <div className="w-fit">
                        <Button
                            label="Next Step"
                            onClick={onNextStep}
                            small
                        />
                    </div>
                ) : (
                    <div className="w-fit">
                        <Button
                            label="Mark Completed"
                            onClick={onComplete}
                            small
                        />
                    </div>
                )}
            </div>
        </div>
    </div>
);

// ---------------------------------------------------------------------------

interface VotingModuleProps {
    participantUserId: string;
    participantRecipeUrl: string;
    onUserIdChange: (v: string) => void;
    onRecipeUrlChange: (v: string) => void;
    generatedFormUrl: string;
    onCopyFormLink: () => void;
}

const VotingModule: React.FC<VotingModuleProps> = ({
    participantUserId,
    participantRecipeUrl,
    onUserIdChange,
    onRecipeUrlChange,
    generatedFormUrl,
    onCopyFormLink,
}) => (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 flex items-center gap-3">
            <FcSurvey className="size-8" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Voting Integration
            </h2>
        </div>
        <div className="prose prose-neutral dark:prose-invert mb-6 max-w-none space-y-4 text-neutral-600 dark:text-neutral-300">
            <p>
                Voting is conducted via a dedicated Google Form which
                automatically maps votes to specific participants and recipes.
            </p>
            <p className="text-sm">
                The form link accepts two query parameters to prefill the
                participant details:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
                <li>
                    <code>entry.342170842</code>: The URL of the posted recipe
                    (found by clicking the recipe &quot;Share&quot; button).
                </li>
                <li>
                    <code>entry.767643834</code>: The participant user ID
                    (extracted from their Jorbites profile URL, e.g.{' '}
                    <code>/profile/{'{id}'}</code>).
                </li>
            </ul>
        </div>

        {/* URL Prefill Builder Simulator */}
        <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-950/40">
            <h4 className="mb-3 text-sm font-bold text-neutral-800 dark:text-neutral-200">
                Live Voting URL Builder
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="voting-recipe-url"
                        className="mb-1 block text-xs font-semibold text-neutral-500 dark:text-neutral-400"
                    >
                        Participant Recipe URL
                    </label>
                    <input
                        id="voting-recipe-url"
                        type="text"
                        value={participantRecipeUrl}
                        onChange={(e) => onRecipeUrlChange(e.target.value)}
                        placeholder="e.g. https://jorbites.com/recipes/clw8s0921"
                        className="focus:border-green-450 w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                </div>
                <div>
                    <label
                        htmlFor="voting-user-id"
                        className="mb-1 block text-xs font-semibold text-neutral-500 dark:text-neutral-400"
                    >
                        Participant User ID
                    </label>
                    <input
                        id="voting-user-id"
                        type="text"
                        value={participantUserId}
                        onChange={(e) => onUserIdChange(e.target.value)}
                        placeholder="e.g. clw8a4128"
                        className="focus:border-green-450 w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                </div>
            </div>

            <div className="mt-4 border-t border-neutral-200/55 pt-4 dark:border-neutral-800">
                <label
                    htmlFor="voting-generated-url"
                    className="mb-1 block text-xs font-semibold text-neutral-500 dark:text-neutral-400"
                >
                    Generated Google Form Link
                </label>
                <div className="flex gap-2">
                    <input
                        id="voting-generated-url"
                        type="text"
                        readOnly
                        value={generatedFormUrl}
                        aria-label="Generated Google Form voting link"
                        className="flex-1 rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-[10px] text-neutral-600 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400"
                    />
                    <button
                        type="button"
                        onClick={onCopyFormLink}
                        aria-label="Copy generated form link and complete module"
                        className="bg-green-450 inline-flex cursor-pointer items-center justify-center rounded-lg px-3 text-xs font-semibold text-neutral-950 transition hover:opacity-90"
                        title="Copy & Complete Module"
                    >
                        <FiCopy className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ---------------------------------------------------------------------------

interface BadgeModuleProps {
    badgeXTopic: string;
    rawBadgePrompt: string;
    copiedBadgePrompt: boolean;
    onTopicChange: (v: string) => void;
    onCopyPrompt: () => void;
}

const BadgeModule: React.FC<BadgeModuleProps> = ({
    badgeXTopic,
    rawBadgePrompt,
    copiedBadgePrompt,
    onTopicChange,
    onCopyPrompt,
}) => (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 flex items-center gap-3">
            <FcPicture className="size-8" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Generating Badges with AI
            </h2>
        </div>
        <div className="prose prose-neutral dark:prose-invert mb-6 max-w-none space-y-4 text-neutral-600 dark:text-neutral-300">
            <p>
                Contest organizers create stylized badges for winners and
                participants using AI image generators.
            </p>
            <p className="text-sm">
                By using a consistent vintage cartoon theme, we maintain a
                beautiful cohesive design language across all events.
            </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-950/40">
            <h4 className="mb-3 text-sm font-bold text-neutral-800 dark:text-neutral-200">
                AI Prompt Builder
            </h4>
            <div className="mb-4">
                <label
                    htmlFor="badge-topic"
                    className="mb-1 block text-xs font-semibold text-neutral-500 dark:text-neutral-400"
                >
                    What recipe/topic is the contest about? (X)
                </label>
                <input
                    id="badge-topic"
                    type="text"
                    value={badgeXTopic}
                    onChange={(e) => onTopicChange(e.target.value)}
                    placeholder="e.g. Sushi, Burgers, Vegan Soups"
                    className="focus:border-green-450 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                />
            </div>

            <div className="relative rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                <p className="pr-8 font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {rawBadgePrompt}
                </p>
                <button
                    type="button"
                    onClick={onCopyPrompt}
                    aria-label="Copy AI badge prompt"
                    className="absolute top-3 right-3 text-neutral-500 transition hover:text-neutral-800 dark:hover:text-white"
                    title="Copy prompt"
                >
                    {copiedBadgePrompt ? (
                        <FiCheck className="text-green-450 size-4" />
                    ) : (
                        <FiCopy className="size-4" />
                    )}
                </button>
            </div>
        </div>
    </div>
);

// ---------------------------------------------------------------------------

interface ContactModuleProps {
    onContactClick: () => void;
}

const ContactModule: React.FC<ContactModuleProps> = ({ onContactClick }) => (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 flex items-center gap-3">
            <FcFeedback className="size-8" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Contacting Administrators
            </h2>
        </div>
        <div className="prose prose-neutral dark:prose-invert mb-8 max-w-none space-y-4 text-neutral-600 dark:text-neutral-300">
            <p>
                Once you have the badge, details, and requirements ready, reach
                out to the Jorbites admin team. They will verify your
                requirements (including checking if you have posted at least 5
                recipes) and add the contest to the events feed.
            </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
                href="mailto:jbonetv5@gmail.com?subject=Jorbites%20New%20Contest%20Request&body=Hi%20Jorbites%20Team%2C%0A%0AI%20would%20like%20to%20organize%20a%20new%20cooking%20contest%20with%20my%20friends.%0A%0ATheme%3A%20%0ADate%20%26%20Time%3A%20%0AMy%20User%20Profile%20URL%3A%20"
                onClick={onContactClick}
                className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 p-6 text-center transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
            >
                <FiMail className="text-green-450 mb-3 size-8" />
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Send Email Request
                </span>
                <span className="mt-1 text-xs text-neutral-500">
                    jbonetv5@gmail.com
                </span>
            </a>

            <a
                href="https://instagram.com/jorbites"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onContactClick}
                className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 p-6 text-center transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
            >
                <FiInstagram className="mb-3 size-8 text-[#E1306C]" />
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Instagram Direct Message
                </span>
                <span className="mt-1 text-xs text-neutral-500">
                    @jorbites
                </span>
            </a>
        </div>
    </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ContestManagerClientProps {
    currentUser?: SafeUser | null;
}

const ContestManagerClient: React.FC<ContestManagerClientProps> = ({
    currentUser,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const isMounted = useIsMounted();

    // Lazy-initialised from localStorage (no mount effect needed)
    const [completedModules, setCompletedModules] = useState<ModulesState>(loadModules);

    const [activeModuleId, setActiveModuleId] = useState('requirements');

    // Requirements checklist
    const [reqs, setReqs] = useState({
        recipes: false,
        theme: false,
        badge: false,
        announcement: false,
    });

    // Workflow current step
    const [workflowStep, setWorkflowStep] = useState(1);

    // Voting url pre-fill generator
    const [participantUserId, setParticipantUserId] = useState('');
    const [participantRecipeUrl, setParticipantRecipeUrl] = useState('');

    // AI Badge prompt customizer
    const [badgeXTopic, setBadgeXTopic] = useState('Italian Pasta');
    const [copiedBadgePrompt, setCopiedBadgePrompt] = useState(false);

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    const markModuleCompleted = useCallback(
        (id: string) => {
            if (completedModules[id]) return;
            const updated = { ...completedModules, [id]: true };
            setCompletedModules(updated);
            persistModules(updated);
            toast.success('Module completed!');
        },
        [completedModules]
    );

    // Requirements: called from onChange so no effect needed
    const handleReqChange = useCallback(
        (key: keyof typeof reqs, value: boolean) => {
            const next = { ...reqs, [key]: value };
            setReqs(next);
            // Complete module once all boxes are checked
            if (next.recipes && next.theme && next.badge && next.announcement) {
                markModuleCompleted('requirements');
            }
        },
        [reqs, markModuleCompleted]
    );

    const generatedFormUrl = useMemo(() => {
        const userId = participantUserId.trim() || '{participant_user_id}';
        const recipeUrl = participantRecipeUrl.trim() || '{participant_recipe_url}';
        return `https://docs.google.com/forms/d/e/1FAIpQLScze8Mi_GjtY6vEMNdtIDEMGKH4SqS0rRmB3UKzwPXKvRjhZQ/viewform?usp=pp_url&entry.342170842=${encodeURIComponent(recipeUrl)}&entry.767643834=${encodeURIComponent(userId)}`;
    }, [participantUserId, participantRecipeUrl]);

    const copyFormLink = useCallback(() => {
        navigator.clipboard.writeText(generatedFormUrl);
        toast.success('Form URL copied to clipboard!');
        markModuleCompleted('voting');
    }, [generatedFormUrl, markModuleCompleted]);

    const rawBadgePrompt = `can you generate me a vintage minimalist cartoon badge for my website call Jorbites about recipes, the logo is an avocado. The badge is for a contest of "${badgeXTopic}", about ${badgeXTopic} recipes. avoid beige colors. aspect ratio 1:1`;

    const copyBadgePrompt = useCallback(() => {
        navigator.clipboard.writeText(rawBadgePrompt);
        setCopiedBadgePrompt(true);
        toast.success('AI Badge Prompt copied!');
        markModuleCompleted('badge');
        setTimeout(() => setCopiedBadgePrompt(false), 2000);
    }, [rawBadgePrompt, markModuleCompleted]);

    if (!isMounted) return null;

    const modules = [
        { id: 'requirements', title: t('requirements'), isCompleted: completedModules.requirements, icon: FcRules },
        { id: 'workflow', title: t('workflow'), isCompleted: completedModules.workflow, icon: FcProcess },
        { id: 'voting', title: t('voting'), isCompleted: completedModules.voting, icon: FcSurvey },
        { id: 'badge', title: t('generate_badge'), isCompleted: completedModules.badge, icon: FcPicture },
        { id: 'contact', title: t('contact_admin'), isCompleted: completedModules.contact, icon: FcFeedback },
        { id: 'test', title: t('final_test'), isCompleted: completedModules.test, icon: FcGraduationCap },
    ];

    return (
        <Container>
            <div className="px-4 py-8">
                {/* Back Button */}
                <button
                    type="button"
                    onClick={() => router.push('/certificates')}
                    className="mb-6 flex items-center gap-2 text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                    <FiChevronLeft className="cursor-pointer text-xl" />
                    <span>{t('back') || 'Back'}</span>
                </button>

                <SectionHeader
                    icon={FcDiploma1}
                    title={t('contest_manager_certificate')}
                    description="Complete the 5 lessons and pass the final test to receive your official Jorbites certificate."
                />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                    {/* Stepper Side Navigation */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                            <h4 className="mb-4 px-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                                Course Steps
                            </h4>
                            <CourseStepper
                                modules={modules}
                                activeModuleId={activeModuleId}
                                onSelectModule={setActiveModuleId}
                            />
                        </div>
                    </div>

                    {/* Module content panels */}
                    <div className="space-y-6 md:col-span-8 lg:col-span-9">
                        {/* 1. Requirements */}
                        {activeModuleId === 'requirements' && (
                            <RequirementsModule
                                reqs={reqs}
                                onChange={handleReqChange}
                            />
                        )}

                        {/* 2. Workflow */}
                        {activeModuleId === 'workflow' && (
                            <WorkflowModule
                                workflowStep={workflowStep}
                                onNextStep={() => setWorkflowStep((prev) => prev + 1)}
                                onComplete={() => markModuleCompleted('workflow')}
                            />
                        )}

                        {/* 3. Voting */}
                        {activeModuleId === 'voting' && (
                            <VotingModule
                                participantUserId={participantUserId}
                                participantRecipeUrl={participantRecipeUrl}
                                onUserIdChange={setParticipantUserId}
                                onRecipeUrlChange={setParticipantRecipeUrl}
                                generatedFormUrl={generatedFormUrl}
                                onCopyFormLink={copyFormLink}
                            />
                        )}

                        {/* 4. AI Badge */}
                        {activeModuleId === 'badge' && (
                            <BadgeModule
                                badgeXTopic={badgeXTopic}
                                rawBadgePrompt={rawBadgePrompt}
                                copiedBadgePrompt={copiedBadgePrompt}
                                onTopicChange={setBadgeXTopic}
                                onCopyPrompt={copyBadgePrompt}
                            />
                        )}

                        {/* 5. Contact Admin */}
                        {activeModuleId === 'contact' && (
                            <ContactModule
                                onContactClick={() => markModuleCompleted('contact')}
                            />
                        )}

                        {/* 6. Final Test */}
                        {activeModuleId === 'test' && (
                            <div className="space-y-6">
                                <CourseTest
                                    questions={contestManagerQuestions}
                                    onPass={() => markModuleCompleted('test')}
                                />

                                {completedModules.test && (
                                    <CertificateGenerator
                                        courseTitle="Contest Manager Certificate"
                                        currentUserNames={currentUser?.name}
                                        badgePath="/badges/contest_manager_badge.jpg"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default ContestManagerClient;
