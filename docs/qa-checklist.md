# QA checklist – pred spustením kampaní

Prejdi zhora nadol. Čo neprejde, zapíš do issue alebo mi napíš.

**Lokálny náhľad:**

```bash
python3 -m http.server 8080
```

Potom `http://localhost:8080/?v=b&utm_source=test&gclid=TEST123`.

> **Pri testovaní CSS a JS si vynucuj tvrdé obnovenie** (`Cmd/Ctrl + Shift + R`).
> Prehliadač si štýly drží v cache a inak uvidíš starú verziu – stalo sa mi to
> pri vývoji a chvíľu som hľadal chybu, ktorá tam už nebola. Keď to nepomôže,
> zastav server (`Ctrl+C`) a spusti ho znova.

> **Otvorenie `index.html` dvojklikom cez Finder** (adresa `file://`) je fajn na
> rýchly vizuálny pohľad, ale **neotestuješ tak formulár ani meranie** –
> odoslanie na Apps Script aj GTM sa z `file://` správajú inak než zo servera.
> Na tie veci vždy použi `http://localhost:8080`.

---

## 1. Žiadna rezervácia pred formulárom

Celá stránka je postavená na tom, že do Apponia sa dá dostať **až zo stavu
Úspech**. Keby sa niekam vrátil priamy odkaz, časť rezervácií prestane byť
meraná ako Lead.

- [ ] Pred odoslaním formulára nie je na stránke žiadny odkaz na `myapponio.com`
      – v DevTools (Elements) hľadaj „myapponio", nesmie byť ani jeden výskyt
- [ ] Hlavička, hero, sticky lišta aj záverečná výzva vedú na `#formular`
- [ ] V stave Úspech odkaz na rezerváciu **je**

## 2. Žiadne zdravotné výrazy

Na stránke beží Meta pixel mimo zdravotnej kategórie. Tento príkaz nesmie nájsť
nič v súboroch, ktoré idú na web:

```bash
rg -i "pain killer|acute|pms|vertigo|tetánia|chronická únava|stop stress|bolesť|bolest" index.html 404.html assets/
```

- [ ] Príkaz nevráti nič
- [ ] (`MASTER_PROMPT.md` a `docs/` výsledky obsahovať môžu – na web sa
      nenahrávajú, blokuje ich `netlify.toml`)

## 3. Varianty H1 (`?v=`)

- [ ] `?v=a` – „Dobite si **imunitu aj energiu**…", chip **Imunita**
- [ ] `?v=b` – „Ráno bez energie?…", chip **Únava a energia**
- [ ] `?v=c` – „Rýchlejšia **regenerácia po tréningu**…", chip **Regenerácia po športe**
- [ ] `?v=d` – „**Žiarivá pleť** zvnútra…", chip **Pleť a detox**
- [ ] `?v=e` aj `?v=nezmysel` aj bez parametra → variant `a`
- [ ] S vypnutým JavaScriptom sa zobrazí default H1

## 4. Ponuka infúzií

- [ ] Hore sú 4 karty: Imunity Booster, Virus Killer, Glutation, Sport Recovery
- [ ] „Zobraziť všetky infúzie (12)" rozbalí zoznam, text sa zmení na „Skryť ponuku"
- [ ] Rozbalenie funguje **klávesnicou** (Tab na tlačidlo, Enter)
- [ ] Filtre Všetky / Imunita / Energia / Beauty / Šport / Po oslave filtrujú
      správne a aktívny má tmavé pozadie
- [ ] Filtre sa dajú prejsť klávesnicou
- [ ] Glutation má prečiarknutú pôvodnú cenu 179 € a aktuálnu 139 €
- [ ] Na mobile sa filtre dajú posunúť do strany a zoznam je v jednom stĺpci

## 5. „Mám záujem"

- [ ] Klik na karte aj v zozname posunie na formulár
- [ ] Nad chipmi sa zobrazí štítok „Vybraná infúzia: {názov}"
- [ ] Zaškrtne sa chip podľa kategórie (Beauty → Pleť a detox, Šport →
      Regenerácia po športe, Po oslave → žiadny)
- [ ] Kurzor skočí do prvého **prázdneho** poľa
- [ ] Krížik na štítku výber zruší a skryje štítok

## 6. Formulár – validácia

- [ ] Odoslanie prázdneho formulára: 5 chýb, kurzor skočí na **Meno**
- [ ] Meno `J` → „Zadajte meno a priezvisko."; po oprave chyba zmizne hneď
- [ ] Telefón – prijme a uloží ako `+421…`:
  - [ ] `0948 375 871` · `+421948375871` · `00421948375871`
  - [ ] `02/5443 1234` (pevná linka) · `+44 7700 900123` (zahraničné)
