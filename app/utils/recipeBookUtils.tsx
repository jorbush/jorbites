import React from 'react';
import { Text } from '@react-pdf/renderer';
import { SafeRecipe } from '@/app/types';

/**
 * Parses markdown-like text to apply bold, italic, and bold-italic styles.
 */
export const parseFormattedText = (
    text: string,
    baseStyle: any = {}
): (string | React.ReactNode)[] | string => {
    if (!text) return '';

    // Regex matching bold-italic (***, **_ or __*), bold (** or __), and italic (* or _) patterns
    // We use [\s\S]+? to require at least one character inside the tags and match newlines.
    const regex =
        /(\*\*\*[\s\S]+?\*\*\*|\*\*_(?:[\s\S]+?)_\*\*|__\*(?:[\s\S]+?)\*__|\*\*[\s\S]+?\*\*|__[\s\S]+?__|\*[\s\S]+?\*|_[\s\S]+?_)/g;
    const parts = text.split(regex);
    let currentOffset = 0;

    return parts.map((part) => {
        if (!part) return '';

        const key = `text-part-${currentOffset}`;
        currentOffset += part.length;

        // Bold-italic
        if (
            (part.startsWith('***') && part.endsWith('***')) ||
            (part.startsWith('**_') && part.endsWith('_**')) ||
            (part.startsWith('__*') && part.endsWith('*__'))
        ) {
            const cleanText = part.slice(3, -3);
            return (
                <Text
                    key={key}
                    style={[
                        baseStyle,
                        { fontWeight: 700, fontStyle: 'italic' },
                    ]}
                >
                    {cleanText}
                </Text>
            );
        }

        // Bold
        if (
            (part.startsWith('**') && part.endsWith('**')) ||
            (part.startsWith('__') && part.endsWith('__'))
        ) {
            const cleanText = part.slice(2, -2);
            return (
                <Text
                    key={key}
                    style={[baseStyle, { fontWeight: 700 }]}
                >
                    {cleanText}
                </Text>
            );
        }

        // Italic / Cursive
        if (
            (part.startsWith('*') && part.endsWith('*')) ||
            (part.startsWith('_') && part.endsWith('_'))
        ) {
            const cleanText = part.slice(1, -1);
            return (
                <Text
                    key={key}
                    style={[baseStyle, { fontStyle: 'italic' }]}
                >
                    {cleanText}
                </Text>
            );
        }

        return part;
    });
};

/**
 * Helper to estimate text height based on character count and line properties.
 */
export const estimateTextHeight = (
    text: string,
    charsPerLine: number,
    lineHeight: number,
    itemMargin: number
): number => {
    const numLines = Math.max(1, Math.ceil((text || '').length / charsPerLine));
    return numLines * lineHeight + itemMargin;
};

/**
 * Helper chunk array for gallery rows.
 */
export const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

export interface RecipeBookConfig {
    imageDisplay:
        | 'random'
        | 'left-top'
        | 'left-bottom'
        | 'right-top'
        | 'right-bottom';
    displayExtraImages: boolean;
    displayUserImage: boolean;
}

export const DEFAULT_RECIPE_BOOK_CONFIG: RecipeBookConfig = {
    imageDisplay: 'random',
    displayExtraImages: true,
    displayUserImage: true,
};

export interface LayoutParameters {
    layout: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom';
    leftImageHeight: number;
    rightImageHeight: number;
    galleryColumn: 'left' | 'right';
    galleryImageHeight: number;
    colsPerRow: number;
}

/**
 * Calculates page layout settings dynamically for a given recipe to prevent page overflow.
 */
