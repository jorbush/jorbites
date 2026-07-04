export interface Question {
    id: string;
    question: {
        en: string;
        es: string;
        ca: string;
    };
    options: {
        en: string[];
        es: string[];
        ca: string[];
    };
    correctIndex: number;
}

export const contestManagerQuestions: Question[] = [
    {
        id: 'q1',
        question: {
            en: 'What is the minimum number of total recipes expected to be posted by participants during the contest to get approved?',
            es: '¿Cuál es el número mínimo de recetas totales que los participantes deben publicar durante el concurso para obtener la aprobación?',
            ca: "Quin és el nombre mínim de receptes totals que els participants han de publicar durant el concurs per obtenir l'aprovació?",
        },
        options: {
            en: [
                'At least 1 recipe in total',
                'At least 3 recipes in total',
                'At least 5 recipes in total',
                'At least 10 recipes in total',
            ],
            es: [
                'Al menos 1 receta en total',
                'Al menos 3 recetas en total',
                'Al menos 5 recetas en total',
                'Al menos 10 recetas en total',
            ],
            ca: [
                'Almenys 1 recepta en total',
                'Almenys 3 receptes en total',
                'Almenys 5 receptes en total',
                'Almenys 10 receptes en total',
            ],
        },
        correctIndex: 2,
    },
    {
        id: 'q2',
        question: {
            en: 'Which email address should you contact to request contest approval or get voting results?',
            es: '¿A qué dirección de correo electrónico debes contactar para solicitar la aprobación del concurso o ver los resultados de la votación?',
            ca: "A quina adreça de correu electrònic has de contactar per sol·licitar l'aprovació del concurs o veure els resultats de la votació?",
        },
        options: {
            en: [
                'admin@jorbites.com',
                'jbonetv5@gmail.com',
                'hello@jorbites.com',
                'support@jorbites.com',
            ],
            es: [
                'admin@jorbites.com',
                'jbonetv5@gmail.com',
                'hello@jorbites.com',
                'support@jorbites.com',
            ],
            ca: [
                'admin@jorbites.com',
                'jbonetv5@gmail.com',
                'hello@jorbites.com',
                'support@jorbites.com',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q3',
        question: {
            en: 'What is the correct order of the contest workflow?',
            es: '¿Cuál es el orden correcto del flujo de trabajo de un concurso?',
            ca: "Quin és l'ordre correcte del flux de treball d'un concurs?",
        },
        options: {
            en: [
                'Announce → Get Approved → Contest Day → Vote',
                'Get Approved → Announce → Contest Day → Vote',
                'Contest Day → Post Recipes → Get Approved → Vote',
                'Vote → Get Approved → Announce → Contest Day',
            ],
            es: [
                'Anunciar → Ser Aprobado → Día del Concurso → Votar',
                'Ser Aprobado → Anunciar → Día del Concurso → Votar',
                'Día del Concurso → Publicar Recetas → Ser Aprobado → Votar',
                'Votar → Ser Aprobado → Anunciar → Día del Concurso',
            ],
            ca: [
                'Anunciar → Ser Aprovat → Dia del Concurs → Votar',
                'Ser Aprovat → Anunciar → Dia del Concurs → Votar',
                'Dia del Concurs → Publicar Receptes → Ser Aprovat → Votar',
                'Votar → Ser Aprovat → Anunciar → Dia del Concurs',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q4',
        question: {
            en: 'Where can you extract the participant user ID for the Google Form voting link?',
            es: '¿De dónde puedes extraer el ID de usuario del participante para el enlace de votación de Google Forms?',
            ca: "D'on pots extreure l'ID d'usuari del participant per a l'enllaç de votació de Google Forms?",
        },
        options: {
            en: [
                'From the profile page URL',
                'From the home page URL',
                'From the settings modal',
                'From the footer menu',
            ],
            es: [
                'De la URL de la página de perfil',
                'De la URL de la página de inicio',
                'Del modal de ajustes',
                'Del menú del pie de página',
            ],
            ca: [
                'De la URL de la pàgina de perfil',
                "De la URL de la pàgina d'inici",
                "Del modal d'ajustaments",
                'Del menú del peu de pàgina',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q5',
        question: {
            en: 'Where can you get the recipe URL for the Google Form voting link?',
            es: '¿De dónde puedes obtener la URL de la receta para el enlace de votación de Google Forms?',
            ca: "D'on pots obtenir la URL de la recepta per a l'enllaç de votació de Google Forms?",
        },
        options: {
            en: [
                'From the profile picture',
                'From the share button on the recipe page',
                'From the search bar placeholder',
                'From the website logo',
            ],
            es: [
                'De la foto de perfil',
                'Del botón de compartir en la página de la receta',
                'Del marcador de posición de la barra de búsqueda',
                'Del logotipo del sitio web',
            ],
            ca: [
                'De la foto de perfil',
                'Del botó de compartir a la pàgina de la recepta',
                'Del marcador de posició de la barra de cerca',
                'Del logotip del lloc web',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q6',
        question: {
            en: "According to the AI badge prompt template, what is Jorbites' logo?",
            es: 'Según la plantilla de prompt de la insignia de IA, ¿cuál es el logotipo de Jorbites?',
            ca: "Segons la plantilla de prompt de la insígnia d'IA, quin és el logotip de Jorbites?",
        },
        options: {
            en: ['An apple', 'A tomato', 'An avocado', 'A banana'],
            es: ['Una manzana', 'Un tomate', 'Un aguacate', 'Un plátano'],
            ca: ['Una poma', 'Un tomàquet', 'Un alvocat', 'Una banana'],
        },
        correctIndex: 2,
    },
    {
        id: 'q7',
        question: {
            en: 'Which colors should be avoided in the AI badge generation prompt?',
            es: '¿Qué colores deben evitarse en el prompt de generación de insignias por IA?',
            ca: "Quins colors s'han d'evitar en el prompt de generació d'insígnies per IA?",
        },
        options: {
            en: [
                'Beige colors',
                'Green colors',
                'Bright red colors',
                'Dark blue colors',
            ],
            es: [
                'Colores beige',
                'Colores verdes',
                'Colores rojo brillante',
                'Colores azul oscuro',
            ],
            ca: [
                'Colors beix',
                'Colors verds',
                'Colors vermell brillant',
                'Colors blau fosc',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q8',
        question: {
            en: 'What aspect ratio is requested for the AI-generated contest badge?',
            es: '¿Qué relación de aspecto se solicita para la insignia del concurso generada por IA?',
            ca: "Quina relació d'aspecte es sol·licita per a la insígnia del concurs generada per IA?",
        },
        options: {
            en: ['16:9', '4:3', '1:1', '2:3'],
            es: ['16:9', '4:3', '1:1', '2:3'],
            ca: ['16:9', '4:3', '1:1', '2:3'],
        },
        correctIndex: 2,
    },
    {
        id: 'q9',
        question: {
            en: 'What style is requested for the AI-generated contest badge?',
            es: '¿Qué estilo se solicita para la insignia del concurso generada por IA?',
            ca: 'Quin estil es sol·licita per a la insígnia del concurs generada per IA?',
        },
        options: {
            en: [
                'Hyper-realistic 3D render',
                'Vintage minimalist cartoon badge',
                'Modern abstract watercolor painting',
                'Neon futuristic cyberpunk badge',
            ],
            es: [
                'Renderizado 3D hiperrealista',
                'Insignia de dibujo animado minimalista vintage',
                'Pintura de acuarela abstracta moderna',
                'Insignia cyberpunk futurista de neón',
            ],
            ca: [
                'Renderitzat 3D hiperrealista',
                'Insígnia de dibuix animat minimalista vintage',
                "Pintura d'aquarel·la abstracta moderna",
                'Insígnia cyberpunk futurista de neó',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q10',
        question: {
            en: 'What do participants do once everyone has finished eating during the contest event?',
            es: '¿Qué hacen los participantes una vez que todos han terminado de comer durante el evento del concurso?',
            ca: "Què fan els participants una vegada que tothom ha acabat de menjar durant l'esdeveniment del concurs?",
        },
        options: {
            en: [
                'They leave immediately',
                'They vote for the best recipe',
                'They wash the dishes',
                'They start cooking a second dish',
            ],
            es: [
                'Se van de inmediato',
                'Votan por la mejor receta',
                'Lavan los platos',
                'Comienzan a cocinar un segundo plato',
            ],
            ca: [
                "Se'n van immediatament",
                'Voten per la millor recepta',
                'Rentem els plats',
                'Comencen a cuinar un segon plat',
            ],
        },
        correctIndex: 1,
    },
];
