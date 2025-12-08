'use client';
import React from 'react';
import { getRecipeCategories } from '@/app/utils/recipeHelpers';

interface RecipeSchemaProps {
    title: string;
    description?: string;
    imageSrc?: string;
    createdAt: string;
    userName?: string | null;
    minutes?: number;
    ingredients?: string[];
    steps?: string[];
    categories?: string[];
}

export default function RecipeSchema({
    title,
    description,
    imageSrc,
    createdAt,
    userName,
    minutes,
    ingredients,
    steps,
    categories,
}: RecipeSchemaProps) {
    // Handle both legacy 'category' and new 'categories' field
    const recipeCategories = getRecipeCategories({ categories });

    const schemaData: any = {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: title,
        description: description || '',
        image: imageSrc || '',
        datePublished: createdAt,
        author: {
            '@type': 'Person',
            name: userName || 'Usuario de Jorbites',
        },
        prepTime: `PT${minutes || 30}M`,
        cookTime: `PT${minutes || 30}M`,
        totalTime: `PT${minutes || 30}M`,
        recipeIngredient: ingredients || [],
        recipeInstructions:
            steps?.map((step, index) => ({
                '@type': 'HowToStep',
                position: index + 1,
                text: step,
                image: imageSrc || '',
            })) || [],
    };

    // Only include recipeCategory if we have categories
    if (recipeCategories.length > 0) {
        schemaData.recipeCategory =
            recipeCategories.length === 1
                ? recipeCategories[0]
                : recipeCategories;
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
}
