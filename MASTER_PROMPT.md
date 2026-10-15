# MASTER PROMPT – Recovery Clinic Bratislava: lead-gen landing page

> **Pre Daniela – ako tento súbor použiť**
> 1. Vytvor prázdny priečinok (napr. `~/Projects/recovery-clinic-lp`) a ulož doň tento súbor ako `MASTER_PROMPT.md`.
> 2. Do toho istého priečinka nakopíruj `logo-recovery-clinic.svg` a `favicon.svg` (dodané spolu s týmto promptom) do podpriečinka `_input/`.
> 3. Z Figmy vyexportuj frame-y ako PNG (pravý panel → Export → PNG 1×) do podpriečinka `design/`:
>    `Desktop – 1440` → `design/desktop.png`, `Mobile – 390` → `design/mobile.png`, `Mobile – prvá obrazovka (390×844)` → `design/mobile-first-screen.png`, `🔁 Stavy & varianty` → `design/states.png`, `🧩 Komponenty & tokeny` → `design/components.png`.
>    (Figma MCP na Starter pláne má mesačný limit, ktorý je už vyčerpaný – Claude Code preto nebude čítať Figmu priamo, ale tieto PNG + špecifikáciu nižšie.)
> 4. Spusti Claude Code v tom priečinku a napíš: **„Prečítaj MASTER_PROMPT.md a postupuj podľa neho. Začni fázou 0."**
> 5. Ak budeš neskôr meniť texty podľa pripomienok klienta, rob to priamo v `index.html` (texty) a `assets/js/config.js` (varianty H1, kontakty, odkazy, zľava).

---

## 0. Tvoja rola a pravidlá práce

Si senior front-end developer so skúsenosťami s performance marketingom (GTM, GA4, Google Ads, Meta Pixel, Consent Mode v2). Staviaš **jednoduchú, rýchlu a dokonale použiteľnú landing page na zber kontaktov** pre IV kliniku v Bratislave. Kód bude upravovať junior PPC špecialista (Daniel), ktorý ovláda základy HTML/CSS/JS – kód musí byť čitateľný a ľahko editovateľný.

**Pravidlá:**
1. **Len čisté HTML, CSS a vanilla JavaScript.** Žiadne frameworky (React, Vue, Tailwind…), žiadny build krok, žiadne runtime npm závislosti. Stránka musí fungovať tak, že sa súbory nahrajú na hosting.
2. **Čitateľnosť nad šikovnosťou.** Komentáre v slovenčine na úrovni sekcií (`<!-- ===== HERO ===== -->`, `/* ===== Formulár ===== */`). CSS premenné pre všetky farby, fonty, medzery a rádiusy. Žiadna minifikácia v repozitári.
3. **Nevymýšľaj fakty.** Používaj len obsah z tohto dokumentu. Ak niečo chýba, vlož placeholder a označ ho `<!-- TODO: … -->` (v JS `// TODO:`). Všetky TODO na konci spíš do README.
4. **Texty v tomto dokumente majú prednosť pred Figmou.** Figma je šablóna pre vizuál (layout, farby, tvary, odstupy). Vo Figme ešte chýba zmienka o 20 % zľave – správne texty sú tu.
5. **Pracuj po fázach (kapitola 14).** Na začiatku použi plan mode, predlož plán a otázky. Po každej fáze: commit, push a krátke zhrnutie (čo je hotové, čo treba otestovať). Pokračuj ďalšou fázou až po mojom „pokračuj".
6. **Pýtaj sa len na rozhodnutia označené ❓** alebo na veci, ktoré naozaj nevieš odvodiť. Všetko ostatné rozhodni podľa tohto dokumentu.
7. Žiadne citlivé údaje (heslá, tokeny) v repozitári. URL Apps Scriptu nie je tajomstvo, ale patrí do `config.js`, nie natvrdo do logiky.

---

## 1. Kontext projektu

### 1.1 Klient
| Údaj | Hodnota |
|---|---|
| Názov | Recovery Clinic Bratislava (Recovery IV Clinic) |
| Prevádzkovateľ | KZ Beauty s. r. o., IČO 56502699, DIČ 2122324886, sídlo Irkutská 1400/18, 040 12 Košice |
| Prevádzka | Prievozská 4/A, 821 09 Bratislava |
| GPS | 48.145988, 17.138776 · Google Maps: `https://www.google.com/maps?q=48.145988,17.138776` |
| Telefón | +421 948 375 871 (`tel:+421948375871`) |
| E-mail | bratislava@recovery-clinic.sk |
| Otváracie hodiny | Po–Pi 10:00–18:00 · So–Ne 9:00–15:00 |
| Hlavný web | https://bratislava.recovery-clinic.sk/ (WordPress) |
| Rezervačný systém | Apponio: `https://recoveryclinicbratislava.myapponio.com/#reservation` |
| Darčekové poukážky | `https://recoveryclinicbratislava.myapponio.com/darcekove-poukazy` |
| Ochrana osobných údajov | `https://bratislava.recovery-clinic.sk/podmienky-spracovania-osobnych-udajov/` |
| Obchodné podmienky | `https://bratislava.recovery-clinic.sk/wp-content/uploads/2024/02/obchodne_podmienky_recovery_clinic.pdf` |
| Odborný garant | MUDr. Stanislav Žiaran, PhD. |
| Instagram | https://www.instagram.com/recovery_ivclinic_ba/ |

### 1.2 Čo vieme z discovery callu (28. 5. 2026)
- Dnes ~100 rezervácií mesačne (z toho ~70 nových zákazníkov za 30 dní), cieľ **300 rezervácií mesačne do pol roka**.
- Kapacita: 3 kreslá, slot 1,5 h → cez týždeň ~15 klientov denne, cez víkend ~12.
- Najpredávanejšie / prioritné infúzie: Glutation, Virus Killer, Imunity Booster, Acute back pain.
- Zákazník: muži aj ženy 15–70 rokov. **Ľudia službu nepoznajú – treba ich vzdelať.**
- USP: lekársky tím (nie každý konkurent ho má), priestory, nealko nápoje, Netflix, masážne kreslá, oxygenoterapia.
- Tón: **luxusný a profesionálny.** Žiadne agresívne výpredajové prvky.
- Leto je slabšie (dovolenky). Teraz je jeseň → imunita je hlavná téma.
- Minulé kampane: ~850 €/mes., ~120 leadov, **slabý prepad leadov do rezervácií**. Časť leadov z Meta Instant Forms bola mimo Bratislavy.
- Meta zaradila účet medzi zdravie/wellness (prísnejšia kontrola reklám aj pixel eventov).

