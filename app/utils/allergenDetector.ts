import { IconType } from 'react-icons';
import { FaFish } from 'react-icons/fa';
import {
    GiAlmond,
    GiEggClutch,
    GiHerbsBundle,
    GiKetchup,
    GiMilkCarton,
    GiMussel,
    GiPeanut,
    GiSesame,
    GiShrimp,
    GiWheat,
    GiWineBottle,
} from 'react-icons/gi';
import { LuBean, LuSprout } from 'react-icons/lu';

export type AllergenId =
    | 'gluten'
    | 'crustaceans'
    | 'eggs'
    | 'fish'
    | 'peanuts'
    | 'soy'
    | 'milk'
    | 'nuts'
    | 'celery'
    | 'mustard'
    | 'sesame'
    | 'sulphites'
    | 'lupin'
    | 'molluscs';

export interface DetectedAllergen {
    id: AllergenId;
    icon: IconType;
    matchedIngredients: string[];
}

interface AllergenDefinition {
    id: AllergenId;
    icon: IconType;
    exclusions: string[];
    negations?: string[];
    keywords: string[];
}

const ANIMAL_ALLERGENS: ReadonlySet<AllergenId> = new Set<AllergenId>([
    'milk',
    'eggs',
    'fish',
    'crustaceans',
    'molluscs',
]);

