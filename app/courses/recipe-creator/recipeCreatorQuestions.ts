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

export const recipeCreatorQuestions: Question[] = [
    {
        id: 'q1',
        question: {
            en: 'What is the primary benefit of the "Plain Text Mode" toggle when inputting ingredients or steps?',
            es: '¿Cuál es el beneficio principal de activar el "Modo de Texto Plano" al introducir ingredientes o pasos?',
            ca: 'Quin és el benefici principal d\'activar el "Mode de Text Pla" al introduir ingredients o passos?',
        },
        options: {
            en: [
                'It lets you copy-paste text blocks directly from platforms like Instagram and parses them into lists',
                'It automatically translates the recipe into five different languages',
                'It disables the photo uploading fields to make the form load faster',
                'It requires a premium account before you can submit the recipe',
            ],
            es: [
                'Te permite copiar y pegar bloques de texto directamente desde plataformas como Instagram y los analiza en listas',
                'Traduce automáticamente la receta a cinco idiomas diferentes',
                'Desactiva los campos de subida de fotos para que el formulario se cargue más rápido',
                'Requiere una cuenta premium antes de poder enviar la receta',
            ],
            ca: [
                'Et permet copiar i enganxar blocs de text directament des de plataformes com Instagram i els divideix en llistes',
                'Tradueix automàticament la recepta a cinc idiomes diferents',
                'Desactiva els camps de pujada de fotos perquè el formulari es carregui més ràpid',
                'Requereix un compte premium abans de poder enviar la recepta',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q2',
        question: {
            en: 'How does Jorbites split a pasted block of text in Plain Text Mode?',
            es: '¿Cómo divide Jorbites un bloque de texto pegado en el Modo de Texto Plano?',
            ca: 'Com divideix Jorbites un bloc de text enganxat al Mode de Text Pla?',
        },
        options: {
            en: [
                'It parses line breaks and numbered lists into separate structured items',
                'It requires you to separate every ingredient with a semicolon symbol',
                'It groups all text into a single large paragraph without separations',
                'It ignores any numbers and only imports alphabetical text characters',
            ],
            es: [
                'Analiza los saltos de línea y las listas numeradas en elementos estructurados individuales',
                'Requiere que separes cada ingrediente con un símbolo de punto y coma',
                'Agrupa todo el texto en un único párrafo grande sin separaciones',
                'Ignora cualquier número y solo importa caracteres de texto alfabéticos',
            ],
            ca: [
                'Divideix els salts de línia i les llistes numerades en elements estructurats individuals',
                'Requereix que separeu cada ingredient amb un símbol de punt i coma',
                'Agrupa tot el text en un únic paràgraf gran sense separacions',
                'Ignora qualsevol número i només importa caràcters de text alfabètics',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q3',
        question: {
            en: 'Where is a recipe creator draft stored so you can resume writing it later?',
            es: '¿Dónde se guarda un borrador del creador de recetas para que puedas reanudar la redacción más tarde?',
            ca: 'On es desa un esborrany del creador de receptes perquè puguis reprendre la redacció més tard?',
        },
        options: {
            en: [
                'Saved locally in browser cookies only',
                'Saved in the database via the /api/draft endpoint',
                'Emailed as a text file to your registered inbox',
                'Drafts are not saved and are lost when closing the modal',
            ],
            es: [
                'Guardado localmente solo en las cookies del navegador',
                'Guardado en la base de datos a través de la ruta /api/draft',
                'Enviado por correo como archivo de texto a tu bandeja de entrada',
                'Los borradores no se guardan y se pierden al cerrar el modal',
            ],
            ca: [
                'Desat localment només a les galetes del navegador',
                'Desat a la base de dades a través de la ruta /api/draft',
                "Enviat per correu com a fitxer de text a la teva bústia d'entrada",
                'Els esborranys no es desen i es perden al tancar el modal',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q4',
        question: {
            en: 'What happens when you open the Recipe Modal if you have a previously saved draft?',
            es: '¿Qué sucede cuando abres el modal de Recetas si tienes un borrador previamente guardado?',
            ca: 'Què passa quan obres el modal de Receptes si tens un esborrany prèviament desat?',
        },
        options: {
            en: [
                'It forces you to delete it before starting a new recipe',
                'It alerts other community users that you are active',
                'It automatically loads the draft data and resumes at your last step',
                'It opens a completely blank form and discards the draft',
            ],
            es: [
                'Te obliga a eliminarlo antes de comenzar una nueva receta',
                'Alerta a otros usuarios de la comunidad de que estás activo',
                'Carga automáticamente los datos del borrador y reanuda en tu último paso',
                'Abre un formulario completamente en blanco y descarta el borrador',
            ],
            ca: [
                'Et obliga a eliminar-lo abans de començar una nova recepta',
                'Alerta els altres usuaris de la comunitat que estàs actiu',
                "Carrega automàticament les dades de l'esborrany i reprèn a l'últim pas",
                "Obre un formulari completament en blanc i descarta l'esborrany",
            ],
        },
        correctIndex: 2,
    },
    {
        id: 'q5',
        question: {
            en: 'Who has permission to edit a published recipe?',
            es: '¿Quién tiene permiso para editar una receta publicada?',
            ca: 'Qui té permís per editar una recepta publicada?',
        },
        options: {
            en: [
                'Any logged-in user who liked or shared the recipe',
                'Only Jorbites administrator accounts',
                'Only the owner/creator of the recipe',
                'Recipes are permanently locked and cannot be edited after publishing',
            ],
            es: [
                'Cualquier usuario conectado al que le haya gustado o compartido la receta',
                'Solo las cuentas de administrador de Jorbites',
                'Solo el propietario/creador de la receta',
                'Las recetas están bloqueadas permanentemente y no se pueden editar después de publicarlas',
            ],
            ca: [
                'Qualsevol usuari connectat a qui li hagi agradat o compartit la recepta',
                "Només els comptes d'administrador de Jorbites",
                'Només el propietari/creador de la recepta',
                'Les receptes estan bloquejades permanentment i no es poden editar després de publicar-les',
            ],
        },
        correctIndex: 2,
    },
    {
        id: 'q6',
        question: {
            en: 'Which of the following cooking methods can you specify for your recipe in Jorbites?',
            es: '¿Cuál de los siguientes métodos de cocción puedes especificar para tu receta en Jorbites?',
            ca: 'Quin dels següents mètodes de cocció pots especificar per a la teva recepta a Jorbites?',
        },
        options: {
            en: [
                'Oven, Microwave, Air Fryer, No Cook, Stove',
                'Boil, Freeze, Dehydrate, Smoke only',
                'Only Oven and Stove are supported',
                'No Cook is not an option',
            ],
            es: [
                'Horno, Microondas, Freidora de aire, Sin cocinar, Estufa',
                'Solo Hervir, Congelar, Deshidratar, Ahumar',
                'Solo se admiten Horno y Estufa',
                'Sin cocinar no es una opción',
            ],
            ca: [
                "Forn, Microones, Fregidora d'aire, Sense cuinar, Estufa",
                'Només Bullir, Congelar, Deshidratar, Fumar',
                "Només s'admeten Forn i Estufa",
                'Sense cuinar no és una opció',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q7',
        question: {
            en: 'What is the purpose of specifying prep/cooking duration minutes?',
            es: '¿Cuál es el propósito de especificar los minutos de duración de preparación/cocción?',
            ca: "Quin és el propòsit d'especificar els minuts de durada de preparació/cocció?",
        },
        options: {
            en: [
                'It adds a quick duration badge to recipe cards, making filtering by fast meals easy',
                'It schedules an alarm to ring on your device when cooking',
                'It blocks users from reading the recipe if they lack time',
                'It calculates the price based on energy consumption',
            ],
            es: [
                'Añade una insignia de duración a las tarjetas, facilitando el filtrado por comidas rápidas',
                'Programa una alarma para sonar en tu dispositivo al cocinar',
                'Bloquea la lectura de la receta a los usuarios si no tienen tiempo',
                'Calcula el precio basándose en el consumo energético',
            ],
            ca: [
                'Afegeix una insígnia de durada a les targetes, facilitant el filtratge per àpats ràpids',
                'Programa una alarma per sonar al vostre dispositiu en cuinar',
                'Bloqueja la lectura de la recepta als usuaris si no tenen temps',
                'Calcula el preu basant-se en el consum energètic',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q8',
        question: {
            en: 'What is the benefit of assigning categories (like Dessert or Pasta) to your recipe?',
            es: '¿Cuál es el beneficio de asignar categorías (como Postre o Pasta) a tu receta?',
            ca: "Quin és el benefici d'assignar categories (com Postres o Pasta) a la teva recepta?",
        },
        options: {
            en: [
                'It lists the recipe under matching category filtering tabs on the dashboard',
                'It changes the color theme of the recipe page automatically',
                'It sends a global notification to users interested in that category',
                'It makes the recipe private to only users who unlock that category',
            ],
            es: [
                'Muestra la receta en las pestañas de filtrado de categorías correspondientes en el panel',
                'Cambia el tema de color de la página de la receta automáticamente',
                'Envía una notificación global a los usuarios interesados en esa categoría',
                'Hace que la receta sea privada solo para usuarios que desbloqueen esa categoría',
            ],
            ca: [
                'Mostra la recepta a les pestanyes de filtratge de categories corresponents al tauler',
                'Canvia el tema de color de la pàgina de la recepta automàticament',
                'Envia una notificació global als usuaris interessats en aquesta categoria',
                'Fa que la recepta sigui privada només per als usuaris que desbloquegin aquesta categoria',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q9',
        question: {
            en: 'What happens when you add another user as a co-cook in the Related Content tab?',
            es: '¿Qué sucede cuando agregas a otro usuario como co-cocinero en la pestaña Contenido relacionado?',
            ca: 'Què passa quan afegeixes un altre usuari com a co-cuiner a la pestanya Contingut relacionat?',
        },
        options: {
            en: [
                'They are credited on the recipe page as collaborators',
                'They receive full owner privileges and can delete your recipe',
                'The system automatically follows their profile for you',
                'They receive an email draft copy to edit on their own account',
            ],
            es: [
                'Se les atribuye en la página de la receta como colaboradores',
                'Reciben privilegios completos de propietario y pueden eliminar tu receta',
                'El sistema sigue automáticamente su perfil por ti',
                'Reciben una copia borrador por correo para editarla en su propia cuenta',
            ],
            ca: [
                "Se'ls atribueix a la pàgina de la recepta com a col·laboradors",
                'Reben privilegis complets de propietari i poden eliminar la teva recepta',
                'El sistema segueix automàticament el seu perfil per tu',
                'Reben una còpia esborrany per correu per editar-la al seu propi compte',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q10',
        question: {
            en: 'Why must you upload the Finished Recipe photo before step-by-step images?',
            es: '¿Por qué debes subir la foto de la receta terminada antes de las imágenes de los pasos?',
            ca: 'Per què has de pujar la foto de la recepta acabada abans de les imatges dels passos?',
        },
        options: {
            en: [
                'Uploading the cover photo first unlocks step photo slots to prevent blank dashboard previews',
                'Step-by-step photos are resized according to the main photo colors',
                'Because step images require administrator review first',
                'To verify the recipe was actually completed successfully first',
            ],
            es: [
                'Subir la foto de portada primero desbloquea las ranuras de pasos para evitar vistas previas vacías en el panel',
                'Las fotos de los pasos se redimensionan según los colores de la foto principal',
                'Porque las imágenes de los pasos requieren primero la revisión del administrador',
                'Para verificar que la receta se completó con éxito primero',
            ],
            ca: [
                'Pujar la foto de portada primer desbloqueja les ranures de passos per evitar vistes prèvies buides al tauler',
                'Les fotos dels passos es redimensionen segons els colors de la foto principal',
                "Perquè les imatges dels passos requereixen primer la revisió de l'administrador",
                'Per verificar que la recepta es va completar amb èxit primer',
            ],
        },
        correctIndex: 0,
    },
];