export const calculateLayoutParameters = (
    recipe: SafeRecipe,
    idx: number,
    config?: RecipeBookConfig
): LayoutParameters => {
    const numSteps = recipe.steps ? recipe.steps.length : 0;
    const totalStepsLength = recipe.steps
        ? recipe.steps.reduce((sum, s) => sum + s.length, 0)
        : 0;
    const showExtraImages = config ? config.displayExtraImages : true;
    const hasExtraImages =
        showExtraImages && recipe.extraImages && recipe.extraImages.length > 0;
    const isLongRecipe =
        numSteps >= 8 || totalStepsLength > 400 || hasExtraImages;

    let layout: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom';
    if (config?.imageDisplay && config.imageDisplay !== 'random') {
        layout = config.imageDisplay;
    } else {
        if (isLongRecipe) {
            layout = idx % 2 === 0 ? 'left-top' : 'left-bottom';
        } else {
            const layouts: (
                | 'left-top'
                | 'left-bottom'
                | 'right-top'
                | 'right-bottom'
            )[] = ['right-top', 'left-top', 'left-bottom'];
            layout = layouts[idx % 3];
        }
    }

    // Dynamic MaxColHeight calculation based on header content
    const descriptionHeight = estimateTextHeight(
        recipe.description || '',
        95,
        12.6,
        15
    );
    const HeaderHeight = 35 + 24 + descriptionHeight + 35; // Header line + title + description + meta row
    const MaxColHeight = 841.89 - 80 - HeaderHeight - 25; // 25pt safety margin for footer/spacing

    // Calculate base heights of columns (excluding images)
    const ingredientsBaseHeight =
        25 +
        (recipe.ingredients || []).reduce((sum, ing) => {
            return sum + estimateTextHeight(ing, 40, 12.6, 6);
        }, 0);

    const stepsBaseHeight =
        25 +
        (recipe.steps || []).reduce((sum, step) => {
            return sum + estimateTextHeight(step, 50, 12.6, 8);
        }, 0);

    // Main recipe image aspect ratio is 4:3
    // Left column width = ~216 pt. Height for 4:3 = 162 pt.
    // Right column width = ~278 pt. Height for 4:3 = 208 pt.
    let leftImageHeight = 162;
    let rightImageHeight = 208;

    // Scale down left main image height if ingredients base height is very tall
    const leftSpaceForImage = MaxColHeight - ingredientsBaseHeight - 15;
    if (leftSpaceForImage < leftImageHeight) {
        leftImageHeight = Math.max(100, leftSpaceForImage);
    }

    // Scale down right main image height if steps base height is very tall
    const rightSpaceForImage = MaxColHeight - stepsBaseHeight - 15;
    if (rightSpaceForImage < rightImageHeight) {
        rightImageHeight = Math.max(120, rightSpaceForImage);
    }

    // Calculate available space for gallery in each column
    const leftAvailableForGallery =
        MaxColHeight -
        (ingredientsBaseHeight +
            (layout.startsWith('left') ? leftImageHeight + 15 : 0)) -
        15;
    const rightAvailableForGallery =
        MaxColHeight -
        (stepsBaseHeight +
            (layout.startsWith('right') ? rightImageHeight + 15 : 0)) -
        15;

    // Route gallery to the column with more available space
    const galleryColumn: 'left' | 'right' =
        leftAvailableForGallery >= rightAvailableForGallery ? 'left' : 'right';

    const columnWidth = galleryColumn === 'left' ? 216 : 278;
    const maxGalleryHeight = galleryColumn === 'left' ? 104 : 133;
    const numExtraImages =
        showExtraImages && recipe.extraImages ? recipe.extraImages.length : 0;
    const allowedGalleryHeight =
        galleryColumn === 'left'
            ? leftAvailableForGallery
            : rightAvailableForGallery;

    let colsPerRow = 2;
    if (numExtraImages > 2) {
        // Estimate height for 2 rows of 2 columns
        const numRows2 = Math.ceil(numExtraImages / 2);
        const maxHeightPerRow2 =
            (allowedGalleryHeight - (numRows2 - 1) * 6) / numRows2;
        const galleryImageHeight2 = Math.max(
            50,
            Math.min(maxGalleryHeight, maxHeightPerRow2)
        );
        const requiredHeight2 =
            numRows2 * galleryImageHeight2 + (numRows2 - 1) * 6;

        // If 2 rows would overflow the available column height, force all extra images into a single row
        if (requiredHeight2 > allowedGalleryHeight) {
            colsPerRow = numExtraImages;
        }
    }

    const numRows = Math.ceil(numExtraImages / colsPerRow);
    // Width percent of each image based on the columns per row
    const imageWidthPercent = (100 - (colsPerRow - 1) * 4) / colsPerRow;
    const maxGalleryHeightForN =
        colsPerRow === 2
            ? maxGalleryHeight
            : Math.floor(columnWidth * (imageWidthPercent / 100));

    let galleryImageHeight = maxGalleryHeightForN;
    if (numRows > 0) {
        const maxHeightPerRow =
            (allowedGalleryHeight - (numRows - 1) * 6) / numRows;
        // With a single row of 3 or 4 images, we can allow slightly smaller heights (minimum 40)
        const minHeight = colsPerRow > 2 ? 40 : 50;
        galleryImageHeight = Math.max(
            minHeight,
            Math.min(maxGalleryHeightForN, maxHeightPerRow)
        );
    }

    return {
        layout,
        leftImageHeight,
        rightImageHeight,
        galleryColumn,
        galleryImageHeight,
        colsPerRow,
    };
};