export const EU_ALLERGEN_DEFINITIONS: readonly AllergenDefinition[] = [
    {
        id: 'gluten',
        icon: GiWheat,
        negations: ['sin gluten', 'sense gluten', 'gluten free'],
        exclusions: [
            'harina de avena sin gluten',
            'harina de trigo sarraceno',
            'farina de blat de moro',
            'harina de garbanzos',
            'harina de almendras',
            'farina de cigrons',
            'harina de garbanzo',
            'harina de almendra',
            'harina de lentejas',
            'harina de mandioca',
            'harina de tapioca',
            'harina de castana',
            'harina de quinoa',
            'farina d ametlles',
            'harina de arroz',
            'farina d ametlla',
            'trigo sarraceno',
            'buckwheat flour',
            'harina de maiz',
            'harina de coco',
            'harina de yuca',
            'farina d arros',
            'farina de fajol',
            'farina de coco',
            'chickpea flour',
            'almond flour',
            'coconut flour',
            'cornstarch',
            'corn flour',
            'rice flour',
            'gram flour',
            'buckwheat',
            'maizena',
            'maicena',
            'fajol',
        ],
        keywords: [
            'gluten',
            'wheat',
            'trigo',
            'blat',
            'rye',
            'centeno',
            'segol',
            'barley',
            'cebada',
            'ordi',
            'oats',
            'oat',
            'avena',
            'civada',
            'spelt',
            'espelta',
            'kamut',
            'semolina',
            'semola',
            'couscous',
            'cuscus',
            'bulgur',
            'seitan',
            'flour',
            'harina',
            'farina',
            'bread',
            'breadcrumbs',
            'panko',
            'pan',
            'pa',
            'pasta',
            'spaghetti',
            'espaguetis',
            'macaroni',
            'macarrones',
            'macarrons',
            'fideos',
            'fideus',
            'noodles',
            'lasagna',
            'lasana',
            'lasanya',
            'ravioli',
            'gnocchi',
            'noquis',
            'nyoquis',
            'tortilla de trigo',
            'puff pastry',
            'hojaldre',
            'pasta de full',
            'croissant',
            'brioche',
            'galleta',
            'galletas',
            'galetes',
            'biscuit',
            'biscuits',
            'cookie',
            'cookies',
            'cracker',
            'crackers',
            'beer',
            'cerveza',
            'cervesa',
            'soy sauce',
            'salsa de soja',
        ],
    },
    {
        id: 'crustaceans',
        icon: GiShrimp,
        exclusions: [],
        keywords: [
            'crustacean',
            'crustaceans',
            'crustaceo',
            'crustaceos',
            'crustaci',
            'crustacis',
            'shrimp',
            'shrimps',
            'prawn',
            'prawns',
            'gamba',
            'gambas',
            'gambes',
            'langostino',
            'langostinos',
            'llagosti',
            'llagostins',
            'crab',
            'cangrejo',
            'cranc',
            'lobster',
            'langosta',
            'llagosta',
            'bogavante',
            'llobregant',
            'crayfish',
            'crawfish',
            'cigala',
            'cigalas',
            'escamarla',
            'escamarlans',
            'carabinero',
            'carabineros',
            'camaron',
            'camarones',
        ],
    },
    {
        id: 'eggs',
        icon: GiEggClutch,
        negations: [
            'sin huevo',
            'sense ou',
            'egg free',
            'vegano',
            'vegana',
            'vegan',
        ],
        exclusions: ['berenjena', 'berenjenas', 'eggplant', 'eggplants'],
        keywords: [
            'egg',
            'eggs',
            'huevo',
            'huevos',
            'ou',
            'ous',
            'yolk',
            'yolks',
            'yema',
            'yemas',
            'rovell',
            'rovells',
            'clara de huevo',
            'claras de huevo',
            'clara d ou',
            'clares d ou',
            'egg white',
            'egg whites',
            'meringue',
            'merengue',
            'merenga',
            'mayonnaise',
            'mayo',
            'mayonesa',
            'mahonesa',
            'maionesa',
            'aioli',
            'allioli',
        ],
    },
    {
        id: 'fish',
        icon: FaFish,
        exclusions: [],
        keywords: [
            'fish',
            'pescado',
            'peix',
            'salmon',
            'salmo',
            'tuna',
            'atun',
            'tonyina',
            'cod',
            'bacalao',
            'bacalla',
            'hake',
            'merluza',
            'lluc',
            'anchovy',
            'anchovies',
            'anchoa',
            'anchoas',
            'anxova',
            'anxoves',
            'boqueron',
            'boquerones',
            'seitons',
            'sardine',
            'sardines',
            'sardina',
            'sardinas',
            'trout',
            'trucha',
            'truita de riu',
            'sea bass',
            'lubina',
            'llobarro',
            'sea bream',
            'dorada',
            'orada',
            'mackerel',
            'caballa',
            'verat',
            'halibut',
            'fletan',
            'sole',
            'lenguado',
            'llenguado',
            'monkfish',
            'rape',
            'rap',
            'swordfish',
            'pez espada',
            'emperador',
            'surimi',
            'fish sauce',
            'salsa de pescado',
            'worcestershire',
            'salsa perrins',
        ],
    },
    {
        id: 'peanuts',
        icon: GiPeanut,
        exclusions: [],
        keywords: [
            'peanut',
            'peanuts',
            'cacahuete',
            'cacahuetes',
            'cacauet',
            'cacauets',
            'mani',
            'manies',
            'groundnut',
            'arachis',
        ],
    },
    {
        id: 'soy',
        icon: LuBean,
        exclusions: [],
        keywords: [
            'soy',
            'soya',
            'soja',
            'soybean',
            'soybeans',
            'edamame',
            'tofu',
            'tempeh',
            'miso',
            'tamari',
            'teriyaki',
            'lecithin',
            'lecitina',
        ],
    },
    {
        id: 'milk',
        icon: GiMilkCarton,
        negations: [
            'sin lacteos',
            'sense lactics',
            'dairy free',
            'vegano',
            'vegana',
            'vega',
            'vegan',
            'vegetal',
        ],
        exclusions: [
            'mantequilla de cacahuete',
            'mantequilla de anacardos',
            'mantequilla de almendras',
            'mantequilla de anacardo',
            'mantequilla de almendra',
            'mantequilla de mani',
            'crema de cacahuete',
            'crema de almendras',
            'mantega de cacauet',
            'mantequilla vegana',
            'leche de almendras',
            'leche de avellanas',
            'mantega d ametlla',
            'leche de almendra',
            'leche de avellana',
            'crema balsamica',
            'manteca de cacao',
            'llet d ametlles',
            'leche de avena',
            'leche de arroz',
            'llet d ametlla',
            'cremor tartaro',
            'cream of tartar',
            'balsamic cream',
            'cashew butter',
            'peanut butter',
            'almond butter',
            'hazelnut milk',
            'leche de coco',
            'leche de soja',
            'llet de civada',
            'llet d arros',
            'crema de coco',
            'coconut cream',
            'coconut milk',
            'queso vegano',
            'vegan cheese',
            'vegan butter',
            'llet de coco',
            'llet de soja',
            'almond milk',
            'cocoa butter',
            'shea butter',
            'rice milk',
            'soy milk',
            'oat milk',
            'butternut',
        ],
        keywords: [
            'milk',
            'leche',
            'llet',
            'dairy',
            'lacteo',
            'lacteos',
            'lactose',
            'lactosa',
            'butter',
            'mantequilla',
            'mantega',
            'ghee',
            'cream',
            'nata',
            'crema de leche',
            'crema de llet',
            'sour cream',
            'creme fraiche',
            'cheese',
            'queso',
            'formatge',
            'mozzarella',
            'parmesan',
            'parmesano',
            'parmigiano',
            'cheddar',
            'gouda',
            'brie',
            'camembert',
            'feta',
            'ricotta',
            'requeson',
            'mato',
            'mascarpone',
            'gorgonzola',
            'roquefort',
            'manchego',
            'provolone',
            'gruyere',
            'emmental',
            'halloumi',
            'paneer',
            'burrata',
            'pecorino',
            'yogurt',
            'yoghurt',
            'yogur',
            'iogurt',
            'kefir',
            'whey',
            'suero de leche',
            'casein',
            'caseina',
            'condensed milk',
            'evaporated milk',
            'dulce de leche',
            'buttermilk',
        ],
    },
    {
        id: 'nuts',
        icon: GiAlmond,
        exclusions: [
            'castana de agua',
            'water chestnut',
            'nuez moscada',
            'nou moscada',
            'butternut',
            'coconut',
            'nutmeg',
            'coco',
        ],
        keywords: [
            'almond',
            'almonds',
            'almendra',
            'almendras',
            'ametlla',
            'ametlles',
            'hazelnut',
            'hazelnuts',
            'avellana',
            'avellanas',
            'avellanes',
            'walnut',
            'walnuts',
            'nuez',
            'nueces',
            'nou',
            'nous',
            'cashew',
            'cashews',
            'anacardo',
            'anacardos',
            'anacard',
            'anacards',
            'pecan',
            'pecans',
            'pacana',
            'pacanas',
            'nueces pecanas',
            'pistachio',
            'pistachios',
            'pistacho',
            'pistachos',
            'pistatxo',
            'pistatxos',
            'macadamia',
            'brazil nut',
            'brazil nuts',
            'nuez de brasil',
            'chestnut',
            'chestnuts',
            'castana',
            'castanas',
            'castanya',
            'castanyes',
            'pine nut',
            'pine nuts',
            'pinon',
            'pinones',
            'pinyo',
            'pinyons',
            'praline',
            'gianduja',
            'marzipan',
            'mazapan',
            'massapa',
            'frutos secos',
            'fruits secs',
            'tree nut',
            'tree nuts',
        ],
    },
    {
        id: 'celery',
        icon: GiHerbsBundle,
        exclusions: [],
        keywords: ['celery', 'celeriac', 'apio', 'api'],
    },
    {
        id: 'mustard',
        icon: GiKetchup,
        exclusions: [],
        keywords: ['mustard', 'mostaza', 'mostassa', 'dijon'],
    },
    {
        id: 'sesame',
        icon: GiSesame,
        exclusions: [],
        keywords: [
            'sesame',
            'sesamo',
            'sesam',
            'ajonjoli',
            'tahini',
            'tahina',
            'tahin',
            'gomasio',
            'halva',
        ],
    },
    {
        id: 'sulphites',
        icon: GiWineBottle,
        exclusions: [],
        keywords: [
            'sulphite',
            'sulphites',
            'sulfite',
            'sulfites',
            'sulfito',
            'sulfitos',
            'sulfit',
            'sulfits',
            'wine',
            'vino',
            'vi blanc',
            'vi negre',
            'vi ranci',
            'vino blanco',
            'vino tinto',
            'vino dulce',
            'sherry',
            'jerez',
            'marsala',
            'porto',
            'oporto',
            'champagne',
            'cava',
            'prosecco',
            'vermouth',
            'vermut',
            'cider',
            'sidra',
            'vinegar',
            'vinagre',
            'orejones',
        ],
    },
    {
        id: 'lupin',
        icon: LuSprout,
        exclusions: [],
        keywords: [
            'lupin',
            'lupine',
            'lupins',
            'lupino',
            'altramuz',
            'altramuces',
            'tramus',
            'tramussos',
        ],
    },
    {
        id: 'molluscs',
        icon: GiMussel,
        exclusions: [],
        keywords: [
            'mollusc',
            'molluscs',
            'mollusk',
            'mollusks',
            'molusco',
            'moluscos',
            'molusc',
            'moluscs',
            'clam',
            'clams',
            'almeja',
            'almejas',
            'cloissa',
            'cloisses',
            'escupinya',
            'escupinyes',
            'mussel',
            'mussels',
            'mejillon',
            'mejillones',
            'musclo',
            'musclos',
            'oyster',
            'oysters',
            'ostra',
            'ostras',
            'ostres',
            'squid',
            'squids',
            'calamar',
            'calamares',
            'calamars',
            'chipiron',
            'chipirones',
            'octopus',
            'pulpo',
            'pop',
            'cuttlefish',
            'sepia',
            'sepias',
            'sipia',
            'scallop',
            'scallops',
            'vieira',
            'vieiras',
            'zamburina',
            'zamburinas',
            'cockle',
            'cockles',
            'berberecho',
            'berberechos',
            'escopinya',
            'snail',
            'snails',
            'caracol',
            'caracoles',
            'cargol',
            'cargols',
        ],
    },
];

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalizes text by lowercasing, removing accents/diacritics, and collapsing punctuation into single spaces.
 */
