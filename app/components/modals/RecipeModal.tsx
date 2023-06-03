'use client';

import useRecipeModal from "@/app/hooks/useRecipeModal";
import Modal from "./Modal"
import { useMemo, useState } from "react";

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

    return (
        <Modal
            isOpen={recipeModal.isOpen}
            onClose={recipeModal.onClose}
            onSubmit={recipeModal.onClose}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            title="Post a recipe!"
        />
    );
}

export default RecipeModal