- [ ] Telefón `123` → chybová hláška
- [ ] E-mail `jana@gmail` → „Skontrolujte e-mail – napr. jana@gmail.com."
- [ ] E-mail `jana@gmial.com` → ponuka „Mysleli ste jana@gmail.com?", klik opraví
- [ ] **Bez voľby „Ako chcete pokračovať"** → „Vyberte, ako chcete pokračovať."
      a obe dlaždice majú červený rámik
- [ ] Nezaškrtnutý súhlas → „Na odoslanie potrebujeme váš súhlas."
- [ ] Ovládanie klávesnicou: Tab prejde polia, dlaždice sa prepínajú šípkami,
      Medzerník prepne chip

## 7. Formulár – text tlačidla a odoslanie

- [ ] Bez voľby je na tlačidle „Získať zľavu 20 %"
- [ ] Po voľbe **Vyberiem si termín online** → „Získať zľavu a vybrať termín"
- [ ] Po voľbe **Zavolajte mi** → „Získať zľavu a konzultáciu"
- [ ] Počas odosielania je tlačidlo zablokované, píše „Odosielam…" so spinnerom
- [ ] **Dvojité odoslanie** (dvakrát rýchlo Enter v poli) vyrobí len **jeden** lead
- [ ] **Vypnutý internet** → chybový box s telefónom, údaje ostanú, tlačidlo sa odblokuje

## 8. Stav Úspech – obe verzie

**Voľba „Vyberiem si termín online":**
- [ ] „Zľavu 20 % na prvú infúziu máte zapísanú. Teraz si vyberte termín…"
- [ ] Primárne tlačidlo „Vybrať termín v rezervácii →" vedie do Apponia
- [ ] Pod ním poznámka o rovnakom e-maile alebo telefóne

**Voľba „Zavolajte mi":**
- [ ] „Zdravotník sa vám ozve do 24 hodín…"
- [ ] Linka, „Nechcete čakať?" a sekundárne tlačidlo „Vybrať termín online →"
- [ ] Rovnaká poznámka o e-maile a telefóne

**Obe:**
- [ ] Oslovenie krstným menom
- [ ] URL stránky sa **nezmení**
- [ ] Klik na rezerváciu zapíše čas do stĺpca `booking_click_at` v Sheete

## 9. Google Sheet a Apps Script

Postup nasadenia: [`google-apps-script/README.md`](../google-apps-script/README.md)

- [ ] `/exec` v prehliadači vráti `{"ok":true,"service":"recovery-lp"}`
      (ak dostaneš HTML prihlasovacej stránky, nasadenie nemá prístup
      **Ktokoľvek**)
- [ ] Po odoslaní pribudne riadok v karte `LP leady`
- [ ] Vyplnené sú `pokracovanie` (`online` / `call`), `infuzia`, `utm_source`,
      `gclid`, `lp_variant`, `consent_ads`
- [ ] Telefón je v tvare `+421…`
- [ ] `status` má rozbaľovací zoznam a je nastavený na `CREATED`
- [ ] Notifikačný e-mail prišiel; pri voľbe „Zavolajte mi" má predmet
      **„📞 ZAVOLAŤ: {meno}"**
- [ ] V tele e-mailu je „Ako chce pokračovať" aj „Vybraná infúzia"
- [ ] **Duplicita:** rovnaký telefón do 10 minút nevyrobí druhý riadok
- [ ] **Robot:** odoslanie do 2,5 s od načítania sa nezapíše (bez chyby)
- [ ] `setupSheet()` spustený druhýkrát nič nepokazí a dáta ostanú

## 10. Tracking – nový GTM kontajner

Podrobnosti: [`docs/tracking-plan.md`](tracking-plan.md)

- [ ] Nové GTM ID je doplnené na **troch** miestach (head, noscript, `config.js`)
- [ ] Nikde v kóde už nie je `GTM-XXXXXXX` ani staré `GTM-P8RKNPB4`
- [ ] GTM Preview sa pripojí
- [ ] `generate_lead` príde **len raz**, **len po úspechu**, s `event_id`
      aj `lead_path`
- [ ] `generate_lead` **nemá** `test_mode: true`
- [ ] `event_id` v GTM sa zhoduje s `lead_id` v Sheete
- [ ] `phone_click` príde z hlavičky, hero, sticky lišty, záveru aj FAQ
- [ ] `booking_click` príde v stave Úspech, s `link_location: 'success'`
- [ ] `infusion_interest` príde pri „Mám záujem", `infusions_expand` pri rozbalení
- [ ] V žiadnom evente **nie je nič o záujme, zdraví ani o vybranej infúzii**
      (okrem `item_name` v `infusion_interest`, čo sú názvy z `infusions.js`)
