'use client';

import useRecipeModal from "@/app/hooks/useRecipeModal";
import Modal from "./Modal"
import { useMemo, useState } from "react";
import Heading from "../Heading";
import { categories } from "../navbar/Categories";
import CategoryInput from "../inputs/CategoryInput";
import { FieldValues, useForm } from "react-hook-form";
import Button from "../Button";
import {AiFillDelete} from "react-icons/ai"
import Input from "../inputs/Input";


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

    const [numIngredients, setNumIngredients] = useState(1)

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

    const addIngredientInput = () => {
        setNumIngredients((value) => value + 1)
    }

    const removeIngredientInput = () => {
        setNumIngredients((value) => value - 1)
    }

    const renderIngredientInput = () => {
        const components = [];
        for (let i = 0; i < numIngredients; i++) {
            components.push(
                <div key={i}
                    className="
                    grid 
                    grid-cols-10
                    gap-3
                    max-h-[50vh]
                    max-w
                    overflow-y-auto
                    "
                >
                    <div className="col-span-9">
                        <Input
                            id={"ingredient " + i}
                            label=""
                            register={register}  
                            errors={errors}
                            required={numIngredients === 1}
                        />
                    </div>
                    {numIngredients>1&&(
                        <div className="flex justify-center items-center">
                            <AiFillDelete 
                                color="#F43F5F" 
                                onClick={removeIngredientInput} 
                                size={24} 
                            />
                        </div>
                    )}
                </div>
            )
        }
        return components
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
                grid-cols-2
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

    if (step === STEPS.INGREDIENTS){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Set ingredients"
                />
                <div 
                    className="
                    grid 
                    grid-cols-1 
                    gap-3
                    max-h-[50vh]
                    overflow-y-auto
                    "
                >
                    {renderIngredientInput()}
                </div>
                <Button outline={true}label="+" onClick={addIngredientInput}/>
            </div>
        )
    }

    return (
        <Modal
            isOpen={recipeModal.isOpen}
            onClose={recipeModal.onClose}
            onSubmit={onNext}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
            title="Post a recipe!"
            body={bodyContent}
        />
    );
}

export default RecipeModal