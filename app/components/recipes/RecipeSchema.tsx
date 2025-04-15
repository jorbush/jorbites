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
        cookTime: `PT${minutes || 30}M`,
        recipeIngredient: ingredients || [],
        recipeInstructions:
            steps?.map((step, index) => ({
                '@type': 'HowToStep',
                position: index + 1,
                text: step,
            })) || [],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
}
