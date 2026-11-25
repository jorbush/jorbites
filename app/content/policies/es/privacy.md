---
title: 'Política de Privacidad'
description: 'Política de Privacidad de Jorbites'
---

Última actualización: 25 de noviembre de 2026

Esta Política de Privacidad explica cómo **Jorbites** ("nosotros", "nuestro" o "nos") recopila, utiliza, almacena y divulga su información personal cuando utiliza nuestro sitio web, accesible en [https://jorbites.com](https://jorbites.com) (el "Sitio Web"), y nuestros microservicios asociados (colectivamente, la "Plataforma").

## 1. Responsable del Tratamiento

La Plataforma es un proyecto comunitario independiente y de código abierto operado por **Jorbites** ("Responsable del Tratamiento").

- **Correo de contacto**: [jorbites.app@gmail.com](mailto:jorbites.app@gmail.com)
- **Sitio Web**: [https://jorbites.com](https://jorbites.com)

## 2. Información que Recopilamos

Recopilamos únicamente la información necesaria para operar, proteger y mejorar la Plataforma:

- **Datos de Usuario y Cuenta**:
  - **Identificación y Contacto**: Nombre, dirección de correo electrónico, imagen de perfil y datos públicos opcionales del perfil (biografía, sitio web y perfiles sociales como Instagram, X/Twitter, YouTube y TikTok).
  - **Autenticación y Seguridad**: Autenticación a través de proveedores OAuth de terceros ([Google SSO](https://policies.google.com/privacy), [GitHub SSO](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement)) o credenciales de correo/contraseña (las contraseñas se cifran con hash y sal mediante bcrypt), tokens de restablecimiento de contraseña (almacenados con hash) y secretos opcionales de autenticación en dos pasos (2FA, cifrados en reposo con AES-256-GCM) junto con códigos de respaldo con hash.
  - **Preferencias y Ajustes**: Idioma de interfaz (`en`, `es`, `ca`), tema visual (`dark`/`light`), preferencias de visibilidad del perfil y preferencias de notificaciones por correo electrónico y push.
- **Datos de Actividad y Contenido del Usuario**:
  - **Recetas y Contenido Comunitario**: Recetas que crea, edita, versiona o guarda en favoritos; borradores individuales o colaborativos; cooksnaps; comentarios y valoraciones; misiones (quests); listas personalizadas y planificaciones semanales; talleres (workshops) y registros de asistencia; y votos de recetas semanales/mensuales/anuales.
  - **Cursos y Certificados**: Certificados de finalización de cursos solicitados por usted (con el nombre mostrado que proporcione, título del curso y fecha de emisión). Los certificados emitidos son verificables públicamente mediante su enlace único.
  - **Niveles e Insignias**: Métricas de actividad (creación de recetas, interacciones, misiones completadas) procesadas para calcular niveles de usuario y otorgar insignias.
- **Archivos Multimedia**: Las imágenes que carga (avatares, recetas, cooksnaps, comentarios, talleres) se almacenan y sirven a través de [Cloudinary](https://cloudinary.com/privacy) y [Cloudflare R2](https://www.cloudflare.com/privacypolicy/).
- **Suscripciones Web Push (Opcional)**: Si activa expresamente las notificaciones push del navegador, almacenamos el endpoint de suscripción de su navegador y las claves criptográficas (`p256dh`, `auth`) para entregar notificaciones a través del servicio push del fabricante de su navegador.
- **Analítica Agregada de Uso y Funciones**: Métricas de interacción estrictamente anónimas y sin cookies (rutas de página normalizadas, uso de funciones como herramientas de cocina o filtros de búsqueda, idioma de interfaz, tipo de dispositivo general, código de país y dominio de referencia). **No** adjuntamos identificadores de usuario, correos electrónicos, direcciones IP, cookies ni identificadores de almacenamiento del navegador a estos eventos analíticos, y respetamos la señal `Do Not Track` (`DNT`) del navegador.

Tenga en cuenta que los perfiles públicos, recetas públicas, listas públicas y talleres públicos pueden ser indexados por motores de búsqueda (incluido a través de nuestro sitemap XML e [IndexNow](https://www.indexnow.org/)).

## 3. Procesamiento por Inteligencia Artificial y Microservicios

Nuestra Plataforma integra microservicios automatizados en segundo plano, telemetría y tecnologías de IA para mejorar la funcionalidad:

- **Procesamiento de IA (Google Gemini API)**: Cuando utiliza funciones asistidas por IA, las entradas y descripciones son procesadas a través de la API de Google Gemini de acuerdo con la [Política de Privacidad de Google](https://policies.google.com/privacy).
- **Auditoría Automatizada de Recetas (Tagatoni)**: Las recetas compartidas públicamente se procesan mediante nuestro microservicio automatizado (*Tagatoni*) usando la API de Google Gemini para estimar datos nutricionales (calorías y macronutrientes), detectar etiquetas dietéticas/alérgenos y clasificar categorías de cocina.
- **Gamificación e Insignias (Badge Forge)**: Sus métricas de actividad son procesadas de forma asíncrona por nuestro servicio *Badge Forge* para calcular los niveles de usuario y otorgar insignias.
- **Notificaciones Transaccionales y Voluntarias (Jorbites Notifier)**: Los restablecimientos de contraseña, mensajes de seguridad y notificaciones de actividad activadas voluntariamente (correo y push) se envían a través de nuestro servicio *Jorbites Notifier*.
- **Copias de Seguridad (Pantry Keeper)**: Las copias de seguridad de la base de datos son gestionadas por nuestro sistema automatizado (*Pantry Keeper*) para prevenir pérdida de datos y garantizar la resiliencia.
- **Registros del Servidor y Diagnóstico (Axiom)**: Los registros técnicos del sistema, diagnóstico de errores y métricas de rendimiento son procesados mediante [Axiom](https://axiom.co/legal/privacy). Minimizamos los datos personales en los registros y evitamos registrar correos electrónicos o contraseñas en texto plano.
- **Agregación de Analítica sin Cookies (Kafkaroni)**: Los eventos anónimos de uso de funciones transmitidos mediante [Aiven](https://aiven.io/privacy) (tópico `analytics-events`) se agregan mediante nuestro servicio interno *Kafkaroni* en resúmenes diarios almacenados en una base de datos aislada de [Turso](https://turso.tech/privacy-policy) (región UE) sin información personalmente identificable.

## 4. Bases Jurídicas del Tratamiento (RGPD Art. 6)

Al tratar datos personales conforme al RGPD, nos amparamos en las siguientes bases jurídicas:

- **Ejecución de un Contrato (Art. 6(1)(b))**: Registro de cuenta, autenticación, alojamiento de recetas, listas, planificaciones, talleres, borradores colaborativos, certificados y restablecimientos de contraseña.
- **Consentimiento (Art. 6(1)(a))**: Envío de correos opcionales de actividad (`emailNotifications`, desactivado por defecto) y notificaciones Web Push del navegador. Puede retirar su consentimiento en cualquier momento desde la configuración de su cuenta sin afectar a la licitud del tratamiento previo.
- **Interés Legítimo (Art. 6(1)(f))**: Protección de la Plataforma frente a abusos y ataques de fuerza bruta (incluida la limitación transitoria de solicitudes por IP mediante Upstash Redis), diagnóstico de errores y rendimiento (Axiom y Vercel Speed Insights), enriquecimiento automatizado de metadatos de recetas (*Tagatoni*), gamificación (*Badge Forge*) y analítica agregada sin cookies (*Kafkaroni*) sin seguimiento entre sitios ni elaboración de perfiles individuales.
- **Obligación Legal (Art. 6(1)(c))**: Cumplimiento de deberes legales aplicables, requerimientos de autoridades o procedimientos de notificación y retirada de contenidos ilícitos.

## 5. Proveedores de Servicios de Terceros y Transferencias Internacionales

**No** vendemos ni alquilamos sus datos personales. Compartimos datos únicamente con proveedores necesarios para operar la Plataforma:

- **Alojamiento e Infraestructura**: [Vercel](https://vercel.com/legal/privacy-policy), [Hostinger](https://www.hostinger.com/privacy).
- **Bases de Datos y Caché**: [MongoDB](https://www.mongodb.com/legal/privacy-policy), [Upstash Redis](https://upstash.com/trust/privacy.pdf), [Turso](https://turso.tech/privacy-policy) (región UE para analítica anónima).
- **Streaming de Eventos**: [Aiven](https://aiven.io/privacy) (Kafka gestionado).
- **Almacenamiento y Entrega Multimedia**: [Cloudinary](https://cloudinary.com/privacy), [Cloudflare R2](https://www.cloudflare.com/privacypolicy/).
- **Registros y Telemetría de Diagnóstico**: [Axiom](https://axiom.co/legal/privacy).
- **IA y Rendimiento**: [Google Gemini API](https://policies.google.com/privacy), [Vercel Speed Insights](https://vercel.com/legal/privacy-policy).
- **Entrega Web Push (Solo si lo activa)**: Pasarelas push del fabricante de su navegador/dispositivo (Google FCM, Apple APNs, Mozilla Push, Microsoft WNS o Samsung Push).

Algunos de estos proveedores están ubicados o procesan datos fuera del Espacio Económico Europeo (EEE), incluidos los Estados Unidos. Cuando se realizan transferencias internacionales de datos personales, estas se amparan en decisiones de adecuación (como el **Marco de Privacidad de Datos UE–EE. UU.**) y/o en las **Cláusulas Contractuales Tipo (SCC) de la Comisión Europea** con garantías de seguridad complementarias.

## 6. Derechos de Protección de Datos (RGPD y LOPDGDD)

Conforme al RGPD y la normativa aplicable, usted dispone de los siguientes derechos:

- **Acceso (Art. 15)**: Solicitar confirmación y una copia de los datos personales que tratamos sobre usted.
- **Rectificación (Art. 16)**: Corregir datos personales inexactos o incompletos (muchos campos pueden editarse directamente desde la configuración de su cuenta).
- **Supresión / Eliminación (Art. 17)**: Eliminar su cuenta directamente desde la configuración de la cuenta o solicitar la supresión completa de sus datos personales.
- **Limitación del Tratamiento (Art. 18)**: Solicitar la limitación del tratamiento de sus datos en determinadas circunstancias.
- **Portabilidad de los Datos (Art. 20)**: Recibir sus datos personales en un formato estructurado, de uso común y lectura mecánica.
- **Oposición (Art. 21)**: Oponerse al tratamiento basado en el interés legítimo.
- **Retirada del Consentimiento (Art. 7(3))**: Retirar en cualquier momento su consentimiento para notificaciones por correo o push desde la configuración de la cuenta.
- **Presentar una Reclamación (Art. 77)**: Presentar una reclamación ante la autoridad de control competente, como la **Agencia Española de Protección de Datos (AEPD)** en [https://www.aepd.es](https://www.aepd.es).

Para ejercer cualquiera de estos derechos, contáctenos en [jorbites.app@gmail.com](mailto:jorbites.app@gmail.com). Responderemos en el plazo máximo de un mes conforme al RGPD.

## 7. Seguridad y Conservación de Datos

Implementamos medidas técnicas y organizativas como cifrado HTTPS/HSTS en tránsito, contraseñas con hash bcrypt, cifrado AES-256-GCM para secretos 2FA, limitación de solicitudes y controles de acceso estrictos para listas, planificaciones y talleres privados.

Conservamos los datos según los siguientes criterios:

- **Cuenta y Contenido del Usuario**: Se conservan mientras su cuenta permanezca activa. Cuando elimina su cuenta, eliminamos de inmediato su registro de cuenta, el contenido asociado en la base de datos, sus participaciones en talleres, votos de recetas y borradores activos en Redis. Los archivos multimedia asociados almacenados en Cloudinary y Cloudflare R2 se depuran de forma asíncrona en un plazo máximo de 30 días (o de forma inmediata previa solicitud por correo electrónico).
- **Borradores Colaborativos e Individuales (Upstash Redis)**: Los borradores temporales caducan automáticamente según su tiempo de vida configurado (TTL) o se eliminan al publicarse la receta o eliminarse la cuenta.
- **Contadores de Limitación de Solicitudes (Upstash Redis)**: Los identificadores transitorios de IP/usuario caducan automáticamente en minutos u horas.
- **Registros del Servidor (Axiom)**: Los registros técnicos de diagnóstico se conservan de forma rotativa a corto plazo para depuración y seguridad.
- **Copias de Seguridad Automatizadas (Pantry Keeper)**: Las copias de seguridad cifradas rotan periódicamente y se eliminan automáticamente al expirar.
- **Analítica Anónima (Turso)**: Contiene exclusivamente métricas diarias agregadas y no personales, sin identificadores de usuario.

## 8. Privacidad de Menores

La Plataforma no está dirigida a menores que no alcancen la edad mínima aplicable de consentimiento digital (**14 años en España**, o entre **13 y 16 años** según su país de residencia; en ningún caso menor de **13 años** a nivel mundial). No recopilamos intencionadamente datos personales de menores por debajo de dicha edad. Si cree que un menor ha creado una cuenta, contáctenos en [jorbites.app@gmail.com](mailto:jorbites.app@gmail.com) para eliminarla de inmediato.

## 9. Cambios en esta Política

Podemos actualizar esta Política de Privacidad periódicamente. Publicaremos cualquier cambio en esta página con la fecha de "Última actualización" revisada.

## 10. Contacto

Si tiene alguna pregunta sobre esta Política de Privacidad o desea ejercer sus derechos de privacidad, contáctenos en [jorbites.app@gmail.com](mailto:jorbites.app@gmail.com).
