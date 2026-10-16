/* ==========================================================================
   Recovery Clinic LP – konfigurácia
   --------------------------------------------------------------------------
   TOTO JE JEDINÝ SÚBOR, KTORÝ TREBA MENIŤ pri zmene kontaktov, odkazov,
   zľavy alebo variantov H1. Nemeň logiku v app.js.

   Načítava sa ako PRVÝ skript, pred consent.js a app.js.
   ========================================================================== */

window.RC_CONFIG = {

  /* ----- Doména ----------------------------------------------------------
     TODO: Daniel doplní pri hostingu. Pozor – meta tagy (canonical, og:url,
     og:image) sa čítajú bez JS, takže doménu treba prepísať AJ priamo
     v index.html. Miesta sú tam označené komentárom <!-- TODO: doména -->. */
  siteUrl: 'https://recoverybratislava.netlify.app',

  /* ----- Google Tag Manager ----------------------------------------------
     VLASTNÝ kontajner len pre túto landing page. Zámerne NIE ten, ktorý
     beží na WP webe a v Apponiu: Meta pixel na tejto stránke nesmie byť
     v zdravotnej kategórii, preto je meranie oddelené.

     POZOR: toto je len evidencia. Skutočný snippet má ID natvrdo
     v index.html (inak by config.js musel blokovať vykreslenie stránky).
     TODO: nové GTM ID – uprav na troch miestach: tu, v <head>
     a v <noscript> iframe za <body>. */
  gtmId: 'GTM-XXXXXXX',

  /* ----- Backend formulára -----------------------------------------------
     URL nasadeného Google Apps Script web appu (končí na /exec).
     PRÁZDNE = testovací režim: formulár sa tvári, že odoslal, nič sa neuloží
     a nad formulárom sa zobrazí žltý pruh. Postup nasadenia:
     google-apps-script/README.md */
  formEndpoint: 'https://script.google.com/macros/s/AKfycbx-15gBJ91bKAqIbu1UeM2wdph9JerCv-ageHnjUcXtizrBjO80sZ-7ODoZYFXu3sB3xQ/exec',

  /* ----- Odkazy ----------------------------------------------------------- */
  bookingUrl: 'https://recoveryclinicbratislava.myapponio.com/#reservation',
  /* Darčekové poukážky – zatiaľ sa na stránku nelinkujú (odkazy do Apponia
     sú povolené až v stave Úspech), hodnotu držíme pre prípad potreby. */
  voucherUrl: 'https://recoveryclinicbratislava.myapponio.com/darcekove-poukazy',
  mapsUrl: 'https://www.google.com/maps?q=48.145988,17.138776',
  privacyUrl: 'https://bratislava.recovery-clinic.sk/podmienky-spracovania-osobnych-udajov/',
  termsUrl: 'https://bratislava.recovery-clinic.sk/wp-content/uploads/2024/02/obchodne_podmienky_recovery_clinic.pdf',

  /* TODO: odkaz na Google Business Profile kliniky.
     Kým je prázdny, odkaz „Ďalšie recenzie na Google" sa automaticky skryje. */
  googleReviewsUrl: '',

  /* ----- Kontakty --------------------------------------------------------- */
  phone: '+421948375871',            // formát pre tel: odkaz (bez medzier)
  phoneDisplay: '+421 948 375 871',  // formát, ktorý vidí návštevník
  email: 'bratislava@recovery-clinic.sk',
  address: 'Prievozská 4/A, 821 09 Bratislava',
  hours: 'Po–Pi 10:00–18:00 · So–Ne 9:00–15:00',

  /* ----- Zľava -----------------------------------------------------------
     Percento sa do textov vkladá cez <span data-discount>20</span>
     a ceny po zľave sa z neho počítajú v JS – zmena čísla tu sa prejaví
     na celej stránke aj na všetkých kartách infúzií.

     POZOR: zľavu dostane LEN ten, kto vyplní formulár. Nie je to ponuka
     pre každého nového klienta – formulár je jediná cesta, ako ju získať,
     a to je zároveň hlavný dôvod, prečo ho ľudia vyplnia.
     Platí na prvú infúziu, na všetky infúzie z ponuky, bez lehoty.
     Na darčekové poukážky sa nevzťahuje. */
  discount: {
    percent: 20,
    terms: 'Zľava 20 % platí na prvú infúziu po vyplnení formulára. Vzťahuje sa na všetky infúzie z ponuky, nie na darčekové poukážky. Odrátame vám ju pri platbe na prevádzke.'
  },

  /* ----- Údaje, ktoré ešte musí potvrdiť klinika -------------------------
     Kým je hodnota prázdna, prvok sa na stránke NEVYKRESLÍ. Nikdy sem
     nepíš odhady – vymyslené číslo na webe je horšie než žiadne. */

  /* Hodnotenie na Google, napr. '4,9' a '128'. Obe musia byť vyplnené,
     inak sa riadok s hodnotením nezobrazí. */
  googleRating: '',
  googleReviewCount: '',

  /* Za aký čas príde potvrdenie zľavy e-mailom. Zodpovedá intervalu,
     v ktorom Make kontroluje Sheet. Prázdne = veta o e-maile sa nezobrazí. */
  emailEta: 'do 2 hodín',

  extras: {
    oxygenPrice: '',          // napr. 'v cene' alebo 'za 15 €'
    includedInPrice: false,   // true = kreslo, Netflix a občerstvenie sú v cene
    paymentMethods: '',       // napr. 'kartou aj v hotovosti'
    rescheduleText: '',       // napr. 'Termín zmeníte jedným telefonátom'
    notSuitableNoCharge: false // true = ak infúzia nie je vhodná, klient neplatí
  },

  /* ----- Tracking --------------------------------------------------------
     leadValue = priemerná hodnota rezervácie × percento premeny leadu.
     Posiela sa do GA4 a Google Ads ako hodnota konverzie generate_lead. */
  tracking: {
    leadValue: 49,
    currency: 'EUR'
  },

  /* ----- Varianty H1 podľa parametra ?v= v URL ---------------------------
     Message match s reklamou: text stránky sedí s textom inzerátu.

     Kódy sú zámerne neutrálne písmená. URL sa posiela do Meta Pixelu
     a zdravotné slová v URL by mohli spustiť obmedzenia pre inzerenta.

     h1      – časti v <b> sa zobrazia modrou (trieda .hl)
     sub     – voliteľný vlastný podnadpis; ak chýba, použije sa ten v HTML
     chip    – hodnota chipu, ktorý sa predvyberie vo formulári

     Neznámy alebo chýbajúci ?v= → použije sa defaultVariant. */
  defaultVariant: 'a',
  variants: {
    // Imunita (default – jeseň, hlavná téma)
    a: {
      h1: 'Dobite si <b>imunitu aj energiu</b> – pohodlne v kresle, pod dohľadom lekára',
      chip: 'imunita'
    },
    // Únava
    b: {
      h1: 'Ráno bez energie? Doplňte telu <b>vitamíny a minerály</b> priamo do krvi',
      chip: 'unava'
    },
    // Šport
    c: {
      h1: 'Rýchlejšia <b>regenerácia po tréningu</b> – horčík a elektrolyty v infúzii',
      chip: 'sport'
    },
    // Beauty
    d: {
      h1: '<b>Žiarivá pleť</b> zvnútra – glutatión a vitamín C v infúzii',
      chip: 'beauty'
    }
  },

  /* ----- Ladenie ---------------------------------------------------------
     true = každý push do dataLayeru sa vypíše do konzoly prehliadača.
     Pred nasadením na produkciu nechaj false. */
  debug: false
};
