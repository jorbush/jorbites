import { describe, it, expect } from 'vitest';
import {
    parseTextToList,
    parseIngredientsText,
    parseStepsText,
} from '@/app/utils/textParser';

describe('parseTextToList (default mode)', () => {
    it('parses simple line-separated items', () => {
        const text = `flour
sugar
eggs`;
        const result = parseTextToList(text);
        expect(result).toEqual(['flour', 'sugar', 'eggs']);
    });

    it('handles numbered list with dots', () => {
        const text = `1. flour
2. sugar
3. eggs`;
        const result = parseTextToList(text);
        expect(result).toEqual(['flour', 'sugar', 'eggs']);
    });

    it('handles numbered list with parentheses', () => {
        const text = `1) flour
2) sugar
3) eggs`;
        const result = parseTextToList(text);
        expect(result).toEqual(['flour', 'sugar', 'eggs']);
    });

    it('handles bullet points with dashes', () => {
        const text = `- flour
- sugar
- eggs`;
        const result = parseTextToList(text);
        expect(result).toEqual(['flour', 'sugar', 'eggs']);
    });

    it('handles bullet points with asterisks', () => {
        const text = `* flour
* sugar
* eggs`;
        const result = parseTextToList(text);
        expect(result).toEqual(['flour', 'sugar', 'eggs']);
    });

    it('handles bullet points with bullet characters', () => {
        const text = `• flour
• sugar
• eggs`;
        const result = parseTextToList(text);
        expect(result).toEqual(['flour', 'sugar', 'eggs']);
    });

    it('handles mixed formatting', () => {
        const text = `1. flour
- sugar
* eggs
4. milk`;
        const result = parseTextToList(text);
        expect(result).toEqual(['flour', 'sugar', 'eggs', 'milk']);
    });

    it('ignores empty lines', () => {
        const text = `flour

sugar

eggs`;
        const result = parseTextToList(text);
        expect(result).toEqual(['flour', 'sugar', 'eggs']);
    });

    it('trims whitespace from items', () => {
        const text = `  flour  
  sugar  
  eggs  `;
        const result = parseTextToList(text);
        expect(result).toEqual(['flour', 'sugar', 'eggs']);
    });

    it('handles complex real-world example', () => {
        const text = `1. 2 cups all-purpose flour
2. 1 cup granulated sugar
3. 3 large eggs
4. 1/2 cup butter, softened`;
        const result = parseTextToList(text);
        expect(result).toEqual([
            '2 cups all-purpose flour',
            '1 cup granulated sugar',
            '3 large eggs',
            '1/2 cup butter, softened',
        ]);
    });

    it('respects maxItems limit', () => {
        const text = `flour
sugar
eggs
milk
butter`;
        const result = parseTextToList(text, 3);
        expect(result).toEqual(['flour', 'sugar', 'eggs']);
        expect(result.length).toBe(3);
    });

    it('handles empty string', () => {
        const result = parseTextToList('');
        expect(result).toEqual([]);
    });

    it('handles null/undefined gracefully', () => {
        const result1 = parseTextToList(null as any);
        expect(result1).toEqual([]);

        const result2 = parseTextToList(undefined as any);
        expect(result2).toEqual([]);
    });

    it('handles text with only whitespace and newlines', () => {
        const text = `

        
        `;
        const result = parseTextToList(text);
        expect(result).toEqual([]);
    });

    it('handles numbered lists with double digits', () => {
        const text = `10. tenth item
11. eleventh item
12. twelfth item`;
        const result = parseTextToList(text);
        expect(result).toEqual(['tenth item', 'eleventh item', 'twelfth item']);
    });

    it('preserves internal punctuation and special characters', () => {
        const text = `1. Mix flour & sugar (2:1 ratio)
2. Add eggs - beat well!
3. Fold in chocolate chips... yum`;
        const result = parseTextToList(text);
        expect(result).toEqual([
            'Mix flour & sugar (2:1 ratio)',
            'Add eggs - beat well!',
            'Fold in chocolate chips... yum',
        ]);
    });

    it('handles recipe steps with detailed instructions', () => {
        const text = `1. Preheat oven to 350°F and grease a 9x13 pan
2. In a large bowl, cream together butter and sugar until fluffy
3. Beat in eggs one at a time, then stir in vanilla
4. Combine flour, baking powder and salt; stir into the creamed mixture`;
        const result = parseTextToList(text);
        expect(result).toEqual([
            'Preheat oven to 350°F and grease a 9x13 pan',
            'In a large bowl, cream together butter and sugar until fluffy',
            'Beat in eggs one at a time, then stir in vanilla',
            'Combine flour, baking powder and salt; stir into the creamed mixture',
        ]);
    });
});

