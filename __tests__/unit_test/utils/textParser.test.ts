import { describe, it, expect } from 'vitest';
import { parseTextToList } from '@/app/utils/textParser';

describe('parseTextToList', () => {
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
