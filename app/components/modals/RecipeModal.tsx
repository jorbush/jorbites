'use client';

import useRecipeModal from "@/app/hooks/useRecipeModal";
import Modal from "./Modal"
import { useMemo, useState } from "react";
import Heading from "../Heading";
import { categories } from "../navbar/Categories";
import CategoryInput from "../inputs/CategoryInput";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Button from "../Button";
import {AiFillDelete} from "react-icons/ai"
import Input from "../inputs/Input";
import Counter from "../inputs/Counter";
import ImageUpload from "../inputs/ImageUpload";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { GiCookingPot, GiPressureCooker } from "react-icons/gi";
import { MdMicrowave } from "react-icons/md";
import { TbCooker } from "react-icons/tb";
import { CgSmartHomeCooker } from "react-icons/cg";
import { useTranslation } from 'react-i18next';

enum STEPS {
    CATEGORY = 0,
    INGREDIENTS = 1,
    DESCRIPTION = 2,
    METHODS = 3,
    STEPS = 4,
    IMAGES = 5
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
]

const RecipeModal = () => {
    const router = useRouter()
    const { t } = useTranslation();

    const recipeModal = useRecipeModal()

    const [step, setStep] = useState(STEPS.CATEGORY)

    const [numIngredients, setNumIngredients] = useState(1)
    const [numSteps, setNumSteps] = useState(1)

    const [isLoading, setIsLoading] = useState(false)

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
            method: '',
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
    const method = watch('method')

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
            setCustomValue('ingredients', newIngredients)
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

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (step !== STEPS.IMAGES){
            return onNext()
        }

        if (imageSrc === ""){
            toast.error('You must upload an image')
            return
        }

        setIsLoading(true)

        axios.post('api/listings', data)
            .then(() => {
                toast.success('Recipe created!')
                router.refresh()
                reset()
                setStep(STEPS.CATEGORY)
                setNumIngredients(1)
                setNumSteps(1)
                recipeModal.onClose()
            }).catch(() => {
                toast.error('Something went wrong.')
            }).finally(()=>{
                setIsLoading(false)
            })
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
                    overflow-x-auto
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
            return t('create')
        }
        return t('next')
    }, [step])

    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.CATEGORY) {
            return undefined
        }
        return t('back')
    }, [step])

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading
                title={t('title_category_recipe')}
                subtitle={t('subtitle_category_recipe')??""}
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
                            label={t(item.label.toLocaleLowerCase())}
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
                    title={t('title_ingredients')}
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
                <Button outline={true} label="+" onClick={() => {addIngredientInput()}}/>
            </div>
        )
    }

    if (step === STEPS.STEPS){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title={t('title_steps')}
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
                <Button outline={true} label="+" onClick={() => {addStepInput()}}/>
            </div>
        )
    }

    if (step === STEPS.DESCRIPTION){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title={t('title_description')}
                    subtitle={t('subtitle_description')??""}
                />
                <Input
                    id="title"
                    label={t('title')}
                    disabled={isLoading}
                    register={register}  
                    errors={errors}
                    required
                />
                <hr/>
                <Input
                    id="description"
                    label={t('description')}
                    disabled={isLoading}
                    register={register}  
                    errors={errors}
                    required
                />
                <hr/>
                <Counter 
                    title={t('minutes')}
                    subtitle={t('minutes_subtitle')}
                    value={minutes} 
                    onChange={(value) => setCustomValue('minutes', value)}
                />
            </div>
        )
    }

    if (step == STEPS.METHODS){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title={t('methods_title')}
                    subtitle={t('methods_subtitle')??""}
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
                    {preparationMethods.map((item) => (
                        <div key={item.label} className="col-span-1">
                            <CategoryInput
                                onClick={(method) => setCustomValue('method', method)}
                                selected={method === item.label}
                                label={t(item.label.toLocaleLowerCase())}
                                icon={item.icon}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (step === STEPS.IMAGES){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title={t('images')}
                    subtitle={t('images_subtitle')??""}
                />
                <ImageUpload value={imageSrc} onChange={(value) => setCustomValue('imageSrc', value)}/>
            </div>
        )
    }

    return (
        <Modal
            isOpen={recipeModal.isOpen}
            onClose={recipeModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
            title={t('post_recipe')?? "Post a recipe!"}
            body={bodyContent}
            minHeight="753px"
        />
    );
}

export default RecipeModal