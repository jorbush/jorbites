import { describe, it, expect } from 'vitest';
import {
    detectAllergens,
    EU_ALLERGEN_DEFINITIONS,
} from '@/app/utils/allergenDetector';

describe('allergenDetector', () => {
    it('defines all 14 EU allergens', () => {
        expect(EU_ALLERGEN_DEFINITIONS).toHaveLength(14);
    });

    it('returns empty array for empty or allergen-free ingredients', () => {
        expect(detectAllergens([])).toEqual([]);
        expect(
            detectAllergens([
                '2 cups water',
                '1 tsp salt',
                '200g potatoes',
                '1 tbsp olive oil',
            ])
        ).toEqual([]);
    });

    it('detects all 14 EU allergens across English, Spanish, and Catalan', () => {
        const cases = [
            {
                id: 'gluten',
                samples: [
                    '200g wheat flour',
                    '2 rebanadas de pan',
                    '150g farina de blat',
                ],
            },
            {
                id: 'crustaceans',
                samples: ['250g prawns', '200g gambas', '4 escamarlans'],
            },
            {
                id: 'eggs',
                samples: ['2 large eggs', '3 huevos', '2 ous'],
            },
            {
                id: 'fish',
                samples: ['300g salmon', '200g bacalao', '150g tonyina'],
            },
            {
                id: 'peanuts',
                samples: [
                    '50g roasted peanuts',
                    '2 cdas de cacahuetes',
                    '30g cacauets',
                ],
            },
            {
                id: 'soy',
                samples: ['200g tofu', '2 tbsp soy sauce', '1 tbsp tamari'],
            },
            {
                id: 'milk',
                samples: [
                    '250ml milk',
                    '50g mantequilla',
                    '100g formatge ratllat',
                ],
            },
            {
                id: 'nuts',
                samples: [
                    '100g almonds',
                    '50g nueces',
                    '40g ametlles torrades',
                ],
            },
            {
                id: 'celery',
                samples: [
                    '2 stalks celery',
                    '1 rama de apio',
                    '1 branqueta d’api',
                ],
            },
            {
                id: 'mustard',
                samples: [
                    '1 tbsp Dijon mustard',
                    '1 cda mostaza',
                    '1 cda mostassa',
                ],
            },
            {
                id: 'sesame',
                samples: [
                    '1 tbsp sesame seeds',
                    '2 cdas tahini',
                    'llavors de sèsam',
                ],
            },
            {
                id: 'sulphites',
                samples: [
                    '100ml white wine',
                    '1 cda vinagre de Jerez',
                    '50ml vi blanc',
                ],
            },
            {
                id: 'lupin',
                samples: [
                    '50g lupin flour',
                    '100g altramuces',
                    '50g tramussos',
                ],
            },
            {
                id: 'molluscs',
                samples: ['300g mussels', '200g calamares', '250g musclos'],
            },
        ] as const;

        for (const testCase of cases) {
            for (const sample of testCase.samples) {
                const result = detectAllergens([sample]);
                const ids = result.map((a) => a.id);
                expect(
                    ids,
                    `Expected "${sample}" to detect "${testCase.id}"`
                ).toContain(testCase.id);
            }
        }
    });

    it('avoids false positives on compound exceptions and substrings', () => {
        expect(
            detectAllergens([
                '1 tsp nutmeg',
                '1 pizca de nuez moscada',
                '1 pessic de nou moscada',
            ])
        ).toEqual([]);

        expect(
            detectAllergens(['200ml leche de coco', '200ml coconut milk'])
        ).toEqual([]);

        const almondMilkResult = detectAllergens([
            '200ml almond milk',
            "150ml llet d'ametlla",
        ]);
        expect(almondMilkResult.map((a) => a.id)).toEqual(['nuts']);

        const peanutButterResult = detectAllergens([
            '2 tbsp peanut butter',
            '1 cda mantequilla de cacahuete',
        ]);
        expect(peanutButterResult.map((a) => a.id)).toEqual(['peanuts']);

        expect(
            detectAllergens([
                '100g harina de maíz',
                '1 tbsp maizena',
                '150g trigo sarraceno',
                '100g buckwheat',
                '100g farina de fajol',
            ])
        ).toEqual([]);

        expect(detectAllergens(['2 rebanadas de pan sin gluten'])).toEqual([]);

        expect(
            detectAllergens(['100g panceta', '50g tapioca', '1 berenjena'])
        ).toEqual([]);

        expect(detectAllergens(['200g butternut squash'])).toEqual([]);
    });

    it('treats lactose-free milk as containing milk allergen, while dairy-free skips milk', () => {
        const lactoseFree = detectAllergens(['250ml leche sin lactosa']);
        expect(lactoseFree.map((a) => a.id)).toEqual(['milk']);

        const dairyFree = detectAllergens([
            '100g queso vegano',
            '200ml bebida vegetal',
            '100g dairy-free cheese',
        ]);
        expect(dairyFree).toEqual([]);
    });

    it('respects Gluten-Free and Vegan category overrides', () => {
        const glutenFree = detectAllergens(
            ['200g flour', '2 eggs'],
            ['Gluten-Free']
        );
        expect(glutenFree.map((a) => a.id)).toEqual(['eggs']);

        const vegan = detectAllergens(
            ['200ml milk', '2 eggs', '100g walnuts', '100g flour'],
            ['Vegan']
        );
        expect(vegan.map((a) => a.id)).toEqual(['gluten', 'nuts']);
    });

    it('records matched ingredients per detected allergen', () => {
        const result = detectAllergens([
            '200g wheat flour',
            '2 eggs',
            '100g butter',
            '2 slices bread',
        ]);
        const gluten = result.find((a) => a.id === 'gluten');
        expect(gluten?.matchedIngredients).toEqual([
            '200g wheat flour',
            '2 slices bread',
        ]);
    });
});
