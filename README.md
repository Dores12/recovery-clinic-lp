# Recovery Clinic Bratislava – lead-gen landing page

Jednostránková kampaňová stránka na zber kontaktov pre IV kliniku v Bratislave.
Čisté HTML, CSS a vanilla JavaScript – **žiadny build krok, žiadne npm závislosti**.
Súbory sa nahrajú na hosting a stránka beží.

| | |
|---|---|
| **Repozitár** | [Dores12/recovery-clinic-lp](https://github.com/Dores12/recovery-clinic-lp) |
| **Vetvy** | `main` = produkcia · `dev` = vývoj |
| **Hosting** | Netlify (postup nižšie) |
| **Backend formulára** | Google Sheets (karta *Leady* pre personál + skrytá *Technické údaje*) + Apps Script |
| **Meranie** | vlastný GTM kontajner len pre LP: `GTM-TR78PWKK` |

---

## Rýchly štart

```bash
python3 -m http.server 8080
```

Otvor `http://localhost:8080/`. Na test kampaňových parametrov:

```
http://localhost:8080/?v=b&utm_source=test&gclid=TEST123
```

> **Vždy si vynucuj tvrdé obnovenie** (`Cmd/Ctrl + Shift + R`). Prehliadač si
> drží CSS a JS v cache a inak budeš hľadať chybu, ktorá je už opravená.
> Python `http.server` neposiela cache hlavičky, takže si prehliadač myslí,
> že staré súbory stále platia. Keď to nepomôže, zastav server (`Ctrl+C`)
> a spusti ho znova.

> **Otvorenie `index.html` dvojklikom cez Finder** (adresa `file://`) je fajn na
> rýchly vizuálny pohľad, ale **neotestuješ tak formulár ani meranie** –
> odoslanie na Apps Script aj GTM sa z `file://` správajú inak než zo servera.
> Na tie veci vždy použi `http://localhost:8080`.

---

## Kde čo meniť

### Texty → `index.html`

Všetky texty sú priamo v HTML. Sekcie sú oddelené komentármi:

```html
<!-- ==========================================================================
     INFÚZIE
     ========================================================================== -->
```

**Percento zľavy nikdy neprepisuj v texte.** Je v `<span data-discount>20</span>`
a JavaScript ho doplní z configu. Zmena čísla v `config.js` ho prepíše na
všetkých 8 miestach naraz.

### Kontakty, odkazy, zľava, varianty → `assets/js/config.js`

Jediný súbor, ktorý treba meniť pri bežných úpravách:

| Pole | Čo robí |
|---|---|
| `siteUrl` | doména (pozri *Keď dostaneš doménu* nižšie) |
| `formEndpoint` | URL Apps Scriptu; **prázdne = testovací režim** |
| `bookingUrl`, `voucherUrl`, `mapsUrl` | odkazy |
| `phone`, `phoneDisplay`, `email`, `address`, `hours` | kontakty |
| `discount.percent` | číslo zľavy v celom texte |
| `discount.terms` | drobné písmo pod formulárom |
| `googleReviewsUrl` | **prázdne = odkaz na Google recenzie sa skryje** |
| `tracking.leadValue` | hodnota leadu pre GA4 a Google Ads (teraz `49`) |
| `variants` | varianty H1 podľa `?v=` |
| `debug` | `true` vypíše každý dataLayer push do konzoly |

### Vzhľad → `assets/css/styles.css`

Hore v `:root` sú všetky farby, veľkosti písma, rádiusy a medzery ako premenné.
Zmena na jednom mieste sa prejaví všade. Komponenty majú vlastné komentované
sekcie.

---

## Štruktúra

```
index.html                  celá stránka, všetky texty
404.html                    chybová stránka v rovnakom dizajne
robots.txt                  zámerne nič neblokuje (vysvetlené v súbore)
netlify.toml                bezpečnostné hlavičky a cache

assets/css/styles.css       tokeny + komponenty + sekcie
assets/js/config.js         VŠETKO, čo sa mení
assets/js/consent.js        cookie lišta + Consent Mode v2
assets/js/app.js            UI: varianty, carousely, sticky lišta, dataLayer
assets/js/form.js           validácia a odoslanie formulára
assets/img/                 logo, biele logo, favicon, apple-touch-icon
assets/fonts/               Montserrat + DM Sans (latin aj latin-ext) + OFL

google-apps-script/Code.gs  backend formulára
google-apps-script/README.md  nasadenie krok za krokom

docs/tracking-plan.md       čo nastaviť v GTM, GA4, Google Ads a Mete
docs/qa-checklist.md        čo otestovať pred spustením

design/                     PNG exporty z Figmy (referencia)
MASTER_PROMPT.md            pôvodné zadanie
CLAUDE.md                   pamäť projektu pre ďalšie sedenia Claude Code
```

---

## Ako to funguje

### Všetko ide cez formulár

Na stránke **nie je žiadny priamy odkaz do Apponia**. Do rezervácie sa dá
dostať až zo stavu Úspech po odoslaní formulára – vďaka tomu je každá
rezervácia zároveň Lead v Meta.

Vo formulári si človek vyberie, ako chce pokračovať:

| Voľba | Čo sa stane |
|---|---|
| **Vyberiem si termín online** | v stave Úspech dostane tlačidlo do Apponia |
| **Zavolajte mi** | ozve sa recepcia; rezervácia je len doplnková možnosť |

Voľba ide do Sheetu ako `pokracovanie` a do dataLayeru ako `lead_path`.
Stĺpec `booking_click_at` ukáže, kto na rezerváciu naozaj klikol.

> Keby sa niekam vrátil priamy odkaz na Apponio, časť rezervácií prestane byť
> meraná. Je to prvá vec v QA checkliste.

### Varianty H1 podľa `?v=`

| URL | Téma |
|---|---|
| `?v=a` (default) | Imunita |
| `?v=b` | Únava |
| `?v=c` | Šport |
| `?v=d` | Beauty |

Variant prepíše H1 a predvyberie chip vo formulári. Neznámy alebo chýbajúci
parameter = `a`.

> **Prečo písmená a nie slová.** URL sa posiela do Meta Pixelu a zdravotné slová
> v nej (napr. `bolest`) môžu spustiť obmedzenia pre zdravotných inzerentov.
> Figma ukazuje slovné kódy – tie sú zastarané, platia písmená.

### Čo sa nikdy neposiela do meraní

Hodnoty z „Čo chcete riešiť?" a názov vybranej infúzie idú **výhradne do Google
Sheetu** – nikdy do dataLayeru, nikdy do URL. FAQ posiela poradové číslo otázky,
nie jej text.

### Žiadne zdravotné výrazy

Meta pixel na tejto stránke **nie je v zdravotnej kategórii** a musí to tak
ostať. Preto na nej nie sú názvy ani popisy zdravotných ťažkostí – klinika
takéto infúzie ponúka, ale odporučí ich zdravotník pri konzultácii. Kontrolný
príkaz je v QA checkliste, sekcia 2.

### Ponuka infúzií

Ceny a texty všetkých 12 infúzií sú **len v `assets/js/infusions.js`**. Z neho
sa vykreslia 4 hlavné karty aj rozbaliteľný zoznam s filtrami. Keď chceš zmeniť
cenu alebo pridať infúziu, meníš len ten súbor.

---

## Nasadenie

### 1. Backend formulára

Celý postup: [`google-apps-script/README.md`](google-apps-script/README.md).
Päť krokov – založiť Sheet, vložiť `Code.gs`, spustiť `setupSheet`, nasadiť web
app, vložiť URL do `config.js`.

**Kým to neurobíš, formulár beží v testovacom režime** – nič sa neukladá a nad
formulárom svieti žltý pruh.

### 2. Netlify

1. Netlify → **Add new site** → *Import an existing project* → GitHub →
   `recovery-clinic-lp`
2. **Branch to deploy:** `main` · **Build command:** nechaj prázdne ·
   **Publish directory:** `.`
3. *Site configuration → Build & deploy → Branches:* zapni deploy aj pre `dev`
   (dostaneš náhľadovú URL na testovanie)
4. *Domain management → Add domain* → nastav DNS podľa Netlify. HTTPS sa zapne
   automaticky.

### 3. GTM

Postupuj podľa [`docs/tracking-plan.md`](docs/tracking-plan.md). Stránka sama
nič nemeria – len pushuje udalosti do `dataLayer`.

### 4. Pred spustením kampaní

Prejdi [`docs/qa-checklist.md`](docs/qa-checklist.md).

---

## Keď dostaneš doménu

Doménu treba doplniť na **piatich miestach** – meta tagy sa čítajú bez
JavaScriptu, takže sa nedajú načítať z configu:

- [ ] `assets/js/config.js` → `siteUrl`
- [ ] `index.html` → `<link rel="canonical">`
- [ ] `index.html` → `<meta property="og:url">`
- [ ] `index.html` → JSON-LD `"url"`
- [ ] `robots.txt` → riadok `Sitemap` (odkomentuj)

V kóde sú označené `TODO: domena`, nájdeš ich takto:

```bash
grep -rn "TODO-domena" .
```

Potom ešte:

- [ ] overiť doménu v **Meta Business Manageri**
- [ ] pridať doménu do **GA4** medzi cross-domain domény

---

## Výkon

Lighthouse, mobil, proti hostingu s gzipom a cache hlavičkami:

| | Nameraný | Cieľ |
|---|---|---|
| Performance | **96** (medián z 3 behov, bez GTM) | ≥ 95 ✅ |
| Accessibility | **100** | ≥ 95 ✅ |
| Best Practices | **100** | ≥ 95 ✅ |
| CLS | **0** | < 0,05 ✅ |
| LCP | **2,5 s** | < 2,0 s ❌ |

Merané ešte s neexistujúcim kontajnerom. Odkedy v ňom sú tagy, počítaj
asi o 2 body menej – GTM a Meta pixel si svoje vezmú.

**SEO skóre bude okolo 69 a je to správne** – stránka má zámerne `noindex`.

> **Nemeraj Lighthouse na `localhost`.** Lokálny `python3 -m http.server` nevie
> gzip ani cache hlavičky a skóre vyjde o 8 bodov nižšie. Meraj až nasadenú
> stránku.

> **Performance kolíše medzi 93 a 95, a je to normálne.** Spôsobuje to GTM:
> Total Blocking Time skáče medzi 138 a 211 ms podľa toho, ako rýchlo sa
> načítajú GA4 a Meta Pixel. FCP, LCP aj CLS sú pritom úplne stabilné. Keď
> nameriaš 93, pusti to ešte dvakrát a ber medián.

Čo o výkone vieme z meraní:

- **GTM stojí 2 body** Performance a 140 ms blokovania. Necháva sa – meranie je
  dôležitejšie než skóre.
- **Preload fontov pomáha** – bez neho stúpne prvé vykreslenie z 2,0 s na 2,3 s.
- **Fotka lounge má `fetchpriority="low"`.** Bez toho sa jej 80 kB sťahovalo
  súbežne s CSS a fontmi a LCP stúplo z 2,5 s na 2,9 s – stálo to 3 body.
  Nechaj to tak.
- **Minifikácia nemá zmysel.** Postavil som minifikovanú verziu (esbuild
  na CSS aj JS, komentáre preč z HTML) a zmeral ju proti súčasnej: **96 vs 96**.
  Po gzipe je úspora asi 9 kB, čo sa na skóre neprejaví. Preto je kód
  v repozitári naďalej komentovaný a čitateľný.
- **LCP 2,3 s** zaostáva o 0,3 s. Meria sa pri simulovanom pomalom 4G so 4×
  spomaleným procesorom; na reálnom mobile je to výrazne lepšie. Ak by to
  prekážalo, najväčšia rezerva je v 45 kB CSS.

**Veľkosti:** CSS 45 kB a JS 46 kB prekračujú limity zo zadania (40 a 30 kB),
pretože kód je zámerne bohato komentovaný a neminifikovaný. Po gzipe ide po
drôte 11 kB CSS a 16 kB JS, takže na výkon to vplyv nemá.

---

## Otvorené body

### Čaká na teba

- [ ] **Nastaviť tagy v GTM** `GTM-TR78PWKK` podľa `docs/tracking-plan.md`
      (kontajner je už v kóde zapojený)
- [ ] **Doplniť Meta PIXEL_ID** z Konverzky do tagov v GTM
- [ ] **Nasadiť novú verziu Apps Scriptu** (nie nové nasadenie!) a spustiť
      `setupSheet()`, nech sa doplnia stĺpce `pokracovanie`, `infuzia`
      a `booking_click_at`
- [ ] **Overiť ceny v Apponiu**, hlavne Double glutation
- [ ] **Doména** → päť miest vyššie
- [ ] **Nasadiť Apps Script** → `google-apps-script/README.md`
- [ ] **Nastaviť GTM** → `docs/tracking-plan.md`
- [ ] **Spracovateľská zmluva s klinikou** – Sheet s osobnými údajmi ich
      klientov je v tvojom účte, takže si voči nim spracovateľ
- [ ] **Filter na `localhost`** v GA4 (*Správca → Dátové streamy → Interná
      prevádzka*), nech ti testovanie neznečisťuje dáta

### Čaká na klienta

- [ ] **Fotka lounge** s masážnymi kreslami. Teraz je tam placeholder.
      Formát: WebP + JPG fallback cez `<picture>`, `srcset` 1×/2×, povinné
      `width` a `height` (inak sa rozbije CLS)
- [ ] **`og-image.jpg` 1200×630** z Figmy. Dočasne sa používa fotka z WP webu
- [ ] **Odkaz na Google Business Profile** → `googleReviewsUrl`. Kým je prázdny,
      odkaz „Ďalšie recenzie na Google" sa automaticky skryje
- [ ] **Overiť, či „Ochrana osobných údajov" pokrýva aj tento formulár.** Voľba
      „Čo chcete riešiť?" sa môže dotýkať údajov o zdraví – preto je nepovinná
      a nejde nikam okrem Sheetu
- [ ] **Sľub „ozveme sa do 24 hodín"** – zvládne to recepcia aj cez víkend?
      Je v hero, vo formulári aj v stave Úspech
- [ ] **Deep linky Apponia** na konkrétnu službu. Teraz všetky karty vedú na
      `#reservation`

### Na neskôr

- [ ] **Voucher e-mail cez Make** – rozšíriť existujúci scenár o trigger
      *Watch Rows* na karte `LP leady` (postup v `google-apps-script/README.md`)
- [ ] **Offline konverzie** – recepcia prepisuje `status` na `CONVERTED`;
      nahrať späť do Google Ads cez `gclid` a do Mety cez CAPI. Toto je liek na
      „veľa leadov, málo rezervácií" (`docs/tracking-plan.md`, kapitola 8)
- [ ] **CSP hlavička** – zatiaľ nie je, lebo GTM by vyžadoval veľa výnimiek
      a pri každom novom tagu by sa stránka ticho rozbila. Keď bude kontajner
      ustálený, doplniť do `netlify.toml`

---

## Práca s repozitárom

Vývoj prebieha v `dev`, `main` je produkcia. Merge do `main` až po odsúhlasení.

```bash
git checkout dev
# … úpravy …
git add -A
git commit -m "fix: upravit text v hero"
git push origin dev
```

Commity v angličtine, formát Conventional Commits: `feat:`, `fix:`, `docs:`,
`chore:`.
