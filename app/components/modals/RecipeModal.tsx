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
import Counter from "../inputs/Counter";


enum STEPS {
    CATEGORY = 0,
    INGREDIENTS = 1,
    STEPS = 2,
    DESCRIPTION = 3,
    IMAGES = 4
}

const RecipeModal = () => {
    const recipeModal = useRecipeModal()

    const [step, setStep] = useState(STEPS.CATEGORY)

    const [numIngredients, setNumIngredients] = useState(1)
    const [numSteps, setNumSteps] = useState(1)


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
            minutes: 10,
        }
    })

    const category = watch('category')
    const minutes = watch('minutes')
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
        if (step === STEPS.INGREDIENTS){
            const newIngredients: string[] = []
            for (let i = 0; i < numIngredients; i++) {
                if (watch('ingredient ' + i) !== ""){
                    newIngredients.push(watch('ingredient ' + i))
                }
            }
            console.log(newIngredients)
            setCustomValue('ingrediens', newIngredients)
        }
        if (step === STEPS.STEPS){
            const newSteps: string[] = []
            for (let i = 0; i < numSteps; i++) {
                if (watch('step ' + i) !== ""){
                    newSteps.push(watch('step ' + i))
                }
            }
            console.log(newSteps)
            setCustomValue('steps', newSteps)
        }
        setStep((value) => value + 1)
    }

    const addIngredientInput = () => {
        setNumIngredients((value) => value + 1)
    }      

    const removeIngredientInput = (index: number) => {
        setNumIngredients((value) => value - 1)
        setCustomValue('ingredient ' + index, "")
        console.log(numIngredients, ' ingredient ' + index, "")
    }

    const addStepInput = () => {
        setNumSteps((value) => value + 1)
    }      

    const removeStepInput = (index: number) => {
        setNumSteps((value) => value - 1)
        setCustomValue('step ' + index, "")
        console.log(numSteps, ' step ' + index, "")
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
                    {(numIngredients>1&&i===(numIngredients - 1)) &&(
                        <div className="flex justify-center items-center">
                            <AiFillDelete 
                                color="#F43F5F" 
                                onClick={() => {removeIngredientInput(i)}} 
                                size={24} 
                            />
                        </div>
                    )}
                </div>
            )
        }
        return components
    }

    const renderStepsInput = () => {
        const components = [];
        for (let i = 0; i < numSteps; i++) {
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
                            id={"step " + i}
                            label=""
                            register={register}  
                            errors={errors}
                            required={numSteps === 1}
                        />
                    </div>
                    {(numSteps>1&&i===(numSteps - 1)) &&(
                        <div className="flex justify-center items-center">
                            <AiFillDelete 
                                color="#F43F5F" 
                                onClick={() => {removeStepInput(i)}} 
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
        if (step === STEPS.IMAGES) {
            return 'Create'
        }
        return 'Next'
    }, [step])

    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.CATEGORY) {
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
                <Button outline={true}label="+" onClick={() => {addIngredientInput()}}/>
            </div>
        )
    }

    if (step === STEPS.STEPS){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Set steps"
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
                    {renderStepsInput()}
                </div>
                <Button outline={true}label="+" onClick={() => {addStepInput()}}/>
            </div>
        )
    }
    if (step === STEPS.DESCRIPTION){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Share some basics about your recipe"
                    subtitle="What is about your recipe?"
                />
                <Input
                    id="description"
                    label="Description"
                    register={register}  
                    errors={errors}
                />
                <Counter title="Minutes" subtitle="How many seconds does it take to complete the recipe?" value={minutes} onChange={(value) => setCustomValue('minutes', value)}/>
            </div>
        )
    }
    if (step === STEPS.IMAGES){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Images"
                    subtitle="Post images of your recipe"
                />
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