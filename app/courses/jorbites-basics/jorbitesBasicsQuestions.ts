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

export const jorbitesBasicsQuestions: Question[] = [
    {
        id: 'q1',
        question: {
            en: 'What does liking/hearting a recipe do on Jorbites?',
            es: '¿Qué hace dar me gusta a una receta en Jorbites?',
            ca: "Què fa donar m'agrada a una recepta a Jorbites?",
        },
        options: {
            en: [
                'Saves it to your liked content and contributes to its standing in the Top Recipe Vote',
                'Instantly locks the recipe so only you can read it',
                'Forces the creator to follow your profile back',
                'Downloads a text draft copy to your device automatically',
            ],
            es: [
                'La guarda en tu contenido favorito y contribuye a su posición en la Votación de la mejor receta',
                'Bloquea instantáneamente la receta para que solo tú puedas leerla',
                'Obliga al creador a seguir tu perfil de vuelta',
                'Descarga una copia borrador de texto en tu dispositivo automáticamente',
            ],
            ca: [
                'La desa al teu contingut preferit i contribueix a la seva posició a la Votació de la millor recepta',
                'Bloqueja instantàniament la recepta perquè només tu la puguis llegir',
                'Obliga el creador a seguir el teu perfil de tornada',
                'Descarrega una còpia esborrany de text al teu dispositiu automàticament',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q2',
        question: {
            en: 'Where do pinned recipes display on your profile?',
            es: '¿Dónde se muestran las recetas fijadas en tu perfil?',
            ca: 'On es mostren les receptes fixades al teu perfil?',
        },
        options: {
            en: [
                'Promoted directly onto your profile page header cover',
                'Inside the private settings panel',
                'Only visible to administrator accounts in a list',
                'In the main navigation sidebar under favorites',
            ],
            es: [
                'Se promocionan directamente en la portada del encabezado de tu página de perfil',
                'Dentro del panel de configuración privada',
                'Solo visible para cuentas de administrador en una lista',
                'En la barra lateral de navegación principal bajo favoritos',
            ],
            ca: [
                'Es promocionen directament a la portada de la capçalera de la teva pàgina de perfil',
                'Dins del panell de configuració privada',
                "Només visible per a comptes d'administrador en una llista",
                'A la barra lateral de navegació principal sota preferits',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q3',
        question: {
            en: 'Which of the following preferences can be configured in the Jorbites Settings modal?',
            es: '¿Cuál de las siguientes preferencias se puede configurar en el modal de Configuración de Jorbites?',
            ca: 'Quina de les preferències següents es pot configurar al modal de Configuració de Jorbites?',
        },
        options: {
            en: [
                'Display name, language, visual theme, and email notification alerts',
                'Only your email address and profile picture',
                'Your recipe cooking timer duration sounds',
                'The default search filters for finding workshops',
            ],
            es: [
                'Nombre de pantalla, idioma, tema visual y alertas de notificaciones por correo',
                'Solo tu dirección de correo electrónico y foto de perfil',
                'Los sonidos del temporizador de cocina de tus recetas',
                'Los filtros de búsqueda predeterminados para encontrar talleres',
            ],
            ca: [
                'Nom de pantalla, idioma, tema visual i alertes de notificacions per correu',
                'Només la teva adreça de correu electrònic i foto de perfil',
                'Els sons del temporitzador de cuina de les teves receptes',
                'Els filtres de cerca predeterminats per trobar tallers',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q4',
        question: {
            en: 'Which visual themes are supported in the Jorbites settings panel?',
            es: '¿Qué temas visuales se admiten en el panel de configuración de Jorbites?',
            ca: "Quins temes visuals s'admeten al panell de configuració de Jorbites?",
        },
        options: {
            en: [
                'Light Mode, Dark Mode, and System Default',
                'High Contrast Green and Neon Yellow only',
                'Only Light Mode is supported',
                'Custom themes from uploadable images',
            ],
            es: [
                'Modo claro, Modo oscuro y Predeterminado del sistema',
                'Solo Verde de alto contraste y Amarillo neón',
                'Solo se admite el Modo claro',
                'Temas personalizados a partir de imágenes cargables',
            ],
            ca: [
                'Mode clar, Mode fosc i Predeterminat del sistema',
                "Només Verd d'alt contrast i Groc neó",
                "Només s'admet el Mode clar",
                "Temes personalitzats a partir d'imatges carregables",
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q5',
        question: {
            en: 'What email notification alerts can you configure in your account settings?',
            es: '¿Qué alertas de notificación por correo electrónico puedes configurar en los ajustes de tu cuenta?',
            ca: 'Quines alertes de notificació per correu electrònic pots configurar als ajusts del teu compte?',
        },
        options: {
            en: [
                'Alerts for workshops, comments replies, quest details, digests, and newsletters',
                'Only alerts when you hit a recipe limit',
                'Daily reminders to log back into the app',
                'You cannot configure notifications, they are all enabled by default',
            ],
            es: [
                'Alertas para talleres, respuestas a comentarios, detalles de misiones, resúmenes y boletines',
                'Solo alertas cuando alcanzas un límite de recetas',
                'Recordatorios diarios para volver a iniciar sesión en la aplicación',
                'No puedes configurar las notificaciones, están todas activadas por defecto',
            ],
            ca: [
                'Alertes per a tallers, respostes a comentaris, detalls de missions, resums i butlletins',
                'Només alertes quan arribes a un límit de receptes',
                "Recordatoris diaris per tornar a iniciar la sessió a l'aplicació",
                'No pots configurar les notificacions, estan totes activades per defecte',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q6',
        question: {
            en: 'How do you install Jorbites as a Progressive Web App (PWA) on iOS using Safari?',
            es: '¿Cómo se instala Jorbites como una Aplicación Web Progresiva (PWA) en iOS usando Safari?',
            ca: "Com s'instal·la Jorbites com una Aplicació Web Progressiva (PWA) a iOS fent servir Safari?",
        },
        options: {
            en: [
                'Tap the Share icon, scroll down, and select "Add to Home Screen"',
                'Download it from the Apple App Store only',
                'Copy the URL and email it to your computer settings',
                'PWAs are not supported on iOS Safari',
            ],
            es: [
                'Toca el icono Compartir, desplázate hacia abajo y selecciona "Añadir a la pantalla de inicio"',
                'Descárgala únicamente desde la App Store de Apple',
                'Copia la URL y envíala por correo a la configuración de tu computadora',
                'Las PWA no son compatibles con iOS Safari',
            ],
            ca: [
                'Toca la icona Comparteix, desplaça\'t cap avall i selecciona "Afegeix a la pantalla d\'inici"',
                "Descarrega-la únicament des de l'App Store d'Apple",
                'Copia la URL i envia-la per correu a la configuració del teu ordinador',
                'Les PWA no són compatibles amb iOS Safari',
            ],
        },
        correctIndex: 0,
    },
];
