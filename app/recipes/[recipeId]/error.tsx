'use client';

import { FaHome, FaRedo } from 'react-icons/fa';
import { BiDish } from 'react-icons/bi';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/buttons/Button';
import { useTranslation } from 'react-i18next';

export default function RecipeError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { push } = useRouter() || {};
    const { t } = useTranslation();

    return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
            <div className="space-y-5 text-center dark:text-white">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-2xs dark:border-neutral-700/60 dark:bg-neutral-800">
                    <BiDish className="size-8 text-neutral-500 dark:text-neutral-400" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">
                        {t('recipe_not_found') || 'Recipe Not Found'}
                    </h2>
                    <p className="text-muted-foreground max-w-md">
                        {t('recipe_not_found_message') ||
                            "Sorry, we couldn't load this recipe. It may have been removed or the link might be incorrect."}
                    </p>
                </div>
                <div className="mt-8 flex justify-center gap-4">
                    <div className="w-40">
                        <Button
                            label={t('try_again') || 'Try Again'}
                            onClick={reset}
                            outline
                            icon={FaRedo}
                        />
                    </div>
                    <div className="w-40">
                        <Button
                            label={t('go_home') || 'Go Home'}
                            onClick={() => push('/')}
                            outline
                            icon={FaHome}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
