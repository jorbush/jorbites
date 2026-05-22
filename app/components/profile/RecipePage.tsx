import React from 'react';
import { Page, View, Image, Text } from '@react-pdf/renderer';
import { SafeRecipe } from '@/app/types';
import { styles } from './recipeBookStyles';
import {
    calculateLayoutParameters,
    chunkArray,
    parseFormattedText,
} from '@/app/utils/recipeBookUtils';

interface RecipePageProps {
    recipe: SafeRecipe;
    idx: number;
    labels: {
        title: string;
        ingredients: string;
        steps: string;
        timeUnit: string;
        page: string;
        of: string;
    };
}

export const RecipePage: React.FC<RecipePageProps> = ({
    recipe,
    idx,
    labels,
}) => {
    // Construct secure proxied image URL.
    let proxiedImageSrc = null;
    if (recipe.imageSrc) {
        if (
            recipe.imageSrc.startsWith('http://') ||
            recipe.imageSrc.startsWith('https://')
        ) {
            proxiedImageSrc = `/api/image-proxy?url=${encodeURIComponent(
                recipe.imageSrc
            )}&q=auto:best&w=800&h=600&f=jpg`;
        } else {
            // Local/relative path
            let localPath = recipe.imageSrc;
            if (localPath.endsWith('.webp')) {
                localPath = localPath.slice(0, -5) + '.png';
            }
            proxiedImageSrc =
                typeof window !== 'undefined'
                    ? `${window.location.origin}${localPath}`
                    : localPath;
        }
    }

    // Construct secure proxied extra images URLs
    let proxiedExtraImages: string[] = [];
    if (recipe.extraImages) {
        proxiedExtraImages = recipe.extraImages.map((img) => {
            if (img.startsWith('http://') || img.startsWith('https://')) {
                return `/api/image-proxy?url=${encodeURIComponent(
                    img
                )}&q=auto:best&w=400&h=300&f=jpg`;
            } else {
                let localPath = img;
                if (localPath.endsWith('.webp')) {
                    localPath = localPath.slice(0, -5) + '.png';
                }
                return typeof window !== 'undefined'
                    ? `${window.location.origin}${localPath}`
                    : localPath;
            }
        });
    }

    const {
        layout,
        leftImageHeight,
        rightImageHeight,
        galleryColumn,
        galleryImageHeight,
        colsPerRow,
    } = calculateLayoutParameters(recipe, idx);

    const extraImageRows = chunkArray(proxiedExtraImages, colsPerRow);

    const mainImage = proxiedImageSrc && (
        <Image
            src={proxiedImageSrc}
            style={
                layout === 'right-top'
                    ? [styles.recipeImageRight, { height: rightImageHeight }]
                    : [styles.recipeImageLeft, { height: leftImageHeight }]
            }
        />
    );

    const gallery = extraImageRows.length > 0 && (
        <View>
            {extraImageRows.map((row, rowIdx) => {
                const imageWidth = `${(100 - (colsPerRow - 1) * 4) / colsPerRow}%`;
                return (
                    <View
                        key={rowIdx}
                        style={styles.galleryRow}
                    >
                        {row.map((src, colIdx) => (
                            <Image
                                key={colIdx}
                                src={src}
                                style={[
                                    styles.galleryImage,
                                    {
                                        width: imageWidth,
                                        height: galleryImageHeight,
                                    },
                                ]}
                            />
                        ))}
                    </View>
                );
            })}
        </View>
    );

    return (
        <Page
            key={recipe.id}
            size="A4"
            style={styles.page}
        >
            {/* Page Header */}
            <View style={styles.header}>
                <Text>Jorbites | {labels.title}</Text>
                <Text>{recipe.title}</Text>
            </View>

            {/* Title & Description */}
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            {recipe.description && (
                <Text style={styles.recipeDesc}>
                    {parseFormattedText(recipe.description)}
                </Text>
            )}

            {/* Meta Tags Row */}
            <View style={styles.metaRow}>
                <Text style={styles.metaBadge}>
                    {recipe.minutes} {labels.timeUnit}
                </Text>
                {recipe.method && (
                    <Text style={styles.metaBadge}>{recipe.method}</Text>
                )}
                {recipe.categories &&
                    recipe.categories.map((cat) => (
                        <Text
                            key={cat}
                            style={[styles.metaBadge, styles.categoryBadge]}
                        >
                            {cat}
                        </Text>
                    ))}
            </View>

            {/* Columns Container */}
            <View style={styles.columns}>
                {/* Left Column: Ingredients */}
                <View style={styles.leftCol}>
                    {layout === 'left-top' && (
                        <View>
                            {mainImage}
                            {galleryColumn === 'left' && gallery}
                        </View>
                    )}
                    <Text style={styles.sectionTitle}>
                        {labels.ingredients}
                    </Text>
                    {recipe.ingredients &&
                        recipe.ingredients.map((ing, i) => (
                            <View
                                key={i}
                                style={styles.ingredientItem}
                            >
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text style={styles.ingredientText}>
                                    {parseFormattedText(ing)}
                                </Text>
                            </View>
                        ))}
                    {layout === 'left-bottom' && (
                        <View style={{ marginTop: 15 }}>
                            {mainImage}
                            {galleryColumn === 'left' && gallery}
                        </View>
                    )}
                    {layout === 'right-top' &&
                        galleryColumn === 'left' &&
                        gallery && (
                            <View style={{ marginTop: 15 }}>{gallery}</View>
                        )}
                </View>

                {/* Right Column: Image and Steps */}
                <View style={styles.rightCol}>
                    {layout === 'right-top' && (
                        <View>
                            {mainImage}
                            {galleryColumn === 'right' && gallery}
                        </View>
                    )}
                    <Text style={styles.sectionTitle}>{labels.steps}</Text>
                    {recipe.steps &&
                        recipe.steps.map((step, i) => (
                            <View
                                key={i}
                                style={styles.stepItem}
                            >
                                <Text style={styles.stepNum}>{i + 1}.</Text>
                                <Text style={styles.stepText}>
                                    {parseFormattedText(step)}
                                </Text>
                            </View>
                        ))}
                    {layout !== 'right-top' &&
                        galleryColumn === 'right' &&
                        gallery && (
                            <View style={{ marginTop: 15 }}>{gallery}</View>
                        )}
                </View>
            </View>

            {/* Page Footer */}
            <Text
                style={styles.footer}
                render={({ pageNumber, totalPages }) =>
                    `${labels.page} ${pageNumber} ${labels.of} ${totalPages}`
                }
                fixed
            />
        </Page>
    );
};