- [ ] GA4 DebugView: udalosti prichádzajú
- [ ] Meta Pixel Helper: `PageView` a `Lead` **až po marketingovom súhlase**,
      `Lead` má `eventID`, žiadne parametre o infúzii

## 11. Cookie lišta

- [ ] Pri prvej návšteve sa zobrazí a **neblokuje** obsah stránky
- [ ] „Prijať všetko" a „Odmietnuť" sú rovnako výrazné
- [ ] „Nastaviť podrobne" otvorí prepínače; „Nevyhnutné" sa nedá vypnúť
- [ ] Po rozhodnutí sa lišta zavrie a po obnovení sa už neukáže
- [ ] „Nastavenie cookies" v pätičke ju otvorí znova s pôvodnou voľbou
- [ ] Po „Odmietnuť" sa **nenastavia** cookies `_ga` ani `_fbp`
- [ ] Pred súhlasom má GA4 hit `gcs=G100`, po „Prijať všetko" `gcs=G111`
- [ ] Na mobile sa lišta posunie **nad** sticky lištu a neprekrýva ju

## 12. Responzívnosť

Otestuj šírky **320, 375, 390, 414, 768, 1024, 1280, 1440 px**.

- [ ] Nikde nie je horizontálny scroll
- [ ] **Prvá obrazovka mobilu (390×844)** ukáže H1, benefity **aj obe tlačidlá**
- [ ] Sticky lišta sa objaví po hero a zmizne pri formulári aj pri závere
- [ ] Sticky lišta nezakrýva obsah ani na iPhone so zaoblením (safe area)
- [ ] Carousel infúzií a recenzií sa posúva, bodky sa prepínajú
- [ ] Na desktope sú z carouselu mriežky a bodky sú skryté
- [ ] V hlavičke na mobile je len logo a telefón
- [ ] Fotka lounge sa načíta a nepodskočí layout (CLS 0)

## 13. Prístupnosť

- [ ] Tab prejde celú stránku v logickom poradí a focus je **vždy vidieť**
- [ ] Skip-link „Preskočiť na formulár" funguje (prvý Tab po načítaní)
- [ ] FAQ sa dá otvoriť klávesnicou (Enter na otázke)
- [ ] Cookie lišta sa dá ovládať klávesnicou, Escape ju zavrie
- [ ] Čítačka obrazovky ohlási chyby vo formulári aj stav Úspech
- [ ] Stránka funguje aj s vypnutými animáciami (`prefers-reduced-motion`)

## 14. Interné súbory nie sú verejné

Na nasadenej stránke (alebo v deploy preview) musia tieto URL vrátiť **404**:

- [ ] `/docs/tracking-plan.md`
- [ ] `/docs/qa-checklist.md`
- [ ] `/design/desktop.png`
- [ ] `/google-apps-script/Code.gs`
- [ ] `/MASTER_PROMPT.md`
- [ ] `/README.md`
- [ ] `/CLAUDE.md`

A tieto musia fungovať (**200**): `/`, `/404.html`, `/robots.txt`,
`/assets/css/styles.css`, `/assets/js/infusions.js`.

## 15. Výkon

Lighthouse, **mobil**, režim inkognito, **proti nasadenej stránke** (nie localhost
– lokálny `http.server` nevie gzip ani cache hlavičky a výsledok podhodnotí).

- [ ] Performance ≥ 95 (kolíše podľa GTM – pusti 3× a ber medián)
- [ ] Accessibility ≥ 95
- [ ] Best Practices ≥ 95
- [ ] CLS < 0,05
- [ ] Cache-Control na fontoch je rok (`netlify dev` to lokálne nevie overiť)
- [ ] Žiadne chyby v konzole

> SEO skóre bude okolo **69** a je to **v poriadku** – stránka má zámerne
> `noindex`.

## 16. Posledná kontrola pred spustením

- [ ] `config.js` → `formEndpoint` je vyplnený
- [ ] `config.js` → `debug: false`
- [ ] `config.js` → `siteUrl` je skutočná doména
- [ ] `index.html` → doména doplnená v **canonical, og:url a JSON-LD**
- [ ] `og-image.jpg` nahradil dočasnú fotku z WP webu
- [ ] Ceny v `infusions.js` overené v Apponiu (hlavne Double glutation)
- [ ] Doména je overená v Meta Business Manageri
- [ ] Doména je v GA4 medzi cross-domain doménami
- [ ] Stránka odoslaná z `dev` do `main` a Netlify ju nasadil
