'use client';
import React from 'react';
import {
    RecipeSchemaProps,
    buildRecipeSchemaData,
    serializeJsonLd,
} from '@/app/components/recipes/recipeSchemaUtils';

export type { RecipeSchemaProps };

export default function RecipeSchema(props: RecipeSchemaProps) {
    const schemaData = buildRecipeSchemaData(props);

    return (
        <script type="application/ld+json">
            {serializeJsonLd(schemaData)}
        </script>
    );
}
