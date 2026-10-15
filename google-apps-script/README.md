# Backend formulára – Google Sheets + Apps Script

Formulár na landing page posiela lead do Google Sheetu cez Apps Script web app.
Tento návod ťa prevedie nasadením. Celé to zaberie asi 15 minút.

**Kým nie je endpoint nasadený, formulár beží v testovacom režime** – tvári sa,
že odoslal, nad formulárom svieti žltý pruh a nikam nič neodchádza.

---

## 1. Vytvor Google Sheet

1. V **tvojom Google účte** vytvor nový Google Sheet a pomenuj ho
   `Recovery LP – leady`.
2. Zdieľaj ho s klientom ako editora (Zdieľať → pridať e-mail kliniky).

> **Pozor na osobné údaje.** V hárku budú meno, telefón a e-mail klientov
> kliniky. Keďže hárok je v tvojom účte, si voči klinike spracovateľ osobných
> údajov – pri spustení si s nimi dohodni spracovateľskú zmluvu alebo dodatok
> k zmluve o spolupráci. Prístup k hárku daj len ľuďom, ktorí ho naozaj
> potrebujú.

## 2. Vlož kód

1. V Sheete: **Rozšírenia → Apps Script**.
2. Zmaž obsah súboru `Code.gs` a vlož doň celý obsah
   [`Code.gs`](Code.gs) z tohto priečinka.
3. Ulož (ikona diskety alebo `Cmd/Ctrl + S`).

## 3. Priprav hárok

1. V editore hore vyber v rozbaľovacom zozname funkciu **`setupSheet`**.
2. Stlač **Spustiť**.
3. Google si vypýta oprávnenia → **Skontrolovať oprávnenia** → vyber svoj účet →
   *Rozšírené* → *Prejsť na projekt (nebezpečné)* → **Povoliť**.
   (Toto varovanie je normálne pri vlastných skriptoch.)
4. V Sheete pribudne karta **`LP leady`** s hlavičkou, rozbaľovacím zoznamom
   v stĺpci `status` a farebným zvýraznením.

## 4. Nasaď web app

1. Vpravo hore **Nasadiť → Nové nasadenie**.
2. Ozubené koliesko → typ **Webová aplikácia**.
3. Nastav:
   - **Spustiť ako:** `Ja` (tvoj účet)
   - **Kto má prístup:** `Ktokoľvek`
4. **Nasadiť** → skopíruj **URL webovej aplikácie** (končí na `/exec`).
5. Vlož ju do [`assets/js/config.js`](../assets/js/config.js) do poľa
   `formEndpoint`:

```js
formEndpoint: 'https://script.google.com/macros/s/AKfyc.../exec',
```

> **Prístup „Ktokoľvek" neznamená, že hárok je verejný.** Znamená len, že
> web app prijme požiadavku bez prihlásenia – inak by formulár nefungoval.
> Hárok ostáva prístupný len tebe a klinike.

## 5. Otestuj

1. **Beží web app?** Otvor URL `/exec` v prehliadači. Má vrátiť:
   ```json
   {"ok":true,"service":"recovery-lp"}
   ```
2. **Príde lead?** Spusti stránku lokálne a odošli formulár:
   ```bash
   python3 -m http.server 8080
   ```
   Otvor `http://localhost:8080/?utm_source=test&gclid=TEST123` a odošli.
3. Skontroluj, že v karte `LP leady` pribudol riadok a má vyplnené
   `utm_source` aj `gclid`.
4. Skontroluj, že prišiel notifikačný e-mail.

> Formulár odmietne odoslanie rýchlejšie ako 2,5 sekundy od načítania stránky
> (ochrana proti robotom). Pri testovaní teda nevypĺňaj formulár bleskovo.

---

## Zmena kódu po nasadení

Keď v `Code.gs` niečo upravíš:

**Nasadiť → Spravovať nasadenia** → ceruzka pri existujúcom nasadení →
*Verzia:* `Nová verzia` → **Nasadiť**.

