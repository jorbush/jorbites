import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font,
} from '@react-pdf/renderer';
import { SafeRecipe } from '@/app/types';

// Register Montserrat and Playfair Display Font weights from Google Fonts gstatic CDN
Font.register({
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

Font.register({
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

Font.registerEmojiSource({
    format: 'png',
    url: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/72x72/',
});

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Montserrat',
        padding: 40,
        backgroundColor: '#FFFFFF',
        color: '#1E293B',
    },
    // Cover Styles
    coverContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderWidth: 2,
        borderColor: '#C5F0A4',
        margin: 10,
        backgroundColor: '#FCFDFB',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 30,
        objectFit: 'contain',
    },
    coverTitle: {
        fontFamily: 'Playfair Display',
        fontSize: 32,
        fontWeight: 700,
        textAlign: 'center',
        color: '#0F0F0F',
        marginBottom: 10,
    },
    coverSubtitle: {
        fontSize: 12,
        fontWeight: 600,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 3,
        marginBottom: 50,
    },
    coverDivider: {
        width: 100,
        height: 3,
        backgroundColor: '#C5F0A4',
        marginBottom: 40,
    },
    coverFooter: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
    },
    coverAuthor: {
        fontSize: 14,
        fontWeight: 700,
        color: '#1E293B',
        marginBottom: 5,
    },
    coverStats: {
        fontSize: 10,
        color: '#64748B',
    },
    // TOC Styles
    tocTitle: {
        fontFamily: 'Playfair Display',
        fontSize: 22,
        fontWeight: 700,
        marginBottom: 30,
        color: '#0F0F0F',
        borderBottomWidth: 2,
        borderBottomColor: '#C5F0A4',
        paddingBottom: 5,
        width: '100%',
    },
    tocItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        fontSize: 10,
    },
    tocItemText: {
        fontWeight: 600,
        color: '#1E293B',
        maxWidth: '85%',
    },
    tocDots: {
        flexGrow: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        borderStyle: 'dashed',
        marginHorizontal: 8,
    },
    tocPage: {
        fontWeight: 700,
        color: '#64748B',
        width: 25,
        textAlign: 'right',
    },
    // Header/Footer on each page
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 5,
        marginBottom: 20,
        fontSize: 8,
        color: '#94A3B8',
        fontWeight: 600,
    },
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#94A3B8',
        fontWeight: 600,
    },
    // Recipe Sheet Styles
    recipeTitle: {
        fontFamily: 'Playfair Display',
        fontSize: 20,
        fontWeight: 700,
        color: '#0F0F0F',
        marginBottom: 4,
    },
    recipeDesc: {
        fontSize: 9,
        color: '#475569',
        marginBottom: 15,
        lineHeight: 1.4,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    metaBadge: {
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 8,
        color: '#475569',
        fontWeight: 600,
        borderWidth: 0.5,
        borderColor: '#E2E8F0',
    },
    categoryBadge: {
        backgroundColor: '#EBFCE2',
        borderColor: '#C5F0A4',
        color: '#336611',
    },
    columns: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
    },
    leftCol: {
        width: '42%',
        paddingRight: 10,
    },
    rightCol: {
        width: '54%',
    },
    sectionTitle: {
        fontFamily: 'Playfair Display',
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#0F0F0F',
        borderBottomWidth: 1.5,
        borderBottomColor: '#C5F0A4',
        paddingBottom: 3,
        marginBottom: 10,
    },
    ingredientItem: {
        flexDirection: 'row',
        marginBottom: 6,
        fontSize: 9,
        lineHeight: 1.4,
    },
    bulletPoint: {
        width: 10,
        color: '#84CC16',
        fontWeight: 700,
    },
    ingredientText: {
        flex: 1,
        color: '#334155',
    },
    recipeImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 15,
        objectFit: 'cover',
    },
    stepItem: {
        flexDirection: 'row',
        marginBottom: 8,
        fontSize: 9,
        lineHeight: 1.4,
    },
    stepNum: {
        width: 16,
        fontWeight: 800,
        color: '#65A30D',
    },
    stepText: {
        flex: 1,
        color: '#334155',
    },
});

const parseFormattedText = (text: string, baseStyle: any = {}) => {
    if (!text) return '';

    // Regex matching bold-italic (***, **_ or __*), bold (** or __), and italic (* or _) patterns
    // We use [\s\S]+? to require at least one character inside the tags and match newlines.
    const regex =
        /(\*\*\*[\s\S]+?\*\*\*|\*\*_(?:[\s\S]+?)_\*\*|__\*(?:[\s\S]+?)\*__|\*\*[\s\S]+?\*\*|__[\s\S]+?__|\*[\s\S]+?\*|_[\s\S]+?_)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
        if (!part) return null;

        // Bold-italic
        if (
            (part.startsWith('***') && part.endsWith('***')) ||
            (part.startsWith('**_') && part.endsWith('_**')) ||
            (part.startsWith('__*') && part.endsWith('*__'))
        ) {
            const cleanText = part.slice(3, -3);
            return (
                <Text
                    key={index}
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
                    key={index}
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
                    key={index}
                    style={[baseStyle, { fontStyle: 'italic' }]}
                >
                    {cleanText}
                </Text>
            );
        }

        return part;
    });
};