export function normalizeAllergenText(input: string): string {
    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildWordPhraseRegex(phrase: string): RegExp {
    return new RegExp(`(?:^|\\s)${escapeRegex(phrase)}(?=\\s|$)`, 'g');
}

// Precompile regexes once at module load for fast repeated calls.
const COMPILED_DEFINITIONS = EU_ALLERGEN_DEFINITIONS.map((def) => {
    const sortedExclusions = [...def.exclusions].sort(
        (a, b) => b.length - a.length
    );
    return {
        id: def.id,
        icon: def.icon,
        negationRegexes: (def.negations ?? []).map(buildWordPhraseRegex),
        exclusionRegexes: sortedExclusions.map(buildWordPhraseRegex),
        keywordRegexes: def.keywords.map(buildWordPhraseRegex),
    };
});

function matchesAny(text: string, regexes: RegExp[]): boolean {
    for (const regex of regexes) {
        regex.lastIndex = 0;
        if (regex.test(text)) {
            return true;
        }
    }
    return false;
}

function stripExclusions(text: string, exclusionRegexes: RegExp[]): string {
    let cleaned = text;
    for (const regex of exclusionRegexes) {
        regex.lastIndex = 0;
        cleaned = cleaned.replace(regex, ' ');
    }
    return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Detects EU 14 allergens from a recipe's ingredient lines and optional category labels.
 */
export function detectAllergens(
    ingredients: string[],
    categories?: string[]
): DetectedAllergen[] {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return [];
    }

    const normalizedCategories = new Set(
        (categories ?? []).map((cat) => cat.trim().toLowerCase())
    );
    const isGlutenFreeCategory = normalizedCategories.has('gluten-free');
    const isVeganCategory = normalizedCategories.has('vegan');

    const normalizedIngredients = ingredients.map((raw) => ({
        raw,
        normalized: normalizeAllergenText(raw),
    }));

    const detected: DetectedAllergen[] = [];

    for (const def of COMPILED_DEFINITIONS) {
        if (isGlutenFreeCategory && def.id === 'gluten') {
            continue;
        }
        if (isVeganCategory && ANIMAL_ALLERGENS.has(def.id)) {
            continue;
        }

        const matchedIngredients: string[] = [];

        for (const item of normalizedIngredients) {
            if (!item.normalized) continue;

            if (
                def.negationRegexes.length > 0 &&
                matchesAny(item.normalized, def.negationRegexes)
            ) {
                continue;
            }

            const cleaned =
                def.exclusionRegexes.length > 0
                    ? stripExclusions(item.normalized, def.exclusionRegexes)
                    : item.normalized;

            if (!cleaned) continue;

            if (matchesAny(cleaned, def.keywordRegexes)) {
                matchedIngredients.push(item.raw);
            }
        }

        if (matchedIngredients.length > 0) {
            detected.push({
                id: def.id,
                icon: def.icon,
                matchedIngredients,
            });
        }
    }

    return detected;
}
