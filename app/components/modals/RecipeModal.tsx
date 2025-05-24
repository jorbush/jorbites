'use client';

import useRecipeModal from '@/app/hooks/useRecipeModal';
import Modal from '@/app/components/modals/Modal';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Heading from '@/app/components/navigation/Heading';
import { categories } from '@/app/components/navbar/Categories';
import CategoryInput from '@/app/components/inputs/CategoryInput';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import Button from '@/app/components/buttons/Button';
import { AiFillDelete } from 'react-icons/ai';
import Input from '@/app/components/inputs/Input';
import Counter from '@/app/components/inputs/Counter';
import ImageUpload from '@/app/components/inputs/ImageUpload';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { GiCookingPot, GiPressureCooker } from 'react-icons/gi';
import { MdMicrowave } from 'react-icons/md';
import { TbCooker } from 'react-icons/tb';
import { CgSmartHomeCooker } from 'react-icons/cg';
import { useTranslation } from 'react-i18next';
import { FiUploadCloud } from 'react-icons/fi';
import { SafeUser } from '@/app/types';
import RelatedContentStep from '@/app/components/modals/recipe-steps/RelatedContentStep';
import {
    RECIPE_TITLE_MAX_LENGTH,
    RECIPE_DESCRIPTION_MAX_LENGTH,
    RECIPE_INGREDIENT_MAX_LENGTH,
    RECIPE_STEP_MAX_LENGTH,
} from '@/app/utils/constants';

/* eslint-disable unused-imports/no-unused-vars */
enum STEPS {
    CATEGORY = 0,
    DESCRIPTION = 1,
    INGREDIENTS = 2,
    METHODS = 3,
    STEPS = 4,
    RELATED_CONTENT = 5,
    IMAGES = 6,
}

export const preparationMethods = [
    {
        label: 'Frying pan',
        icon: GiCookingPot,
    },
    {
        label: 'Microwave',
        icon: MdMicrowave,
    },
    {
        label: 'Air fryer',
        icon: GiPressureCooker,
    },
    {
        label: 'Deep fryer',
        icon: CgSmartHomeCooker,
    },
    {
        label: 'Oven',
        icon: TbCooker,
    },
];

