# Tracking plán – Recovery Clinic LP

Stránka sama **nič nemeria**. Len pushuje udalosti do `dataLayer`. Všetky tagy
(GA4, Google Ads, Meta) sa nastavujú v GTM kontajneri **`GTM-P8RKNPB4`** – tom
istom, ktorý beží na WP webe a v Apponiu. Vďaka tomu máme jednu GA4 a funkčný
cross-domain.

V kóde stránky nie sú **žiadne gtag ani fbq volania** okrem Consent Mode defaultu.

---

## Dve pravidlá, ktoré sa nesmú porušiť

1. **Do dataLayeru ani do URL nikdy nejde nič o zdraví.** Hodnoty z „Čo chcete
   riešiť?" idú výhradne do Google Sheetu. FAQ posiela poradové číslo otázky,
   nie jej text. Meta má zdravotných inzerentov pod prísnym dohľadom a vie
   zablokovať eventy celému účtu.
2. **Do Meta Pixelu ide iba `Lead`** (plus PageView, ak už v kontajneri je).
   Ostatné udalosti sú len pre GA4.

Všetky udalosti nesú `lead_source: 'lp'`, aby sa v zdieľanom kontajneri dali
odlíšiť od WP webu.

---

## 1. Udalosti, ktoré stránka posiela

| Event | Kedy nastane | Parametre |
|---|---|---|
| `lp_variant_view` | po načítaní a aplikovaní varianty | `lp_variant` |
| `booking_click` | klik na akýkoľvek odkaz do Apponia | `link_location`, `item_name` (len karty), `lp_variant` |
| `phone_click` | klik na `tel:` odkaz | `link_location` |
| `form_start` | prvý focus do poľa formulára (raz za návštevu) | `lp_variant` |
| `form_error` | chyba validácie alebo zlyhané odoslanie | `error_type` (`validation`/`network`/`server`), `form_field` |
| `generate_lead` | **až po `ok:true` zo servera** | `event_id`, `lp_variant`, `value`, `currency`, `user_data`, `test_mode` |
| `faq_open` | otvorenie otázky | `faq_index` (1–7) |
| `scroll_depth` | 25 / 50 / 75 / 90 % (každá raz) | `percent` |
| `section_view` | sekcia videná z 50 % (každá raz) | `section` |
| `consent_update` | po rozhodnutí v cookie lište | `consent_analytics`, `consent_marketing` |

**Hodnoty `link_location`:** `header`, `hero`, `card`, `sticky`, `form`,
`success`, `final`, `all_infusions`, `faq`.

**Hodnoty `section`:** `hero`, `formular`, `dovera`, `ako-to-prebieha`,
`infuzie`, `lounge`, `garant`, `recenzie`, `faq`, `zaver`.

### `generate_lead` – detaily

- `event_id` = `lead_id`, rovnaké UUID, aké je v Google Sheete. Slúži na
  deduplikáciu s budúcim Meta CAPI a ako `transaction_id` v Google Ads.
- `value` = `49` (z `config.js` → `tracking.leadValue`), `currency` = `EUR`.
- `user_data` = `{ email, phone_number }` – **posiela sa len pri marketingovom
  súhlase.** Bez neho parameter v evente vôbec nie je.
- `test_mode: true` sa objaví, kým nie je nasadený Apps Script. **Pred
  spustením kampaní over, že tam už nie je** – inak by si meral testy.

---

## 2. Premenné v GTM (Data Layer Variable)

Vytvor DLV s presne týmito názvami:

```
lead_source      lp_variant       link_location    item_name
form_field       error_type       event_id         value
currency         faq_index        percent          section
consent_analytics                 consent_marketing
user_data.email                   user_data.phone_number
```

> `user_data.email` a `user_data.phone_number` sú vnorené – v GTM ich zadaj
> presne s bodkou, DLV to zvládne.

---

## 3. Triggre

Pre každú udalosť vytvor **Custom Event** trigger s podmienkou
`lead_source` **equals** `lp`. Bez tejto podmienky by tagy strieľali aj
na WP webe.

---

## 4. Tagy

### GA4

| Tag | Trigger | Parametre |
|---|---|---|
| GA4 Event – `generate_lead` | `generate_lead` | `event_id`, `lp_variant`, `value`, `currency` |
| GA4 Event – `booking_click` | `booking_click` | `link_location`, `item_name`, `lp_variant` |
| GA4 Event – `phone_click` | `phone_click` | `link_location` |
| GA4 Event – `form_start` | `form_start` | `lp_variant` |
| GA4 Event – `form_error` | `form_error` | `error_type`, `form_field` |
| GA4 Event – `faq_open` | `faq_open` | `faq_index` |
| GA4 Event – `lp_variant_view` | `lp_variant_view` | `lp_variant` |
| GA4 Event – `scroll_depth` | `scroll_depth` | `percent` |
| GA4 Event – `section_view` | `section_view` | `section` |

V GA4 potom **označ `generate_lead` ako kľúčovú udalosť**.

### Google Ads