URL ostane rovnaká, takže v `config.js` sa nič nemení.
Ak namiesto toho urobíš „Nové nasadenie", dostaneš **inú URL** a formulár
bude ďalej posielať na starú.

---

## Čo kam chodí

| Kam | Čo |
|---|---|
| Hárok `LP leady` | všetko vrátane UTM, click ID a súhlasu |
| E-mail recepcii | meno, telefón, e-mail, záujem, variant – **žiadne click ID** |
| dataLayer / GTM | `generate_lead` s `event_id`, **nikdy nič o záujme** |

Hodnoty z „Čo chcete riešiť?" sa môžu dotýkať údajov o zdraví, preto sú
nepovinné a nejdú nikam okrem hárku.

---

## Stĺpec `status` – prečo tam je

`CREATED` → `QUALIFIED` → `CONVERTED` / `DISQUALIFIED`

Recepcia prepisuje stav rovnako ako pri leadoch z Meta formulárov. Vďaka tomu
budeš neskôr vedieť nahrať do Google Ads (cez `gclid`) a do Mety (cez
`event_id`) **reálne rezervácie, nie leady** – to je liek na „veľa leadov,
málo rezervácií". Click ID použi na upload len pri `consent_ads = granted`.

---

## Nastavenia v `Code.gs`

Všetko je hore v objekte `CONFIG`:

| Nastavenie | Default | Na čo je |
|---|---|---|
| `SHEET_NAME` | `LP leady` | názov karty v Sheete |
| `NOTIFY_EMAIL` | `bratislava@recovery-clinic.sk` | komu chodia upozornenia (viac adries oddeľ čiarkou) |
| `SEND_NOTIFICATION` | `true` | `false` pri testovaní vypne e-maily |
| `DEDUPE_MINUTES` | `10` | rovnaký telefón/e-mail v tomto okne sa nezapíše druhýkrát |
| `MIN_ELAPSED_MS` | `2500` | rýchlejšie odoslanie = robot |
| `TIMEZONE` | `Europe/Bratislava` | pásmo pre `created_at` |

---

## TODO: potvrdzujúci e-mail zákazníkovi

Zákazníkovi **zámerne neposielame** e-mail z Apps Scriptu – odchádzal by
z tvojho súkromného účtu, nie z adresy kliniky.

Klinika už má v **Make** scenár, ktorý posiela voucher e-maily leadom z Meta
formulára. Rozšír ho:

1. Make → otvor existujúci scenár s voucher e-mailom.
2. Pridaj druhý trigger **Google Sheets → Watch Rows**.
3. Vyber tento Sheet a kartu `LP leady`.
4. Namapuj `email` a `meno` do existujúceho e-mailového modulu.
5. Zapni scenár a otestuj jedným testovacím leadom.

---

## Keď niečo nefunguje

| Príznak | Príčina a riešenie |
|---|---|
| Formulár hlási „nepodarilo sa odoslať" | Otvor `/exec` v prehliadači. Ak nevráti JSON, web app nie je nasadený alebo má zlé oprávnenia. |
| Riadok nepribudol, ale chyba sa nezobrazila | Odoslal si rýchlejšie ako 2,5 s, alebo je to duplicita do 10 minút. Skús o chvíľu s iným telefónom. |
| Prázdne UTM stĺpce | Otvoril si stránku bez parametrov. Skús `?utm_source=test&gclid=TEST123`. |
| Nechodia e-maily | Skontroluj `NOTIFY_EMAIL` a denný limit Apps Scriptu (100 e-mailov/deň pre bežný účet). V editore: **Spustenia** → pozri chyby. |
| Telefón sa v Sheete zobrazuje divne | Zapisujeme ho s apostrofom (`'+421…`), aby ho Sheets nebral ako číslo. To je správne. |

Logy nájdeš v editore Apps Scriptu v sekcii **Spustenia**.
