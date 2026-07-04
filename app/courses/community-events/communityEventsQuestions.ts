import { Question } from '@/app/courses/contest-manager/contestManagerQuestions';

export const communityEventsQuestions: Question[] = [
    {
        id: 'ce1',
        question: {
            en: 'What is the main purpose of the "Challenge of the Week" on Jorbites?',
            es: '¿Cuál es el propósito principal del "Reto de la Semana" en Jorbites?',
            ca: 'Quin és el propòsit principal del "Repte de la Setmana" a Jorbites?',
        },
        options: {
            en: [
                'To encourage cooking around a specific theme or ingredient',
                'To delete inactive profiles automatically',
                'To reward chefs with cash prizes directly',
                'To test website server speed dynamically',
            ],
            es: [
                'Fomentar la cocina en torno a un tema o ingrediente específico',
                'Eliminar perfiles inactivos automáticamente',
                'Recompensar a los chefs con premios en efectivo directamente',
                'Probar la velocidad del servidor del sitio web dinámicamente',
            ],
            ca: [
                "Fomentar la cuina entorn d'un tema o ingredient específic",
                'Eliminar perfils inactius automàticament',
                'Recompensar els xefs amb premis en efectiu directament',
                'Provar la velocitat del servidor del lloc web dinàmicament',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'ce2',
        question: {
            en: 'Where can you find and view all active and upcoming Jorbites events in a calendar interface?',
            es: '¿Dónde puedes encontrar y ver todos los eventos activos y próximos de Jorbites en una interfaz de calendario?',
            ca: 'On pots trobar i veure tots els esdeveniments actius i propers de Jorbites en una interfície de calendari?',
        },
        options: {
            en: [
                'Only inside promotional emails',
                'In the Event Calendar section on the Events page',
                'On your personal profile configuration screen',
                'In your custom private recipe lists',
            ],
            es: [
                'Solo dentro de correos electrónicos promocionales',
                'En la sección Calendario de Eventos en la página de Eventos',
                'En la pantalla de configuración de tu perfil personal',
                'En tus listas de recetas privadas personalizadas',
            ],
            ca: [
                'Només dins de correus electrònics promocionals',
                "A la secció Calendari d'Esdeveniments a la pàgina d'Esdeveniments",
                'A la pantalla de configuració del teu perfil personal',
                'En les teves llistes de receptes privades personalitzades',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'ce3',
        question: {
            en: 'How is the winner of a Jorbites cooking contest typically determined?',
            es: '¿Cómo se determina típicamente el ganador de un concurso de cocina de Jorbites?',
            ca: "Com es determina típicamente el guanyador d'un concurs de cuina de Jorbites?",
        },
        options: {
            en: [
                'Decided solely by Jorbites administrators',
                'Based on whoever uploads their recipe first',
                'By public community voting using integrated forms',
                'By a random digital lottery draw',
            ],
            es: [
                'Decidido únicamente por los administradores de Jorbites',
                'Basado en quien suba su receta primero',
                'Por votación pública de la comunidad mediante formularios integrados',
                'Por un sorteo de lotería digital aleatorio',
            ],
            ca: [
                'Decidit únicament pels administradors de Jorbites',
                'Basat en qui pugi la seva recepta primer',
                'Per votació pública de la comunitat mitjançant formularis integrats',
                'Per un sorteig de loteria digital aleatori',
            ],
        },
        correctIndex: 2,
    },
    {
        id: 'ce4',
        question: {
            en: 'How can you check the end date and remaining time for a Weekly Challenge?',
            es: '¿Cómo puedes verificar la fecha de finalización y el tiempo restante para un Reto de la Semana?',
            ca: 'Com pots verificar la data de finalització i el temps restant per a un Repte de la Setmana?',
        },
        options: {
            en: [
                'Look at the "Ends" date displayed on the Weekly Challenge section card',
                'There is no end date, challenges run forever',
                'By checking your profile settings screen',
                'By sending a direct request to administrators',
            ],
            es: [
                'Mirar la fecha de finalización indicada en la tarjeta de la sección Reto de la Semana',
                'No hay fecha de finalización, los retos duran para siempre',
                'Comprobando la pantalla de configuración de tu perfil',
                'Enviando una solicitud directa a los administradores',
            ],
            ca: [
                'Mirar la data de finalització indicada a la targeta de la secció Repte de la Setmana',
                'No hi ha data de finalització, els reptes duren per sempre',
                'Comprovant la pantalla de configuració del teu perfil',
                'Enviant una sol·licitud directa als administradors',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'ce5',
        question: {
            en: 'Which types of community events are featured on the Jorbites platform?',
            es: '¿Qué tipos de eventos comunitarios se presentan en la plataforma Jorbites?',
            ca: "Quins tipus d'esdeveniments comunitaris es presenten a la plataforma Jorbites?",
        },
        options: {
            en: [
                'Restaurant dining guides and food delivery promotions',
                'Cooking contests, weekly challenges, and workshops',
                'Only individual cooking classes for kids',
                'Recipe database backups and code updates',
            ],
            es: [
                'Guías de restaurantes y promociones de entrega de comida',
                'Concursos de cocina, retos semanales y talleres',
                'Solo clases de cocina individuales para niños',
                'Copias de seguridad de recetas y actualizaciones de código',
            ],
            ca: [
                'Guies de restaurants i promocions de lliurament de menjar',
                'Concursos de cuina, reptes setmanals i tallers',
                'Només classes de cuina individuals per a nens',
                'Còpies de seguretat de receptes i actualitzacions de codi',
            ],
        },
        correctIndex: 1,
    },
];
