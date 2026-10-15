# CLAUDE.md – pamäť projektu

Kampaňová landing page pre Recovery Clinic Bratislava (IV infúzie).
Pôvodné zadanie je v `MASTER_PROMPT.md`, návod pre Daniela v `README.md`.

## Pravidlá, ktoré platia vždy

1. **Len čisté HTML, CSS a vanilla JS.** Žiadne frameworky, žiadny build krok,
   žiadne runtime npm závislosti. Stránka musí fungovať po nahratí súborov.
2. **Čitateľnosť nad šikovnosťou.** Kód bude upravovať junior PPC špecialista.
   Komentáre v slovenčine na úrovni sekcií. Žiadna minifikácia v repozitári.
3. **Nevymýšľaj fakty.** Obsah ber z `MASTER_PROMPT.md`. Čo chýba, označ `TODO`
   a zapíš do zoznamu v `README.md`.
4. **Texty v `MASTER_PROMPT.md` majú prednosť pred Figmou.** Figma je šablóna
   pre vizuál. Výnimka: kratšie mobilné texty v hero sú z Figmy zámerne, aby sa
   na prvú obrazovku 390×844 zmestili obe CTA.
5. **Žiadne citlivé údaje v repozitári.** URL Apps Scriptu nie je tajomstvo, ale
   patrí do `config.js`.

## Tri veci, ktoré sa ľahko pokazia

### Zdravotné údaje nesmú opustiť Google Sheet
Hodnoty chipov „Čo chcete riešiť?" idú **výhradne do Sheetu**. Nikdy do
dataLayeru, nikdy do URL, nikdy do Meta Pixelu. FAQ posiela poradové číslo
otázky, nie text. Meta má účet kliniky zaradený medzi zdravie/wellness a vie
zablokovať eventy celému reklamnému účtu.

### Konverzia sa hlási až po zápise na serveri
`generate_lead` sa pushne **až po `ok: true`** z Apps Scriptu, nikdy po kliknutí
na tlačidlo. V `form.js` to chráni príznak `isSubmitting` – zablokované tlačidlo
nestačí, formulár sa dá odoslať aj Enterom v poli.

### Varianty `?v=` sú písmená, nie slová
`a`–`e`, nie `imunita`/`bolest`. URL ide do Meta Pixelu a zdravotné slová v nej
môžu spustiť obmedzenia. Figma ukazuje slovné kódy – tie sú zastarané.

## Zľava 20 % – zmena oproti pôvodnému zadaniu

Zľava platí pre **každého nového klienta**, automaticky, aj pri priamej
rezervácii cez Apponio. **Nie je odmenou za vyplnenie formulára.** Formulár
preto predáva bezplatnú konzultáciu („Chcem poradiť s výberom"), nie zľavu.
Priama rezervácia je rovnocenná konverzia, nie únik.

Percento sa do textu vkladá cez `<span data-discount>20</span>` a `app.js` ho
dopĺňa z configu – nikdy ho nepíš do textu natvrdo.

## Kde čo je

| Súbor | Obsah |
|---|---|
| `assets/js/config.js` | všetko, čo sa mení: kontakty, odkazy, zľava, varianty, `leadValue` |
| `assets/js/app.js` | UI: varianty, carousely, sticky lišta, scroll, dataLayer eventy |
| `assets/js/form.js` | validácia, atribúcia, odoslanie, stav Úspech |
| `assets/js/consent.js` | cookie lišta a Consent Mode v2 |
| `assets/css/styles.css` | tokeny v `:root`, potom komponenty a sekcie |
| `google-apps-script/Code.gs` | backend, serverová validácia, deduplikácia |

Consent Mode default a GTM snippet sú **inline v `<head>`** – musia bežať pred
všetkým ostatným. GTM ID je natvrdo na troch miestach (head, noscript iframe,
`config.js` ako evidencia), lebo načítanie z configu by blokovalo vykreslenie.

## Rozhodnutia, ktoré neruš bez opýtania

- **`noindex, follow`** je zámerné – organické pozície má vlastniť hlavný web.
  `robots.txt` preto **nič neblokuje**, inak by Googlebot noindex neprečítal
  a Google Ads by nevedel ohodnotiť vstupnú stránku. SEO skóre ~69 je správne.
- **Fonty lokálne**, nikdy z `fonts.googleapis.com` (GDPR). Subsety `latin`
  **aj** `latin-ext` – bez druhého nefungujú č, ľ, ť, ž, ô.
- **Preload fontov pomáha** – overené meraním, bez neho stúpne FCP o 0,3 s.
- **CSS 45 kB a JS 46 kB** prekračujú limity zo zadania. Daniel sa rozhodol
  nechať komentáre tak – po gzipe ide po drôte 11 + 16 kB.
- **Na odkazy do Apponia nedávaj UTM parametre** – rozbilo by to session a
  atribúciu v GA4. Cross-domain nesie linker cez `_gl`.
- **Žiadne menu v hlavičke.** Každý odkaz navyše je únik z konverzie. Na mobile
  je v hlavičke len logo a telefón, rezerváciu nesie sticky lišta.

## Testovanie

```bash
python3 -m http.server 8080
```

Prehliadač si tvrdo cachuje `styles.css` a `app.js` – pri testovaní vždy
`Cmd/Ctrl + Shift + R`, inak uvidíš starú verziu.

Lighthouse meraj **až na nasadenej stránke**, nie na localhoste: lokálny server
nevie gzip ani cache hlavičky a skóre vyjde o 8 bodov nižšie.

Checklist pred spustením: `docs/qa-checklist.md`.

## Git

Vývoj v `dev`, produkcia `main`. Merge do `main` až po odsúhlasení Danielom.
Commity v angličtine, Conventional Commits.
