import React from 'react';
import { Page, View, Image, Text } from '@react-pdf/renderer';
import { styles } from './recipeBookStyles';
import { RecipeBookConfig } from '@/app/utils/recipeBookUtils';

interface RecipeBookCoverProps {
    userName: string;
    userImage?: string | null;
    logoUrl: string;
    recipesCount: number;
    labels: {
        title: string;
        createdBy: string;
        subtitle: string;
        recipes: string;
    };
    config?: RecipeBookConfig;
}

export const RecipeBookCover: React.FC<RecipeBookCoverProps> = ({
    userName,
    userImage,
    logoUrl,
    recipesCount,
    labels,
    config,
}) => {
    const showUserImage = config ? config.displayUserImage : true;

    // Construct secure proxied user image URL if available
    let proxiedUserImage = null;
    if (userImage) {
        if (
            userImage.startsWith('http://') ||
            userImage.startsWith('https://')
        ) {
            proxiedUserImage = `/api/image-proxy?url=${encodeURIComponent(
                userImage
            )}&q=auto:best&w=150&h=150&f=jpg`;
        } else {
            let localPath = userImage;
            if (localPath.endsWith('.webp')) {
                localPath = localPath.slice(0, -5) + '.png';
            }
            proxiedUserImage =
                typeof window !== 'undefined'
                    ? `${window.location.origin}${localPath}`
                    : localPath;
        }
    }

    return (
        <Page
            size="A4"
            style={styles.page}
        >
            <View style={styles.coverContainer}>
                {logoUrl && (
                    <Image
                        src={logoUrl}
                        style={styles.logo}
                    />
                )}
                <Text style={styles.coverTitle}>{labels.title}</Text>
                <View style={styles.coverDivider} />
                <Text style={styles.coverSubtitle}>{labels.subtitle}</Text>
                <View style={styles.coverFooter}>
                    {showUserImage && proxiedUserImage && (
                        <Image
                            src={proxiedUserImage}
                            style={styles.coverAvatar}
                        />
                    )}
                    <Text style={styles.coverAuthor}>
                        {labels.createdBy} {userName}
                    </Text>
                    <Text style={styles.coverStats}>
                        {recipesCount} {labels.recipes}
                    </Text>
                </View>
            </View>
        </Page>
    );
};
