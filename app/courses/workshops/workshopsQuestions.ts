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

export const workshopsQuestions: Question[] = [
    {
        id: 'q1',
        question: {
            en: 'Who is allowed to join a private workshop on Jorbites?',
            es: '¿Quién tiene permitido unirse a un taller privado en Jorbites?',
            ca: 'Qui té permès unir-se a un taller privat a Jorbites?',
        },
        options: {
            en: [
                'Any registered Jorbites user',
                'Only users who pay a subscription fee',
                'Only the host and explicitly whitelisted users',
                'Only users with an admin role',
            ],
            es: [
                'Cualquier usuario registrado de Jorbites',
                'Solo los usuarios que pagan una suscripción',
                'Solo el organizador y los usuarios autorizados (en lista blanca)',
                'Solo los usuarios con rol de administrador',
            ],
            ca: [
                'Qualsevol usuari registrat de Jorbites',
                'Només els usuaris que paguen una subscripció',
                "Només l'organitzador i els usuaris autoritzats (en llista blanca)",
                "Només els usuaris amb rol d'administrador",
            ],
        },
        correctIndex: 2,
    },
    {
        id: 'q2',
        question: {
            en: 'What happens when a cooking workshop reaches its maximum seat capacity?',
            es: '¿Qué ocurre cuando un taller de cocina alcanza su aforo máximo?',
            ca: 'Què passa quan un taller de cuina arriba al seu aforament màxim?',
        },
        options: {
            en: [
                'The host receives a warning, but registration remains open',
                'The capacity is automatically doubled',
                'The workshop is marked as full, blocking further registrations',
                'The workshop is converted to a private class',
            ],
            es: [
                'El organizador recibe una advertencia, pero el registro sigue abierto',
                'La capacidad se duplica automáticamente',
                'El taller se marca como lleno, bloqueando nuevos registros',
                'El taller se convierte en una clase privada',
            ],
            ca: [
                "L'organitzador rep una advertència, però el registre segueix obert",
                'La capacitat es duplica automàticament',
                'El taller es marca com a ple, bloquejant nous registres',
                'El taller es converteix en una classe privada',
            ],
        },
        correctIndex: 2,
    },
    {
        id: 'q3',
        question: {
            en: 'What is the function of the administrator review step for newly created workshops?',
            es: '¿Cuál es la función del paso de revisión del administrador para los talleres recién creados?',
            ca: "Quina és la funció del pas de revisió de l'administrador per als tallers acabats de crear?",
        },
        options: {
            en: [
                'To automatically assign recipes to the workshop',
                'To ensure event quality and approve publishing to the community',
                'To manage the student whitelist on behalf of the host',
                'To calculate the currency conversion of pricing',
            ],
            es: [
                'Asignar automáticamente recetas al taller',
                'Garantizar la calidad del evento y aprobar la publicación en la comunidad',
                'Gestionar la lista de alumnos autorizados en nombre del organizador',
                'Calcular la conversión de moneda de los precios',
            ],
            ca: [
                'Assignar automàticament receptes al taller',
                "Garantir la qualitat de l'esdeveniment i aprovar la publicació a la comunitat",
                "Gestionar la llista d'alumnes autoritzats en nom de l'organitzador",
                'Calcular la conversió de divises dels preus',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q4',
        question: {
            en: 'Can a host set prerequisite recipes that students must complete before joining a workshop?',
            es: '¿Puede un organizador establecer recetas obligatorias que los alumnos deban completar antes de unirse al taller?',
            ca: "Pot un organitzador establir receptes obligatòries que els alumnes hagin de completar abans d'unir-se al taller?",
        },
        options: {
            en: [
                'No, workshops are always open without prerequisites',
                'Yes, the host can specify prerequisite recipes to ensure students are prepared',
                'Only if the workshop is marked as public',
                'Only if the workshop has a capacity of less than 5 seats',
            ],
            es: [
                'No, los talleres están siempre abiertos sin requisitos previos',
                'Sí, el organizador puede especificar recetas previas para garantizar que estén preparados',
                'Solo si el taller está marcado como público',
                'Solo si el taller tiene una capacidad de menos de 5 plazas',
            ],
            ca: [
                'No, els tallers estan sempre oberts sense requisits previs',
                "Sí, l'organitzador pot especificar receptes prèvies per garantir que estiguin preparats",
                'Només si el taller està marcat com a públic',
                'Només si el taller té una capacitat de menys de 5 places',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q5',
        question: {
            en: 'Where does a host manage student join requests and roster status?',
            es: '¿Dónde gestiona el organizador las solicitudes de inscripción de los alumnos?',
            ca: "On gestiona l'organitzador les sol·licituds d'inscripció dels alumnes?",
        },
        options: {
            en: [
                'Directly on the home page dashboard',
                'Via their personal user profile settings',
                'On the specific workshop details page roster panel',
                'Through an automated email questionnaire',
            ],
            es: [
                'Directamente en el panel de la página de inicio',
                'A través de la configuración de su perfil personal',
                'En el panel de participantes de la página de detalles del taller',
                'A través de un cuestionario de correo electrónico automatizado',
            ],
            ca: [
                "Directament al panell de la pàgina d'inici",
                'A través de la configuració del seu perfil personal',
                'Al panell de participants de la pàgina de detalls del taller',
                "A través d'un qüestionari de correu electrònic automatitzat",
            ],
        },
        correctIndex: 2,
    },
];
