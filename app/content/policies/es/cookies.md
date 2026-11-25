---
title: 'Política de Cookies'
description: 'Política de Cookies de Jorbites'
---

Última actualización: 25 de noviembre de 2026

Esta Política de Cookies explica cómo **Jorbites** ("nosotros", "nuestro" o "nos") utiliza cookies, almacenamiento local del navegador (`localStorage` / `sessionStorage`) y service workers en nuestro sitio web, accesible en [https://jorbites.com](https://jorbites.com) (el "Sitio Web").

## 1. ¿Qué son las cookies y el almacenamiento local?

Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Las tecnologías de almacenamiento del navegador (como `localStorage`, `sessionStorage` de HTML5 y Service Workers) permiten conservar el estado esencial de la aplicación, recordar sus preferencias y ofrecer funciones activadas expresamente por usted (como las notificaciones Web Push opcionales).

## 2. Cookies y Almacenamiento que Utilizamos

**No** utilizamos cookies publicitarias, cookies de seguimiento entre sitios ni píxeles de marketing de terceros.

### A. Cookies Técnicas Esenciales (Estrictamente Necesarias)

Estas cookies y tokens de seguridad son necesarios para que el Sitio Web funcione de forma segura. Permiten la autenticación, mantienen su sesión y protegen contra vulnerabilidades como ataques CSRF. No pueden desactivarse sin afectar al inicio de sesión.

- **`next-auth.session-token` / `__Secure-next-auth.session-token`**: Identifica su sesión de usuario autenticado (Tipo: Cookie esencial HTTP-only, Caducidad: 30 días).
- **`next-auth.csrf-token` / `__Host-next-auth.csrf-token`**: Protección CSRF para formularios y solicitudes API de autenticación (Tipo: Cookie esencial, Caducidad: Sesión).
- **`next-auth.callback-url` / `__Secure-next-auth.callback-url`**: Almacena la URL de redirección durante el inicio de sesión OAuth (Google/GitHub) (Tipo: Cookie esencial, Caducidad: Sesión).
- **`i18next`**: Recuerda el idioma de interfaz seleccionado (`en`, `es`, `ca`) para las páginas renderizadas en servidor (Tipo: Cookie funcional, Caducidad: 1 año / `max-age=31536000`).

### B. Almacenamiento Funcional y de Preferencias (`localStorage` y `sessionStorage`)

Utilizamos el almacenamiento del navegador de forma local en su dispositivo para conservar preferencias y estados de interfaz solicitados por usted:

- **`theme`** (`localStorage`, Persistente): Recuerda su preferencia de tema visual (Modo Oscuro / Modo Claro).
- **`i18nextLng`** (`localStorage`, Persistente): Almacena su idioma preferido de interfaz (Inglés, Español, Catalán).
- **Claves de Progreso de Cursos** (`localStorage`, Persistente): Guarda localmente su avance por módulos en los cursos interactivos de cocina de Jorbites.
- **Estado de Lista de Verificación de Recetas** (`localStorage`, Persistente): Recuerda los ingredientes y pasos marcados mientras cocina una receta.
- **Preferencias de Audio de la Guía de Cocina** (`localStorage`, Persistente): Guarda su preferencia de música/audio ambiental en la Guía de Cocina paso a paso.
- **`commentSortOrder`** (`localStorage`, Persistente): Recuerda su preferencia de ordenación de comentarios en recetas.
- **Estado de Sesión de Bite Cards** (`sessionStorage`, Sesión de pestaña): Conserva la posición actual de la baraja mientras explora Bite Cards.
- **Token de Finalización de Curso** (`sessionStorage`, Sesión de pestaña): Almacena temporalmente el token firmado de aprobación del cuestionario al generar un certificado de curso.

### C. Service Worker y Web Push (Solo si lo activa)

- **`/sw.js` (Service Worker)**: Se registra únicamente cuando usted activa explícitamente las notificaciones push del navegador desde la Configuración de Cuenta. Escucha los mensajes Web Push entrantes y abre la página correspondiente de Jorbites al hacer clic. Puede desactivar las notificaciones push en cualquier momento desde la Configuración de Cuenta o los ajustes de su navegador.

### D. Analítica sin Cookies y Rendimiento

Utilizamos [Vercel Speed Insights](https://vercel.com/docs/speed-insights) para medir métricas de rendimiento agregadas (tiempos de carga de páginas y Web Vitals) y nuestro propio sistema de analítica de interacciones sin cookies (*Kafkaroni*) para medir el uso agregado de funciones. Ninguno de estos sistemas establece cookies de analítica, lee o escribe en `localStorage`/`sessionStorage`, almacena direcciones IP ni rastrea usuarios entre sitios web. Nuestro cliente analítico también respeta automáticamente la configuración `Do Not Track` (`DNT`) de su navegador.

## 3. Infraestructura de Terceros

Nuestro Sitio Web depende de proveedores de infraestructura de terceros que procesan conexiones de red técnicas estándar:

- **Alojamiento**: [Política de Privacidad de Vercel](https://vercel.com/legal/privacy-policy), [Política de Privacidad de Hostinger](https://www.hostinger.com/privacy)
- **Base de Datos y Caché**: [Política de Privacidad de MongoDB](https://www.mongodb.com/legal/privacy-policy), [Política de Privacidad de Upstash](https://upstash.com/trust/privacy.pdf), [Política de Privacidad de Turso](https://turso.tech/privacy-policy)
- **Streaming de Eventos**: [Política de Privacidad de Aiven](https://aiven.io/privacy)
- **Almacenamiento Multimedia**: [Política de Privacidad de Cloudinary](https://cloudinary.com/privacy), [Política de Privacidad de Cloudflare](https://www.cloudflare.com/privacypolicy/)
- **Registros y Monitorización**: [Política de Privacidad de Axiom](https://axiom.co/legal/privacy)

## 4. Cómo Gestionar las Cookies y el Almacenamiento del Navegador

Puede borrar las cookies, `localStorage`, `sessionStorage` y Service Workers en cualquier momento a través de la configuración de su navegador web:

- **Chrome**: Configuración -> Privacidad y seguridad -> Cookies y otros datos de sitios
- **Firefox**: Ajustes -> Privacidad y seguridad -> Cookies y datos del sitio
- **Safari**: Ajustes -> Privacidad -> Gestionar datos de sitios web

*Nota: Desactivar o borrar las cookies esenciales cerrará la sesión de su cuenta de Jorbites, y borrar el almacenamiento local restablecerá preferencias guardadas como el tema visual, listas de verificación y progreso local de cursos.*

## 5. Cambios en esta Política

Podemos actualizar esta Política de Cookies periódicamente. Publicaremos cualquier cambio en esta página con la fecha de "Última actualización" revisada.

## 6. Contacto

Si tiene alguna pregunta sobre esta Política de Cookies, puede contactarnos en [jorbites.app@gmail.com](mailto:jorbites.app@gmail.com) o consultar nuestra [Política de Privacidad](/policies/privacy).
