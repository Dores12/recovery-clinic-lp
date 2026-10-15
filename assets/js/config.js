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
  siteUrl: 'https://TODO-domena.sk',

  /* ----- Google Tag Manager ----------------------------------------------
     Existujúci kontajner kliniky – beží aj na WP webe a v Apponiu.
     Vďaka tomu máme jednu GA4 a funkčný cross-domain.

     POZOR: toto je len evidencia. Skutočný snippet má ID natvrdo v
     index.html (inak by config.js musel blokovať vykreslenie stránky).
     Pri zmene kontajnera uprav ID na troch miestach: tu, v <head>
     a v <noscript> iframe za <body>. */
  gtmId: 'GTM-P8RKNPB4',

  /* ----- Backend formulára -----------------------------------------------
     URL nasadeného Google Apps Script web appu (končí na /exec).
     PRÁZDNE = testovací režim: formulár sa tvári, že odoslal, nič sa neuloží
     a nad formulárom sa zobrazí žltý pruh. Postup nasadenia:
     google-apps-script/README.md */
  formEndpoint: 'https://script.google.com/macros/s/AKfycbyFLuWQSEKNP3e_ywqSgBWEOwSAZ8jvFv3mEfaWfc--J5WHQlB7f8MKfYdS8_HYAbAD1g/exec',

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
     Percento sa do textov vkladá cez <span data-discount>20</span>,
     takže zmena čísla tu ho prepíše na celej stránke naraz.

     POZOR: zľava platí pre KAŽDÉHO nového klienta – aj pri priamej
     rezervácii cez Apponio, nielen po vyplnení formulára. Texty na stránke
     sú tomu prispôsobené (formulár predáva bezplatnú konzultáciu). */
  discount: {
    percent: 20,
    terms: 'Zľava 20 % platí na prvú infúziu pre nových klientov – pri rezervácii online aj cez formulár. Odrátame vám ju pri platbe na prevádzke.'
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
     a zdravotné slová v URL (napr. „bolest") môžu spustiť obmedzenia
     pre zdravotných inzerentov.

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
    },
    // Chrbát
    e: {
      h1: 'Akútna <b>bolesť chrbta</b>? Infúzia po konzultácii so zdravotníkom',
      chip: 'bolest'
    }
  },

  /* ----- Ladenie ---------------------------------------------------------
     true = každý push do dataLayeru sa vypíše do konzoly prehliadača.
     Pred nasadením na produkciu nechaj false. */
  debug: false
};
