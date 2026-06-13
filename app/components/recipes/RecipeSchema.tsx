'use client';
import React from 'react';
import { getHighResImageUrl, getYoutubeVideoId } from '@/app/utils/seo-utils';
import { JORBITES_URL } from '@/app/utils/constants';
import { SafeComment } from '@/app/types';

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
    averageRating?: number;
    ratingCount?: number;
    comments?: SafeComment[];
}

const EMPTY_IMAGES: string[] = [];

export default function RecipeSchema({
    title,
    description,
    imageSrc,
    extraImages = EMPTY_IMAGES,
    createdAt,
    userName,
    minutes,
    ingredients,
    steps,
    categories,
    youtubeUrl,
    recipeId,
    averageRating,
    ratingCount,
    comments,
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

    if (averageRating && ratingCount && averageRating > 0 && ratingCount > 0) {
        schemaData.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: averageRating.toFixed(1),
            ratingCount: ratingCount,
            bestRating: '5',
            worstRating: '1',
        };
    }

    const reviews = comments?.filter(
        (c) => c.rating !== undefined && c.rating !== null && c.rating > 0
    );
    if (reviews && reviews.length > 0) {
        schemaData.review = reviews.map((c) => ({
            '@type': 'Review',
            author: {
                '@type': 'Person',
                name: c.user?.name || 'Usuario de Jorbites',
            },
            datePublished: c.createdAt,
            reviewBody: c.comment,
            reviewRating: {
                '@type': 'Rating',
                ratingValue: c.rating,
                bestRating: '5',
                worstRating: '1',
            },
        }));
    }

    return (
        <script type="application/ld+json">
            {JSON.stringify(schemaData)
                .replace(/</g, '\\u003c')
                .replace(/>/g, '\\u003e')}
        </script>
    );
}
