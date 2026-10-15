# Tracking plán – Recovery Clinic LP

Stránka sama **nič nemeria**. Len pushuje udalosti do `dataLayer`. Všetky tagy
(GA4, Meta, prípadne Google Ads) sa nastavujú v GTM.

> **Táto landing page má VLASTNÝ GTM kontajner** – zámerne nie ten, ktorý beží
> na WP webe a v Apponiu. Meta pixel na tejto stránke nesmie byť v zdravotnej
> kategórii, a to sa dá udržať len vtedy, keď je meranie oddelené.
>
> **TODO: nové GTM ID** treba doplniť na troch miestach: snippet v `<head>`,
> `<noscript>` iframe za `<body>` a `gtmId` v `config.js` (tam len ako evidencia).
> Všade je zatiaľ `GTM-XXXXXXX`.

V kóde stránky nie sú **žiadne `gtag` ani `fbq` volania** okrem Consent Mode
defaultu. Meta pixel aj GA4 nastavíš celé v GTM.

---

## Dve pravidlá, ktoré sa nesmú porušiť

1. **Do dataLayeru ani do URL nikdy nejde nič o zdraví ani o vybranej infúzii.**
   Hodnoty z „Čo chcete riešiť?" a názov infúzie z poľa `infusion` idú výhradne
   do Google Sheetu. FAQ posiela poradové číslo otázky, nie jej text.
   Výnimka: `infusion_interest` posiela `item_name`, ale len názvy z
   `assets/js/infusions.js` – v tom súbore zámerne nie sú žiadne zdravotné
   ťažkosti ani diagnózy.
2. **Do Meta Pixelu ide `PageView`, `Lead` a `Contact`** – nič viac. Bez
   parametrov o záujme či infúzii.

Všetky udalosti nesú `lead_source: 'lp'`. V samostatnom kontajneri to už nie je
nutné na odlíšenie, ale necháva sa – uľahčuje ladenie v náhľade.

---

## 1. Udalosti, ktoré stránka posiela

| Event | Kedy nastane | Parametre |
|---|---|---|
| `generate_lead` | **až po `ok: true` zo servera** | `event_id`, `lp_variant`, `lead_path`, `value`, `currency`, `user_data` |
| `phone_click` | klik na `tel:` odkaz | `link_location` |
| `booking_click` | klik na rezerváciu v stave Úspech | `link_location: 'success'`, `lead_path` |
| `infusion_interest` | klik na „Mám záujem" | `item_name` |
| `infusions_expand` | rozbalenie celej ponuky | – |
| `form_start` | prvý focus do poľa formulára (raz za návštevu) | `lp_variant` |
| `form_error` | chyba validácie alebo zlyhané odoslanie | `error_type`, `form_field` |
| `faq_open` | otvorenie otázky | `faq_index` (1–7) |
| `scroll_depth` | 25 / 50 / 75 / 90 % (každá raz) | `percent` |
| `section_view` | sekcia videná z 50 % (každá raz) | `section` |
| `lp_variant_view` | po načítaní a aplikovaní varianty | `lp_variant` |
| `consent_update` | po rozhodnutí v cookie lište | `consent_analytics`, `consent_marketing` |

**`link_location`:** `header`, `hero`, `sticky`, `final`, `faq`, `form_error`
(telefón) a `success` (rezervácia).

**`lead_path`:** `online` (vyberie si termín sám) alebo `call` (chce zavolať).

**`section`:** `hero`, `formular`, `dovera`, `ako-to-prebieha`, `infuzie`,
`lounge`, `recenzie`, `faq`, `zaver`.

### `generate_lead` – detaily

- `event_id` = `lead_id`, rovnaké UUID, aké je v Google Sheete. Slúži na
  deduplikáciu s Meta pixelom (a neskôr s CAPI).
- `value` = `49` (z `config.js` → `tracking.leadValue`), `currency` = `EUR`.
- `user_data` = `{ email, phone_number }` – **len pri marketingovom súhlase.**
  Bez neho parameter v evente vôbec nie je.
- `test_mode: true` sa objaví, kým nie je nasadený Apps Script. **Pred spustením
  kampaní over, že tam už nie je** – inak by si meral testy.

---

## 2. Premenné v GTM (Data Layer Variable)

```
event_id       lead_path      lp_variant     link_location
item_name      value          currency       faq_index
percent        section        error_type     form_field
user_data.email                user_data.phone_number
consent_analytics              consent_marketing
```

> `user_data.email` a `user_data.phone_number` sú vnorené – zadaj ich presne
> s bodkou, DLV si s tým poradí.

---

## 3. Triggre

- **All Pages** – pre Google tag a Meta base kód.
- **Custom Event** pre každú udalosť z tabuľky vyššie (názov eventu presne
  podľa tabuľky).

Keďže kontajner je len pre túto stránku, **nepotrebuješ** podmienky na hostname
ani na `lead_source`.

---

## 4. Tagy

### Google / GA4

