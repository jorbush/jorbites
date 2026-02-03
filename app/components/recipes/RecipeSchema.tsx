'use client';
import React from 'react';
import { getHighResImageUrl, getYoutubeVideoId } from '@/app/utils/seo-utils';
import { JORBITES_URL } from '@/app/utils/constants';

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
    youtubeUrl?: string | null;
    recipeId?: string;
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
    youtubeUrl,
    recipeId,
}: RecipeSchemaProps) {
    const recipeCategories = categories || [];

    const highResImage = getHighResImageUrl(imageSrc);

    let videoSchema: Record<string, unknown> | undefined;

    if (youtubeUrl) {
        const videoId = getYoutubeVideoId(youtubeUrl);
        if (videoId) {
            videoSchema = {
                '@type': 'VideoObject',
                name: title,
                description: description || `Video recipe for ${title}`,
                thumbnailUrl: [
                    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                ],
                contentUrl: youtubeUrl,
                embedUrl: `https://www.youtube.com/embed/${videoId}`,
            };
        }
    }

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
                const stepImageSrc = extraImages[index] || imageSrc;
                return {
                    '@type': 'HowToStep',
                    name: step.split('.')[0] || `Step ${index + 1}`,
                    position: index + 1,
                    text: step,
                    image: getHighResImageUrl(stepImageSrc),
                    url: `${JORBITES_URL}/recipes/${recipeId}`,
                };
            }) || [],
        recipeCategory:
            recipeCategories.length === 1
                ? recipeCategories[0]
                : recipeCategories,
        video: videoSchema,
        keywords: recipeCategories.join(', '),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
}
