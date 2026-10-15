# QA checklist – pred spustením kampaní

Prejdi zhora nadol. Čo neprejde, zapíš do issue alebo mi napíš.

**Lokálny náhľad:**

```bash
python3 -m http.server 8080
```

Potom `http://localhost:8080/?v=b&utm_source=test&gclid=TEST123`.

> **Pri testovaní CSS a JS si vynucuj tvrdé obnovenie** (`Cmd/Ctrl + Shift + R`).
> Prehliadač si štýly drží v cache a inak uvidíš starú verziu – stalo sa mi to
> pri vývoji a chvíľu som hľadal chybu, ktorá tam už nebola.

---

## 1. Varianty H1 (`?v=`)

- [ ] `?v=a` – „Dobite si **imunitu aj energiu**…", predvybraný chip **Imunita**
- [ ] `?v=b` – „Ráno bez energie?…", chip **Únava a energia**
- [ ] `?v=c` – „Rýchlejšia **regenerácia po tréningu**…", chip **Regenerácia po športe**
- [ ] `?v=d` – „**Žiarivá pleť** zvnútra…", chip **Pleť a detox**
- [ ] `?v=e` – „Akútna **bolesť chrbta**?…", chip **Bolesť**
- [ ] `?v=nezmysel` aj úplne bez parametra → variant `a`
- [ ] Zvýraznená časť H1 je modrá, zvyšok navy
- [ ] S vypnutým JavaScriptom sa zobrazí default H1 (variant `a`)

## 2. Formulár – validácia

- [ ] Odoslanie prázdneho formulára: 4 chyby, kurzor skočí na **Meno**
- [ ] Meno `J` → „Zadajte meno a priezvisko."; po oprave chyba zmizne hneď
- [ ] Telefón – prijme a uloží ako `+421…`:
  - [ ] `0948 375 871`
  - [ ] `+421948375871`
  - [ ] `00421948375871`
  - [ ] `02/5443 1234` (pevná linka)
  - [ ] `+44 7700 900123` (zahraničné)
- [ ] Telefón `123` → chybová hláška
- [ ] E-mail `jana@gmail` → „Skontrolujte e-mail – napr. jana@gmail.com."
- [ ] E-mail `jana@gmial.com` → ponuka „Mysleli ste jana@gmail.com?", klik ju opraví
- [ ] Nezaškrtnutý súhlas → „Na odoslanie potrebujeme váš súhlas."
- [ ] Ovládanie len klávesnicou: Tab prejde všetky polia aj chipy, Medzerník prepne chip

## 3. Formulár – odoslanie

- [ ] **Testovací režim** (prázdny `formEndpoint`): žltý pruh, po ~1 s stav Úspech
- [ ] Počas odosielania je tlačidlo zablokované, píše „Odosielam…" a točí sa spinner
- [ ] **Dvojité odoslanie** (dvakrát rýchlo Enter v poli) vyrobí len **jeden** lead
- [ ] **Vypnutý internet** → chybový box s telefónom, údaje vo formulári ostanú,
      tlačidlo sa odblokuje
- [ ] Stav Úspech oslovuje krstným menom a URL stránky sa **nezmení**
- [ ] „Vybrať termín online" v stave Úspech vedie do Apponia

## 4. Google Sheet a Apps Script

Postup nasadenia: [`google-apps-script/README.md`](../google-apps-script/README.md)

- [ ] `/exec` v prehliadači vráti `{"ok":true,"service":"recovery-lp"}`
- [ ] Po odoslaní pribudne riadok v karte `LP leady`
- [ ] Riadok má vyplnené `utm_source`, `gclid`, `lp_variant`, `consent_ads`
- [ ] Telefón je v tvare `+421…` (so apostrofom, aby ho Sheets nezmenil na číslo)
- [ ] `status` má rozbaľovací zoznam a je nastavený na `CREATED`
- [ ] Notifikačný e-mail prišiel a telefón v ňom je klikateľný
- [ ] **Duplicita:** rovnaký telefón do 10 minút nevyrobí druhý riadok
- [ ] **Robot:** odoslanie do 2,5 s od načítania sa nezapíše (a formulár nehlási chybu)

## 5. Tracking

Podrobnosti: [`docs/tracking-plan.md`](tracking-plan.md)