| Tag | Trigger |
|---|---|
| **Google tag** (nové GA4 ID) | All Pages |
| GA4 Event `generate_lead` – `event_id`, `lp_variant`, `lead_path`, `value`, `currency` | `generate_lead` |
| GA4 Event `booking_click` – `link_location`, `lead_path` | `booking_click` |
| GA4 Event `phone_click` – `link_location` | `phone_click` |
| GA4 Event `infusion_interest` – `item_name` | `infusion_interest` |
| GA4 Event `infusions_expand` | `infusions_expand` |
| GA4 Event `form_start` / `form_error` / `faq_open` / `scroll_depth` / `section_view` / `lp_variant_view` | príslušný event |

V GA4 potom **označ `generate_lead` ako kľúčovú udalosť**. Oplatí sa sledovať aj
`booking_click` – ukáže, koľko leadov naozaj prešlo do rezervácie.

### Meta

PIXEL_ID je pixel z Konverzky – **TODO: doplní Daniel**.

| Tag | Typ | Trigger | Nastavenie |
|---|---|---|---|
| **Meta – base** | Custom HTML | All Pages | Consent: vyžaduje `ad_storage` |
| **Meta – Lead** | Custom HTML | `generate_lead` | Tag sequencing: najprv base; Consent `ad_storage` |
| **Meta – Contact** | Custom HTML | `phone_click` | Tag sequencing: najprv base; Consent `ad_storage` |

**Base kód:**

```html
<script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

**Lead:**

```html
<script>
  fbq('track', 'Lead', {}, { eventID: '{{DLV - event_id}}' });
</script>
```

**Contact:**

```html
<script>
  fbq('track', 'Contact');
</script>
```

> `eventID` pri `Lead` je pripravený na deduplikáciu s budúcim CAPI.
> Ak sa rozhodneš posielať namiesto `Lead` radšej `Contact`, meníš len názov
> eventu v tomto jednom tagu.
>
> **Nikdy nepridávaj parametre o záujme ani o infúzii.**

### Google Ads (voliteľné)

- Konverzia „Lead – LP formulár" na `generate_lead`, Transaction ID = `{{event_id}}`
- Conversion Linker na All Pages

---

## 5. Consent Mode v2

Predvolený stav nastavuje inline skript v `<head>` **pred GTM**:

| Kategória | Default |
|---|---|
| `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` | `denied` |
| `functionality_storage`, `security_storage` | `granted` |

Navyše `ads_data_redaction: true`, `url_passthrough: true` a
`wait_for_update: 500`.

Po rozhodnutí v lište ide `gtag('consent','update',…)` a hneď za ním
`consent_update` do dataLayeru. Voľba sa ukladá do `localStorage`
(`rc_consent_v1`) a platí 12 mesiacov.

### Čo overiť v QA

- [ ] Pred rozhodnutím nesie GA4 hit `gcs=G100`
- [ ] Hneď po „Prijať všetko" nesie najbližší hit `gcs=G111`
- [ ] Po „Odmietnuť" ostáva `G100` a nenastavia sa `_fbp` ani `_ga` cookies
- [ ] Meta Pixel Helper nehlási PageView, kým nie je marketingový súhlas
- [ ] „Nastavenie cookies" v pätičke lištu znova otvorí
- [ ] Po reloade sa lišta nezobrazí a voľba platí

---

## 6. Kontrolný zoznam pred spustením kampaní

- [ ] Nové GTM ID je doplnené na všetkých troch miestach
- [ ] V `config.js` je vyplnený `formEndpoint` a `debug: false`
- [ ] GTM Preview: `generate_lead` príde **len raz** a **len po úspechu**,
      s `event_id` aj `lead_path`
- [ ] `event_id` v GTM sedí s `lead_id` v Google Sheete
- [ ] `generate_lead` **nemá** `test_mode: true`
- [ ] `booking_click` príde pri kliku na rezerváciu v stave Úspech
      a v Sheete pribudne `booking_click_at`
- [ ] `phone_click` príde zo všetkých miest s telefónom
- [ ] Meta Pixel Helper: `PageView` a `Lead` až po marketingovom súhlase,
      `Lead` má `eventID`, žiadne parametre o infúzii
- [ ] GA4: `generate_lead` je označená ako kľúčová udalosť
- [ ] V GA4 je pridaný filter na internú prevádzku z `localhost`

---

## 7. Neskôr: offline konverzie

Recepcia v Sheete prepisuje `status` na `CONVERTED`. Keď budeš mať pár desiatok
takých riadkov, nahraj ich späť:

- **Meta:** CAPI s `event_id` (deduplikácia s pixelom) a `fbc` / `fbp`.
- **Google Ads:** offline konverzie cez `gclid`, `gbraid`, `wbraid`.

Nahrávaj **len riadky s `consent_ads = granted`**.

Stĺpec `booking_click_at` ti medzitým ukáže, ktorí leadi aspoň klikli na
rezerváciu – to je najrýchlejší signál kvality ešte predtým, než recepcia
stihne stavy prepísať.