### 1.3 Ponuka pre formulár
**Kto vyplní formulár, dostane zľavu 20 % na prvú infúziu.** Zľava je hlavná motivácia popri bezplatnej konzultácii (pomoc s výberom infúzie). Zľava sa uplatňuje pri platbe na prevádzke (v Apponiu je „Platba na prevádzke").
❓ Podmienky zľavy (len prví klienti? nesčítava sa s inými akciami?) ešte potvrdí klient – texty podmienok drž v `config.js`.

---

## 2. Cieľ stránky a konverzie

**Stránka má dve cesty a obe sú v poriadku:**
1. **Lead (primárna konverzia):** človek, ktorý nevie, ktorú infúziu chce, nechá kontakt → recepcia zavolá, poradí, zarezervuje. Motivácia: konzultácia zdarma + 20 % zľava.
2. **Priama rezervácia (sekundárna):** človek, ktorý už vie, klikne na „Rezervovať" → Apponio.
3. **Telefón (mikro):** klik na číslo.

**UX princípy, ktoré musíš dodržať:**
- **Žiadne menu.** Hlavička = logo, (otváracie hodiny na desktope), telefón, tlačidlo „Rezervovať online". Každý ďalší odkaz je únik z konverzie.
- **Mobile first.** Väčšina návštev príde z Meta reklám na mobile. Prvá obrazovka mobilu musí ukázať H1, benefity a obe tlačidlá. Sticky lišta dole (Zavolať / Rezervovať online).
- **Message match:** H1 sa mení podľa parametra `?v=` v URL (kapitola 6.2), aby text stránky sedel s reklamou.
- **Kvalita leadov:** adresa „Bratislava, Prievozská 4/A" je viditeľná hneď v hero (odfiltruje ľudí mimo BA), telefón aj e-mail sú povinné, voľba „Čo chcete riešiť?" dá recepcii kontext.
- **Konverzia sa meria až po úspešnom zápise do Google Sheetu**, nikdy len po kliknutí na tlačidlo.

---

## 3. Dizajn – zdroj pravdy

- **Figma:** https://www.figma.com/design/YMGkDIRBLRx9vuflKHN31u
  Frame-y (node ID): Desktop – 1440 `3:2` · Mobile – 390 `5:289` · Mobile – prvá obrazovka `6:526` · Stavy & varianty `6:744` · Komponenty & tokeny `2:37` · Poznámky `6:820`.
- **Nečítaj Figmu cez MCP** (limit Starter plánu je vyčerpaný). Použi PNG v `design/` a túto špecifikáciu. Ak PNG v `design/` chýbajú, povedz mi to a pokračuj podľa špecifikácie.
- Logo: `_input/logo-recovery-clinic.svg` (originál je aj na `https://bratislava.recovery-clinic.sk/wp-content/uploads/2024/02/recovery_clinic_logo.svg`). Biela verzia loga = rovnaký SVG, kde sa farba `#142947` nahradí `#ffffff` (kvapka ostáva modrá).
- Favicon / znak kvapky: `_input/favicon.svg`.

### 3.1 Farby (CSS premenné v `:root`)
```css
--c-navy: #142947;        /* hlavná farba značky, nadpisy, primárne tlačidlá */
--c-navy-deep: #0B1A30;   /* pätička, tmavé prechody */
--c-blue: #009BDF;        /* zvýraznenie v H1 (len veľký text!), ikony, focus */
--c-blue-dark: #0072B1;   /* textové odkazy, eyebrow – spĺňa kontrast AA */
--c-cyan: #6DCFF6;        /* ikony na tmavom pozadí */
--c-cyan-light: #D8F3FD;  /* štítky, vybraný chip, banner „Neviete si vybrať" */
--c-white: #FFFFFF;
--c-gray-50: #F5F8FA;     /* pozadie sekcií */
--c-gray-100: #EEF1F2;
--c-border: #DCE3E8;
--c-border-strong: #B9C6D0; /* rámik inputov a chipov */
--c-text: #3D4A5C;        /* bežný text */
--c-text-muted: #6B7787;  /* pomocný text */
--c-success: #1E9E6A;
--c-error: #D64545;
--c-star: #F5B400;
```
Prechody:
- Hero desktop: `linear-gradient(90deg, #F5F8FA 0%, #D8F3FD 100%)`, mobil `180deg`.
- Záverečná výzva: `linear-gradient(90deg, #0B1A30 0%, #142947 100%)`.
- Placeholder fotky: `linear-gradient(180deg, #D8F3FD 0%, #EEF1F2 100%)`.

Kontrast: `--c-blue` (#009BDF) na bielej má ~3,1 : 1 → **len pre text ≥ 24 px** (zvýraznenie v H1). Malý modrý text vždy `--c-blue-dark`.

### 3.2 Typografia
- Nadpisy, tlačidlá, ceny: **Montserrat** (700, 800) – rovnaký font ako hlavný web kliniky.
- Text: **DM Sans** (400, 500, 600) – rovnaký font ako rezervačný systém Apponio.
- **Fonty hostuj lokálne** (`assets/fonts/*.woff2`, subsety `latin` + `latin-ext` – bez latin-ext nebudú fungovať č, ľ, ť, ž, ô…). Nenačítavaj ich z fonts.googleapis.com (GDPR + rýchlosť). Zdroj: Fontsource alebo google-webfonts-helper, licencia OFL – pribaľ `OFL.txt`. `font-display: swap`, preload len Montserrat 800 a DM Sans 400.

| Štýl | Font | Desktop | Mobil | Ďalšie |
|---|---|---|---|---|
| H1 | Montserrat 800 | 56/64 px | 34/41 px | letter-spacing −0.015em, použij `clamp()` |
| H2 | Montserrat 800 | 40/48 px | 28/35 px | −0.01em |
| H3 | Montserrat 700 | 22/30 px | 22/30 px | −0.005em |
| H4 | Montserrat 700 | 18/26 px | 18/26 px | |
| Eyebrow | DM Sans 600 | 13/18 px | 13/18 px | UPPERCASE, letter-spacing 0.08em, farba `--c-blue-dark` |
| Body L | DM Sans 400 | 19/30 px | 16/26 px | |
| Body M | DM Sans 400 | 16/26 px | 16/26 px | |
| Body S | DM Sans 400 | 14/22 px | 14/22 px | |
| Label | DM Sans 600 | 15/22 px | 15/22 px | |
| Button | Montserrat 700 | 15/20 px | 15/20 px | letter-spacing 0.003em |
| Price | Montserrat 800 | 26/32 px | 26/32 px | |
| Quote | DM Sans 500 | 17/28 px | 17/28 px | |

### 3.3 Tvar „kvapka" – podpis značky
Kvapka v logu má ostrý horný hrot. Preto **tlačidlá, karty, formulár a číselné odznaky majú ľavý horný roh hranatý** a ostatné rohy zaoblené:
```css
--r-btn:  0 999px 999px 999px;
--r-card: 0 24px 24px 24px;
--r-form: 0 28px 28px 28px;
--r-sm:   0 20px 20px 20px;
--r-input: 12px;   /* inputy majú bežné rohy – sú to formulárové prvky, nie značka */
--r-pill: 999px;   /* chipy, štítky */
```

### 3.4 Tiene, medzery, breakpointy
```css
--shadow-card: 0 10px 30px rgba(20, 41, 71, .07);
--shadow-form: 0 24px 64px rgba(20, 41, 71, .14);
--shadow-bar:  0 -6px 24px rgba(20, 41, 71, .12);
--container: 1200px;
--gutter: 20px;           /* mobil; od 768 px 32 px */
--section-y: 64px;        /* mobil; od 1024 px 112 px */
```
Breakpointy (mobile first): `768px` tablet, `1024px` desktop (hero sa delí na 2 stĺpce), `1280px` plná šírka kontajnera. Žiadny horizontálny scroll stránky na žiadnej šírke od 320 px.

### 3.5 Komponenty
- **Button primary:** pozadie navy, biely text, šípka (ikona `arrow-right` 18 px), padding 17×30 px, `--r-btn`. Hover: o odtieň svetlejšie (`#1d3a63`), jemný posun šípky o 3 px. Focus: `outline: 3px solid var(--c-blue); outline-offset: 3px`.
- **Button secondary:** priehľadné, rámik 1,5 px navy, navy text.
- **Button on dark:** biele pozadie, navy text. **Outline on dark:** rámik 1,5 px biely 60 %, biely text.
- **Text link:** `--c-blue-dark`, Label štýl, šípka.
- **Input:** výška 54 px, rámik 1,5 px `--c-border-strong`, `--r-input`, padding 0 18 px, label nad poľom (Label štýl, navy). Focus: rámik `--c-blue` + `box-shadow: 0 0 0 4px rgba(0,155,223,.18)`. Chyba: rámik 2 px `--c-error`, pod poľom chybová hláška Body S v `--c-error`.
- **Chip (multiselect):** pill, padding 10×16, rámik 1,5 px `--c-border-strong`, biele pozadie. Vybraný: pozadie `--c-cyan-light`, rámik `--c-blue`, ikona `check` 16 px. Technicky = `<input type="checkbox">` + `<label>`, ovládateľné klávesnicou.
- **Checkbox súhlasu:** štvorec 22 px, rádius 6 px.
- **Karta infúzie:** biela, rámik 1 px `--c-border`, `--r-card`, `--shadow-card`, padding 28. Obsah: štítok kategórie (pill, cyan-light, eyebrow) + ikona kvapky vpravo, názov (H3), objem (Body S muted), popis (Body S), deliaca čiara, dole cena (Price) a odkaz „Rezervovať →". Karty v rade majú rovnakú výšku, spodok zarovnaný.
- **USP karta (na navy):** pozadie biela 6 %, rámik cyan 25 %, `--r-sm`, ikona v kruhu 46 px (cyan 16 %), titulok H4 biely, text Body S biely 78 %.
- **Karta recenzie:** biela, `--r-card`, 5 hviezdičiek (`--c-star`), citát (Quote), dole avatar s iniciálou (kruh 42 px, cyan-light) + meno + „Recenzia z rezervačného systému".
- **Krok:** odznak 56×56 navy v tvare kvapky (`0 28px 28px 28px`) s číslom, H3, Body M.
- **FAQ položka:** `<details><summary>`, otázka H4, vpravo kruh 36 px s „+" (otvorená: navy kruh s „−"), deliaca čiara dole.
- **Ikony:** Lucide (https://lucide.dev), vkladaj ako inline SVG, `stroke-width: 1.9`, `stroke-linecap/linejoin: round`. Použité: `arrow-right, check, phone, shield-check, hospital, wallet, square-parking, star, droplet, lock, armchair, tv, wind, test-tube, badge-check, clock, map-pin, camera, plus, minus, cookie, calendar`.

---

## 4. Technický stack a štruktúra repozitára

```
recovery-clinic-lp/
├── index.html                 ← celá stránka, všetky texty sú tu
├── 404.html                   ← jednoduchá 404 v rovnakom dizajne s tlačidlom späť
├── assets/
│   ├── css/styles.css         ← tokeny + komponenty + sekcie (komentované)
│   ├── js/config.js           ← VŠETKO, čo sa mení: kontakty, URL, GTM, endpoint, zľava, varianty H1
│   ├── js/consent.js          ← cookie lišta + Consent Mode v2
│   ├── js/app.js              ← UI (varianty, FAQ, carousely, sticky lišta, scroll), tracking, formulár
│   ├── img/                   ← logo.svg, logo-white.svg, favicon.svg, og-image.jpg, fotky (webp)
│   └── fonts/                 ← woff2 + OFL.txt
├── google-apps-script/
│   ├── Code.gs                ← backend formulára (Google Sheets)
│   └── README.md              ← nasadenie krok za krokom
├── design/                    ← PNG exporty z Figmy (referencia)
├── docs/
│   ├── tracking-plan.md       ← dataLayer eventy + GTM nastavenie
│   └── qa-checklist.md
├── netlify.toml
├── robots.txt
├── .gitignore                 ← .DS_Store, node_modules, _input/, *.log
├── CLAUDE.md                  ← stručná pamäť projektu pre ďalšie sedenia Claude Code
└── README.md                  ← pre Daniela: ako meniť texty, testovať, nasadiť, zoznam TODO
```
Ak by `app.js` presiahol ~600 riadkov, rozdeľ ho na `ui.js`, `tracking.js`, `form.js`. Všetky skripty načítavaj s `defer`, `config.js` ako prvý.

### 4.1 `config.js` (vzor – doplň a okomentuj)
```js
window.RC_CONFIG = {
  siteUrl: 'https://TODO-domena.sk',   // ❓ doménu doplní Daniel pri hostingu
  gtmId: 'GTM-P8RKNPB4',               // existujúci kontajner kliniky (WP + Apponio)
  formEndpoint: '',                    // URL Apps Script web appu (…/exec); prázdne = testovací režim
  bookingUrl: 'https://recoveryclinicbratislava.myapponio.com/#reservation',
  voucherUrl: 'https://recoveryclinicbratislava.myapponio.com/darcekove-poukazy',
  phone: '+421948375871',
  phoneDisplay: '+421 948 375 871',
  email: 'bratislava@recovery-clinic.sk',
  mapsUrl: 'https://www.google.com/maps?q=48.145988,17.138776',
  privacyUrl: 'https://bratislava.recovery-clinic.sk/podmienky-spracovania-osobnych-udajov/',
  termsUrl: 'https://bratislava.recovery-clinic.sk/wp-content/uploads/2024/02/obchodne_podmienky_recovery_clinic.pdf',
  googleReviewsUrl: '',                // TODO: odkaz na Google Business Profile
  discount: {
    percent: 20,
    terms: 'Zľava platí na prvú infúziu. Uplatníte ju pri platbe na prevádzke.' // ❓ potvrdiť s klientom
  },
  tracking: { leadValue: 0, currency: 'EUR' }, // leadValue doplní Daniel (priem. hodnota × % premeny leadu)
  defaultVariant: 'a',
  variants: { /* kapitola 6.2 */ },
  debug: false                          // true = výpis dataLayer do konzoly
};
```
Percento zľavy v texte vkladaj cez `<span data-discount>20</span>` a JS ho prepíše z configu – ak klient zmení zľavu, mení sa na jednom mieste.

---

## 5. HTML – `<head>`, meta a SEO

Poradie v `<head>`:
1. `<meta charset>`, `viewport` (`width=device-width, initial-scale=1, viewport-fit=cover`), `<title>`, `description`.
2. **Inline skript Consent Mode default** (kapitola 9.2) – musí byť pred GTM.
3. **GTM snippet** (`GTM-P8RKNPB4`) hneď za ním; `<noscript>` iframe hneď za `<body>`.
4. Preload fontov, CSS, favicon, OG/Twitter, canonical, JSON-LD.

```html
<html lang="sk">
<title>IV infúzie Bratislava – zľava 20 % na prvú | Recovery Clinic</title>
<meta name="description" content="Vitamínové IV infúzie v masážnom kresle, pod dohľadom lekára. Nechajte kontakt – poradíme s výberom a na prvú infúziu máte zľavu 20 %. Prievozská 4/A.">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="{siteUrl}/">
<meta name="theme-color" content="#142947">
<meta property="og:type" content="website">
<meta property="og:locale" content="sk_SK">
<meta property="og:site_name" content="Recovery Clinic Bratislava">
<meta property="og:title" content="Dobite si imunitu aj energiu – IV infúzie v Bratislave">
<meta property="og:description" content="Poradíme s výberom infúzie a na prvú dostanete zľavu 20 %. Masážne kreslo, Netflix a lekársky dohľad.">
<meta property="og:url" content="{siteUrl}/">
<meta property="og:image" content="{siteUrl}/assets/img/og-image.jpg">  <!-- 1200×630 -->
<meta name="twitter:card" content="summary_large_image">
```
- **Prečo `noindex`:** ide o čisto PPC stránku. Hlavný web `bratislava.recovery-clinic.sk` má vlastniť organické pozície; indexovaná LP by s ním súperila o tie isté dopyty a varianty `?v=` by vytvárali duplicity. Reklamné systémy (Google AdsBot, Meta) stránku aj tak prečítajú. Do `robots.txt` daj `Allow: /` – **nič neblokuj**, inak by Google Ads nevedel stránku vyhodnotiť. Nechaj v kóde komentár, ako prepnúť na `index, follow`, ak sa klient rozhodne inak.
- `og-image.jpg`: TODO – Daniel vyexportuje z Figmy. Dovtedy dočasne použi `https://bratislava.recovery-clinic.sk/wp-content/uploads/2024/02/WhatsApp-Image-2024-02-21-at-17.47.06-1.jpeg`.
- Kým nie je doména, `{siteUrl}` nahrádzaj hodnotou z configu ručne v HTML (meta tagy sa čítajú bez JS) a do README zapíš, kde všade treba doménu doplniť.
- **JSON-LD** (`MedicalClinic`): názov, url, telephone, email, adresa, geo (48.145988, 17.138776), `openingHoursSpecification` (Po–Pi 10:00–18:00, So–Ne 09:00–15:00), `priceRange: "59 € – 199 €"`.
- Favicon: `favicon.svg` + PNG 180×180 `apple-touch-icon` (vyrender zo SVG).

---

## 6. Sekcie stránky – layout a finálne texty

Poradie sekcií je rovnaké na desktope aj mobile, mení sa len layout. Každá sekcia má `id` a `data-section` (pre scroll tracking).

### 6.1 Hlavička (`header`, sticky)
- Biela, spodná linka 1 px `--c-border`. Pri scrolle jemný tieň.
- **Desktop:** vľavo logo (šírka 150 px, odkaz na `#top`). Vpravo: „Po–Pi 10:00–18:00 · So–Ne 9:00–15:00" (Body S muted, len ≥ 1200 px), ikona telefónu + „+421 948 375 871" (Label, `tel:`), tlačidlo primary „Rezervovať online" (menší padding 13×24).
- **Mobil:** logo 120 px, vpravo okrúhle tlačidlo 44 px s ikonou telefónu (`aria-label="Zavolať +421 948 375 871"`).

### 6.2 Hero (`#top`)
**Desktop:** 2 stĺpce – vľavo text (flex 1), vpravo formulár (šírka 500 px), medzera 80 px. Dekorácia: veľká kvapka (znak z loga) vpravo za formulárom, priehľadnosť 10 %, `aria-hidden`.
**Mobil:** jeden stĺpec; formulár je samostatná sekcia hneď pod pásom dôvery.

Obsah:
- Eyebrow v bielej pilulke s ikonou kvapky: desktop „**IV terapia · Bratislava, Prievozská 4/A**", mobil „**IV terapia · Bratislava**".
- **H1** (z varianty, zvýraznená časť v `<span class="hl">` farbou `--c-blue`). Default:
  „Dobite si **imunitu aj energiu** – pohodlne v kresle, pod dohľadom lekára"
- Podnadpis (Body L): „Vitamínové IV infúzie v Bratislave. Nechajte nám kontakt – zdravotník vám zavolá, pomôže vybrať vhodnú infúziu a na prvú dostanete zľavu <span data-discount>20</span> %."
- 3 benefity (navy kruh 26 px s bielou fajkou + Label navy):
  - Odborný garant MUDr. Stanislav Žiaran, PhD.
  - Masážne kreslo, Netflix a občerstvenie počas infúzie
  - Infúzie od 59 € · platíte až na prevádzke
- **Desktop CTA:** primary „Rezervovať termín online →" (Apponio) + vedľa „alebo zavolajte / +421 948 375 871".
- **Mobil CTA (pod sebou, plná šírka):** primary „Rezervovať termín online →" a secondary „Získať zľavu 20 % a konzultáciu" (scroll na `#formular` + focus na prvé pole).

**Varianty H1 podľa `?v=`** (do `config.js`). Kódy sú zámerne neutrálne písmená: URL sa posiela do Meta Pixelu a zdravotné slová v URL (napr. „bolest") môžu spustiť obmedzenia pre zdravotné inzerenty.

| `?v=` | Téma | H1 (zvýraznená časť **tučne**) | Predvybraný chip |
|---|---|---|---|
| `a` (default) | Imunita | Dobite si **imunitu aj energiu** – pohodlne v kresle, pod dohľadom lekára | imunita |
| `b` | Únava | Ráno bez energie? Doplňte telu **vitamíny a minerály** priamo do krvi | unava |
| `c` | Šport | Rýchlejšia **regenerácia po tréningu** – horčík a elektrolyty v infúzii | sport |
| `d` | Beauty | **Žiarivá pleť** zvnútra – glutatión a vitamín C v infúzii | beauty |
| `e` | Chrbát | Akútna **bolesť chrbta**? Infúzia po konzultácii so zdravotníkom | bolest |

Logika: prečítaj `v` z URL → ak existuje vo `variants`, prepíš H1 (+ voliteľne podnadpis), predvyber chip, ulož `lp_variant` do sessionStorage a pošli ho s leadom aj do dataLayeru. Neznámy alebo chýbajúci `v` = default `a`. Bez JS sa zobrazí default (je priamo v HTML).

### 6.3 Pás dôvery
- **Desktop:** jeden riadok, 5 položiek rozložených (`space-between`), ikona 22 px `--c-blue-dark` + Label navy, linka dole: Lekársky dohľad (`shield-check`) · Zdravotnícke zariadenie (`hospital`) · Platba až na prevádzke (`wallet`) · Parkovanie pre klientov (`square-parking`) · Overené recenzie klientov (`star`).
- **Mobil:** zalamované pilulky (gray-50): Lekársky dohľad · Platba na mieste · Parkovanie · Zdravotnícke zariadenie.

### 6.4 Formulár (`#formular`) – detail v kapitole 7
Biela karta, `--r-form`, `--shadow-form`, padding 40 (mobil 22×28).
- Štítok (pill cyan-light, eyebrow): „**Zľava <span data-discount>20</span> % na prvú infúziu**"
- H3: „Poradíme vám s výberom infúzie"
- Body S: „Nechajte nám kontakt – do 24 hodín sa vám ozveme, spolu vyberieme vhodnú infúziu a na prvú dostanete zľavu <span data-discount>20</span> %." (mobil kratšie: „Ozveme sa do 24 hodín, poradíme a na prvú infúziu dostanete zľavu 20 %.")
- Polia, chipy, súhlas, tlačidlo „**Chcem konzultáciu a zľavu 20 %**", pod ním ikona zámku + „Údaje použijeme len na spätný kontakt." a podmienky zľavy z configu (Body S muted).
- Oddeľovač „alebo" a textový odkaz „Rezervovať si termín online hneď →".

### 6.5 Ako to prebieha (pozadie gray-50)
Eyebrow „Ako to prebieha", H2 „Od prvého kontaktu po relax v kresle" (na stred). 3 kroky vedľa seba (desktop), pod sebou (mobil):
1. **Ozvete sa nám** – Vyplníte krátky formulár alebo si rovno rezervujete termín online. Zaberie to minútu.
2. **Poradíme vám** – Zdravotník sa opýta, čo riešite, a odporučí vhodnú infúziu. Na želanie aj rozbor krvi z kvapky – výsledok do 12 minút.
3. **Oddychujete** – Infúziu dostanete v masážnom kresle pri Netflixe a s občerstvením. Počítajte približne s hodinou a pol.

### 6.6 Infúzie (biela)
Hlavička: vľavo eyebrow „Najobľúbenejšie infúzie" + H2 „Vyberte si podľa toho, čo potrebujete", vpravo textový odkaz „Celá ponuka (19 infúzií) v rezervácii →". Na mobile odkaz pod kartami.
**Desktop:** 4 karty v mriežke. **Mobil:** horizontálny carousel s `scroll-snap` (karta 290 px, vidno kúsok ďalšej), pod ním bodky (aktívna = navy pilulka 20×8), bez knižníc.

| Štítok | Názov | Objem | Popis | Cena |
|---|---|---|---|---|
| Imunita | Imunity Booster | 500 ml | Vitamín C, glutatión a vitamíny skupiny B na podporu obranyschopnosti a regenerácie. | 159 € |
| Imunita | Virus Killer | 500 ml | Vitamín C, vitamíny skupiny B a vápnik pre silnú imunitu a hydratáciu. | 99 € |
| Beauty | Glutation | 250 ml · bežne <s>179 €</s> | Antioxidant glutatión s vitamínom C pre vitalitu, detox a zdravý vzhľad pleti. | 139 € |
| No pain | Acute back pain | 500 ml | Pri akútnej bolesti chrbta. Vždy po konzultácii so zdravotníkom. | 99 € |

Ceny sú z webu kliniky k 15. 10. 2026 – `<!-- TODO: overiť ceny v Apponiu -->`. Každá karta: odkaz „Rezervovať →" na `bookingUrl` s `data-track="booking_click" data-location="card" data-item="Imunity Booster"`. ❓ Zisti, či Apponio podporuje deep link priamo na službu – ak áno, doplníme neskôr (TODO).

Pod kartami banner (cyan-light, `--r-card`): H4 „Neviete si vybrať? Poradíme vám – a na prvú infúziu máte −<span data-discount>20</span> %." + Body M „Máme 19 druhov infúzií. Nechajte nám kontakt a zdravotník vám odporučí tú pravú." + secondary tlačidlo „Chcem poradiť" (→ `#formular`).

### 6.7 Self-care lounge (pozadie navy)
**Desktop:** vľavo fotka 520×640 (`--r-form`), vpravo text + mriežka 2×3 USP kariet. **Mobil:** fotka 350×240 hore, potom text a zoznam USP (ikona vľavo, text vpravo).
- Eyebrow (cyan): „Self-care lounge"
- H2 (biela): „Žiadna čakáreň. Chvíľa, ktorá patrí len vám."
- Body L (biela 78 %): „Infúzia trvá chvíľu – tak nech je to ten najpríjemnejší čas v týždni. Pohodlne, v súkromí a s profesionálnou starostlivosťou."
- USP:
  - `shield-check` **Lekársky tím** – Infúziu podáva vyškolený zdravotník pod dohľadom lekára.
  - `armchair` **Masážne kreslo RelaxPro 3D** – Zero gravity poloha a 8 masážnych programov.
  - `tv` **Netflix a občerstvenie** – Váš obľúbený seriál, nápoj a Wi-Fi zadarmo.
  - `wind` **Oxygenoterapia** – Doplnková kyslíková terapia s 90 – 95 % kyslíka.
  - `test-tube` **Biochémia krvi z kvapky** – Výsledok do 12 minút – zistíte, čo telu chýba.
  - `square-parking` **Parkovanie** – Pohodlné parkovanie pre klientov kliniky.

### 6.8 Odborný garant (biela)
**Desktop:** fotka 440×500 vľavo, text vpravo. **Mobil:** fotka hore.
- Eyebrow „Odborný garant", H2 „MUDr. Stanislav Žiaran, PhD."
- Body L: „Koncept vitamínových infúzií priniesol na Slovensko zo zahraničia. Spolu s tímom zdravotníkov dbá na to, aby bola každá terapia bezpečná a vybraná podľa toho, čo vaše telo naozaj potrebuje."
- 3 fakty s ikonou `badge-check`: Zdravotnícke zariadenie – stacionár · Každá infúzia pod dohľadom lekára · Výber infúzie podľa vašich potrieb, na želanie aj podľa rozboru krvi.

### 6.9 Recenzie (gray-50)
Eyebrow „Recenzie", H2 „Čo hovoria naši klienti" (na stred). Desktop 3 karty, mobil carousel so `scroll-snap`.
- **Zuzana** – „Pani doktorka so sestričkou boli profesionálne, nápomocné, milé a ľudské."
- **Lenka** – „Veľmi príjemné. Od príchodu cez veľmi dobrý servis až po super služby v masážnom kresle pri pozeraní TV."
- **Pčolinský** – „Super prístup, poradenstvo, príjemný priestor, dokonalý oddych… vrelo odporúčam."

Pod kartami odkaz „Ďalšie recenzie na Google →" (`googleReviewsUrl`; ak je prázdne, odkaz skry). `<!-- TODO: súhlas klienta s použitím recenzií -->`

### 6.10 FAQ (biela)
**Desktop:** vľavo (360 px) eyebrow „Časté otázky", H2 „Máte otázky? Máme odpovede.", Body M „Nenašli ste odpoveď? Zavolajte nám na +421 948 375 871 alebo napíšte na bratislava@recovery-clinic.sk." Vpravo zoznam. **Mobil:** pod sebou. Prvá otázka je otvorená.

1. **Bolí podanie infúzie?** – Pocítite len krátky vpich, podobne ako pri odbere krvi. Potom už len oddychujete v masážnom kresle.
2. **Ako dlho návšteva trvá?** – Počítajte približne s hodinou a pol vrátane krátkej konzultácie. Samotná infúzia trvá podľa typu a objemu.
3. **Je IV terapia bezpečná?** – Infúzie podáva vyškolený zdravotnícky personál pod dohľadom lekára. Pred podaním sa vás opýtame na zdravotný stav a lieky, ktoré užívate.
4. **Ako uplatním zľavu 20 %?** – Stačí vyplniť formulár na tejto stránke. Zľavu máte zapísanú na meno a uplatníte ju pri platbe na prevádzke.
5. **Potrebujem odporúčanie od lekára?** – Nie. Stačí si rezervovať termín online alebo nám nechať kontakt – s výberom infúzie vám poradíme.
6. **Ako a kedy zaplatím?** – Platíte až na prevádzke, po rezervácii nič neplatíte vopred.
7. **Môžem infúziu niekomu darovať?** – Áno. Ponúkame darčekové poukážky v hodnote 50 €, 100 € a 150 € – [kúpite ich online](voucherUrl).

`<!-- TODO: odpovede vo FAQ odsúhlasí klinika -->`

### 6.11 Záverečná výzva (navy prechod)
Na stred: znak kvapky (54 px), H2 biela „Doprajte si chvíľu pre seba. Telo sa vám poďakuje." (na desktope zalomené za „seba."), Body L biela 78 %: „Vyberte si termín online alebo nám nechajte kontakt – poradíme a na prvú infúziu dostanete zľavu 20 %."
Tlačidlá: „Rezervovať termín online →" (on dark) + „Získať zľavu 20 %" (outline on dark → `#formular`). Na mobile pod sebou, plná šírka.
Info riadok (ikony cyan): `clock` Po–Pi 10:00–18:00 · So–Ne 9:00–15:00 · `map-pin` Prievozská 4/A, 821 09 Bratislava (odkaz na mapu) · `phone` +421 948 375 871.

### 6.12 Pätička (navy-deep)
Biele logo · „© {aktuálny rok} KZ Beauty s. r. o. · IČO 56502699 · Prievozská 4/A, Bratislava" (biela 60 %) · odkazy Ochrana osobných údajov · Obchodné podmienky · Nastavenie cookies (otvorí cookie lištu). Na mobile pod sebou a so spodným paddingom 108 px kvôli sticky lište.

### 6.13 Sticky lišta (len mobil < 1024 px)
Biela, `--shadow-bar`, padding 12/16, spodný padding `calc(20px + env(safe-area-inset-bottom))`. Vľavo „Zavolať" (outline navy s ikonou telefónu), vpravo „Rezervovať online" (primary, flex 1).
Správanie (IntersectionObserver): **zobraz** až keď CTA v hero zmiznú z obrazovky; **skry**, keď je na obrazovke formulár alebo záverečná výzva (aby nezakrývala tlačidlo Odoslať). Plynulé vysunutie (transform), pri `prefers-reduced-motion` bez animácie.

### 6.14 Fotky
Kým Daniel nedodá fotky, zobraz placeholdery (gradient z kapitoly 3.1, ikona `camera`, popis „FOTO: lounge s masážnymi kreslami" / „FOTO: MUDr. Stanislav Žiaran, PhD."). Keď fotky prídu: WebP + JPG fallback cez `<picture>`, `srcset` 1×/2×, `width`/`height` (žiadny CLS), `loading="lazy"` (žiadna fotka nie je v hero), `object-fit: cover`, výstižný `alt` po slovensky.

---

## 7. Formulár – UX, validácia, odoslanie

### 7.1 Polia
| Pole | `name` | Typ | Povinné | Placeholder | `autocomplete` |
|---|---|---|---|---|---|
| Meno a priezvisko | `name` | text | áno | Napr. Jana Nováková | `name` |
| Telefón | `phone` | tel, `inputmode="tel"` | áno | 09XX XXX XXX | `tel` |
| E-mail | `email` | email | áno | vas@email.sk | `email` |
| Čo chcete riešiť? (nepovinné) | `interest[]` | checkboxy ako chipy | nie | – | – |
| Súhlas | `consent` | checkbox | áno | – | – |
| Honeypot | `company` | text, skrytý (nie `display:none`, ale mimo obrazovky), `tabindex="-1"`, `autocomplete="off"` | – | – | – |

Chipy (`value` → zobrazený text): `imunita` Imunita · `unava` Únava a energia · `sport` Regenerácia po športe · `beauty` Pleť a detox · `bolest` Bolesť · `neviem` Neviem, poraďte.
Desktop: Telefón a E-mail vedľa seba, mobil pod sebou.
Súhlas: „Súhlasím so spracovaním osobných údajov na účel spätného kontaktu. *" + odkaz „Viac informácií" na `privacyUrl` (nová karta, `rel="noopener"`).

### 7.2 Validácia (klient + server)
- Validuj pri opustení poľa (`blur`) a pri odoslaní; chyba sa zobrazí pod poľom a zmizne hneď po oprave. Nevaliduj počas písania prvého znaku.
- Meno: min. 2 znaky po orezaní → „Zadajte meno a priezvisko."
- Telefón: odstráň medzery, pomlčky, zátvorky. Prijmi `09XXXXXXXX`, `+4219XXXXXXXX`, `004219XXXXXXXX`, pevné linky `02…` a zahraničné čísla `+` 8–15 číslic. Normalizuj na E.164 (`+421…`). Chyba → „Zadajte telefónne číslo v tvare 09XX XXX XXX."
- E-mail: musí mať `@` a doménu s bodkou → „Skontrolujte e-mail – napr. jana@gmail.com." Bonus: pri preklepe v bežnej doméne (gmial.com, gmail.cm, azet.s, centrum.sj…) ponúkni „Mysleli ste …@gmail.com?" (klik opraví).
- Súhlas → „Na odoslanie potrebujeme váš súhlas."
- Pri odoslaní s chybami: scroll a focus na prvé chybné pole, `aria-invalid="true"`, chyby prepojené cez `aria-describedby`, súhrn chýb v `aria-live="polite"`.

### 7.3 Odoslanie
1. Zablokuj tlačidlo, text „Odosielam…" + spinner (ochrana proti dvojitému odoslaniu).
2. Vygeneruj `lead_id = crypto.randomUUID()` (fallback: timestamp + náhodné číslo). Rovnaké ID ide do Sheetu aj ako `event_id` do dataLayeru (deduplikácia s budúcim Meta CAPI a Google Ads `transaction_id`).
3. Zostav payload (kapitola 8.3) a pošli ho:
```js
// Apps Script nepodporuje CORS preflight → posielame "simple request" (text/plain),
// odpoveď vráti cez redirect na googleusercontent.com, ktorý CORS povoľuje.
const res = await fetch(CONFIG.formEndpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify(payload),
  redirect: 'follow',
  signal: AbortSignal.timeout(12000)
});
const data = await res.json(); // { ok: true, lead_id } alebo { ok: false, error }
```
4. **Až pri `ok: true`** pushni `generate_lead` do dataLayeru (kapitola 9.4) a zobraz stav Úspech.
5. Pri chybe/timeoute: tlačidlo odblokuj, údaje vo formulári ponechaj, zobraz chybový box: „Formulár sa nepodarilo odoslať. Skúste to prosím znova alebo nám zavolajte na +421 948 375 871." (číslo ako `tel:` odkaz) a pushni `form_error` s `error_type: 'network'` alebo `'server'`.
6. Ak `formEndpoint` je prázdny (testovací režim): po 800 ms simuluj úspech, nad formulárom zobraz žltý pruh „TESTOVACÍ REŽIM – údaje sa nikam neposlali" a do dataLayeru pošli `generate_lead` s `test_mode: true`.

### 7.4 Stav Úspech (nahradí obsah formulára)
- Zelený kruh s fajkou (64 px), H3 „Ďakujeme, {krstné meno}!" (prvé slovo z mena).
- Body M: „Zdravotník sa vám ozve do 24 hodín. Zľavu <span data-discount>20</span> % na prvú infúziu máte zapísanú – uplatníte ju pri platbe na prevádzke."
- Deliaca čiara, Label: „Nechcete čakať? Vyberte si termín online – zľava platí aj tak."
- Primary tlačidlo „Vybrať termín online →" (`data-location="success"`).
- Focus presuň na nadpis (`tabindex="-1"`), oznám cez `aria-live`.
- URL stránky nemeň (žiadne `?interest=` – zdravotné údaje nesmú ísť do URL ani do pixelov).

---

## 8. Backend formulára – Google Sheets + Apps Script

### 8.1 Hárok
Google Sheet „Recovery LP – leady", karta **`LP leady`**, prvý riadok hlavička:

| Stĺpec | Obsah |
|---|---|
| `created_at` | dátum a čas (Europe/Bratislava), `yyyy-MM-dd HH:mm:ss` |
| `lead_id` | UUID z prehliadača |
| `status` | default `CREATED`; overenie údajov (dropdown): CREATED / QUALIFIED / CONVERTED / DISQUALIFIED – rovnaký proces, aký recepcia používa pri Meta leadoch |
| `meno` | |
| `telefon` | E.164 (zapisuj s apostrofom `'+421…`, aby ho Sheets nezmenil na číslo) |
| `email` | malými písmenami |
| `zaujem` | čiarkou oddelené hodnoty chipov |
| `zlava` | „20 % prvá infúzia" (z payloadu) |
| `lp_variant` | a–e |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | |
| `gclid`, `gbraid`, `wbraid` | Google Ads click ID |
| `fbclid`, `fbc`, `fbp` | Meta |
| `consent_ads` | granted / denied (stav súhlasu v čase odoslania) |
| `page_url`, `referrer`, `user_agent` | |
| `poznamka_recepcie` | prázdne, vyplní recepcia |

Prečo takto: click ID + `status` + `lead_id` umožnia neskôr nahrávať do Google Ads a Mety **reálne rezervácie (CONVERTED)** ako offline konverzie – to je liek na „veľa leadov, málo rezervácií". Click ID používaj na upload len pri `consent_ads = granted`.

### 8.2 `google-apps-script/Code.gs` – požiadavky
- `CONFIG` na začiatku: `SHEET_NAME`, `NOTIFY_EMAIL` (default `bratislava@recovery-clinic.sk` – ❓ potvrdiť), `SEND_NOTIFICATION` (true), `ALLOWED_ORIGINS` (len informatívne/logovanie), `DEDUPE_MINUTES` (10).
- `doPost(e)`: `JSON.parse(e.postData.contents)` → server-side validácia rovnakými pravidlami ako na klientovi → ak je vyplnený honeypot `company` alebo `elapsed_ms < 2500`, vráť `{ok:true}` **bez zápisu** (bot nemá zistiť, že bol odhalený).
- Duplicita: `CacheService` – rovnaký telefón alebo e-mail do 10 minút → vráť `{ok:true, lead_id, duplicate:true}` bez nového riadku.
- Zápis cez `LockService.getScriptLock()` (súbežné odoslania) a `appendRow`.
- Notifikácia recepcii (`MailApp.sendEmail`): predmet „Nový lead z LP: {meno} – {zaujem}", telo s menom, telefónom (klikateľný), e-mailom, záujmom, variantom, odkazom na Sheet. Žiadne click ID v e-maile.
- Odpoveď vždy `ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)`; chyby zachyť `try/catch`, loguj `console.error`, vráť `{ok:false, error:'server'}`.
- `doGet()` vráti `{ok:true, service:'recovery-lp'}` (rýchly test, či web app beží).
- Funkcia `setupSheet()` (spustí sa raz ručne): vytvorí kartu, hlavičku, zmrazí 1. riadok, nastaví dropdown pre `status` a podmienené formátovanie (CONVERTED zelená, DISQUALIFIED sivá).
- Potvrdzujúci e-mail zákazníkovi so zľavou **nerob v Apps Scripte** – odchádzal by z účtu vlastníka skriptu. Klinika už má v Make scenár, ktorý posiela voucher e-maily leadom z Meta formulára; do README napíš, ako ho rozšíriť o trigger „Watch rows" na karte `LP leady`. (TODO pre Daniela.)

### 8.3 Payload z prehliadača
```json
{
  "lead_id": "uuid",
  "name": "Jana Nováková",
  "phone": "+421948000000",
  "email": "jana@gmail.com",
  "interest": ["imunita","neviem"],
  "discount": "20 % prvá infúzia",
  "lp_variant": "a",
  "utm_source": "", "utm_medium": "", "utm_campaign": "", "utm_content": "", "utm_term": "",
  "gclid": "", "gbraid": "", "wbraid": "", "fbclid": "", "fbc": "", "fbp": "",
  "consent_ads": "granted",
  "page_url": "https://…", "referrer": "", "user_agent": "…",
  "company": "",
  "elapsed_ms": 18342
}
```

### 8.4 `google-apps-script/README.md` – postup pre Daniela (napíš krok za krokom)
1. Vytvoriť Google Sheet – ❓ **ideálne v Google účte kliniky** (sú to osobné údaje ich klientov, klinika je prevádzkovateľ), Daniel dostane prístup editora.
2. Rozšírenia → Apps Script → vložiť `Code.gs` → uložiť → spustiť `setupSheet` (povoliť oprávnenia).
3. Nasadiť → Nové nasadenie → Typ: Webová aplikácia → Spustiť ako: **Ja** → Prístup: **Ktokoľvek** → Nasadiť → skopírovať URL končiacu `/exec` do `config.js` → `formEndpoint`.
4. Pri každej zmene kódu: Nasadiť → Spravovať nasadenia → upraviť existujúce → nová verzia (URL ostane rovnaká).
5. Test: otvoriť URL `/exec` v prehliadači (má vrátiť `{"ok":true…}`), potom odoslať formulár z lokálneho náhľadu.

---

## 9. Tracking – GTM, Consent Mode v2, dataLayer

### 9.1 Princípy
- Všetko ide cez **existujúci GTM kontajner `GTM-P8RKNPB4`** (beží aj na WP webe a v Apponiu → jedna GA4, jednoduchý cross-domain). **Žiadne priame gtag/fbq skripty v HTML** okrem consent defaultu.
- Kód stránky iba pushuje udalosti do `dataLayer`. Tagy (GA4, Google Ads, Meta) nastaví Daniel v GTM podľa `docs/tracking-plan.md`.
- **Do dataLayeru ani do URL nikdy neposielaj zdravotné údaje** (hodnoty chipov „Čo chcete riešiť?", texty otázok vo FAQ a pod. – posielaj len poradové čísla). Meta má zdravotných inzerentov pod prísnym dohľadom a môže zablokovať eventy celému účtu.
- Do Meta Pixelu ide **iba** `Lead` (a PageView, ak už v kontajneri existuje). Ostatné eventy (kliky, FAQ, scroll) idú len do GA4.
- Všetky custom eventy majú parameter `lead_source: 'lp'`, aby sa v zdieľanom kontajneri dali odlíšiť od WP webu.
- **Na odkazy do Apponia nedávaj UTM parametre** – rozbilo by to session a atribúciu v GA4 (nová návšteva z „lp / referral"). Atribúciu nesie cross-domain linker GA4 (`_gl`).

### 9.2 Consent Mode v2 + cookie lišta (`consent.js`)
Inline v `<head>` pred GTM:
```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', functionality_storage: 'granted', security_storage: 'granted',
    wait_for_update: 500
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);
  // ak už existuje uložená voľba, aplikuj ju HNEĎ (pred GTM)
  try {
    var c = JSON.parse(localStorage.getItem('rc_consent_v1'));
    if (c) gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    });
  } catch (e) {}
</script>
```
Lišta (podľa Figma stavu „Cookie lišta"): spodná karta (desktop vpravo dole 390 px, mobil plná šírka nad sticky lištou), **neblokuje obsah stránky**. Ikona `cookie`, H4 „Používame cookies", Body S „Pomáhajú nám merať návštevnosť a zlepšovať reklamy. Vyberte si, s čím súhlasíte – rozhodnutie môžete kedykoľvek zmeniť v pätičke."
- Tlačidlá **rovnako výrazné**: „Prijať všetko" (primary) a „Odmietnuť" (secondary) vedľa seba + textový odkaz „Nastaviť podrobne".
- Panel nastavení: Nevyhnutné (vždy zapnuté), Analytické (`analytics_storage`), Marketingové (`ad_storage`, `ad_user_data`, `ad_personalization`) – prepínače s popisom, tlačidlo „Uložiť výber".
- Po voľbe: **okamžite** `gtag('consent','update', …)`, potom `dataLayer.push({event:'consent_update', consent_analytics, consent_marketing})`, uloženie do `localStorage` (`rc_consent_v1`, s dátumom; platnosť 12 mesiacov, potom sa lišta zobrazí znova).
- Odkaz „Nastavenie cookies" v pätičke lištu znova otvorí.
- Poznámka z praxe: na WP webe kliniky sa súhlas neposielal do GTM v reálnom čase (parameter `gcs=G100` ostával aj po prijatí). Preto po kliknutí „Prijať všetko" musí najbližší GA4 hit niesť `gcs=G111` – overíme v QA.
- Ak by klient vyžadoval certifikovanú CMP (napr. Cookiebot, CookieYes), dá sa vymeniť – drž `consent.js` oddelený.

### 9.3 Zachytenie atribúcie (`app.js`)
Pri načítaní prečítaj z URL `utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, gbraid, wbraid, fbclid, v`. Neprázdne hodnoty ulož do `sessionStorage` (`rc_attrib`) – posledná neprázdna hodnota vyhráva. `fbc`: ak je `fbclid`, vytvor `fb.1.{timestamp_ms}.{fbclid}`, inak čítaj cookie `_fbc`. `fbp`: cookie `_fbp` (existuje len pri marketingovom súhlase). Do payloadu formulára pridaj aj `consent_ads`.

### 9.4 Udalosti v dataLayeri
| Event | Kedy | Parametre |
|---|---|---|
| `lp_variant_view` | po načítaní a aplikovaní varianty | `lead_source:'lp'`, `lp_variant` |
| `booking_click` | klik na akýkoľvek odkaz do Apponia | `link_location` (header, hero, card, sticky, form, success, final, all_infusions), `item_name` (pri kartách), `lp_variant` |
| `phone_click` | klik na `tel:` | `link_location` |
| `form_start` | prvý focus do ľubovoľného poľa (raz za session) | `lp_variant` |
| `form_error` | neúspešná validácia pri odoslaní / chyba siete | `error_type` (validation, network, server), `form_field` (názov poľa, nie hodnota) |
| `generate_lead` | **po `ok:true` zo servera** | `event_id` (= lead_id), `lp_variant`, `value` (config), `currency:'EUR'`, `user_data: {email, phone_number}` (iba ak marketingový súhlas = granted), `test_mode` (len v testovacom režime) |
| `faq_open` | otvorenie otázky | `faq_index` (poradové číslo 1–7, nie text otázky) |
| `scroll_depth` | 25/50/75/90 % (raz) | `percent` |
| `section_view` | sekcia z 50 % na obrazovke (raz) | `section` (z `data-section`) |

Všetky eventy majú aj `lead_source:'lp'`. Kliky trackuj delegovane cez `data-track` atribúty (žiadne inline `onclick`). `debug: true` vypisuje každý push do konzoly.

### 9.5 `docs/tracking-plan.md` – čo nastaví Daniel v GTM a v platformách
Napíš ako checklist:
- **Premenné (DLV):** `event_id, lead_source, lp_variant, link_location, item_name, form_field, error_type, value, currency, user_data.email, user_data.phone_number, faq_index, percent, section`.
- **Triggre:** Custom Event pre každý event vyššie + podmienka `lead_source equals lp`.
- **Tagy:**
  - GA4 Event `generate_lead` (event_id, lp_variant, value, currency) → v GA4 označiť ako **kľúčovú udalosť**.
  - GA4 Eventy `booking_click`, `phone_click`, `form_start`, `form_error`, `faq_open`, `lp_variant_view`.
  - Google Ads Conversion „Lead – LP formulár" na `generate_lead`: Transaction ID = `event_id`, rozšírené konverzie cez user-provided data z `user_data`.
  - Conversion Linker – musí bežať aj na doméne LP.
  - Meta Pixel `Lead` na `generate_lead` s `eventID = event_id`, iba pri `ad_storage = granted`. Bez akýchkoľvek parametrov o záujme. Po spustení skontrolovať v Events Manageri, či Meta event neobmedzuje (zdravotná kategória).
  - Hodnoty pre Meta advanced matching (e-mail, telefón) zapnúť až po overení, že ich Meta pri tomto účte nefiltruje.
- **GA4 admin:** Dátové streamy → Konfigurovať nastavenia značky → Konfigurovať domény: pridať doménu LP, `bratislava.recovery-clinic.sk`, `recoveryclinicbratislava.myapponio.com`. Zoznam nežiaducich odporúčaní: rovnaké domény.
- **Google Ads:** primárna konverzia pre kampane na LP = „Lead – LP formulár"; existujúca GA4 udalosť `rezervacia` z Apponia ako ďalšia konverzia (rozhodnutie primárna/sekundárna je na Danielovi).
- **Meta:** po pripojení domény overiť doménu v Business Manageri a zaradiť `Lead` do prioritizácie eventov.

---

## 10. Interakcie a správanie (`app.js`)
- Plynulý scroll na kotvy, `scroll-margin-top` podľa výšky sticky hlavičky. Tlačidlá „Získať zľavu…" / „Chcem poradiť" → scroll na `#formular` a focus na pole Meno (`preventScroll` po dojazde).
- FAQ: natívne `<details>`; otvorenie jednej otázky ostatné nezatvára. Ikona +/− cez CSS.
- Carousely (infúzie, recenzie na mobile): CSS `scroll-snap-type: x mandatory`, bodky podľa IntersectionObserver, klik na bodku posunie. Na desktope mriežka.
- Hlavička dostane tieň po 8 px scrollu.
- `data-discount` a rok v pätičke sa napĺňajú z configu.
- Jemné animácie (fade-up 12 px, 400 ms) len pri `prefers-reduced-motion: no-preference`. Žiadne animácie, ktoré posúvajú layout.
- Bez JS sa obsah zobrazí celý (je v HTML) a odkazy na rezerváciu a telefón fungujú. Formulár bez JS odoslať nejde, preto v `<noscript>` pod ním zobraz „Formulár vyžaduje JavaScript. Zavolajte nám na +421 948 375 871."

---

## 11. Kvalita: výkon, prístupnosť, bezpečnosť

**Výkon (mobil, Lighthouse):** Performance ≥ 95, LCP < 2,0 s, CLS < 0,05, INP < 200 ms. Vlastný JS spolu < 30 kB, CSS < 40 kB (nekomprimované). Kritické štýly môžu byť v jednom CSS súbore (je malý). Žiadne externé knižnice, žiadne fonty z Google CDN.

**Prístupnosť (WCAG 2.1 AA):** sémantické značky (`header, main, section, footer`, jedno `h1`), labely pri všetkých poliach, viditeľný focus, ovládanie klávesnicou (chipy, FAQ, cookie lišta, carousel), kontrast podľa 3.1, dotykové plochy min. 44×44 px, `lang="sk"`, `alt` texty, „Preskočiť na formulár" skip-link.

**`netlify.toml`:**
```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    X-Frame-Options = "SAMEORIGIN"

[[headers]]
  for = "/assets/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```
CSP zatiaľ nenastavuj (GTM by vyžadoval veľa výnimiek) – daj do README poznámku na neskôr. `404.html` v štýle stránky.

---

## 12. Lokálny vývoj a testovanie
- Náhľad: `python3 -m http.server 8080` (alebo `npx serve .`) → `http://localhost:8080/?v=b&utm_source=test&gclid=TEST123`.
- Testuj na šírkach 320, 375, 390, 414, 768, 1024, 1280, 1440 px.
- `docs/qa-checklist.md` (napíš ho):
  - [ ] Všetky varianty `?v=a…e` menia H1 a predvyberajú chip; neznámy `v` = default.
  - [ ] Formulár: každá chyba validácie, normalizácia telefónu, preklep v e-maile, honeypot, dvojklik na Odoslať, timeout (vypnutý internet), testovací režim.
  - [ ] Riadok v Sheete má všetky stĺpce vrátane UTM a click ID; notifikačný e-mail príde.
  - [ ] GTM Preview: `generate_lead` len po úspechu, s `event_id`; `booking_click` s `link_location`.
  - [ ] GA4 DebugView: eventy prichádzajú; pred súhlasom `gcs=G100`, po „Prijať všetko" `gcs=G111`.
  - [ ] Klik na Apponio nesie parameter `_gl` (cross-domain).
  - [ ] Meta Pixel Helper / Test Events: `Lead` s `eventID`, len so súhlasom; žiadne údaje o záujme.
  - [ ] Sticky lišta: objaví sa po hero, zmizne pri formulári, nezakrýva obsah (iPhone safe area).
  - [ ] Lighthouse mobil: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95.
  - [ ] Žiadne chyby v konzole, žiadny horizontálny scroll.

---

## 13. GitHub a Netlify

**Repozitár:**
1. Over `gh auth status`. Ak nie je prihlásený, zastav sa a požiadaj ma o `gh auth login`.
2. `git init -b main`, `.gitignore`, prvý commit.
3. `gh repo create recovery-clinic-lp --private --source=. --remote=origin --push`
4. Vytvor vetvu `dev` a pushni ju. **Vývoj prebieha v `dev`, `main` = produkcia** (rovnako ako Danielov web danieltache.com). Merge do `main` len po mojom odsúhlasení.
5. Commity: malé, po logických krokoch, formát Conventional Commits v angličtine (`feat: add lead form validation`, `fix: …`, `docs: …`).

**Netlify (urobí Daniel v prehliadači – napíš mu postup do README):**
1. Netlify → Add new site → Import an existing project → GitHub → `recovery-clinic-lp`.
2. Branch to deploy: `main`, Build command: prázdne, Publish directory: `.`.
3. Site configuration → Build & deploy → Branches: zapnúť deploy aj pre `dev` (náhľadová URL na testovanie).
4. Doména (❓ zatiaľ neznáma): Domain management → Add domain → DNS podľa Netlify → HTTPS sa zapne automaticky.
5. **Po pripojení domény:** doplniť `siteUrl` v `config.js`, canonical + `og:url` + `og:image` v `index.html`, doménu v GA4 (cross-domain) a overiť doménu v Meta Business Manageri.

---

## 14. Fázy práce

| Fáza | Obsah | Hotovo, keď |
|---|---|---|
| **0 – Plán** | Prečítaj celý dokument a PNG v `design/`. Predlož plán súborov, zoznam otázok ❓ a riziká. | Odsúhlasím plán. |
| **1 – Základ** | Repo + `dev`, štruktúra, fonty (latin-ext), `styles.css` s tokenmi a komponentmi, `config.js`, kostra `index.html` so všetkými sekciami. | Stránka sa otvorí, typografia a farby sedia s Figmou. Push do `dev`. |
| **2 – Sekcie** | Všetky sekcie s finálnymi textami, responzívny layout, carousely, FAQ, sticky lišta, varianty `?v=`. | Desktop aj mobil vizuálne zodpovedajú PNG z Figmy. |
| **3 – Formulár + backend** | Validácia, odoslanie, stavy, `Code.gs`, `setupSheet`, README pre nasadenie. | Testovací režim funguje; po nasadení skriptu príde riadok do Sheetu. |
| **4 – Tracking** | Consent Mode + lišta, atribúcia, všetky dataLayer eventy, `docs/tracking-plan.md`. | V GTM Preview vidím všetky eventy so správnymi parametrami. |
| **5 – SEO a kvalita** | Meta, OG, JSON-LD, favicon, `robots.txt`, `404.html`, `netlify.toml`, Lighthouse, prístupnosť, `qa-checklist.md`. | Lighthouse ciele z kap. 11 splnené. |
| **6 – Odovzdanie** | `README.md` (ako meniť texty, testovať, nasadiť, zoznam TODO), `CLAUDE.md`, finálny push. | Pripravené na merge do `main` a pripojenie Netlify. |

Po každej fáze napíš: čo je hotové, ako to otestujem (konkrétne kroky), čo ostáva ako TODO.

---

## 15. Otvorené body (❓ / TODO) – drž ich v README aktuálne
- ❓ Doména LP (Daniel doplní pri hostingu) → `siteUrl`, canonical, OG, GA4 domény, overenie domény v Mete.
- ❓ Podmienky zľavy 20 % (len prvá infúzia? noví klienti? nesčítava sa s akciami?).
- ❓ Sľub „ozveme sa do 24 hodín" – zvládne to recepcia aj cez víkend?
- ❓ Kde bude Google Sheet (účet kliniky vs. Danielov) a kto dostáva notifikácie.
- ❓ Súhlas s použitím recenzií + odkaz na Google Business Profile.
- ❓ Odpovede vo FAQ odsúhlasí klinika.
- ❓ Ceny a výber 4 infúzií (overiť v Apponiu), deep linky Apponia na konkrétne služby.
- ❓ Pokrýva existujúca „Ochrana osobných údajov" aj formulár na LP? (Voľba „Čo chcete riešiť?" sa môže dotýkať údajov o zdraví – nech to klinika preverí so zodpovednou osobou; preto je pole nepovinné a nikam okrem Sheetu nejde.)
- TODO: fotky (lounge, kreslá, MUDr. Žiaran, tím), `og-image.jpg` 1200×630.
- TODO: rozšíriť Make scenár o voucher e-mail pre leady z karty `LP leady`.
- TODO (fáza 2, mimo tohto zadania): nahrávanie stavu CONVERTED ako offline konverzií do Google Ads (gclid) a Mety (CAPI, `event_id`), aby sa kampane optimalizovali na rezervácie, nie na leady.
