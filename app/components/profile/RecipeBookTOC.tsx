import React from 'react';
import { SafeRecipe } from '@/app/types';
import { styles } from './recipeBookStyles';

interface RecipeBookTOCProps {
    pdfRenderer: any;
    recipes: SafeRecipe[];
    labels: {
        tableOfContents: string;
        page: string;
        of: string;
    };
}

export const RecipeBookTOC: React.FC<RecipeBookTOCProps> = ({
    pdfRenderer,
    recipes,
    labels,
}) => {
    const { Page, View, Text } = pdfRenderer;
    // Generate Table of Contents mappings.
    // Cover is Page 1, TOC is Page 2. Recipes start at Page 3.
    const tocItems = recipes.map((recipe, index) => ({
        id: recipe.id,
        title: recipe.title,
        pageNumber: index + 3,
    }));

    return (
        <Page
            size="A4"
            style={styles.page}
        >
            <View style={styles.header}>
                <Text>Jorbites</Text>
                <Text>{labels.tableOfContents}</Text>
            </View>
            <Text style={styles.tocTitle}>{labels.tableOfContents}</Text>
            <View style={{ marginTop: 10 }}>
                {tocItems.map((item, index) => (
                    <View
                        key={item.id}
                        style={styles.tocItem}
                    >
                        <Text style={styles.tocItemText}>
                            {index + 1}. {item.title}
                        </Text>
                        <View style={styles.tocDots} />
                        <Text style={styles.tocPage}>{item.pageNumber}</Text>
                    </View>
                ))}
            </View>
            <Text
                style={styles.footer}
                render={({
                    pageNumber,
                    totalPages,
                }: {
                    pageNumber: number;
                    totalPages: number;
                }) => `${labels.page} ${pageNumber} ${labels.of} ${totalPages}`}
                fixed
            />
        </Page>
    );
};