interface RecipeBookPDFProps {
    recipes: SafeRecipe[];
    userName: string;
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
}

export const RecipeBookPDF: React.FC<RecipeBookPDFProps> = ({
    recipes,
    userName,
    logoUrl,
    labels,
}) => {
    // Generate Table of Contents mappings.
    // Cover is Page 1, TOC is Page 2. Recipes start at Page 3.
    const tocItems = recipes.map((recipe, index) => ({
        title: recipe.title,
        pageNumber: index + 3,
    }));

    return (
        <Document>
            {/* Page 1: Cover Page */}
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
                        <Text style={styles.coverAuthor}>
                            {labels.createdBy} {userName}
                        </Text>
                        <Text style={styles.coverStats}>
                            {recipes.length} {labels.recipes}
                        </Text>
                    </View>
                </View>
            </Page>

            {/* Page 2: Table of Contents */}
            {recipes.length > 0 && (
                <Page
                    size="A4"
                    style={styles.page}
                >
                    <View style={styles.header}>
                        <Text>Jorbites</Text>
                        <Text>{labels.tableOfContents}</Text>
                    </View>
                    <Text style={styles.tocTitle}>
                        {labels.tableOfContents}
                    </Text>
                    <View style={{ marginTop: 10 }}>
                        {tocItems.map((item, index) => (
                            <View
                                key={index}
                                style={styles.tocItem}
                            >
                                <Text style={styles.tocItemText}>
                                    {index + 1}. {item.title}
                                </Text>
                                <View style={styles.tocDots} />
                                <Text style={styles.tocPage}>
                                    {item.pageNumber}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <Text
                        style={styles.footer}
                        render={({ pageNumber, totalPages }) =>
                            `${labels.page} ${pageNumber} ${labels.of} ${totalPages}`
                        }
                        fixed
                    />
                </Page>
            )}

            {/* Recipe Pages (Page 3+) */}
            {recipes.map((recipe, index) => {
                // Construct secure proxied image URL.
                let proxiedImageSrc = null;
                if (recipe.imageSrc) {
                    if (
                        recipe.imageSrc.startsWith('http://') ||
                        recipe.imageSrc.startsWith('https://')
                    ) {
                        proxiedImageSrc = `/api/image-proxy?url=${encodeURIComponent(recipe.imageSrc)}&q=auto:best&w=800&h=600&f=jpg`;
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
                                <Text style={styles.metaBadge}>
                                    {recipe.method}
                                </Text>
                            )}
                            {recipe.categories &&
                                recipe.categories.map((cat) => (
                                    <Text
                                        key={cat}
                                        style={[
                                            styles.metaBadge,
                                            styles.categoryBadge,
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                ))}
                        </View>

                        {/* Columns Container */}
                        <View style={styles.columns}>
                            {/* Left Column: Ingredients */}
                            <View style={styles.leftCol}>
                                <Text style={styles.sectionTitle}>
                                    {labels.ingredients}
                                </Text>
                                {recipe.ingredients &&
                                    recipe.ingredients.map((ing, i) => (
                                        <View
                                            key={i}
                                            style={styles.ingredientItem}
                                        >
                                            <Text style={styles.bulletPoint}>
                                                •
                                            </Text>
                                            <Text style={styles.ingredientText}>
                                                {parseFormattedText(ing)}
                                            </Text>
                                        </View>
                                    ))}
                            </View>

                            {/* Right Column: Image and Steps */}
                            <View style={styles.rightCol}>
                                {proxiedImageSrc && (
                                    <Image
                                        src={proxiedImageSrc}
                                        style={styles.recipeImage}
                                    />
                                )}
                                <Text style={styles.sectionTitle}>
                                    {labels.steps}
                                </Text>
                                {recipe.steps &&
                                    recipe.steps.map((step, i) => (
                                        <View
                                            key={i}
                                            style={styles.stepItem}
                                        >
                                            <Text style={styles.stepNum}>
                                                {i + 1}.
                                            </Text>
                                            <Text style={styles.stepText}>
                                                {parseFormattedText(step)}
                                            </Text>
                                        </View>
                                    ))}
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
            })}
        </Document>
    );
};
