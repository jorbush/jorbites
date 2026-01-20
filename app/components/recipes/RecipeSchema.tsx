'use client';
import React from 'react';

interface RecipeSchemaProps {
    title: string;
    description?: string;
    imageSrc?: string;
    extraImages?: string[];
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
    extraImages = [],
    createdAt,
    userName,
    minutes,
    ingredients,
    steps,
    categories,
}: RecipeSchemaProps) {
    const recipeCategories = categories || [];

    const getHighResImageUrl = (url?: string) => {
        if (!url) return '';
        if (url.includes('cloudinary.com')) {
            try {
                const matches = url.match(
                    /^(https?:\/\/res\.cloudinary\.com\/[^/]+)\/image\/upload(?:\/([^/]+))?\/(.+)$/
                );
                if (matches) {
                    const [, baseUrl, segment, imagePath] = matches;
                    // Force 4:3 aspect ratio (w_1200, h_900) and fill crop
                    // Reconstruct path preserving the segment (version usually) if it exists
                    const fullPath = segment
                        ? `${segment}/${imagePath}`
                        : imagePath;
                    return `${baseUrl}/image/upload/w_1200,h_900,c_fill,q_auto:good/${fullPath}`;
                }
            } catch (e) {
                console.error(
                    'Error transforming Cloudinary URL for schema:',
                    e
                );
            }
        }
        return url;
    };

    const highResImage = getHighResImageUrl(imageSrc);

    const schemaData: any = {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: title,
        description: description || '',
        image: highResImage,
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
            steps?.map((step, index) => {
                // Use extraImages for the step if available (step 1 -> index 0), otherwise use main image
                const stepImageSrc = extraImages[index] || imageSrc;
                return {
                    '@type': 'HowToStep',
                    position: index + 1,
                    text: step,
                    image: getHighResImageUrl(stepImageSrc),
                };
            }) || [],
        recipeCategory:
            recipeCategories.length === 1
                ? recipeCategories[0]
                : recipeCategories,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
}