- [ ] GTM Preview sa pripojí
- [ ] `generate_lead` príde **len raz** a **len po úspešnom zápise**
- [ ] `event_id` v GTM sa zhoduje s `lead_id` v Google Sheete
- [ ] `generate_lead` **nemá** `test_mode: true` (ak má, nie je nasadený endpoint)
- [ ] `booking_click` má správny `link_location` z: header, hero, card, sticky,
      form, success, final, all_infusions
- [ ] `phone_click`, `form_start`, `faq_open`, `scroll_depth`, `section_view` prichádzajú
- [ ] V žiadnom evente **nie je nič o záujme ani o zdraví**
- [ ] GA4 DebugView: udalosti prichádzajú
- [ ] Pred súhlasom má hit `gcs=G100`, po „Prijať všetko" `gcs=G111`
- [ ] Klik do Apponia nesie parameter `_gl` (cross-domain)
- [ ] Meta Pixel Helper: `Lead` s `eventID`, **len po marketingovom súhlase**

## 6. Cookie lišta

- [ ] Pri prvej návšteve sa zobrazí a **neblokuje** obsah stránky
- [ ] „Prijať všetko" a „Odmietnuť" sú rovnako výrazné
- [ ] „Nastaviť podrobne" otvorí prepínače; „Nevyhnutné" sa nedá vypnúť
- [ ] Po rozhodnutí sa lišta zavrie a po obnovení stránky sa už neukáže
- [ ] „Nastavenie cookies" v pätičke ju otvorí znova s pôvodnou voľbou
- [ ] Po „Odmietnuť" sa **nenastavia** cookies `_ga` ani `_fbp`
- [ ] Na mobile sa lišta posunie **nad** sticky lištu a neprekrýva ju

## 7. Responzívnosť

Otestuj šírky **320, 375, 390, 414, 768, 1024, 1280, 1440 px**.

- [ ] Nikde nie je horizontálny scroll
- [ ] **Prvá obrazovka mobilu (390×844)** ukáže H1, benefity **aj obe tlačidlá**
- [ ] Sticky lišta sa objaví po hero a zmizne pri formulári aj pri závere
- [ ] Sticky lišta nezakrýva obsah ani na iPhone so zaoblením (safe area)
- [ ] Carousel infúzií a recenzií sa posúva, bodky sa prepínajú
- [ ] Na desktope sú z carouselu mriežky a bodky sú skryté
- [ ] V hlavičke na mobile je len logo a telefón (žiadne tlačidlo rezervácie)

## 8. Prístupnosť

- [ ] Tab prejde celú stránku v logickom poradí a focus je **vždy vidieť**
- [ ] Skip-link „Preskočiť na formulár" funguje (prvý Tab po načítaní)
- [ ] FAQ sa dá otvoriť klávesnicou (Enter na otázke)
- [ ] Cookie lišta sa dá ovládať klávesnicou, Escape ju zavrie
- [ ] Čítačka obrazovky ohlási chyby vo formulári aj stav Úspech
- [ ] Stránka funguje aj s vypnutými animáciami (`prefers-reduced-motion`)

## 9. Výkon

Lighthouse, **mobil**, režim inkognito, **proti nasadenej stránke** (nie localhost
– lokálny `http.server` nevie gzip ani cache hlavičky a výsledok podhodnotí).

- [ ] Performance ≥ 95
- [ ] Accessibility ≥ 95
- [ ] Best Practices ≥ 95
- [ ] CLS < 0,05
- [ ] Žiadne chyby v konzole

> SEO skóre bude okolo **69** a je to **v poriadku** – stránka má zámerne
> `noindex`. Viac v `index.html` pri meta tagu `robots`.

## 10. Posledná kontrola pred spustením

- [ ] `config.js` → `formEndpoint` je vyplnený
- [ ] `config.js` → `debug: false`
- [ ] `config.js` → `siteUrl` je skutočná doména
- [ ] `index.html` → doména doplnená v **canonical, og:url a JSON-LD**
- [ ] `og-image.jpg` nahradil dočasnú fotku z WP webu
- [ ] Fotky lounge a MUDr. Žiarana nahradili placeholdery
- [ ] Doména je overená v Meta Business Manageri
- [ ] Doména je v GA4 medzi cross-domain doménami
- [ ] Stránka odoslaná z `dev` do `main` a Netlify ju nasadil
