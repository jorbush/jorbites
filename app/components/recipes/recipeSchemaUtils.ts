import {
    getHighResImageUrl,
    getYoutubeVideoId,
    formatIsoDuration,
} from '@/app/utils/seo-utils';
import { JORBITES_URL } from '@/app/utils/constants';
import { SafeComment, SafeCooksnap } from '@/app/types';

export interface RecipeSchemaProps {
    title: string;
    description?: string;
    imageSrc?: string;
    extraImages?: string[];
    createdAt: string;
    userName?: string | null;
    minutes?: number;
    prepTime?: number | null;
    cookTime?: number | null;
    ingredients?: string[];
    steps?: string[];
    categories?: string[];
    youtubeUrl?: string | null;
    recipeId?: string;
    averageRating?: number;
    ratingCount?: number;
    comments?: SafeComment[];
    cooksnaps?: SafeCooksnap[];
    calories?: number | null;
    recipeCuisine?: string | null;
    recipeYield?: number | null;
}

const EMPTY_IMAGES: string[] = [];
const DEFAULT_AUTHOR_NAME = 'Usuario de Jorbites';
const DEFAULT_TOTAL_TIME = 'PT30M';

interface ReviewSource {
    user?: { name?: string | null } | null;
    createdAt: string;
    comment?: string | null;
    rating?: number | null;
}

const hasValidRating = (rating?: number | null): rating is number =>
    rating !== undefined && rating !== null && rating > 0;

export const buildVideoSchema = (
    youtubeUrl: string | null | undefined,
    title: string,
    description: string | undefined,
    createdAt: string
): Record<string, unknown> | undefined => {
    if (!youtubeUrl) return undefined;
    const videoId = getYoutubeVideoId(youtubeUrl);
    if (!videoId) return undefined;

    return {
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
};

export const buildRecipeInstructions = (
    steps: string[] | undefined,
    extraImages: string[],
    imageSrc: string | undefined,
    recipeId: string | undefined
): Record<string, unknown>[] => {
    if (!steps) return [];

    return steps.map((step, index) => {
        const stepImageSrc = extraImages[index] || imageSrc;
        return {
            '@type': 'HowToStep',
            name: step.split('.')[0] || `Step ${index + 1}`,
            position: index + 1,
            text: step,
            image: getHighResImageUrl(stepImageSrc),
            url: `${JORBITES_URL}/recipes/${recipeId}`,
        };
    });
};

export const buildAggregateRating = (
    averageRating: number | undefined,
    ratingCount: number | undefined
): Record<string, unknown> | undefined => {
    if (
        !averageRating ||
        !ratingCount ||
        averageRating <= 0 ||
        ratingCount <= 0
    ) {
        return undefined;
    }

    return {
        '@type': 'AggregateRating',
        ratingValue: averageRating.toFixed(1),
        ratingCount,
        bestRating: '5',
        worstRating: '1',
    };
};

const mapReviewItems = (
    items: ReviewSource[] | undefined,
    defaultBody: string
): Record<string, unknown>[] =>
    (items || [])
        .filter((item) => hasValidRating(item.rating))
        .map((item) => ({
            '@type': 'Review',
            author: {
                '@type': 'Person',
                name: item.user?.name || DEFAULT_AUTHOR_NAME,
            },
            datePublished: item.createdAt,
            reviewBody: item.comment || defaultBody,
            reviewRating: {
                '@type': 'Rating',
                ratingValue: item.rating,
                bestRating: '5',
                worstRating: '1',
            },
        }));

export const buildRecipeReviews = (
    comments: SafeComment[] | undefined,
    cooksnaps: SafeCooksnap[] | undefined
): Record<string, unknown>[] | undefined => {
    const allReviews = [
        ...mapReviewItems(comments, ''),
        ...mapReviewItems(cooksnaps, 'Cooksnap photo remake'),
    ];
    return allReviews.length > 0 ? allReviews : undefined;
};

export const buildRecipeCategory = (categories: string[]): string | string[] =>
    categories.length === 1 ? categories[0] : categories;

export const buildRecipeSchemaData = ({
    title,
    description,
    imageSrc,
    extraImages = EMPTY_IMAGES,
    createdAt,
    userName,
    minutes,
    prepTime,
    cookTime,
    ingredients,
    steps,
    categories,
    youtubeUrl,
    recipeId,
    averageRating,
    ratingCount,
    comments,
    cooksnaps,
    calories,
    recipeCuisine,
    recipeYield,
}: RecipeSchemaProps): Record<string, unknown> => {
    const recipeCategories = categories || [];
    const prepTimeIso = formatIsoDuration(prepTime);
    const cookTimeIso = formatIsoDuration(cookTime);
    const aggregateRating = buildAggregateRating(averageRating, ratingCount);
    const reviews = buildRecipeReviews(comments, cooksnaps);

    return {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: title,
        description: description || '',
        image: getHighResImageUrl(imageSrc),
        datePublished: createdAt,
        author: {
            '@type': 'Person',
            name: userName || DEFAULT_AUTHOR_NAME,
        },
        totalTime: formatIsoDuration(minutes) || DEFAULT_TOTAL_TIME,
        ...(prepTimeIso ? { prepTime: prepTimeIso } : {}),
        ...(cookTimeIso ? { cookTime: cookTimeIso } : {}),
        recipeIngredient: ingredients || [],
        recipeInstructions: buildRecipeInstructions(
            steps,
            extraImages,
            imageSrc,
            recipeId
        ),
        recipeCategory: buildRecipeCategory(recipeCategories),
        video: buildVideoSchema(youtubeUrl, title, description, createdAt),
        keywords: recipeCategories.join(', '),
        ...(recipeCuisine ? { recipeCuisine } : {}),
        ...(recipeYield ? { recipeYield: `${recipeYield} servings` } : {}),
        ...(calories
            ? {
                  nutrition: {
                      '@type': 'NutritionInformation',
                      calories: `${calories} calories`,
                  },
              }
            : {}),
        ...(aggregateRating ? { aggregateRating } : {}),
        ...(reviews ? { review: reviews } : {}),
    };
};

export const serializeJsonLd = (data: Record<string, unknown>): string =>
    JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
