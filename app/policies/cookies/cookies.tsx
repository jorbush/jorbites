'use client';
import Container from '@/app/components/Container';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft } from 'react-icons/fi';

const CookiesPolicy: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();

    return (
        <Container>
            <div className="mx-auto max-w-screen-md dark:text-neutral-100">
                <Head>
                    <title>{t('cookies_policy')} | Jorbites</title>
                    <meta
                        name="description"
                        content="Jorbites Cookies Policy"
                    />
                </Head>
                <div className="mx-auto max-w-[700px] gap-10 px-1 py-0 md:px-4 md:py-6">
                    <div className="mb-5 flex items-center justify-between">
                        <button
                            className="flex items-center space-x-2 text-gray-600 focus:outline-none dark:text-neutral-100"
                            onClick={() => router.back()}
                        >
                            <FiChevronLeft className="text-xl" />
                        </button>
                        <h1 className="text-3xl font-bold">
                            {t('cookies_policy')}
                        </h1>
                        <div className="w-8"></div>
                    </div>
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
                        , utilizamos cookies y tecnologías similares para
                        asegurar el correcto funcionamiento de nuestro sitio web
                        y mejorar la experiencia de usuario. Esta política
                        explica qué son las cookies, cómo las utilizamos, y las
                        opciones que tienes para gestionarlas.
                    </p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        ¿Qué son las cookies?
                    </h2>
                    <p className="mb-4">
                        Las cookies son pequeños archivos de texto que se
                        almacenan en tu dispositivo cuando visitas un sitio web.
                        Son ampliamente utilizadas para hacer que los sitios web
                        funcionen de manera más eficiente, así como para
                        proporcionar información a los propietarios del sitio.
                    </p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        Tipos de cookies que utilizamos
                    </h2>
                    <h3 className="mb-2 mt-4 text-xl font-semibold">
                        1. Cookies técnicas esenciales
                    </h3>
                    <p className="mb-4">
                        Estas cookies son necesarias para que nuestro sitio web
                        funcione correctamente y te permiten navegar por él y
                        utilizar sus funciones esenciales. Sin estas cookies,
                        algunos servicios en nuestro sitio no funcionarían
                        correctamente.
                    </p>
                    <ul className="mb-4 ml-6 list-disc">
                        <li>
                            <strong>Cookies de sesión:</strong> Mantienen tu
                            sesión activa mientras navegas por el sitio.
                        </li>
                        <li>
                            <strong>Cookies de autenticación:</strong> Facilitan
                            el inicio de sesión y mantienen tu sesión activa,
                            especialmente cuando usas{' '}
                            <a
                                href="https://policies.google.com/privacy"
                                className="text-blue-600"
                            >
                                Google SSO
                            </a>{' '}
                            y{' '}
                            <a
                                href="https://docs.github.com/en/github/authenticating-to-github/githubs-privacy-statement"
                                className="text-blue-600"
                            >
                                GitHub SSO
                            </a>
                            .
                        </li>
                    </ul>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        Servicios de terceros
                    </h2>
                    <p className="mb-4">
                        Nuestro sitio web está alojado en{' '}
                        <a
                            href="https://vercel.com"
                            className="text-blue-600"
                        >
                            Vercel
                        </a>
                        , y el dominio es proporcionado por{' '}
                        <a
                            href="https://www.godaddy.com"
                            className="text-blue-600"
                        >
                            GoDaddy
                        </a>
                        . Además, utilizamos{' '}
                        <a
                            href="https://www.mongodb.com"
                            className="text-blue-600"
                        >
                            MongoDB
                        </a>{' '}
                        para alojar y gestionar nuestra base de datos y{' '}
                        <a
                            href="https://cloudinary.com/"
                            className="text-blue-600"
                        >
                            Cloudinary
                        </a>{' '}
                        para almacenar y gestionar las imágenes que subes. Estos
                        proveedores pueden utilizar cookies en sus servicios.
                        Revisa sus políticas de privacidad para más detalles
                        sobre cómo gestionan las cookies:
                    </p>
                    <ul className="mb-4 ml-6 list-disc">
                        <li>
                            <a
                                href="https://vercel.com/legal/privacy-policy"
                                className="text-blue-600"
                            >
                                Política de Privacidad de Vercel
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.godaddy.com/legal/agreements/privacy-policy"
                                className="text-blue-600"
                            >
                                Política de Privacidad de GoDaddy
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.mongodb.com/legal/privacy-policy"
                                className="text-blue-600"
                            >
                                Política de Privacidad de MongoDB
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://cloudinary.com/privacy"
                                className="text-blue-600"
                            >
                                Política de Privacidad de Cloudinary
                            </a>
                        </li>
                    </ul>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        ¿Cómo puedes gestionar las cookies?
                    </h2>
                    <p className="mb-4">
                        Dado que solo utilizamos cookies técnicas esenciales, no
                        es necesario obtener tu consentimiento para su uso. Sin
                        embargo, puedes configurar tu navegador para bloquear o
                        alertarte sobre estas cookies, aunque al hacerlo,
                        algunas partes del sitio podrían no funcionar
                        correctamente.
                    </p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        Cambios en la Política de Cookies
                    </h2>
                    <p className="mb-4">
                        Podemos actualizar esta política de cookies para
                        reflejar cambios en nuestras prácticas o por otras
                        razones operativas, legales o regulatorias. Te
                        recomendamos que revises esta política periódicamente
                        para estar informado sobre cómo utilizamos las cookies.
                    </p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        Contacto
                    </h2>
                    <p>
                        Si tienes alguna pregunta sobre nuestra política de
                        cookies, puedes contactarnos a través de{' '}
                        <a
                            href="mailto:jbonetv5@gmail.com"
                            className="text-blue-600"
                        >
                            jbonetv5@gmail.com
                        </a>{' '}
                        o visitar nuestra{' '}
                        <a
                            href="/politica-de-privacidad"
                            className="text-blue-600"
                        >
                            Política de Privacidad
                        </a>{' '}
                        para más información.
                    </p>
                </div>
            </div>
        </Container>
    );
};

export default CookiesPolicy;
