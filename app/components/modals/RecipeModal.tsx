'use client';

import useRecipeModal from "@/app/hooks/useRecipeModal";
import Modal from "./Modal"
import { useMemo, useState } from "react";
import Heading from "../Heading";
import { categories } from "../navbar/Categories";
import CategoryInput from "../inputs/CategoryInput";
import { FieldValues, useForm } from "react-hook-form";

enum STEPS {
    CATEGORY = 0,
    INGREDIENTS = 1,
    STEPS = 2,
    IMAGES = 3,
    DESCRIPTION = 4
}

const RecipeModal = () => {
    const recipeModal = useRecipeModal()

    const [step, setStep] = useState(STEPS.CATEGORY)

    const { 
        register, 
        handleSubmit,
        setValue,
        watch,
        formState: {
          errors,
        },
        reset,
    } = useForm<FieldValues>({
        defaultValues: {
            category: '',
            imageSrc: '',
            title: '',
            description: '',
            ingredients: [],
            steps: [],
            seconds: 60,
        }
    })

    const category = watch('category')
    const seconds = watch('seconds')
    const imageSrc = watch('imageSrc')
    const ingredients = watch('ingredients')
    const steps = watch('steps')

    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        })
    }

    const onBack = () => {
        setStep((value) => value - 1)
    }

    const onNext = () => {
        setStep((value) => value + 1)
    }

    const actionLabel = useMemo(() => {
        if (step === STEPS.DESCRIPTION) {
            return 'Create'
        }
        return 'Next'
    }, [step])

    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.DESCRIPTION) {
            return undefined
        }
        return 'Back'
    }, [step])

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading
                title="Which of these best describes your recipe?"
                subtitle="Pick a category"
            />
            <div 
                className="
                grid 
                grid-cols-1 
                md:grid-cols-2 
                gap-3
                max-h-[50vh]
                overflow-y-auto
                "
            >
                {categories.map((item) => (
                    <div key={item.label} className="col-span-1">
                        <CategoryInput
                            onClick={(category) => setCustomValue('category', category)}
                            selected={category === item.label}
                            label={item.label}
                            icon={item.icon}
                        />
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <Modal
            isOpen={recipeModal.isOpen}
            onClose={recipeModal.onClose}
            onSubmit={recipeModal.onClose}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
            title="Post a recipe!"
            body={bodyContent}
        />
    );
}

export default RecipeModal