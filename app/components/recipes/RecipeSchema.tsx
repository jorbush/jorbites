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
    category?: string;
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
    category,
}: RecipeSchemaProps) {
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
        recipeCategory: category || 'Main Course',
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
