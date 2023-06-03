'use client';

import useRecipeModal from "@/app/hooks/useRecipeModal";
import Modal from "./Modal"

const RecipeModal = () => {
    const recipeModal = useRecipeModal()
    return (
        <Modal
            isOpen={recipeModal.isOpen}
            onClose={recipeModal.onClose}
            onSubmit={recipeModal.onClose}
            actionLabel="Submit"
            title="Post a recipe!"
        />
    );
}

export default RecipeModal