- **Conversion „Lead – LP formulár"** na trigger `generate_lead`
  - Transaction ID = `{{event_id}}`
  - Conversion value = `{{value}}`, Currency = `{{currency}}`
  - **Enhanced conversions:** User-provided data z `{{user_data.email}}`
    a `{{user_data.phone_number}}`
- **Conversion Linker** – musí bežať aj na doméne LP (All Pages).
- Primárna konverzia pre kampane mierené na LP = „Lead – LP formulár".
  Existujúca GA4 udalosť `rezervacia` z Apponia ako ďalšia konverzia.

> **Nové po zmene ponuky:** zľava 20 % platí aj pri priamej rezervácii, takže
> časť ľudí preskočí formulár a objedná sa rovno. `booking_click` preto už nie
> je „únik", ale plnohodnotný signál. Sleduj obe čísla vedľa seba a rozhodni
> sa, či nespraviť z `rezervacia` primárnu konverziu.

### Meta

- **Meta Pixel `Lead`** na trigger `generate_lead`
  - `eventID` = `{{event_id}}` (deduplikácia s budúcim CAPI)
  - **Spúšťaj len pri `ad_storage = granted`** – pridaj výnimku na
    `{{consent_marketing}}` equals `granted`, alebo použi built-in
    consent checks v GTM.
  - **Bez akýchkoľvek parametrov o záujme.**
- Advanced matching (e-mail, telefón) zapni **až po overení**, že ich Meta pri
  tomto účte nefiltruje – účet je zaradený medzi zdravie/wellness.
- Po spustení skontroluj v **Events Manageri**, či Meta event neobmedzuje.

---

## 5. GA4 admin

1. **Dátové streamy → Konfigurovať nastavenia značky → Konfigurovať domény**
   – pridaj: doménu LP, `bratislava.recovery-clinic.sk`,
   `recoveryclinicbratislava.myapponio.com`.
2. **Zoznam nežiaducich odporúčaní** – tie isté domény.
3. **Interná prevádzka** – pridaj pravidlo pre `localhost`, nech ti testovanie
   neznečisťuje dáta.

> **Na odkazy do Apponia nedávaj UTM parametre.** Rozbilo by to session
> a atribúciu v GA4 (nová návšteva z „lp / referral"). Cross-domain nesie
> linker GA4 cez parameter `_gl`.

---

## 6. Consent Mode v2

Predvolený stav nastavuje inline skript v `<head>` **pred GTM**:

| Kategória | Default |
|---|---|
| `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` | `denied` |
| `functionality_storage`, `security_storage` | `granted` |

Navyše `ads_data_redaction: true` a `url_passthrough: true`,
`wait_for_update: 500`.

Po rozhodnutí v lište ide `gtag('consent','update',…)` a hneď za ním
`consent_update` do dataLayeru. Voľba sa ukladá do `localStorage`
(`rc_consent_v1`) a platí 12 mesiacov.

### Čo overiť v QA

Na WP webe kliniky sa súhlas **neposielal do GTM v reálnom čase** – parameter
`gcs` ostával `G100` aj po prijatí. Tu to musí fungovať:

- [ ] Pred rozhodnutím nesie GA4 hit `gcs=G100`
- [ ] Hneď po „Prijať všetko" nesie najbližší hit `gcs=G111`
- [ ] Po „Odmietnuť" ostáva `G100` a nenastavia sa `_fbp` / `_ga` cookies
- [ ] „Nastavenie cookies" v pätičke lištu znova otvorí
- [ ] Po reloade sa lišta nezobrazí a voľba platí

---

## 7. Kontrolný zoznam pred spustením kampaní

- [ ] V `config.js` je vyplnený `formEndpoint` (inak `test_mode: true`)
- [ ] V `config.js` je `debug: false`
- [ ] GTM Preview: `generate_lead` príde **len raz** a **len po úspechu**
- [ ] `event_id` v GTM sedí s `lead_id` v Google Sheete
- [ ] `booking_click` má správny `link_location` zo všetkých miest
- [ ] GA4 DebugView: udalosti prichádzajú, `gcs` sa po súhlase mení
- [ ] Klik do Apponia nesie parameter `_gl`
- [ ] Meta Pixel Helper: `Lead` s `eventID`, len so súhlasom, bez údajov o záujme
- [ ] GA4: `generate_lead` je označená ako kľúčová udalosť
- [ ] Google Ads: konverzia prijíma hodnotu aj Transaction ID
- [ ] Doména LP je overená v Meta Business Manageri

---

## 8. Neskôr: offline konverzie

Toto je liek na „veľa leadov, málo rezervácií“ a je to mimo rozsahu tohto
zadania, ale pripravené na to už sme:

Recepcia v Sheete prepisuje `status` na `CONVERTED`. Keď budeš mať pár desiatok
takých riadkov, nahraj ich späť:

- **Google Ads:** offline konverzie cez `gclid` (stĺpce `gclid`, `gbraid`,
  `wbraid`) – kampane sa začnú optimalizovať na rezervácie, nie na leady.
- **Meta:** CAPI s `event_id` (deduplikácia s pixelom) a `fbc` / `fbp`.

Nahrávaj **len riadky s `consent_ads = granted`**.
