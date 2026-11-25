---
title: 'Política de Cookies'
description: 'Política de Cookies de Jorbites'
---

Última actualització: 25 de novembre de 2026

Aquesta Política de Cookies explica com **Jorbites** ("nosaltres", "nostre" o "ens") utilitza cookies, emmagatzematge local del navegador (`localStorage` / `sessionStorage`) i service workers al nostre lloc web, accessible a [https://jorbites.com](https://jorbites.com) (el "Lloc Web").

## 1. Què són les cookies i l'emmagatzematge local?

Les cookies són petits fitxers de text que s'emmagatzemen al vostre dispositiu quan visiteu un lloc web. Les tecnologies d'emmagatzematge del navegador (com `localStorage`, `sessionStorage` d'HTML5 i Service Workers) permeten conservar l'estat essencial de l'aplicació, recordar les vostres preferències i oferir funcionalitats activades expressament per vós (com les notificacions Web Push opcionals).

## 2. Cookies i Emmagatzematge que Utilitzem

**No** utilitzem cookies publicitàries, cookies de seguiment entre llocs ni píxels de màrqueting de tercers.

### A. Cookies Tècniques Essencials (Estrictament Necessàries)

Aquestes cookies i tokens de seguretat són necessaris perquè el Lloc Web funcioni de manera segura. Permeten l'autenticació, mantenen la vostra sessió i protegeixen contra vulnerabilitats com atacs CSRF. No es poden desactivar sense afectar l'inici de sessió.

- **`next-auth.session-token` / `__Secure-next-auth.session-token`**: Identifica la vostra sessió d'usuari autenticat (Tipus: Cookie essencial HTTP-only, Caducitat: 30 dies).
- **`next-auth.csrf-token` / `__Host-next-auth.csrf-token`**: Protecció CSRF per a formularis i sol·licituds API d'autenticació (Tipus: Cookie essencial, Caducitat: Sessió).
- **`next-auth.callback-url` / `__Secure-next-auth.callback-url`**: Emmagatzema l'URL de redirecció durant l'inici de sessió OAuth (Google/GitHub) (Tipus: Cookie essencial, Caducitat: Sessió).
- **`i18next`**: Recorda l'idioma d'interfície seleccionat (`en`, `es`, `ca`) per a les pàgines renderitzades al servidor (Tipus: Cookie funcional, Caducitat: 1 any / `max-age=31536000`).

### B. Emmagatzematge Funcional i de Preferències (`localStorage` i `sessionStorage`)

Utilitzem l'emmagatzematge del navegador de manera local al vostre dispositiu per conservar preferències i estats d'interfície sol·licitats per vós:

- **`theme`** (`localStorage`, Persistent): Recorda la vostra preferència de tema visual (Mode Fosc / Mode Clar).
- **`i18nextLng`** (`localStorage`, Persistent): Emmagatzema el vostre idioma preferit d'interfície (Anglès, Espanyol, Català).
- **Claus de Progrés de Cursos** (`localStorage`, Persistent): Desa localment el vostre progrés per mòduls als cursos interactius de cuina de Jorbites.
- **Estat de la Llista de Verificació de Receptes** (`localStorage`, Persistent): Recorda els ingredients i passos marcats mentre cuineu una recepta.
- **Preferències d'Àudio de la Guia de Cuina** (`localStorage`, Persistent): Desa la vostra preferència de música/àudio ambiental a la Guia de Cuina pas a pas.
- **`commentSortOrder`** (`localStorage`, Persistent): Recorda la vostra preferència d'ordenació de comentaris a les receptes.
- **Estat de Sessió de Bite Cards** (`sessionStorage`, Sessió de pestanya): Conserva la posició actual de la baralla mentre exploreu Bite Cards.
- **Token de Finalització de Curs** (`sessionStorage`, Sessió de pestanya): Emmagatzema temporalment el token signat d'aprovació del qüestionari en generar un certificat de curs.

### C. Service Worker i Web Push (Només si l'activeu)

- **`/sw.js` (Service Worker)**: Es registra únicament quan activeu explícitament les notificacions push del navegador des de la Configuració del Compte. Escolta els missatges Web Push entrants i obre la pàgina corresponent de Jorbites en fer-hi clic. Podeu desactivar les notificacions push en qualsevol moment des de la Configuració del Compte o els ajustos del vostre navegador.

### D. Analítica sense Cookies i Rendiment

Utilitzem [Vercel Speed Insights](https://vercel.com/docs/speed-insights) per mesurar mètriques de rendiment agregades (temps de càrrega de pàgines i Web Vitals) i el nostre propi sistema d'analítica d'interaccions sense cookies (*Kafkaroni*) per mesurar l'ús agregat de funcionalitats. Cap d'aquests sistemes estableix cookies d'analítica, llegeix o escriu a `localStorage`/`sessionStorage`, emmagatzema adreces IP ni rastreja usuaris entre llocs web. El nostre client analític també respecta automàticament la configuració `Do Not Track` (`DNT`) del vostre navegador.

## 3. Infraestructura de Tercers

El nostre Lloc Web depèn de proveïdors d'infraestructura de tercers que processen connexions de xarxa tècniques estàndard:

- **Allotjament**: [Política de Privacitat de Vercel](https://vercel.com/legal/privacy-policy), [Política de Privacitat de Hostinger](https://www.hostinger.com/privacy)
- **Base de Dades i Memòria Catxé**: [Política de Privacitat de MongoDB](https://www.mongodb.com/legal/privacy-policy), [Política de Privacitat d'Upstash](https://upstash.com/trust/privacy.pdf), [Política de Privacitat de Turso](https://turso.tech/privacy-policy)
- **Streaming d'Esdeveniments**: [Política de Privacitat d'Aiven](https://aiven.io/privacy)
- **Emmagatzematge Multimèdia**: [Política de Privacitat de Cloudinary](https://cloudinary.com/privacy), [Política de Privacitat de Cloudflare](https://www.cloudflare.com/privacypolicy/)
- **Registres i Monitorització**: [Política de Privacitat d'Axiom](https://axiom.co/legal/privacy)

## 4. Com Gestionar les Cookies i l'Emmagatzematge del Navegador

Podeu esborrar les cookies, `localStorage`, `sessionStorage` i Service Workers en qualsevol moment a través de la configuració del vostre navegador web:

- **Chrome**: Configuració -> Privacitat i seguretat -> Cookies i altres dades de llocs
- **Firefox**: Configuració -> Privacitat i seguretat -> Cookies i dades del lloc
- **Safari**: Configuració -> Privacitat -> Gestionar dades de llocs web

*Nota: Desactivar o esborrar les cookies essencials tancarà la sessió del vostre compte de Jorbites, i esborrar l'emmagatzematge local restablirà preferències desades com el tema visual, llistes de verificació i progrés local de cursos.*

## 5. Canvis en Aquesta Política

Podem actualitzar aquesta Política de Cookies periòdicament. Publicarem qualsevol canvi en aquesta pàgina amb la data d'"Última actualització" revisada.

## 6. Contacte

Si teniu qualsevol pregunta sobre aquesta Política de Cookies, podeu contactar-nos a [jorbites.app@gmail.com](mailto:jorbites.app@gmail.com) o consultar la nostra [Política de Privacitat](/policies/privacy).
