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

export const draftsQuestions: Question[] = [
    {
        id: 'q1',
        question: {
            en: 'How many private recipe drafts can you keep in progress at the same time in Jorbites?',
            es: '¿Cuántos borradores privados de recetas puedes tener en progreso al mismo tiempo en Jorbites?',
            ca: 'Quants esborranys privats de receptes pots tenir en progrés al mateix temps a Jorbites?',
        },
        options: {
            en: [
                'Only 1 draft',
                'Up to 3 drafts',
                'Up to 5 drafts',
                'Unlimited drafts',
            ],
            es: [
                'Solo 1 borrador',
                'Hasta 3 borradores',
                'Hasta 5 borradores',
                'Borradores ilimitados',
            ],
            ca: [
                'Només 1 esborrany',
                'Fins a 3 esborranys',
                'Fins a 5 esborranys',
                'Esborranys il·limitats',
            ],
        },
        correctIndex: 2,
    },
    {
        id: 'q2',
        question: {
            en: 'How long are your private solo drafts kept safely in your account?',
            es: '¿Cuánto tiempo se conservan tus borradores individuales de forma segura en tu cuenta?',
            ca: 'Quant de temps es conserven els teus esborranys individuals de manera segura al teu compte?',
        },
        options: {
            en: ['24 hours', '7 days', '30 days', '1 full year (365 days)'],
            es: ['24 horas', '7 días', '30 días', '1 año completo (365 días)'],
            ca: ['24 hores', '7 dies', '30 dies', '1 any sencer (365 dies)'],
        },
        correctIndex: 3,
    },
    {
        id: 'q3',
        question: {
            en: 'How many friends or co-cooks can you invite to collaborate on a single recipe?',
            es: '¿A cuántos amigos o cocineros puedes invitar a colaborar en una sola receta?',
            ca: 'A quants amics o cuiners pots convidar a col·laborar en una sola recepta?',
        },
        options: {
            en: [
                'Only 1 friend',
                'Up to 4 co-cooks',
                'Up to 10 co-cooks',
                'Up to 25 co-cooks',
            ],
            es: [
                'Solo 1 amigo',
                'Hasta 4 cocineros',
                'Hasta 10 cocineros',
                'Hasta 25 cocineros',
            ],
            ca: [
                'Només 1 amic',
                'Fins a 4 cuiners',
                'Fins a 10 cuiners',
                'Fins a 25 cuiners',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q4',
        question: {
            en: 'What happens when you invite a co-cook to one of your private solo drafts?',
            es: '¿Qué ocurre cuando invitas a un cocinero a uno de tus borradores privados individuales?',
            ca: 'Què passa quan convides un cuiner a un dels teus esborranys privats individuals?',
        },
        options: {
            en: [
                'Your draft is erased and you must start over',
                'It automatically upgrades into a shared collaborative draft',
                'You have to copy and paste the recipe into a new form',
                'The recipe is immediately published to the community feed',
            ],
            es: [
                'El borrador se borra y debes empezar de nuevo',
                'Se transforma automáticamente en un borrador colaborativo compartido',
                'Tienes que copiar y pegar la receta en un nuevo formulario',
                'La receta se publica inmediatamente en el muro de la comunidad',
            ],
            ca: [
                'L’esborrany s’esborra i has de començar de nou',
                'Es transforma automàticament en un esborrany col·laboratiu compartit',
                'Has de copiar i enganxar la recepta en un formulari nou',
                'La recepta es publica immediatament al mur de la comunitat',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q5',
        question: {
            en: 'What is the difference between an Editor and a Viewer co-cook?',
            es: '¿Cuál es la diferencia entre un cocinero Editor y un Lector?',
            ca: 'Quina és la diferència entre un cuiner Editor i un Lector?',
        },
        options: {
            en: [
                'Editors can add/edit ingredients and steps, while Viewers have read-only access',
                'Viewers can publish recipes, but Editors cannot',
                'Editors can only upload photos, while Viewers can only write text',
                'There is no difference between Editor and Viewer roles',
            ],
            es: [
                'Los Editores pueden añadir/editar ingredientes y pasos, mientras que los Lectores tienen acceso de solo lectura',
                'Los Lectores pueden publicar recetas, pero los Editores no',
                'Los Editores solo pueden subir fotos, mientras que los Lectores solo pueden escribir texto',
                'No hay ninguna diferencia entre los roles de Editor y Lector',
            ],
            ca: [
                'Els Editors poden afegir/editar ingredients i passos, mentre que els Lectors tenen accés de només lectura',
                'Els Lectors poden publicar receptes, però els Editors no',
                'Els Editors només poden pujar fotos, mentre que els Lectors només poden escriure text',
                'No hi ha cap diferència entre els rols d’Editor i Lector',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q6',
        question: {
            en: 'While collaborating with a friend, an orange banner appears on the Ingredients step saying your friend is editing it. What does this mean?',
            es: 'Mientras colaboras con un amigo, aparece un aviso naranja en el paso de Ingredientes indicando que tu amigo lo está editando. ¿Qué significa?',
            ca: 'Mentre col·labores amb un amic, apareix un avís taronja al pas d’Ingredients indicant que el teu amic l’està editant. Què significa?',
        },
        options: {
            en: [
                'Your internet connection was disconnected',
                'The step is temporarily protected so you do not accidentally overwrite each other’s typing',
                'The ingredients were deleted by the system',
                'The recipe was reported for review',
            ],
            es: [
                'Tu conexión a internet se ha desconectado',
                'El paso está temporalmente protegido para que no sobreescribáis el texto del otro por accidente',
                'El sistema ha eliminado los ingredientes',
                'La receta ha sido enviada a revisión',
            ],
            ca: [
                'La teva connexió a internet s’ha desconnectat',
                'El pas està temporalment protegit perquè no sobreescriviu el text de l’altre per accident',
                'El sistema ha eliminat els ingredients',
                'La recepta ha estat enviada a revisió',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q7',
        question: {
            en: 'When does a locked step unlock and become editable for you again?',
            es: '¿Cuándo se desbloquea un paso bloqueado y vuelve a ser editable para ti?',
            ca: 'Quan es desbloqueja un pas bloquejat i torna a ser editable per a tu?',
        },
        options: {
            en: [
                'Only after restarting your computer',
                'You must wait 24 hours for the lock to expire',
                'As soon as your co-cook moves to another step or closes the recipe',
                'You have to contact technical support',
            ],
            es: [
                'Solo después de reiniciar tu ordenador',
                'Debes esperar 24 horas a que expire el bloqueo',
                'Tan pronto como tu cocinero avance a otro paso o cierre la receta',
                'Tienes que contactar con soporte técnico',
            ],
            ca: [
                'Només després de reiniciar el teu ordinador',
                'Has d’esperar 24 hores perquè caduqui el bloqueig',
                'Tan bon punt el teu cuiner avanci a un altre pas o tanqui la recepta',
                'Has de contactar amb el suport tècnic',
            ],
        },
        correctIndex: 2,
    },
    {
        id: 'q8',
        question: {
            en: 'If you are actively typing an ingredient description while your co-cook saves changes, what happens to your typing?',
            es: 'Si estás escribiendo activamente la descripción de un ingrediente mientras tu cocinero guarda cambios, ¿qué ocurre con tu texto?',
            ca: 'Si estàs escrivint activament la descripció d’un ingredient mentre el teu cuiner desa canvis, què passa amb el teu text?',
        },
        options: {
            en: [
                'Your active typing is protected and will never be overwritten by remote updates',
                'Your text is immediately replaced by whatever your co-cook wrote',
                'The entire page reloads and clears your form',
                'The browser closes automatically',
            ],
            es: [
                'Lo que estás escribiendo está protegido y nunca será sobreescrito por cambios externos',
                'Tu texto se sustituye de inmediato por lo que haya escrito tu compañero',
                'Toda la página se recarga y vacía el formulario',
                'El navegador se cierra automáticamente',
            ],
            ca: [
                'El que estàs escrivint està protegit i mai serà sobreescrit per canvis externs',
                'El teu text se substitueix immediatament pel que hagi escrit el teu company',
                'Tota la pàgina es recarrega i buida el formulari',
                'El navegador es tanca automàticament',
            ],
        },
        correctIndex: 0,
    },
    {
        id: 'q9',
        question: {
            en: 'What happens if you click "Regenerate Link" in your recipe’s invite settings?',
            es: '¿Qué sucede si pulsas "Regenerar Enlace" en la configuración de invitación de tu receta?',
            ca: 'Què passa si prems "Regenerar Enllaç" a la configuració d’invitació de la teva recepta?',
        },
        options: {
            en: [
                'The entire recipe is permanently deleted',
                'The old invite link stops working immediately and a new private link is created',
                'All existing collaborators are removed from your account',
                'The draft is immediately made public',
            ],
            es: [
                'La receta se elimina de forma permanente',
                'El enlace de invitación anterior deja de funcionar de inmediato y se crea uno nuevo privado',
                'Todos los colaboradores actuales se eliminan de tu cuenta',
                'El borrador se hace público al instante',
            ],
            ca: [
                'La recepta s’elimina de manera permanent',
                'L’enllaç d’invitació anterior deixa de funcionar d’immediat i se’n crea un de nou privat',
                'Tots els col·laboradors actuals s’eliminen del teu compte',
                'L’esborrany es fa públic a l’instant',
            ],
        },
        correctIndex: 1,
    },
    {
        id: 'q10',
        question: {
            en: 'What happens to your collaborative draft once you and your team publish the recipe?',
            es: '¿Qué ocurre con vuestro borrador colaborativo una vez que el equipo publica la receta?',
            ca: 'Què passa amb el vostre esborrany col·laboratiu un cop l’equip publica la recepta?',
        },
        options: {
            en: [
                'It becomes a public recipe on Jorbites, and the temporary draft is cleanly completed',
                'The recipe disappears completely from the platform',
                'It stays as an unfinished draft forever',
                'Only the recipe owner can view the final published recipe',
            ],
            es: [
                'Se convierte en una receta pública en Jorbites y el borrador temporal queda completado',
                'La receta desaparece por completo de la plataforma',
                'Se queda como borrador incompleto para siempre',
                'Solo el creador puede ver la receta final publicada',
            ],
            ca: [
                'Es converteix en una recepta pública a Jorbites i l’esborrany temporal queda completat',
                'La recepta desapareix completament de la plataforma',
                'Es queda com a esborrany incomplet per sempre',
                'Només el creador pot veure la recepta final publicada',
            ],
        },
        correctIndex: 0,
    },
];
