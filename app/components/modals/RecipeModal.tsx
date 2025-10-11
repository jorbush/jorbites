'use client';

import useRecipeModal, { EditRecipeData } from '@/app/hooks/useRecipeModal';
import Modal from '@/app/components/modals/Modal';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiUploadCloud } from 'react-icons/fi';
import { SafeUser } from '@/app/types';
import RelatedContentStep from '@/app/components/modals/recipe-steps/RelatedContentStep';
import CategoryStep from '@/app/components/modals/recipe-steps/CategoryStep';
import DescriptionStep from '@/app/components/modals/recipe-steps/DescriptionStep';
import IngredientsStep from '@/app/components/modals/recipe-steps/IngredientsStep';
import MethodsStep from '@/app/components/modals/recipe-steps/MethodsStep';
import RecipeStepsStep from '@/app/components/modals/recipe-steps/RecipeStepsStep';
import ImagesStep from '@/app/components/modals/recipe-steps/ImagesStep';
import {
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
    STEPS,
    STEPS_LENGTH,
} from '@/app/utils/constants';

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
    const hasLoadedEditData = useRef(false);
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
            youtubeUrl: '',
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
            if (watch(`ingredient-${i}`) !== '') {
                newIngredients.push(watch(`ingredient-${i}`));
            }
        }

        // Collect steps
        const newSteps: string[] = [];
        for (let i = 0; i < numSteps; i++) {
            if (watch(`step-${i}`) !== '') {
                newSteps.push(watch(`step-${i}`));
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
            youtubeUrl: watch('youtubeUrl'),
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
                // Validate and clamp the currentStep to valid range
                setStep(Math.max(0, Math.min(currentStep, STEPS_LENGTH - 1)));
            }
            setNumIngredients(data.ingredients?.length || 1);
            setNumSteps(data.steps?.length || 1);
            const ingredients = formData.ingredients || [];
            ingredients.forEach((ingredient: string, index: number) => {
                setValue(`ingredient-${index}`, ingredient);
            });
            const steps = formData.steps || [];
            steps.forEach((step: string, index: number) => {
                setValue(`step-${index}`, step);
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

    const loadEditData = useCallback(
        async (editData: EditRecipeData) => {
            setIsLoading(true);
            try {
                reset({
                    category: editData.category,
                    method: editData.method,
                    imageSrc: editData.imageSrc,
                    imageSrc1: editData.imageSrc1 || '',
                    imageSrc2: editData.imageSrc2 || '',
                    imageSrc3: editData.imageSrc3 || '',
                    title: editData.title,
                    description: editData.description,
                    ingredients: editData.ingredients,
                    steps: editData.steps,
                    minutes: editData.minutes,
                    coCooksIds: editData.coCooksIds || [],
                    linkedRecipeIds: editData.linkedRecipeIds || [],
                    youtubeUrl: editData.youtubeUrl || '',
                });

                setNumIngredients(editData.ingredients.length || 1);
                setNumSteps(editData.steps.length || 1);

                // Pre-populate ingredient and step fields
                editData.ingredients.forEach(
                    (ingredient: string, index: number) => {
                        setValue(`ingredient-${index}`, ingredient);
                    }
                );
                editData.steps.forEach((step: string, index: number) => {
                    setValue(`step-${index}`, step);
                });

                // Set co-cooks and linked recipes if available
                if (editData.coCooks) {
                    setSelectedCoCooks(editData.coCooks);
                }
                if (editData.linkedRecipes) {
                    setSelectedLinkedRecipes(editData.linkedRecipes);
                }

                setStep(STEPS.CATEGORY);
            } catch (error) {
                console.error('Failed to load edit data', error);
                toast.error(
                    t('error_loading_edit_data') ??
                        'Failed to load recipe data.'
                );
            } finally {
                setIsLoading(false);
            }
        },
        [reset, setValue, t]
    );

    useEffect(() => {
        if (!recipeModal.isOpen) {
            // Reset form when modal closes to ensure clean state on next open
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
                minutes: 30,
                coCooksIds: [],
                linkedRecipeIds: [],
                youtubeUrl: '',
            });
            setStep(STEPS.CATEGORY);
            setNumIngredients(1);
            setNumSteps(1);
            setSelectedCoCooks([]);
            setSelectedLinkedRecipes([]);
            hasLoadedDraft.current = false;
            hasLoadedEditData.current = false;
        } else if (
            recipeModal.isOpen &&
            recipeModal.isEditMode &&
            recipeModal.editRecipeData &&
            !hasLoadedEditData.current
        ) {
            // Load edit data when opening in edit mode
            hasLoadedEditData.current = true;
            loadEditData(recipeModal.editRecipeData);
        } else if (
            recipeModal.isOpen &&
            !recipeModal.isEditMode &&
            currentUser &&
            !hasLoadedDraft.current
        ) {
            // Load draft when opening in create mode
            hasLoadedDraft.current = true;
            loadDraft().then(() => {
                console.log('Draft loaded');
            });
        }
    }, [
        recipeModal.isOpen,
        recipeModal.isEditMode,
        recipeModal.editRecipeData,
        currentUser,
        loadDraft,
        loadEditData,
        reset,
    ]);

    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    const onBack = () => {
        setStep((value) => Math.max(value - 1, 0));
    };

    const onNext = () => {
        if (step >= STEPS_LENGTH - 1) {
            return;
        }

        if (step === STEPS.INGREDIENTS) {
            const newIngredients: string[] = [];
            for (let i = 0; i < numIngredients; i++) {
                if (watch(`ingredient-${i}`) !== '') {
                    newIngredients.push(watch(`ingredient-${i}`));
                }
            }
            setCustomValue('ingredients', newIngredients);
        }
        if (step === STEPS.STEPS) {
            const newSteps: string[] = [];
            for (let i = 0; i < numSteps; i++) {
                if (watch(`step-${i}`) !== '') {
                    newSteps.push(watch(`step-${i}`));
                }
            }
            setCustomValue('steps', newSteps);
        }
        setStep((value) => value + 1);
    };

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        if (step !== STEPS.IMAGES) {
            // Only save draft on recipe creation in production
            if (
                process.env.NODE_ENV === 'production' &&
                !recipeModal.isEditMode
            ) {
                await saveDraft();
            }
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
            if (recipeModal.isEditMode && recipeModal.editRecipeData) {
                // Edit existing recipe
                const url = `${window.location.origin}/api/recipe/${recipeModal.editRecipeData.id}`;
                await axios.patch(url, data);
                toast.success(t('recipe_updated'));
            } else {
                // Create new recipe
                const url = `${window.location.origin}/api/recipes`;
                await axios.post(url, data);
                await deleteDraft();
                toast.success(t('recipe_posted'));
            }

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
                youtubeUrl: '',
            });
            setStep(STEPS.CATEGORY);
            setNumIngredients(1);
            setNumSteps(1);
            setSelectedCoCooks([]);
            setSelectedLinkedRecipes([]);
            recipeModal.onClose();
            router.refresh();
        } catch (error) {
            console.error('Failed to save recipe', error);
            toast.error(t('something_went_wrong') ?? 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const addIngredientInput = () => {
        if (numIngredients >= RECIPE_MAX_INGREDIENTS) {
            toast.error(
                t('max_ingredients_reached') ||
                    `Maximum of ${RECIPE_MAX_INGREDIENTS} ingredients allowed`
            );
            return;
        }
        setNumIngredients((value) => value + 1);
    };

    const removeIngredientInput = (index: number) => {
        setNumIngredients((value) => value - 1);
        setCustomValue(`ingredient-${index}`, '');
    };

    const addStepInput = () => {
        if (numSteps >= RECIPE_MAX_STEPS) {
            toast.error(
                t('max_steps_reached') ||
                    `Maximum of ${RECIPE_MAX_STEPS} steps allowed`
            );
            return;
        }
        setNumSteps((value) => value + 1);
    };

    const removeStepInput = (index: number) => {
        setNumSteps((value) => value - 1);
        setCustomValue(`step-${index}`, '');
    };

    const actionLabel = useMemo(() => {
        if (step === STEPS.IMAGES) {
            return recipeModal.isEditMode ? t('update') : t('create');
        }
        return t('next');
    }, [step, t, recipeModal.isEditMode]);

    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.CATEGORY) {
            return undefined;
        }
        return t('back');
    }, [step, t]);

    let bodyContent = (
        <CategoryStep
            selectedCategory={category}
            onCategorySelect={(selectedCategory) =>
                setCustomValue('category', selectedCategory)
            }
        />
    );

    if (step === STEPS.INGREDIENTS) {
        bodyContent = (
            <IngredientsStep
                numIngredients={numIngredients}
                register={register}
                errors={errors}
                onAddIngredient={addIngredientInput}
                onRemoveIngredient={removeIngredientInput}
            />
        );
    }

    if (step === STEPS.STEPS) {
        bodyContent = (
            <RecipeStepsStep
                numSteps={numSteps}
                register={register}
                errors={errors}
                onAddStep={addStepInput}
                onRemoveStep={removeStepInput}
            />
        );
    }

    if (step === STEPS.DESCRIPTION) {
        bodyContent = (
            <DescriptionStep
                isLoading={isLoading}
                register={register}
                errors={errors}
                minutes={minutes}
                onMinutesChange={(value) => setCustomValue('minutes', value)}
            />
        );
    }

    if (step == STEPS.METHODS) {
        bodyContent = (
            <MethodsStep
                selectedMethod={method}
                onMethodSelect={(selectedMethod) =>
                    setCustomValue('method', selectedMethod)
                }
            />
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
                register={register}
                errors={errors}
            />
        );
    }

    if (step === STEPS.IMAGES) {
        bodyContent = (
            <ImagesStep
                imageSrc={imageSrc}
                imageSrc1={watch('imageSrc1')}
                imageSrc2={watch('imageSrc2')}
                imageSrc3={watch('imageSrc3')}
                onImageChange={(field, value) => setCustomValue(field, value)}
            />
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
            title={
                recipeModal.isEditMode
                    ? (t('edit_recipe') ?? 'Edit recipe')
                    : (t('post_recipe') ?? 'Post a recipe')
            }
            body={bodyContent}
            isLoading={isLoading}
            topButton={
                !recipeModal.isEditMode ? (
                    <FiUploadCloud
                        onClick={saveDraft}
                        className="cursor-pointer text-2xl text-black transition hover:opacity-70 dark:text-neutral-100"
                        data-testid="load-draft-button"
                    />
                ) : undefined
            }
        />
    );
};

export default RecipeModal;
