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

export const questsQuestions: Question[] = [
    {
        id: 'q1',
        question: {
            en: 'Who is allowed to open a recipe quest (request a recipe) on Jorbites?',
            es: '¿Quién tiene permitido abrir una búsqueda de receta (solicitar una receta) en Jorbites?',
            ca: 'Qui té permès obrir una cerca de recepta (sol·licitar una recepta) a Jorbites?',
        },
        options: {
            en: [
                'Only users with an Admin role',
                'Only chefs with at least 10 recipes',
                'Any registered Jorbites user',
                'Only users with a premium subscription',
            ],
            es: [
                'Solo los usuarios con rol de Administrador',
                'Solo los chefs con al menos 10 recetas',
                'Cualquier usuario registrado de Jorbites',
                'Solo los usuarios con una suscripción premium',
            ],
            ca: [
                "Només els usuaris amb rol d'Administrador",
                'Només els xefs amb almenys 10 receptes',
                'Qualsevol usuari registrat de Jorbites',
                'Només els usuaris amb una subscripció premium',
            ],
        },
        correctIndex: 2,
    },
    {
        id: 'q2',
        question: {
            en: 'How does a chef suggest their recipe to fulfill an open quest request?',
            es: '¿Cómo sugiere un chef su receta para cumplir con una solicitud de búsqueda abierta?',
            ca: 'Com suggereix un xef la seva recepta per complir amb una sol·licitud de cerca oberta?',
        },
        options: {
            en: [
                'By sending the recipe link via email to support',
                'By clicking "Link Recipe" on the quest page and selecting a published recipe',
                'By typing the recipe name in the comment section',
                'By posting the recipe on their personal profile page only',
            ],
            es: [
                'Enviando el enlace de la receta por correo a soporte',
                'Haciendo clic en "Vincular Receta" en la página de la búsqueda y seleccionando una receta publicada',
                'Escribiendo el nombre de la receta en la sección de comentarios',
                'Publicando la receta únicamente en su página de perfil personal',
            ],
            ca: [
                "Enviant l'enllaç de la recepta per correu a suport",
                'Fent clic a "Vincular Recepta" a la pàgina de la cerca i seleccionant una recepta publicada',
                'Escrivint el nom de la recepta a la secció de comentaris',
                'Publicant la recepta únicament a la seva pàgina de perfil personal',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q3',
        question: {
            en: 'What is the correct status progression of a quest from start to finish?',
            es: '¿Cuál es la progresión de estado correcta de una búsqueda de principio a fin?',
            ca: "Quina és la progressió d'estat correcta d'una cerca de principi a fi?",
        },
        options: {
            en: [
                'Completed → Open → In Progress',
                'Open → Completed → In Progress',
                'Open → In Progress → Completed',
                'In Progress → Open → Completed',
            ],
            es: [
                'Completada → Abierta → En Progreso',
                'Abierta → Completada → En Progreso',
                'Abierta → En Progreso → Completada',
                'En Progreso → Abierta → Completada',
            ],
            ca: [
                'Completada → Oberta → En Progrés',
                'Oberta → Completada → En Progrés',
                'Oberta → En Progrés → Completada',
                'En Progrés → Oberta → Completada',
            ],
        },
        correctIndex: 2,
    },
    {
        id: 'q4',
        question: {
            en: 'Who has the authority to accept a suggested recipe and mark the quest as Completed?',
            es: '¿Quién tiene la autoridad para aceptar una receta sugerida y marcar la búsqueda como Completada?',
            ca: "Qui té l'autoritat per acceptar una recepta suggerida i marcar la cerca com a Completada?",
        },
        options: {
            en: [
                'Any registered Jorbites chef',
                'The quest creator (host) who requested the recipe',
                'Only Jorbites administrator accounts',
                'The chef who uploaded the recipe solution',
            ],
            es: [
                'Cualquier chef registrado de Jorbites',
                'El creador (organizador) de la búsqueda que solicitó la receta',
                'Solo las cuentas de administrador de Jorbites',
                'El chef que subió la receta de solución',
            ],
            ca: [
                'Qualsevol xef registrat de Jorbites',
                'El creador (organitzador) de la cerca que va sol·licitar la recepta',
                "Només els comptes d'administrador de Jorbites",
                'El xef que va pujar la recepta de solució',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q5',
        question: {
            en: 'What is the main benefit of users liking a quest request on the community board?',
            es: '¿Cuál es el beneficio principal de que los usuarios den me gusta a una solicitud de búsqueda?',
            ca: "Quin és el benefici principal que els usuaris donin m'agrada a una sol·licitud de cerca?",
        },
        options: {
            en: [
                'It awards them free ingredients',
                'It automatically publishes a recipe',
                'It shows support and increases community visibility/demand for that recipe',
                'It changes the quest status to Completed',
            ],
            es: [
                'Les otorga ingredientes gratuitos',
                'Publica automáticamente una receta',
                'Muestra apoyo e incrementa la visibilidad/demanda comunitaria de esa receta',
                'Cambia el estado de la búsqueda a Completada',
            ],
            ca: [
                'Els atorga ingredients gratuïts',
                'Publica automàticament una recepta',
                "Mostra suport i incrementa la visibilitat/demanda comunitària d'aquesta recepta",
                "Canvia l'estat de la cerca a Completada",
            ],
        },
        correctIndex: 2,
    },
];
