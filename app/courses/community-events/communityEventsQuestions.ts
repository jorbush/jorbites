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
                'Cooking contests, weekly challenges, and temporary/recurrent events',
                'Only individual cooking classes for kids',
                'Recipe database backups and code updates',
            ],
            es: [
                'Guías de restaurantes y promociones de entrega de comida',
                'Concursos de cocina, retos semanales y eventos temporales o recurrentes',
                'Solo clases de cocina individuales para niños',
                'Copias de seguridad de recetas y actualizaciones de código',
            ],
            ca: [
                'Guies de restaurants i promocions de lliurament de menjar',
                'Concursos de cuina, reptes setmanals i esdeveniments temporals o recurrents',
                'Només classes de cuina individuals per a nens',
                'Còpies de seguretat de receptes i actualitzacions de codi',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'ce6',
        question: {
            en: 'When does Jorbites send notifications to users regarding community events?',
            es: '¿Cuándo envía Jorbites notificaciones a los usuarios con respecto a los eventos comunitarios?',
            ca: 'Quan envia Jorbites notificacions als usuaris pel que fa als esdeveniments comunitaris?',
        },
        options: {
            en: [
                'Every single hour while any event is actively running',
                'On event start, with 3 days left, on Mondays for challenges, and during Recipe of X voting',
                'Only once a year via the global email newsletter',
                'Only when a user deletes a recipe or changes their name',
            ],
            es: [
                'Cada hora mientras un evento esté activo',
                'Al inicio del evento, cuando quedan 3 días, los lunes para retos y durante la votación de Receta de X',
                'Solo una vez al año mediante el boletín global de correo',
                'Solo cuando un usuario elimina una receta o cambia su nombre',
            ],
            ca: [
                'Cada hora mentre un esdeveniment estigui actiu',
                "A l'inici de l'esdeveniment, quan queden 3 dies, els dilluns per a reptes i durant la votació de Recepta de X",
                "Només una vegada a l'any mitjançant el butlletí global de correu",
                'Només quan un usuari elimina una recepta o canvia el seu nom',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'ce7',
        question: {
            en: 'What is the primary function of the Jorbites Event Calendar?',
            es: '¿Cuál es la función principal del Calendario de Eventos de Jorbites?',
            ca: "Quina és la funció principal del Calendari d'Esdeveniments de Jorbites?",
        },
        options: {
            en: [
                'To reserve tables and book reservations at local partner restaurants',
                'To visualize and plan participation in active, past, and upcoming events',
                'To schedule grocery shopping lists and choose delivery windows',
                'To display the private calendar birthdays of other community members',
            ],
            es: [
                'Reservar mesas en restaurantes asociados locales',
                'Visualizar y planificar la participación en eventos activos, pasados y futuros',
                'Programar listas de compras de alimentos y elegir ventanas de entrega',
                'Mostrar los cumpleaños privados de otros miembros de la comunidad',
            ],
            ca: [
                'Reservar taules en restaurants associats locals',
                'Visualitzar i planificar la participació en esdeveniments actius, passats i futurs',
                "Programar llistes de compres d'aliments i triar finestres de lliurament",
                "Mostrar els aniversaris privats d'altres membres de la comunitat",
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'ce8',
        question: {
            en: 'Which of the following is a key benefit of participating in Jorbites community events?',
            es: '¿Cuál de los siguientes es un beneficio clave de participar en los eventos comunitarios de Jorbites?',
            ca: 'Quin dels següents és un benefici clau de participar en els esdeveniments comunitaris de Jorbites?',
        },
        options: {
            en: [
                'Earning profile badges and discovering new recipes, cuisines, and cooking ingredients',
                'Getting automatic free home delivery on all restaurant orders',
                'Learning how to use third-party AI writing assistants to write descriptions',
                'Receiving physical kitchen products shipped directly to your house',
            ],
            es: [
                'Obtener insignias de perfil y descubrir nuevas recetas, cocinas e ingredientes culinarios',
                'Obtener entrega a domicilio gratuita automática en todos los pedidos de restaurantes',
                'Aprender a usar asistentes de escritura de IA de terceros para escribir descripciones',
                'Recibir productos físicos de cocina enviados directamente a tu casa',
            ],
            ca: [
                'Obtenir insígnies de perfil i descobrir noves receptes, cuines i ingredients culinaris',
                'Obtenir lliurament a domicili gratuït automàtic en tots els comandes de restaurants',
                "Aprendre a usar assistents d'escriptura d'IA de tercers per escriure descripcions",
                'Rebre productes físics de cuina enviats directament a casa teva',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'ce9',
        question: {
            en: 'What is used as a tie-breaker if a Recipe of X voting session ends in a tie?',
            es: '¿Qué se utiliza como desempate si una sesión de votación de Receta de X termina en empate?',
            ca: "Què s'utilitza com a desempat si una sessió de votació de Recepta de X acaba en empat?",
        },
        options: {
            en: [
                'The total number of likes on the competing recipes',
                'A random digital coin toss by the system',
                'The oldest user account registration date',
                'Whoever uploaded their recipe last',
            ],
            es: [
                'El número total de likes de las recetas en competencia',
                'Un lanzamiento de moneda digital aleatorio por el sistema',
                'La fecha de registro de cuenta de usuario más antigua',
                'Quien haya subido su receta al último',
            ],
            ca: [
                'El nombre total de likes de les receptes en competència',
                'Un llançament de moneda digital aleatori pel sistema',
                "La data de registre de compte d'usuari més antiga",
                "Qui hagi pujat la seva recepta l'últim",
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'ce10',
        question: {
            en: 'How should you contact Jorbites administrators if a Weekly Challenge badge is not automatically assigned?',
            es: '¿Cómo debes contactar a los administradores de Jorbites si una insignia del Reto de la Semana no se asigna automáticamente?',
            ca: "Com has de contactar amb els administradors de Jorbites si una insígnia del Repte de la Setmana no s'assigna automàticament?",
        },
        options: {
            en: [
                'By leaving a comment on a random recipe',
                'Via Instagram Direct Message (DM) or official email',
                'By creating a new recipe named "Help"',
                'There is no way to contact administrators',
            ],
            es: [
                'Dejando un comentario en una receta aleatoria',
                'A través de Mensaje Directo (DM) de Instagram o correo electrónico oficial',
                'Creando una nueva receta llamada "Ayuda"',
                'No hay forma de contactar a los administradores',
            ],
            ca: [
                'Deixant un comentari en una recepta aleatòria',
                "A través de Missatge Directe (DM) d'Instagram o correu electrònic oficial",
                'Creant una nova recepta anomenada "Ajuda"',
                'No hi ha manera de contactar amb els administradors',
            ],
        },
        correctIndex: 1,
    },
];
