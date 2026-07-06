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
                'Display name, language, visual theme (light/dark), and global email notifications toggle',
                'Only your email address and profile picture',
                'Your recipe cooking timer duration sounds',
                'The default search filters for finding workshops',
            ],
            es: [
                'Nombre de pantalla, idioma, tema visual (claro/oscuro) e interruptor global de notificaciones por correo',
                'Solo tu dirección de correo electrónico y foto de perfil',
                'Los sonidos del temporizador de cocina de tus recetas',
                'Los filtros de búsqueda predeterminados para encontrar talleres',
            ],
            ca: [
                'Nom de pantalla, idioma, tema visual (clar/fosc) i interruptor global de notificacions per correu',
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
                'Light Mode and Dark Mode',
                'Light Mode, Dark Mode, and System Default',
                'High Contrast Green and Neon Yellow only',
                'Custom themes from uploadable images',
            ],
            es: [
                'Modo claro y Modo oscuro',
                'Modo claro, Modo oscuro y Predeterminado del sistema',
                'Solo Verde de alto contraste y Amarillo neón',
                'Temas personalizados a partir de imágenes cargables',
            ],
            ca: [
                'Mode clar i Mode fosc',
                'Mode clar, Mode fosc i Predeterminat del sistema',
                "Només Verd d'alt contrast i Groc neó",
                "Temes personalitzats a partir d'imatges carregables",
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q5',
        question: {
            en: 'How do email notification controls work in your account settings?',
            es: '¿Cómo funcionan los controles de notificación por correo en los ajustes de tu cuenta?',
            ca: 'Com funcionen els controls de notificació per correu als ajusts del teu compte?',
        },
        options: {
            en: [
                'A single global toggle switch to enable or disable all Jorbites email notifications at once',
                'Granular checkboxes to select individual notifications for workshops, comments, and digests',
                'Daily reminders to log back into the app',
                'You cannot configure notifications, they are all enabled by default',
            ],
            es: [
                'Un único interruptor global para activar o desactivar todas las notificaciones por correo de Jorbites a la vez',
                'Casillas de verificación detalladas para seleccionar notificaciones individuales para talleres, comentarios y resúmenes',
                'Recordatorios diarios para volver a iniciar sesión en la aplicación',
                'No puedes configurar las notificaciones, están todas activadas por defecto',
            ],
            ca: [
                'Un únic interruptor global per activar o desactivar totes les notificacions per correu de Jorbites alhora',
                'Caselles de verificació detallades per seleccionar notificacions individuals per a tallers, comentaris i resums',
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