describe('parseIngredientsText', () => {
    it('splits comma-separated ingredients in a single string', () => {
        const text =
            'Dorada, sal y pimienta blanca, aceite, cebolla, ajo limón y manteqilla.Pimiento verde.';
        const result = parseIngredientsText(text);
        expect(result).toEqual([
            'Dorada',
            'sal y pimienta blanca',
            'aceite',
            'cebolla',
            'ajo limón y manteqilla',
            'Pimiento verde',
        ]);
    });

    it('splits Catalan ingredients list with optional note', () => {
        const text =
            'Rap, sal, pebre, ou, llet, farina, bicarbonat, julivert opcional, oli.';
        const result = parseIngredientsText(text);
        expect(result).toEqual([
            'Rap',
            'sal',
            'pebre',
            'ou',
            'llet',
            'farina',
            'bicarbonat',
            'julivert opcional',
            'oli',
        ]);
    });

    it('splits quantities and items properly', () => {
        const text =
            '2 patatas, 1 cebolla, sobrassada, 1 huevo, pan rallado, sal, pimienta, picant y aceite.';
        const result = parseIngredientsText(text);
        expect(result).toEqual([
            '2 patatas',
            '1 cebolla',
            'sobrassada',
            '1 huevo',
            'pan rallado',
            'sal',
            'pimienta',
            'picant y aceite',
        ]);
    });

    it('splits measurements properly', () => {
        const text =
            '1 huevo, 150 ml de leche, 150 gramos harina, 300grs de bacalao, 3 ajos, perejil, aceite para freir.';
        const result = parseIngredientsText(text);
        expect(result).toEqual([
            '1 huevo',
            '150 ml de leche',
            '150 gramos harina',
            '300grs de bacalao',
            '3 ajos',
            'perejil',
            'aceite para freir',
        ]);
    });

    it('does not split decimal quantities with commas', () => {
        const text = '1,5 kg de harina, 0,5 l de leche, 2 patatas';
        const result = parseIngredientsText(text);
        expect(result).toEqual([
            '1,5 kg de harina',
            '0,5 l de leche',
            '2 patatas',
        ]);
    });

    it('parses multiline ingredients without splitting internal commas', () => {
        const text = `2 cups flour
1/2 cup butter, softened
3 eggs`;
        const result = parseIngredientsText(text);
        expect(result).toEqual([
            '2 cups flour',
            '1/2 cup butter, softened',
            '3 eggs',
        ]);
    });
});

describe('parseStepsText', () => {
    it('splits single-paragraph steps with periods and inline text', () => {
        const text =
            'Limpiar la dorada, poner la en bandeja de horno con Mèdia cebolla, ajo. Untar la dorada con aceite sal y pimienta y en el lomo hacer incisions y poner rodajas de limón. Poner el horno a 180 grados unos 35mn.a Mèdia cocció poner encima de la dorada una nuez de manteqilla.';
        const result = parseStepsText(text);
        expect(result).toEqual([
            'Limpiar la dorada, poner la en bandeja de horno con Mèdia cebolla, ajo',
            'Untar la dorada con aceite sal y pimienta y en el lomo hacer incisions y poner rodajas de limón',
            'Poner el horno a 180 grados unos 35mn',
            'a Mèdia cocció poner encima de la dorada una nuez de manteqilla',
        ]);
    });

    it('splits short sentence instructions', () => {
        const text =
            'Fer fumet amb rap. Desmicolat. Fer massa bunyols. Barrejar tot i reposar. Oli per fregir els bunyols';
        const result = parseStepsText(text);
        expect(result).toEqual([
            'Fer fumet amb rap',
            'Desmicolat',
            'Fer massa bunyols',
            'Barrejar tot i reposar',
            'Oli per fregir els bunyols',
        ]);
    });

    it('splits multi-sentence recipe steps paragraph', () => {
        const text =
            'Hervir patatas y hacer un puré compact, freir la cebolla y me clar con sal y pimienta y picant como tabasco. Formar bolas y hacer un aguero para poner la sobrassada en el centro. Tapar el aguero formando una bola. Empanar con huevo y pan rallado. Yo lo paso dos veces para que quede mas crujiente. Freir.';
        const result = parseStepsText(text);
        expect(result).toEqual([
            'Hervir patatas y hacer un puré compact, freir la cebolla y me clar con sal y pimienta y picant como tabasco',
            'Formar bolas y hacer un aguero para poner la sobrassada en el centro',
            'Tapar el aguero formando una bola',
            'Empanar con huevo y pan rallado',
            'Yo lo paso dos veces para que quede mas crujiente',
            'Freir',
        ]);
    });

    it('splits inline numbered steps on a single line', () => {
        const text =
            '1. First do this 2. Then do that 3. Finally finish with this.';
        const result = parseStepsText(text);
        expect(result).toEqual([
            'First do this',
            'Then do that',
            'Finally finish with this',
        ]);
    });

    it('parses multiline steps normally', () => {
        const text = `1. Step one.
2. Step two.
3. Step three.`;
        const result = parseStepsText(text);
        expect(result).toEqual(['Step one', 'Step two', 'Step three']);
    });
});
