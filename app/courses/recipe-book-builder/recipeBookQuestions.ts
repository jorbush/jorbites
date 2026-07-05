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

export const recipeBookQuestions: Question[] = [
    {
        id: 'q1',
        question: {
            en: 'Where can a user find the button to start building their recipe book?',
            es: '¿Dónde puede encontrar un usuario el botón para comenzar a crear su libro de recetas?',
            ca: 'On pot trobar un usuari el botó per començar a crear el seu llibre de receptes?',
        },
        options: {
            en: [
                "On their own profile page or another user's profile page",
                'Only in the main settings dropdown menu',
                'On the recipe details page sharing options',
                'Only in the main navigation sidebar',
            ],
            es: [
                'En su propia página de perfil o en la página de perfil de otro usuario',
                'Solo en el menú desplegable de configuración principal',
                'En las opciones para compartir de la página de detalles de la receta',
                'Solo en la barra lateral de navegación principal',
            ],
            ca: [
                "A la seva pròpia pàgina de perfil o a la pàgina de perfil d'un altre usuari",
                'Només al menú desplegable de configuració principal',
                'A les opcions de compartir de la pàgina de detalls de la recepta',
                'Només a la barra lateral de navegació principal',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q2',
        question: {
            en: 'Which of the following is NOT an available placement option in the recipe image display dropdown?',
            es: '¿Cuál de los siguientes NO es una opción de alineación disponible en el menú desplegable de visualización de imágenes?',
            ca: "Quin dels següents NO és una opció d'alineació disponible al menú desplegable de visualització d'imatges?",
        },
        options: {
            en: ['Top Left', 'Top Right', 'Center Background', 'Bottom Left'],
            es: [
                'Arriba izquierda',
                'Arriba derecha',
                'Fondo centrado',
                'Abajo izquierda',
            ],
            ca: [
                'A dalt esquerra',
                'A dalt dreta',
                'Fons centrat',
                'A baix esquerra',
            ],
        },
        correctIndex: 2,
    },
    {
        id: 'q3',
        question: {
            en: 'What happens if you disable the "Display extra images" toggle switch?',
            es: '¿Qué sucede si desactivas el interruptor "Mostrar imágenes adicionales"?',
            ca: 'Què passa si desactives l\'interruptor "Mostrar imatges addicionals"?',
        },
        options: {
            en: [
                'The PDF will exclude recipe step images, optimizing space',
                'The recipe book will render completely without any text',
                'The book will automatically request administrator approval',
                'The generated PDF size is increased dynamically',
            ],
            es: [
                'El PDF excluirá las imágenes de los pasos de la receta, optimizando el espacio',
                'El libro de recetas se procesará completamente sin texto',
                'El libro solicitará automáticamente la aprobación del administrador',
                'El tamaño del PDF generado aumenta dinámicamente',
            ],
            ca: [
                "El PDF exclourà les imatges dels passos de la recepta, optimitzant l'espai",
                'El llibre de receptes es processarà completament sense text',
                "El llibre sol·licitarà automàticament l'aprovació de l'administrador",
                'La mida del PDF generat augmenta dinàmicament',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q4',
        question: {
            en: 'Why is recipe book PDF generation subject to rate limits on Jorbites?',
            es: '¿Por qué la generación de libros de recetas en PDF está sujeta a límites de tasa en Jorbites?',
            ca: 'Per què la generació de llibres de receptes en PDF està subjecta a límits de taxa a Jorbites?',
        },
        options: {
            en: [
                'To encourage users to pay for a premium subscription',
                'To prevent server and client rendering resource overload',
                'Because PDFs expire after a limited period of 24 hours',
                'To restrict users from exporting recipes that are not their own',
            ],
            es: [
                'Para animar a los usuarios a pagar por una suscripción premium',
                'Para evitar la sobrecarga de recursos de procesamiento en el servidor y cliente',
                'Porque los archivos PDF expiran después de un período limitado de 24 horas',
                'Para restringir a los usuarios de exportar recetas que no son suyas',
            ],
            ca: [
                'Per animar els usuaris a pagar per una subscripció premium',
                'Per evitar la sobrecàrrega de recursos de processament al servidor i client',
                "Perquè els fitxers PDF expiren després d'un període limitat de 24 hores",
                "Per restringir els usuaris d'exportar receptes que no són seves",
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q5',
        question: {
            en: 'How is the final compiled PDF document delivered to the user?',
            es: '¿Cómo se entrega al usuario el documento PDF final compilado?',
            ca: "Com s'entrega a l'usuari el document PDF final compilat?",
        },
        options: {
            en: [
                'Sent via postal service to their physical home address',
                'Emailed as an attachment by the admin support team',
                'Requires manual verification from other community chefs first',
                'Compiles dynamically in the browser and downloads directly to their local device',
            ],
            es: [
                'Se envía por servicio postal a su dirección física',
                'Se envía por correo como archivo adjunto por el equipo de soporte',
                'Requiere primero la verificación manual de otros chefs de la comunidad',
                'Se compila dinámicamente en el navegador y se descarga directamente en su dispositivo',
            ],
            ca: [
                "S'envia per servei postal a la seva adreça física",
                "S'envia per correu com a fitxer adjunt pel seu equip de suport",
                "Requereix primer la verificació manual d'altres xefs de la comunitat",
                'Es compila dinàmicament al navegador i es descarrega directament al seu dispositiu',
            ],
        },
        correctIndex: 3,
    },
];
