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
    youtubeUrl?: string; // Optional YouTube ID or URL
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

                    // Check if segment is a version (starts with 'v' followed by numbers)
                    // If it's transformations (e.g. w_800,h_600), we discard it to avoid duplication
                    const isVersion = segment && /^v\d+$/.test(segment);

                    const fullPath = isVersion
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

    const getYoutubeVideoId = (url: string) => {
        const regExp =
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const highResImage = getHighResImageUrl(imageSrc);

    let videoSchema = undefined;

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
                uploadDate: createdAt,
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
        video: videoSchema,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
}
