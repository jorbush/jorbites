import { Question } from '@/app/courses/contest-manager/contestManagerQuestions';

export const recipeListsQuestions: Question[] = [
    {
        question: {
            en: 'What is the default list created automatically for every user in Jorbites?',
            es: '¿Cuál es la lista predeterminada que se crea automáticamente para cada usuario en Jorbites?',
            ca: 'Quina és la llista predeterminada que es crea automàticament per a cada usuari a Jorbites?',
        },
        options: {
            en: ['favorites', 'to cook later', 'my recipes', 'to try later'],
            es: ['favorites', 'to cook later', 'my recipes', 'to try later'],
            ca: ['favorites', 'to cook later', 'my recipes', 'to try later'],
        },
        correctIndex: 1, // 'to cook later'
    },
    {
        question: {
            en: 'How can you add a recipe to one of your lists?',
            es: '¿Cómo puedes añadir una receta a una de tus listas?',
            ca: 'Com pots afegir una recepta a una de les teves llistes?',
        },
        options: {
            en: [
                'Click the list plus icon button on any recipe card or page',
                'Copy and paste the recipe URL into your profile bio',
                'Email the Jorbites admin support team',
                'You can only add your own recipes to lists',
            ],
            es: [
                'Hacer clic en el botón con el icono de lista más (+) en cualquier receta',
                'Copiar y pegar la URL de la receta en tu biografía de perfil',
                'Enviar un correo electrónico al equipo de soporte de Jorbites',
                'Solo puedes añadir tus propias recetas a las listas',
            ],
            ca: [
                'Fer clic al botó amb la icona de llista més (+) en qualsevol recepta',
                'Copiar i enganxar la URL de la recepta a la biografia del teu perfil',
                "Enviar un correu electrònic a l'equip de suport de Jorbites",
                'Només pots afegir les teves pròpies receptes a les llistes',
            ],
        },
        correctIndex: 0,
    },
    {
        question: {
            en: 'Who can view a list marked as "Private"?',
            es: '¿Quién puede ver una lista marcada como "Privada"?',
            ca: 'Qui pot veure una llista marcada com a "Privada"?',
        },
        options: {
            en: [
                'Everyone in the community',
                'Only Jorbites administrators',
                'Only the creator of the list',
                'Only users who follow you',
            ],
            es: [
                'Cualquier persona de la comunidad',
                'Solo los administradores de Jorbites',
                'Solo el creador de la lista',
                'Solo los usuarios que te siguen',
            ],
            ca: [
                'Qualsevol persona de la comunitat',
                'Només els administradors de Jorbites',
                'Només el creador de la llista',
                'Només els usuaris que et segueixen',
            ],
        },
        correctIndex: 2,
    },
    {
        question: {
            en: 'How can you share a recipe list with the community?',
            es: '¿Cómo puedes compartir una lista de recetas con la comunidad?',
            ca: 'Com pots compartir una llista de receptes amb la comunitat?',
        },
        options: {
            en: [
                'Set the list privacy to Public, go to the list page, and share the URL',
                'Private lists are automatically posted to the events feed',
                'Request administrators to manually approve your list sharing',
                'Lists are private by design and cannot be shared',
            ],
            es: [
                'Establecer la privacidad como Pública, ir a la página de la lista y compartir la URL',
                'Las listas privadas se publican automáticamente en el feed de eventos',
                'Solicitar que los administradores aprueben manualmente el uso compartido',
                'Las listas son privadas por diseño y no se pueden compartir',
            ],
            ca: [
                'Establir la privadesa com a Pública, anar a la pàgina de la llista i compartir la URL',
                "Les llistes privades es publiquen automàticament al feed d'esdeveniments",
                "Sol·licitar que els administradors aprovin manualment l'ús compartit",
                'Les llistes són privades per disseny i no es poden compartir',
            ],
        },
        correctIndex: 0,
    },
    {
        question: {
            en: 'Can a recipe belong to multiple lists simultaneously?',
            es: '¿Puede una receta pertenecer a múltiples listas simultáneamente?',
            ca: 'Pot una recepta pertànyer a múltiples llistes simultàniament?',
        },
        options: {
            en: [
                'No, a recipe can only belong to one list at a time',
                'Yes, you can toggle the recipe in as many lists as you like',
                'Yes, but only if all of those lists are set to public',
                'Only up to a maximum of two lists',
            ],
            es: [
                'No, una receta solo puede pertenecer a una lista a la vez',
                'Sí, puedes activar la receta en tantas listas como quieras',
                'Sí, pero solo si todas esas listas están configuradas como públicas',
                'Solo hasta un máximo de dos listas',
            ],
            ca: [
                'No, una recepta només pot pertànyer a una llista alhora',
                'Sí, pots activar la recepta en tantes llistes com vulguis',
                'Sí, però només si totes aquestes llistes estan configurades com a públiques',
                'Només fins a un màxim de dues llistes',
            ],
        },
        correctIndex: 1,
    },
];