interface RecipeModalProps {
    currentUser?: SafeUser | null;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ currentUser }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const recipeModal = useRecipeModal();
    const [step, setStep] = useState(STEPS.CATEGORY);
    const [numIngredients, setNumIngredients] = useState(1);
    const [numSteps, setNumSteps] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const hasLoadedDraft = useRef(false);
    const [selectedCoCooks, setSelectedCoCooks] = useState<any[]>([]);
    const [selectedLinkedRecipes, setSelectedLinkedRecipes] = useState<any[]>(
        []
    );

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm<FieldValues>({
        defaultValues: {
            category: '',
            method: '',
            imageSrc: '',
            imageSrc1: '',
            imageSrc2: '',
            imageSrc3: '',
            title: '',
            description: '',
            ingredients: [],
            steps: [],
            minutes: 30,
            coCooksIds: [],
            linkedRecipeIds: [],
        },
    });

    const category = watch('category');
    const minutes = watch('minutes');
    const imageSrc = watch('imageSrc');
    const method = watch('method');

    const addCoCook = (user: any) => {
        if (selectedCoCooks.length >= 4) {
            toast.error(
                t('max_cooks_reached') || 'Maximum of 4 co-cooks allowed'
            );
            return;
        }

        if (selectedCoCooks.some((cook) => cook.id === user.id)) {
            toast.error(
                t('cook_already_added') || 'This cook is already added'
            );
            return;
        }

        const newSelectedCoCooks = [...selectedCoCooks, user];
        setSelectedCoCooks(newSelectedCoCooks);
        setValue(
            'coCooksIds',
            newSelectedCoCooks.map((cook) => cook.id)
        );
    };

    const removeCoCook = (userId: string) => {
        const updatedCooks = selectedCoCooks.filter(
            (cook) => cook.id !== userId
        );
        setSelectedCoCooks(updatedCooks);
        setValue(
            'coCooksIds',
            updatedCooks.map((cook) => cook.id)
        );
    };

    const addLinkedRecipe = (recipe: any) => {
        if (selectedLinkedRecipes.length >= 2) {
            toast.error(
                t('max_recipes_reached') ||
                    'Maximum of 2 linked recipes allowed'
            );
            return;
        }

        if (selectedLinkedRecipes.some((r) => r.id === recipe.id)) {
            toast.error(
                t('recipe_already_added') || 'This recipe is already added'
            );
            return;
        }

        const newLinkedRecipes = [...selectedLinkedRecipes, recipe];
        setSelectedLinkedRecipes(newLinkedRecipes);
        setValue(
            'linkedRecipeIds',
            newLinkedRecipes.map((r) => r.id)
        );
    };

    const removeLinkedRecipe = (recipeId: string) => {
        const updatedRecipes = selectedLinkedRecipes.filter(
            (recipe) => recipe.id !== recipeId
        );
        setSelectedLinkedRecipes(updatedRecipes);
        setValue(
            'linkedRecipeIds',
            updatedRecipes.map((recipe) => recipe.id)
        );
    };

    const saveDraft = async () => {
        // Collect ingredients
        const newIngredients: string[] = [];
        for (let i = 0; i < numIngredients; i++) {
            if (watch('ingredient ' + i) !== '') {
                newIngredients.push(watch('ingredient ' + i));
            }
        }

        // Collect steps
        const newSteps: string[] = [];
        for (let i = 0; i < numSteps; i++) {
            if (watch('step ' + i) !== '') {
                newSteps.push(watch('step ' + i));
            }
        }

        const data = {
            currentStep: step,
            category: watch('category'),
            method: watch('method'),
            imageSrc: watch('imageSrc'),
            imageSrc1: watch('imageSrc1'),
            imageSrc2: watch('imageSrc2'),
            imageSrc3: watch('imageSrc3'),
            title: watch('title'),
            description: watch('description'),
            ingredients: newIngredients,
            steps: newSteps,
            minutes: watch('minutes'),
            coCooksIds: watch('coCooksIds'),
            linkedRecipeIds: watch('linkedRecipeIds'),
        };

        try {
            await axios.post(`${window.location.origin}/api/draft`, data);
            toast.success(t('draft_saved') ?? 'Draft saved!');
        } catch (error) {
            console.error(error);
            toast.error(t('error_saving_draft') ?? 'Failed to save draft.');
        }
    };

    const loadDraft = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(
                `${window.location.origin}/api/draft`
            );
            if (!data) {
                return;
            }
            const { currentStep, ...formData } = data;
            reset(formData);
            if (currentStep !== undefined) {
                setStep(currentStep);
            }
            setNumIngredients(data.ingredients?.length || 1);
            setNumSteps(data.steps?.length || 1);
            const ingredients = formData.ingredients || [];
            ingredients.forEach((ingredient: string, index: number) => {
                setValue(`ingredient ${index}`, ingredient);
            });
            const steps = formData.steps || [];
            steps.forEach((step: string, index: number) => {
                setValue(`step ${index}`, step);
            });

            if (formData.coCooksIds?.length > 0) {
                try {
                    const cooksResponse = await axios.get(
                        `/api/users/multiple?ids=${formData.coCooksIds.join(',')}`
                    );
                    setSelectedCoCooks(cooksResponse.data);
                } catch (error) {
                    console.error('Failed to load co-cooks', error);
                }
            }

            if (formData.linkedRecipeIds?.length > 0) {
                try {
                    const recipesResponse = await axios.get(
                        `/api/recipes/multiple?ids=${formData.linkedRecipeIds.join(',')}`
                    );
                    setSelectedLinkedRecipes(recipesResponse.data);
                } catch (error) {
                    console.error('Failed to load linked recipes', error);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(t('error_loading_draft') ?? 'Failed to load draft.');
        } finally {
            setIsLoading(false);
        }
    }, [reset, setNumIngredients, setNumSteps, setValue, t]);

    const deleteDraft = async () => {
        try {
            await axios.delete(`${window.location.origin}/api/draft`);
        } catch (error) {
            console.error(error);
            toast.error(t('error_deleting_draft') ?? 'Failed to delete draft.');
        }
    };

    useEffect(() => {
        if (currentUser && !hasLoadedDraft.current) {
            hasLoadedDraft.current = true;
            loadDraft().then(() => {
                console.log('Draft loaded');
            });
        }
    }, [currentUser, loadDraft]);

    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    const onBack = () => {
        setStep((value) => value - 1);
    };

    const onNext = () => {
        if (step === STEPS.INGREDIENTS) {
            const newIngredients: string[] = [];
            for (let i = 0; i < numIngredients; i++) {
                if (watch('ingredient ' + i) !== '') {
                    newIngredients.push(watch('ingredient ' + i));
                }
            }
            setCustomValue('ingredients', newIngredients);
        }
        if (step === STEPS.STEPS) {
            const newSteps: string[] = [];
            for (let i = 0; i < numSteps; i++) {
                if (watch('step ' + i) !== '') {
                    newSteps.push(watch('step ' + i));
                }
            }
            setCustomValue('steps', newSteps);
        }
        setStep((value) => value + 1);
    };

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        const url = `${window.location.origin}/api/recipes`;

        if (step !== STEPS.IMAGES) {
            if (process.env.NODE_ENV === 'production') await saveDraft();
            return onNext();
        }

        if (
            process.env.NEXT_PUBLIC_SKIP_IMAGE_VALIDATION !== 'true' &&
            imageSrc === ''
        ) {
            toast.error('You must upload an image');
            return;
        }

        setIsLoading(true);

        try {
            await axios.post(url, data);
            await deleteDraft();
            toast.success(t('recipe_posted') ?? 'Recipe posted!');
            reset({
                category: '',
                method: '',
                imageSrc: '',
                imageSrc1: '',
                imageSrc2: '',
                imageSrc3: '',
                title: '',
                description: '',
                ingredients: [],
                steps: [],
                minutes: 10,
                coCooksIds: [],
                linkedRecipeIds: [],
            });
            setStep(STEPS.CATEGORY);
            setNumIngredients(1);
            setNumSteps(1);
            setSelectedCoCooks([]);
            setSelectedLinkedRecipes([]);
            recipeModal.onClose();
            router.refresh();
        } catch (error) {
            console.error('Failed to post recipe', error);
            toast.error(t('something_went_wrong') ?? 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const addIngredientInput = () => {
        setNumIngredients((value) => value + 1);
    };

    const removeIngredientInput = (index: number) => {
        setNumIngredients((value) => value - 1);
        setCustomValue('ingredient ' + index, '');
    };

    const addStepInput = () => {
        setNumSteps((value) => value + 1);
    };

    const removeStepInput = (index: number) => {
        setNumSteps((value) => value - 1);
        setCustomValue('step ' + index, '');
    };

    const renderStepsInput = () => {
        const components = [];
        for (let i = 0; i < numSteps; i++) {
            components.push(
                <div
                    key={i}
                    className="relative flex w-full items-center gap-3 px-2"
                >
                    <div className="shrink-0 text-base">{`${i + 1}.`}</div>

                    <div className="grow">
                        <Input
                            id={'step ' + i}
                            label=""
                            register={register}
                            errors={errors}
                            required={numSteps === 1}
                            maxLength={RECIPE_STEP_MAX_LENGTH}
                            dataCy={`recipe-step-${i}`}
                        />
                    </div>
                    {numSteps > 1 && i === numSteps - 1 ? (
                        <div className="shrink-0">
                            <AiFillDelete
                                data-testid="remove-step-button"
                                color="#F43F5F"
                                onClick={() => {
                                    removeStepInput(i);
                                }}
                                size={24}
                            />
                        </div>
                    ) : (
                        <div className="w-6 shrink-0" />
                    )}
                </div>
            );
        }
        return components;
    };

    const renderIngredientInput = () => {
        const components = [];
        for (let i = 0; i < numIngredients; i++) {
            components.push(
                <div
                    key={i}
                    className="relative flex w-full items-center gap-3 px-2"
                >
                    <div className="grow">
                        <Input
                            id={'ingredient ' + i}
                            label=""
                            register={register}
                            errors={errors}
                            required={numIngredients === 1}
                            maxLength={RECIPE_INGREDIENT_MAX_LENGTH}
                            dataCy={`recipe-ingredient-${i}`}
                        />
                    </div>
                    {numIngredients > 1 && i === numIngredients - 1 ? (
                        <div className="shrink-0">
                            <AiFillDelete
                                data-testid="remove-ingredient-button"
                                color="#F43F5F"
                                onClick={() => {
                                    removeIngredientInput(i);
                                }}
                                size={24}
                            />
                        </div>
                    ) : (
                        <div className="w-6 shrink-0" />
                    )}
                </div>
            );
        }
        return components;
    };

    const actionLabel = useMemo(() => {
        if (step === STEPS.IMAGES) {
            return t('create');
        }
        return t('next');
    }, [step, t]);

    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.CATEGORY) {
            return undefined;
        }
        return t('back');
    }, [step, t]);

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading
                title={t('title_category_recipe')}
                subtitle={t('subtitle_category_recipe') ?? ''}
            />
            <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto">
                {categories
                    .filter(
                        (item) => item.label.toLowerCase() !== 'award-winning'
                    )
                    .map((item) => (
                        <div
                            key={item.label}
                            className="col-span-1"
                        >
                            <CategoryInput
                                onClick={(category) =>
                                    setCustomValue('category', category)
                                }
                                selected={category === item.label}
                                label={item.label}
                                icon={item.icon}
                                dataCy={`category-box-${item.label}`}
                            />
                        </div>
                    ))}
            </div>
        </div>
    );

    if (step === STEPS.INGREDIENTS) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading title={t('title_ingredients')} />
                <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
                    {renderIngredientInput()}
                </div>
                <Button
                    outline={true}
                    label="+"
                    onClick={() => {
                        addIngredientInput();
                    }}
                    dataCy="add-ingredient-button"
                />
            </div>
        );
    }

    if (step === STEPS.STEPS) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading title={t('title_steps')} />
                <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
                    {renderStepsInput()}
                </div>
                <Button
                    outline={true}
                    label="+"
                    onClick={() => {
                        addStepInput();
                    }}
                    dataCy="add-step-button"
                />
            </div>
        );
    }

    if (step === STEPS.DESCRIPTION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title={t('title_description')}
                    subtitle={t('subtitle_description') ?? ''}
                />
                <Input
                    id="title"
                    label={t('title')}
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                    maxLength={RECIPE_TITLE_MAX_LENGTH}
                    dataCy="recipe-title"
                />
                <hr />
                <Input
                    id="description"
                    label={t('description')}
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                    maxLength={RECIPE_DESCRIPTION_MAX_LENGTH}
                    dataCy="recipe-description"
                />
                <hr />
                <Counter
                    title={t('minutes')}
                    subtitle={t('minutes_subtitle')}
                    value={minutes}
                    onChange={(value) => setCustomValue('minutes', value)}
                />
            </div>
        );
    }

    if (step == STEPS.METHODS) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title={t('methods_title')}
                    subtitle={t('methods_subtitle') ?? ''}
                />
                <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto">
                    {preparationMethods.map((item) => (
                        <div
                            key={item.label}
                            className="col-span-1"
                        >
                            <CategoryInput
                                onClick={(method) =>
                                    setCustomValue('method', method)
                                }
                                selected={method === item.label}
                                label={item.label}
                                icon={item.icon}
                                dataCy={`method-box-${item.label}`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (step === STEPS.RELATED_CONTENT) {
        bodyContent = (
            <RelatedContentStep
                isLoading={isLoading}
                selectedCoCooks={selectedCoCooks}
                selectedLinkedRecipes={selectedLinkedRecipes}
                onAddCoCook={addCoCook}
                onRemoveCoCook={removeCoCook}
                onAddLinkedRecipe={addLinkedRecipe}
                onRemoveLinkedRecipe={removeLinkedRecipe}
            />
        );
    }

    if (step === STEPS.IMAGES) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title={t('images')}
                    subtitle={t('images_subtitle') ?? ''}
                />
                <div className="grid grid-cols-2 gap-4">
                    <ImageUpload
                        data-testid="image-upload"
                        value={imageSrc}
                        onChange={(value) => setCustomValue('imageSrc', value)}
                        canRemove={watch('imageSrc1') === ''}
                        text={t('finished_recipe') ?? 'Finished recipe'}
                    />
                    <ImageUpload
                        data-testid="image-upload-2"
                        value={watch('imageSrc1')}
                        onChange={(value) => setCustomValue('imageSrc1', value)}
                        disabled={imageSrc === ''}
                        canRemove={watch('imageSrc2') === ''}
                        text={t('first_steps') ?? 'First steps'}
                    />
                    <ImageUpload
                        data-testid="image-upload-3"
                        value={watch('imageSrc2')}
                        onChange={(value) => setCustomValue('imageSrc2', value)}
                        disabled={watch('imageSrc1') === ''}
                        canRemove={watch('imageSrc3') === ''}
                        text={t('next_steps') ?? 'Next steps'}
                    />
                    <ImageUpload
                        data-testid="image-upload-4"
                        value={watch('imageSrc3')}
                        onChange={(value) => setCustomValue('imageSrc3', value)}
                        disabled={watch('imageSrc2') === ''}
                        text={t('final_steps') ?? 'Final steps'}
                    />
                </div>
            </div>
        );
    }

    return (
        <Modal
            isOpen={recipeModal.isOpen}
            onClose={recipeModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
            title={t('post_recipe') ?? 'Post a recipe!'}
            body={bodyContent}
            isLoading={isLoading}
            minHeight="753px"
            topButton={
                <FiUploadCloud
                    onClick={saveDraft}
                    className="cursor-pointer text-2xl text-black transition hover:opacity-70 dark:text-neutral-100"
                    data-testid="load-draft-button"
                />
            }
        />
    );
};

export default RecipeModal;
