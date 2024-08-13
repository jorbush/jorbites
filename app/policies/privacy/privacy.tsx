'use client';

import Container from '@/app/components/Container';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Container>
            <div className="mx-auto max-w-screen-md dark:text-neutral-100">
                <Head>
                    <title>Política de Privacidad | Jorbites</title>
                    <meta
                        name="description"
                        content="Política de privacidad de Jorbites"
                    />
                </Head>
                <div className="container mx-auto px-4 py-6">
                    <h1 className="mb-4 text-3xl font-bold">
                        Política de Privacidad
                    </h1>
                    <p className="mb-4">
                        Última actualización: [12 de agosto de 2024]
                    </p>
                    <p className="mb-4">
                        En <strong>Jorbites</strong> (&quot;nosotros&quot;,
                        &quot;nuestro&quot;, &quot;nuestra&quot;, &quot;sitio
                        web&quot;), accesible desde{' '}
                        <a
                            href="https://jorbites.com"
                            className="text-blue-600"
                        >
                            jorbites.com
                        </a>
                        , respetamos tu privacidad y nos comprometemos a
                        proteger tus datos personales. Esta política de
                        privacidad explica cómo recopilamos, utilizamos y
                        protegemos la información personal que nos proporcionas
                        a través de nuestro sitio web.
                    </p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        1. Información que recopilamos
                    </h2>
                    <p className="mb-4">
                        Recopilamos diferentes tipos de información personal
                        cuando interactúas con nuestro sitio web:
                    </p>
                    <ul className="mb-4 ml-6 list-disc">
                        <li>
                            <strong>Datos de Usuario:</strong>
                        </li>
                        <ul className="mb-4 ml-6 list-disc">
                            <li>
                                <strong>Identificación y Contacto:</strong>{' '}
                                Nombre, dirección de correo electrónico, imagen
                                de perfil (si decides proporcionarla).
                            </li>
                            <li>
                                <strong>Autenticación:</strong> Información
                                relacionada con tu cuenta, incluyendo
                                contraseñas cifradas.
                            </li>
                            <li>
                                <strong>Preferencias y Configuraciones:</strong>{' '}
                                Notificaciones por correo electrónico, nivel de
                                usuario, y estado de verificación.
                            </li>
                        </ul>
                        <li>
                            <strong>Datos de Actividad:</strong>
                        </li>
                        <ul className="mb-4 ml-6 list-disc">
                            <li>
                                <strong>Recetas:</strong> Título, descripción,
                                imágenes, categoría, método, tiempo de
                                preparación, ingredientes, pasos y cualquier
                                imagen adicional que subas.
                            </li>
                            <li>
                                <strong>Comentarios:</strong> Comentarios que
                                publiques en las recetas, junto con la
                                información del usuario y del comentario.
                            </li>
                        </ul>
                        <li>
                            <strong>Imágenes:</strong> Las imágenes que subes,
                            ya sea para recetas o fotos de perfil, se almacenan
                            en{' '}
                            <a
                                href="https://cloudinary.com/"
                                className="text-blue-600"
                            >
                                Cloudinary
                            </a>
                            , un servicio de gestión de medios.
                        </li>
                    </ul>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        2. Cómo utilizamos tu información
                    </h2>
                    <p className="mb-4">
                        Utilizamos la información que recopilamos para:
                    </p>
                    <ul className="mb-4 ml-6 list-disc">
                        <li>
                            Proporcionarte acceso a los servicios y
                            funcionalidades del sitio web, incluyendo la
                            posibilidad de crear y gestionar tu cuenta, publicar
                            recetas, y dejar comentarios.
                        </li>
                        <li>
                            Personalizar tu experiencia en nuestro sitio web,
                            incluyendo recomendaciones basadas en tus recetas
                            favoritas y preferencias.
                        </li>
                        <li>
                            Comunicarnos contigo para ofrecer soporte, enviar
                            actualizaciones o notificaciones importantes.
                        </li>
                        <li>
                            Mejorar nuestros servicios y el rendimiento de
                            nuestro sitio web mediante análisis de datos.
                        </li>
                    </ul>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        3. Compartir tu información
                    </h2>
                    <p className="mb-4">
                        No compartimos tus datos personales con terceros,
                        excepto en los siguientes casos:
                    </p>
                    <ul className="mb-4 ml-6 list-disc">
                        <li>
                            <strong>Proveedores de Servicios:</strong>{' '}
                            Utilizamos proveedores de servicios externos para
                            alojar nuestro sitio web (Vercel), gestionar nuestro
                            dominio (GoDaddy), y almacenar nuestra base de datos
                            (MongoDB). También usamos{' '}
                            <a
                                href="https://cloudinary.com/"
                                className="text-blue-600"
                            >
                                Cloudinary
                            </a>{' '}
                            para gestionar las imágenes que subes. Estos
                            proveedores pueden tener acceso a tus datos
                            personales en la medida en que sea necesario para
                            realizar sus funciones, pero están obligados a
                            protegerlos y no utilizarlos para otros fines.
                        </li>
                        <li>
                            <strong>Requisitos Legales:</strong> Podemos
                            divulgar tu información si es necesario para cumplir
                            con obligaciones legales o en respuesta a
                            solicitudes válidas de autoridades públicas.
                        </li>
                    </ul>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        4. Seguridad de tus datos
                    </h2>
                    <p className="mb-4">
                        Nos tomamos muy en serio la seguridad de tu información
                        personal. Implementamos medidas técnicas y organizativas
                        para proteger tus datos contra accesos no autorizados,
                        alteraciones, divulgaciones o destrucción.
                    </p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        5. Tus derechos
                    </h2>
                    <p className="mb-4">
                        Tienes ciertos derechos sobre tus datos personales,
                        incluyendo:
                    </p>
                    <ul className="mb-4 ml-6 list-disc">
                        <li>
                            <strong>Acceso:</strong> Puedes solicitar una copia
                            de los datos personales que tenemos sobre ti.
                        </li>
                        <li>
                            <strong>Rectificación:</strong> Puedes solicitar que
                            corrijamos cualquier dato incorrecto o incompleto.
                        </li>
                        <li>
                            <strong>Eliminación:</strong> Puedes solicitar que
                            eliminemos tus datos personales, aunque esto puede
                            limitar tu capacidad de utilizar algunos servicios
                            en nuestro sitio web.
                        </li>
                        <li>
                            <strong>Oposición:</strong> Puedes oponerte al
                            procesamiento de tus datos en ciertas
                            circunstancias.
                        </li>
                    </ul>
                    <p className="mb-4">
                        Para ejercer estos derechos, puedes contactarnos en{' '}
                        <a
                            href="mailto:jbonetv5@gmail.com"
                            className="text-blue-600"
                        >
                            jbonetv5@gmail.com
                        </a>
                        .
                    </p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        6. Retención de datos
                    </h2>
                    <p className="mb-4">
                        Retenemos tus datos personales solo durante el tiempo
                        que sea necesario para los fines descritos en esta
                        política de privacidad, o según lo requiera la ley.
                    </p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        7. Cambios en la Política de Privacidad
                    </h2>
                    <p className="mb-4">
                        Podemos actualizar esta política de privacidad de vez en
                        cuando para reflejar cambios en nuestras prácticas o por
                        otras razones operativas, legales o regulatorias. Te
                        notificaremos sobre cualquier cambio importante mediante
                        un aviso en nuestro sitio web.
                    </p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        8. Contacto
                    </h2>
                    <p>
                        Si tienes alguna pregunta o inquietud sobre nuestra
                        política de privacidad, no dudes en contactarnos a
                        través de{' '}
                        <a
                            href="mailto:jbonetv5@gmail.com"
                            className="text-blue-600"
                        >
                            jbonetv5@gmail.com
                        </a>
                        .
                    </p>
                </div>
            </div>
        </Container>
    );
};

export default PrivacyPolicy;
