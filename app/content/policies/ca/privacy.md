---
title: 'Política de Privacitat'
description: 'Política de Privacitat de Jorbites'
---

Última actualització: 25 de novembre de 2026

Aquesta Política de Privacitat explica com **Jorbites** ("nosaltres", "nostre" o "ens") recopila, utilitza, emmagatzema i divulga la vostra informació personal quan utilitzeu el nostre lloc web, accessible a [https://jorbites.com](https://jorbites.com) (el "Lloc Web"), i els nostres microserveis associats (col·lectivament, la "Plataforma").

## 1. Responsable del Tractament

La Plataforma és un projecte comunitari independent i de codi obert operat per **Jordi Bonet** ("Jorbites").

- **Correu de contacte**: [jbonetv5@gmail.com](mailto:jbonetv5@gmail.com)
- **Lloc Web**: [https://jorbites.com](https://jorbites.com)

## 2. Informació que Recopilem

Recopilem únicament la informació necessària per operar, protegir i millorar la Plataforma:

- **Dades d'Usuari i Compte**:
  - **Identificació i Contacte**: Nom, adreça de correu electrònic, imatge de perfil i dades públiques opcionals del perfil (biografia, lloc web i perfils socials com Instagram, X/Twitter, YouTube i TikTok).
  - **Autenticació i Seguretat**: Autenticació mitjançant proveïdors OAuth de tercers ([Google SSO](https://policies.google.com/privacy), [GitHub SSO](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement)) o credencials de correu/contrasenya (les contrasenyes es xifren amb hash i sal mitjançant bcrypt), tokens de restabliment de contrasenya (emmagatzemats amb hash) i secrets opcionals d'autenticació en dos passos (2FA, xifrats en repòs amb AES-256-GCM) juntament amb codis de recuperació amb hash.
  - **Preferències i Ajustos**: Idioma d'interfície (`en`, `es`, `ca`), tema visual (`dark`/`light`), preferències de visibilitat del perfil i preferències de notificacions per correu electrònic i push.
- **Dades d'Activitat i Contingut de l'Usuari**:
  - **Receptes i Contingut Comunitari**: Receptes que creeu, editeu, versionegeu o deseu a preferits; esborranys individuals o col·laboratius; cooksnaps; comentaris i valoracions; missions (quests); llistes personalitzades i planificacions setmanals; tallers (workshops) i registres d'assistència; i vots de receptes setmanals/mensuals/anuals.
  - **Cursos i Certificats**: Certificats de finalització de cursos sol·licitats per vós (amb el nom mostrat que proporcioneu, títol del curs i data d'emissió). Els certificats emesos són verificables públicament mitjançant el seu enllaç únic.
  - **Nivells i Insígnies**: Mètriques d'activitat (creació de receptes, interaccions, missions completades) processades per calcular nivells d'usuari i atorgar insígnies.
- **Arxius Multimèdia**: Les imatges que carregueu (avatars, receptes, cooksnaps, comentaris, tallers) s'emmagatzemen i serveixen a través de [Cloudinary](https://cloudinary.com/privacy) i [Cloudflare R2](https://www.cloudflare.com/privacypolicy/).
- **Subscripcions Web Push (Opcional)**: Si activeu expressament les notificacions push del navegador, emmagatzemem l'endpoint de subscripció del vostre navegador i les claus criptogràfiques (`p256dh`, `auth`) per lliurar notificacions a través del servei push del fabricant del vostre navegador.
- **Analítica Agregada d'Ús i Funcionalitats**: Mètriques d'interacció estrictament anònimes i sense cookies (rutes de pàgina normalitzades, ús de funcionalitats com eines de cuina o filtres de cerca, idioma d'interfície, tipus de dispositiu general, codi de país i domini de referència). **No** adjuntem identificadors d'usuari, adreces electròniques, adreces IP, cookies ni identificadors d'emmagatzematge del navegador a aquests esdeveniments analítics, i respectem el senyal `Do Not Track` (`DNT`) del navegador.

Tingueu en compte que els perfils públics, receptes públiques, llistes públiques i tallers públics poden ser indexats per motors de cerca (inclòs mitjançant el nostre sitemap XML i [IndexNow](https://www.indexnow.org/)).

## 3. Processament per Intel·ligència Artificial i Microserveis

La nostra Plataforma integra microserveis automatitzats en segon pla, telemetria i tecnologies d'IA per millorar la funcionalitat:

- **Processament d'IA (Google Gemini API)**: Quan utilitzeu funcionalitats assistides per IA, les entrades i descripcions són processades a través de l'API de Google Gemini d'acord amb la [Política de Privacitat de Google](https://policies.google.com/privacy).
- **Auditoria Automatitzada de Receptes (Tagatoni)**: Les receptes compartides públicament es processen mitjançant el nostre microservei automatitzat (*Tagatoni*) utilitzant l'API de Google Gemini per estimar dades nutricionals (calories i macronutrients), detectar etiquetes dietètiques/al·lèrgens i classificar categories de cuina.
- **Gamificació i Insígnies (Badge Forge)**: Les vostres mètriques d'activitat es processen de forma asíncrona pel nostre servei *Badge Forge* per calcular els nivells d'usuari i atorgar insígnies.
- **Notificacions Transaccionals i Voluntàries (Jorbites Notifier)**: Els restabliments de contrasenya, missatges de seguretat i notificacions d'activitat activades voluntàriament (correu i push) s'envien a través del nostre servei *Jorbites Notifier*.
- **Còpies de Seguretat (Pantry Keeper)**: Les còpies de seguretat de la base de dades són gestionades pel nostre sistema automatitzat (*Pantry Keeper*) per prevenir pèrdues de dades i garantir la resiliència.
- **Registres del Servidor i Diagnòstic (Axiom)**: Els registres tècnics del sistema, diagnòstic d'errors i mètriques de rendiment es processen mitjançant [Axiom](https://axiom.co/legal/privacy). Minimitzem les dades personals als registres i evitem registrar adreces de correu electrònic o contrasenyes en text pla.
- **Agregació d'Analítica sense Cookies (Kafkaroni)**: Els esdeveniments anònims d'ús de funcionalitats transmesos mitjançant [Aiven](https://aiven.io/privacy) (tòpic `analytics-events`) s'agreguen pel nostre servei intern *Kafkaroni* en resums diaris emmagatzemats en una base de dades aïllada de [Turso](https://turso.tech/privacy-policy) (regió UE) sense informació personalment identificable.

## 4. Bases Jurídiques del Tractament (RGPD Art. 6)

En tractar dades personals d'acord amb el RGPD, ens emparem en les següents bases jurídiques:

- **Execució d'un Contracte (Art. 6(1)(b))**: Registre de compte, autenticació, allotjament de receptes, llistes, planificacions, tallers, esborranys col·laboratius, certificats i restabliments de contrasenya.
- **Consentiment (Art. 6(1)(a))**: Enviament de correus opcionals d'activitat (`emailNotifications`, desactivat per defecte) i notificacions Web Push del navegador. Podeu retirar el vostre consentiment en qualsevol moment des de la configuració del compte sense afectar la licitud del tractament previ.
- **Interès Legítim (Art. 6(1)(f))**: Protecció de la Plataforma enfront d'abusos i atacs de força bruta (inclosa la limitació transitòria de sol·licituds per IP mitjançant Upstash Redis), diagnòstic d'errors i rendiment (Axiom i Vercel Speed Insights), enriquiment automatitzat de metadades de receptes (*Tagatoni*), gamificació (*Badge Forge*) i analítica agregada sense cookies (*Kafkaroni*) sense seguiment entre llocs ni elaboració de perfils individuals.
- **Obligació Legal (Art. 6(1)(c))**: Compliment de deures legals aplicables, requeriments d'autoritats o procediments de notificació i retirada de continguts il·lícits.

## 5. Proveïdors de Serveis de Tercers i Transferències Internacionals

**No** venem ni lloguem les vostres dades personals. Compartim dades únicament amb proveïdors necessaris per operar la Plataforma:

- **Allotjament i Infraestructura**: [Vercel](https://vercel.com/legal/privacy-policy), [Hostinger](https://www.hostinger.com/privacy).
- **Bases de Dades i Memòria Catxé**: [MongoDB](https://www.mongodb.com/legal/privacy-policy), [Upstash Redis](https://upstash.com/trust/privacy.pdf), [Turso](https://turso.tech/privacy-policy) (regió UE per a analítica anònima).
- **Streaming d'Esdeveniments**: [Aiven](https://aiven.io/privacy) (Kafka gestionat).
- **Emmagatzematge i Lliurament Multimèdia**: [Cloudinary](https://cloudinary.com/privacy), [Cloudflare R2](https://www.cloudflare.com/privacypolicy/).
- **Registres i Telemetria de Diagnòstic**: [Axiom](https://axiom.co/legal/privacy).
- **IA i Rendiment**: [Google Gemini API](https://policies.google.com/privacy), [Vercel Speed Insights](https://vercel.com/legal/privacy-policy).
- **Lliurament Web Push (Només si l'activeu)**: Passarel·les push del fabricant del vostre navegador/dispositiu (Google FCM, Apple APNs, Mozilla Push, Microsoft WNS o Samsung Push).

Alguns d'aquests proveïdors estan ubicats o processen dades fora de l'Espai Econòmic Europeu (EEE), inclosos els Estats Units. Quan es fan transferències internacionals de dades personals, aquestes s'emparen en decisions d'adequació (com el **Marc de Privacitat de Dades UE–EUA**) i/o en les **Clàusules Contractuals Tipus (SCC) de la Comissió Europea** amb garanties de seguretat complementàries.

## 6. Drets de Protecció de Dades (RGPD i LOPDGDD)

D'acord amb el RGPD i la normativa aplicable, disposeu dels següents drets:

- **Accés (Art. 15)**: Sol·licitar confirmació i una còpia de les dades personals que tractem sobre vós.
- **Rectificació (Art. 16)**: Corregir dades personals inexactes o incompletes (molts camps es poden editar directament des de la configuració del compte).
- **Supressió / Eliminació (Art. 17)**: Eliminar el vostre compte directament des de la configuració del compte o sol·licitar la supressió completa de les vostres dades personals.
- **Limitació del Tractament (Art. 18)**: Sol·licitar la limitació del tractament de les vostres dades en determinades circumstàncies.
- **Portabilitat de les Dades (Art. 20)**: Rebre les vostres dades personals en un format estructurat, d'ús comú i lectura mecànica.
- **Oposició (Art. 21)**: Oposar-vos al tractament basat en l'interès legítim.
- **Retirada del Consentiment (Art. 7(3))**: Retirar en qualsevol moment el vostre consentiment per a notificacions per correu o push des de la configuració del compte.
- **Presentar una Reclamació (Art. 77)**: Presentar una reclamació davant l'autoritat de control competent, com l'**Agència Espanyola de Protecció de Dades (AEPD)** a [https://www.aepd.es](https://www.aepd.es).

Per exercir qualsevol d'aquests drets, contacteu-nos a [jbonetv5@gmail.com](mailto:jbonetv5@gmail.com). Respondrem en el termini màxim d'un mes conforme al RGPD.

## 7. Seguretat i Conservació de Dades

Implementem mesures tècniques i organitzatives com xifratge HTTPS/HSTS en trànsit, contrasenyes amb hash bcrypt, xifratge AES-256-GCM per a secrets 2FA, limitació de sol·licituds i controls d'accés estrictes per a llistes, planificacions i tallers privats.

Conservem les dades segons els següents criteris:

- **Compte i Contingut de l'Usuari**: Es conserven mentre el vostre compte romangui actiu. Quan elimineu el vostre compte, eliminem immediatament el registre del compte, el contingut associat a la base de dades, les participacions en tallers, els vots de receptes i els esborranys actius a Redis. Els arxius multimèdia associats emmagatzemats a Cloudinary i Cloudflare R2 es depuren de manera asíncrona en un termini màxim de 30 dies (o de manera immediata prèvia sol·licitud per correu electrònic).
- **Esborranys Col·laboratius i Individuals (Upstash Redis)**: Els esborranys temporals caduquen automàticament segons el seu temps de vida configurat (TTL) o s'eliminen en publicar-se la recepta o eliminar-se el compte.
- **Comptadors de Limitació de Sol·licituds (Upstash Redis)**: Els identificadors transitoris d'IP/usuari caduquen automàticament en minuts o hores.
- **Registres del Servidor (Axiom)**: Els registres tècnics de diagnòstic es conserven de manera rotativa a curt termini per a depuració i seguretat.
- **Còpies de Seguretat Automatitzades (Pantry Keeper)**: Les còpies de seguretat xifrades roten periòdicament i s'eliminen automàticament en expirar.
- **Analítica Anònima (Turso)**: Conté exclusivament mètriques diàries agregades i no personals, sense identificadors d'usuari.

## 8. Privacitat de Menors

La Plataforma no està adreçada a menors que no assoleixin l'edat mínima aplicable de consentiment digital (**14 anys a Espanya**, o entre **13 i 16 anys** segons el vostre país de residència; en cap cas menor de **13 anys** a escala mundial). No recopilem intencionadament dades personals de menors per sota d'aquesta edat. Si creieu que un menor ha creat un compte, contacteu-nos a [jbonetv5@gmail.com](mailto:jbonetv5@gmail.com) per eliminar-lo immediatament.

## 9. Canvis en Aquesta Política

Podem actualitzar aquesta Política de Privacitat periòdicament. Publicarem qualsevol canvi en aquesta pàgina amb la data d'"Última actualització" revisada.

## 10. Contacte

Si teniu qualsevol pregunta sobre aquesta Política de Privacitat o voleu exercir els vostres drets de privacitat, contacteu-nos a [jbonetv5@gmail.com](mailto:jbonetv5@gmail.com).
