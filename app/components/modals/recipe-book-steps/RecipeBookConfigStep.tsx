'use client';

import { useTranslation } from 'react-i18next';
import Dropdown from '@/app/components/utils/Dropdown';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';
import { RecipeBookConfig } from '@/app/utils/recipeBookUtils';
import { RecipeBookAction } from '@/app/hooks/recipeBookReducer';

interface RecipeBookConfigStepProps {
    config: RecipeBookConfig;
    dispatch: (action: RecipeBookAction) => void;
}

const RecipeBookConfigStep: React.FC<RecipeBookConfigStepProps> = ({
    config,
    dispatch,
}) => {
    const { t } = useTranslation();
    const { imageDisplay, displayExtraImages, displayUserImage } = config;

    const imageDisplayOptions: {
        value: RecipeBookConfig['imageDisplay'];
        label: string;
    }[] = [
        { value: 'random', label: t('random') || 'Random' },
        { value: 'left-top', label: t('top_left') || 'Top Left' },
        { value: 'right-top', label: t('top_right') || 'Top Right' },
        { value: 'left-bottom', label: t('bottom_left') || 'Bottom Left' },
        { value: 'right-bottom', label: t('bottom_right') || 'Bottom Right' },
    ];

    const currentOption = imageDisplayOptions.find(
        (opt) => opt.value === imageDisplay
    );

    const dropdownButton = (
        <span className="text-sm font-medium">{currentOption?.label}</span>
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Dropdown field */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        {t('recipe_image_display') || 'Recipe image display'}
                    </span>
                </div>
                <Dropdown
                    options={imageDisplayOptions}
                    value={imageDisplay}
                    onChange={(val) =>
                        dispatch({ type: 'SET_IMAGE_DISPLAY', payload: val })
                    }
                    buttonContent={dropdownButton}
                    ariaLabel={
                        t('recipe_image_display') || 'Recipe image display'
                    }
                    data-cy="image-display-dropdown"
                />
            </div>

            {/* Switch: Display extra images */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {t('display_extra_images') || 'Display extra images'}
                </span>
                <ToggleSwitch
                    checked={displayExtraImages}
                    onChange={() => dispatch({ type: 'TOGGLE_EXTRA_IMAGES' })}
                    dataCy="extra-images-toggle"
                />
            </div>

            {/* Switch: Display user image on cover */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {t('display_user_image_in_cover') ||
                        'Display user image on cover'}
                </span>
                <ToggleSwitch
                    checked={displayUserImage}
                    onChange={() => dispatch({ type: 'TOGGLE_USER_IMAGE' })}
                    dataCy="user-image-toggle"
                />
            </div>
        </div>
    );
};

export default RecipeBookConfigStep;
