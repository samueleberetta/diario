# Studio Bicocca — base comune (template)

## Cos'è
Base per 4 app separate, una per corso di Scienze dell'Educazione (Milano-Bicocca):
1. Storia della pedagogia (primo progetto)
2. Pedagogia generale
3. Educazione alla salute, prevenzione e igiene
4. Politiche dei servizi sociali

Questo repo è il **template**: lo sviluppo e lo testo con Storia della pedagogia, poi lo duplico (GitHub "Use this template") per gli altri corsi e personalizzo ogni progetto per conto suo.
Tutto ciò che è specifico del corso sta in `course.config.ts` e in `/content`, non nel codice.

## Riuso nei semestri successivi
Il template deve restare utilizzabile per qualsiasi corso futuro, non solo per i 4 attuali.
- **Repo template pulito** (`studio-template`), separato dalle app dei corsi: nessun contenuto, solo codice e un modulo di esempio. I miglioramenti generali li faccio qui e poi li riporto nelle app dei corsi.
- Nel codice nulla deve dipendere da un corso specifico: nomi, colori, formato d'esame, schema DB e moduli vengono tutti da `course.config.ts`.
- **`npm run new-course`**: script guidato che chiede nome corso, slug, colore, formato e date d'esame, e poi:
  - compila `course.config.ts`, il manifest PWA (nome e icona dell'app)
  - crea la migrazione `create schema <slug>` con le tabelle base, RLS e grant
  - svuota `/appunti/` e `/content/`
  - mi ricorda i passaggi manuali: Exposed schemas su Supabase, nuovo progetto Vercel
- **Fine corso**: dopo l'esame l'app resta online in modalità sola consultazione (`archived: true` in config), con un export completo dei progressi in JSON. Lo schema non si cancella mai in automatico.

## Principio
È preparazione a un esame universitario, non un gioco. L'app deve:
- verificare la **comprensione**, non solo il riconoscimento
- far emergere in modo onesto cosa non so
- rimandarmi sempre agli appunti per approfondire
Niente streak, punti, badge o animazioni celebrative. Interfaccia sobria, leggibile, testo in primo piano.

## Stack
- Next.js (App Router) + TypeScript + Tailwind, deploy su Vercel
- PWA installabile su iPhone, funziona offline (safe area, tipografia leggibile per testi lunghi)
- Progressi: IndexedDB (Dexie) come cache locale offline + sync con Supabase (vedi sezione Database)
- Contenuti in JSON nel repo (`/content/<modulo>.json`), validati con Zod
- Interfaccia in italiano

## Database (Supabase, piano gratuito)
Un **unico progetto Supabase** condiviso dalle 4 app, con i dati di ogni corso **completamente separati**.

- **Uno schema Postgres per corso**: `storia_pedagogia`, `pedagogia_generale`, `educazione_salute`, `politiche_servizi_sociali`. Il nome dello schema sta in `course.config.ts` (`dbSchema`).
- Ogni app legge e scrive **solo nel proprio schema** (`createClient(url, key, { db: { schema } })`). Nessuna query, vista o funzione deve toccare gli schemi degli altri corsi.
- Le tabelle di ogni schema sono indipendenti, quindi ogni app può modificarle senza toccare le altre.
- **Auth condivisa**: un solo utente (io) per tutte le app, con lo stesso login.
- **RLS attiva** su ogni tabella: `user_id = auth.uid()`.
- Migrazioni in `supabase/migrations/`, ognuna limitata al proprio schema (`create schema if not exists <schema>`, poi le tabelle). Al primo setup bisogna aggiungere lo schema agli **Exposed schemas** nelle API settings e fare i grant a `authenticated`. Indicami tu questi passaggi.
- Tabelle base: `card_state` (stato FSRS per carta), `review_log` (storico risposte, inclusi i punti chiave coperti), `open_answers` (risposte aperte scritte, con eventuale correzione).
- I contenuti (carte) **non** vanno nel database: restano nei JSON del repo. Nel database c'è solo il mio stato di studio.
- **Offline-first**: si scrive prima in IndexedDB, poi si sincronizza con Supabase quando c'è rete. In caso di conflitto vince l'`updated_at` più recente, carta per carta.
- Variabili d'ambiente: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, uguali per le 4 app. Lo schema invece viene da `course.config.ts`.
- Piano gratuito: il progetto va in pausa dopo 7 giorni di inattività. L'app deve funzionare lo stesso in locale e sincronizzare quando il progetto torna attivo.

## Livelli di domanda (dal più semplice al più profondo)
1. **Fondamenta** — flashcard e scelta multipla su fatti, date, autori, opere, definizioni. Ogni risposta ha una spiegazione; i distrattori sono plausibili (stesso periodo, stessa corrente, concetti confondibili).
2. **Comprensione** — domande aperte: "Spiega…", "Perché…", "Che ruolo ha…". Scrivo (o penso) la risposta, poi vedo:
   - risposta modello di 5–10 righe
   - checklist dei **punti chiave** che una buona risposta deve contenere
   - mi autovaluto spuntando i punti che avevo detto
3. **Collegamenti** — confronti e relazioni tra autori, correnti, concetti ("Confronta X e Y su…", "Cosa riprende X da Y?", "Come si collega al contesto storico?"). Stessa struttura con risposta modello e punti chiave.
4. **Simulazione d'esame** — domande nel formato dell'esame reale (configurabile: scritto aperto, scelta multipla, orale), a tempo, senza aiuti, con resoconto finale per modulo.

La padronanza di un modulo si misura soprattutto sui livelli 2–3, non sul livello 1.

## Correzione delle risposte aperte (fase opzionale)
Se scrivo una risposta aperta, posso chiedere una correzione via Anthropic API (route server su Vercel, chiave in variabile d'ambiente): confronta la mia risposta con gli appunti e con i punti chiave, dice cosa manca, cosa è impreciso, cosa è sbagliato. Niente voti gonfiati: se la risposta è debole, lo deve dire.

## Struttura carta
`id` stabile, `modulo`, `livello` (1–4), `tipo` (flashcard | scelta_multipla | aperta | confronto | ordine_cronologico | abbinamento), `domanda`, `risposta` / `opzioni`, `spiegazione`, `punti_chiave[]`, `fonte` (sezione esatta degli appunti), `tag[]`.

## Ripetizione dilazionata
- FSRS (`ts-fsrs`) per ogni carta
- Scelta multipla sbagliata = "Di nuovo"; domanda aperta: il voto deriva dalla % di punti chiave coperti
- Le nuove carte di livello 2–3 si sbloccano quando il livello 1 del modulo è stato visto almeno una volta

## Schermate
- **Oggi**: carte da ripassare, moduli più deboli
- **Moduli**: padronanza per modulo e per livello
- **Sessione**: una carta alla volta; per le aperte c'è un campo di testo facoltativo
- **Punti deboli**: carte e punti chiave mancati più spesso, con link alla fonte negli appunti
- **Appunti**: lettura degli appunti per modulo, con le carte collegate a ogni sezione
- **Simulazione d'esame**
- **Impostazioni**: nuove carte al giorno, export/import progressi

## Pipeline contenuti
1. Esporto gli appunti (Google Docs → .md o .docx) in `/appunti/`
2. Claude Code genera `/content/<modulo>.json`
3. Regole:
   - solo contenuti presenti negli appunti; se una cosa manca o è ambigua negli appunti, la segnali invece di inventarla
   - ogni carta con `fonte`
   - per modulo circa: 10–15 livello 1, 6–10 livello 2, 3–6 livello 3
   - italiano accurato e da livello universitario; terminologia corretta
4. `npm run validate-content` controlla schema, id duplicati, fonti mancanti
5. Rigenerare un modulo non azzera i progressi (id stabili)
6. Prima di generare un intero corso, genero un modulo di prova e aspetto il mio ok sulla qualità

### Appunti incrementali
Gli appunti arrivano ogni settimana, man mano che si svolgono le lezioni. Quindi:
- un file per lezione: `/appunti/AAAA-MM-GG-argomento.md`
- `/content/_registro.json` tiene traccia di quali sezioni sono già state trasformate in carte
- l'app gestisce moduli e carte aggiunti nel tempo, e le carte nuove entrano nella coda FSRS come "nuove"
- il comando `/nuovi-appunti` (`.claude/commands/nuovi-appunti.md`) gestisce l'aggiornamento settimanale

## course.config.ts
Nome corso, colore, formato d'esame, date d'esame, elenco moduli, tipi di carta attivi.

## Fasi
1. Scaffold + schema + `course.config.ts` + un modulo di prova di Storia della pedagogia
2. Sessione con livelli 1–3 + FSRS + IndexedDB + login e sync Supabase (schema del corso)
3. Generazione di tutti i moduli di Storia della pedagogia
4. Punti deboli, vista Appunti, simulazione d'esame
5. PWA offline + deploy Vercel
6. (Opzionale) correzione risposte aperte via API

Prima di ogni fase mostrami cosa farai e aspetta la mia conferma.
