'use client';
import React from 'react';

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
    category?: string; // Legacy field for backward compatibility
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
    category, // Legacy field
}: RecipeSchemaProps) {
    // Handle both legacy 'category' and new 'categories' field
    const recipeCategories = Array.isArray(categories)
        ? categories
        : category
        ? [category]
        : ['Main Course'];

    const schemaData = {
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
        recipeCategory:
            recipeCategories.length === 1
                ? recipeCategories[0]
                : recipeCategories,
        recipeIngredient: ingredients || [],
        recipeInstructions:
            steps?.map((step, index) => ({
                '@type': 'HowToStep',
                position: index + 1,
                text: step,
                image: imageSrc || '',
            })) || [],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
}
