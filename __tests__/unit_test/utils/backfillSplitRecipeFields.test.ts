import { describe, it, expect } from 'vitest';
import { parseIngredientsText, parseStepsText } from '@/app/utils/textParser';

describe('backfill-split-recipe-fields parsing logic', () => {
    it('correctly splits Spanish and Catalan recipes from single-field ingredients', () => {
        const input1 =
            'Dorada, sal y pimienta blanca, aceite, cebolla, ajo limón y manteqilla.Pimiento verde.';
        expect(parseIngredientsText(input1)).toEqual([
            'Dorada',
            'sal y pimienta blanca',
            'aceite',
            'cebolla',
            'ajo limón y manteqilla',
            'Pimiento verde',
        ]);

        const input2 =
            'Rap, sal, pebre, ou, llet, farina, bicarbonat, julivert opcional, oli.';
        expect(parseIngredientsText(input2)).toEqual([
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

        const input3 =
            '2 patatas, 1 cebolla, sobrassada, 1 huevo, pan rallado, sal, pimienta, picant y aceite.';
        expect(parseIngredientsText(input3)).toEqual([
            '2 patatas',
            '1 cebolla',
            'sobrassada',
            '1 huevo',
            'pan rallado',
            'sal',
            'pimienta',
            'picant y aceite',
        ]);

        const input4 =
            '1 huevo, 150 ml de leche, 150 gramos harina, 300grs de bacalao, 3 ajos, perejil, aceite para freir.';
        expect(parseIngredientsText(input4)).toEqual([
            '1 huevo',
            '150 ml de leche',
            '150 gramos harina',
            '300grs de bacalao',
            '3 ajos',
            'perejil',
            'aceite para freir',
        ]);
    });

    it('correctly splits single-paragraph steps into individual steps', () => {
        const steps1 =
            'Limpiar la dorada, poner la en bandeja de horno con Mèdia cebolla, ajo. Untar la dorada con aceite sal y pimienta y en el lomo hacer incisions y poner rodajas de limón. Poner el horno a 180 grados unos 35mn.a Mèdia cocció poner encima de la dorada una nuez de manteqilla.';
        expect(parseStepsText(steps1)).toEqual([
            'Limpiar la dorada, poner la en bandeja de horno con Mèdia cebolla, ajo',
            'Untar la dorada con aceite sal y pimienta y en el lomo hacer incisions y poner rodajas de limón',
            'Poner el horno a 180 grados unos 35mn',
            'a Mèdia cocció poner encima de la dorada una nuez de manteqilla',
        ]);

        const steps2 =
            'Fer fumet amb rap. Desmicolat. Fer massa bunyols. Barrejar tot i reposar. Oli per fregir els bunyols';
        expect(parseStepsText(steps2)).toEqual([
            'Fer fumet amb rap',
            'Desmicolat',
            'Fer massa bunyols',
            'Barrejar tot i reposar',
            'Oli per fregir els bunyols',
        ]);

        const steps3 =
            'Hervir patatas y hacer un puré compact, freir la cebolla y me clar con sal y pimienta y picant como tabasco. Formar bolas y hacer un aguero para poner la sobrassada en el centro. Tapar el aguero formando una bola. Empanar con huevo y pan rallado. Yo lo paso dos veces para que quede mas crujiente. Freir.';
        expect(parseStepsText(steps3)).toEqual([
            'Hervir patatas y hacer un puré compact, freir la cebolla y me clar con sal y pimienta y picant como tabasco',
            'Formar bolas y hacer un aguero para poner la sobrassada en el centro',
            'Tapar el aguero formando una bola',
            'Empanar con huevo y pan rallado',
            'Yo lo paso dos veces para que quede mas crujiente',
            'Freir',
        ]);

        const steps4 =
            'Hacer masa con 1 huevo, 150mls leche, 100grs harina. Poner en nevera. En una sarten poner los 3 trozos de bacalao';
        expect(parseStepsText(steps4)).toEqual([
            'Hacer masa con 1 huevo, 150mls leche, 100grs harina',
            'Poner en nevera',
            'En una sarten poner los 3 trozos de bacalao',
        ]);
    });
});
