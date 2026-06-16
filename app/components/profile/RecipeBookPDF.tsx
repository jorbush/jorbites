import { SafeRecipe } from '@/app/types';
import { RecipeBookCover } from './RecipeBookCover';
import { RecipeBookTOC } from './RecipeBookTOC';
import { RecipePage } from './RecipePage';
import { RecipeBookConfig } from '@/app/utils/recipeBookUtils';

let fontsRegistered = false;

interface RecipeBookPDFProps {
    pdfRenderer: any;
    recipes: SafeRecipe[];
    userName: string;
    userImage?: string | null;
    logoUrl: string;
    labels: {
        title: string;
        createdBy: string;
        subtitle: string;
        ingredients: string;
        steps: string;
        minutes: string;
        method: string;
        categories: string;
        page: string;
        of: string;
        tableOfContents: string;
        timeUnit: string;
        recipes: string;
    };
    config?: RecipeBookConfig;
}

export const RecipeBookPDF: React.FC<RecipeBookPDFProps> = ({
    pdfRenderer,
    recipes,
    userName,
    userImage,
    logoUrl,
    labels,
    config,
}) => {
    // Register Montserrat and Playfair Display Font weights from Google Fonts gstatic CDN dynamically
    if (!fontsRegistered) {
        pdfRenderer.Font.register({
            family: 'Montserrat',
            fonts: [
                {
                    src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aX8.ttf',
                    fontWeight: 400,
                },
                {
                    src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu173w5aX8.ttf',
                    fontWeight: 600,
                },
                {
                    src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aX8.ttf',
                    fontWeight: 700,
                },
                {
                    src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCvr73w5aX8.ttf',
                    fontWeight: 800,
                },
                {
                    src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUFjIg1_i6t8kCHKm459Wx7xQYXK0vOoz6jq6R9aX8.ttf',
                    fontWeight: 400,
                    fontStyle: 'italic',
                },
                {
                    src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUFjIg1_i6t8kCHKm459Wx7xQYXK0vOoz6jq0N6aX8.ttf',
                    fontWeight: 700,
                    fontStyle: 'italic',
                },
            ],
        });

        pdfRenderer.Font.register({
            family: 'Playfair Display',
            fonts: [
                {
                    src: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtY.ttf',
                    fontWeight: 400,
                },
                {
                    src: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiunDXbtY.ttf',
                    fontWeight: 700,
                },
            ],
        });

        pdfRenderer.Font.registerEmojiSource({
            format: 'png',
            url: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/72x72/',
        });

        fontsRegistered = true;
    }

    const { Document } = pdfRenderer;

    return (
        <Document>
            {/* Page 1: Cover Page */}
            <RecipeBookCover
                pdfRenderer={pdfRenderer}
                userName={userName}
                userImage={userImage}
                logoUrl={logoUrl}
                recipesCount={recipes.length}
                labels={labels}
                config={config}
            />

            {/* Page 2: Table of Contents */}
            {recipes.length > 0 && (
                <RecipeBookTOC
                    pdfRenderer={pdfRenderer}
                    recipes={recipes}
                    labels={labels}
                />
            )}

            {/* Recipe Pages (Page 3+) */}
            {recipes.map((recipe, idx) => (
                <RecipePage
                    key={recipe.id}
                    pdfRenderer={pdfRenderer}
                    recipe={recipe}
                    idx={idx}
                    labels={labels}
                    config={config}
                />
            ))}
        </Document>
    );
};
export default RecipeBookPDF;
