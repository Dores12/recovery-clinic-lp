/**
 * Recovery Clinic LP – backend formulára
 * =============================================================================
 * Zapisuje leady z landing page do Google Sheetu a pošle upozornenie recepcii.
 *
 * Hárok má dve karty:
 *   „Leady"            – pre personál. Len to, čo treba na objednanie.
 *   „Technické údaje"  – skrytá. UTM, click ID, súhlas. Personál sa jej
 *                        nedotýka, slúži na neskoršie offline konverzie.
 *
 * Nasadenie krok za krokom: pozri README.md v tomto priečinku.
 *
 * Po vložení kódu spusti raz ručne setupSheet(). Ak už máš starý hárok
 * s dvadsiatimi stĺpcami, spusti potom ešte simplifySheet() – prehodí
 * technické stĺpce na druhú kartu a z prvej ich odstráni.
 */


/* ===========================================================================
   NASTAVENIA – jediné miesto, ktoré treba meniť
   =========================================================================== */

var CONFIG = {
  /** Karta, ktorú vidí a upravuje personál. */
  SHEET_NAME: 'Leady',

  /** Skrytá karta s technickými údajmi. */
  TECH_SHEET_NAME: 'Technické údaje',

  /**
   * false = technické údaje sa nikam nezapisujú.
   * Necháva sa true: bez gclid a fbc sa neskôr nedajú nahrať reálne
   * rezervácie späť do Google Ads a Mety (pozri docs/tracking-plan.md).
   */
  KEEP_TECH_SHEET: true,

  /** Komu chodí upozornenie na nový lead.
   *  Viac adries oddeľ čiarkou: 'recepcia@…, daniel@…' */
  NOTIFY_EMAIL: 'bratislava@recovery-clinic.sk',

  /** false = neposielať e-maily (hodí sa pri testovaní) */
  SEND_NOTIFICATION: true,

  /** Rovnaký telefón alebo e-mail v tomto okne = duplicita, nezapíše sa. */
  DEDUPE_MINUTES: 10,

  /** Odoslanie rýchlejšie ako toto je takmer isto robot. */
  MIN_ELAPSED_MS: 2500,

  /** Časové pásmo pre dátum a čas. */
  TIMEZONE: 'Europe/Bratislava'
};


/**
 * Stĺpce karty pre personál. Zámerne len to, čo treba na objednanie –
 * žiadne ID kampaní ani technické polia.
 *
 * Zápis sa riadi NÁZVAMI v hlavičke, nie poradím, takže stĺpce môžeš
 * v hárku presúvať. Keď sem pridáš nový, spusti znova setupSheet().
 */
var COLUMNS = ['datum', 'cas', 'meno', 'telefon', 'email', 'zaujem', 'status'];

/**
 * Stĺpce skrytej technickej karty.
 *
 * `datum`, `cas` a `telefon` sú tu zámerne aj druhýkrát – sú to jediné
 * spoločné údaje s kartou pre personál, takže sa dá cez telefón spárovať,
 * ktorý lead skončil ako CONVERTED, a nahrať ho do reklamných systémov.
 */
var TECH_COLUMNS = [
  'datum', 'cas', 'telefon', 'lead_id',
  'pokracovanie', 'infuzia', 'booking_click_at',
  'zlava', 'lp_variant',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'gclid', 'gbraid', 'wbraid',
  'fbclid', 'fbc', 'fbp',
  'consent_ads', 'page_url', 'referrer', 'user_agent'
];

/** Zrozumiteľný popis cesty pre e-mail recepcii. */
var CESTY = {
  online: 'Vyberie si termín online',
  call: 'Chce zavolať'
};


/* ===========================================================================
   VEREJNÉ ENDPOINTY
   =========================================================================== */

/**
 * Rýchly test, či web app beží.
 * Otvor URL končiacu /exec v prehliadači – má vrátiť {"ok":true,…}.
 */
function doGet() {
  return jsonResponse({ ok: true, service: 'recovery-lp' });
}

/**
 * Príjem leadu z landing page.
 * Vracia vždy JSON, aj pri chybe – prehliadač inak nevie, čo sa stalo.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    /* --- Klik na rezerváciu v stave Úspech -------------------------------
       Chodí cez navigator.sendBeacon, keď človek odchádza na Apponio.
       Nezakladá lead, len doplní čas na technickej karte. */
    if (data.action === 'booking_click') {
      return handleBookingClick(data.lead_id);
    }

    /* --- Pasce na roboty ---------------------------------------------------
       Keď sa chytí robot, tvárime sa, že všetko prebehlo v poriadku.
       Keby dostal chybu, skúsil by to inak. */
    if (data.company) {
      console.log('Honeypot vyplnený – zahadzujem, lead_id=' + data.lead_id);
      return jsonResponse({ ok: true, lead_id: data.lead_id });
    }
    if (typeof data.elapsed_ms === 'number' && data.elapsed_ms < CONFIG.MIN_ELAPSED_MS) {
      console.log('Príliš rýchle odoslanie (' + data.elapsed_ms + ' ms) – zahadzujem');
      return jsonResponse({ ok: true, lead_id: data.lead_id });
    }

    /* --- Serverová validácia ---------------------------------------------
       Rovnaké pravidlá ako na klientovi. Klientskej validácii sa nedá veriť. */
    var name = String(data.name || '').trim();
    var phone = normalizePhone(data.phone);
    var email = String(data.email || '').trim().toLowerCase();

    if (name.length < 2 || !phone || !isValidEmail(email)) {
      console.warn('Neplatné údaje, lead_id=' + data.lead_id);
      return jsonResponse({ ok: false, error: 'validation' });
    }

    /* --- Duplicita --------------------------------------------------------
       Dvojklik alebo opakované odoslanie nemá vyrobiť dva riadky. */
    var cache = CacheService.getScriptCache();
    var dedupeKey = 'lead_' + phone + '_' + email;
    if (cache.get(dedupeKey)) {
      console.log('Duplicita do ' + CONFIG.DEDUPE_MINUTES + ' min, lead_id=' + data.lead_id);
      return jsonResponse({ ok: true, lead_id: data.lead_id, duplicate: true });
    }
    cache.put(dedupeKey, '1', CONFIG.DEDUPE_MINUTES * 60);

    /* --- Zápis ------------------------------------------------------------
       Zámok chráni pred súbežnými odoslaniami (dva riadky na rovnakom mieste). */
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      appendLead(data, name, phone, email);
    } finally {
      lock.releaseLock();
    }

    if (CONFIG.SEND_NOTIFICATION) {
      notifyReception(data, name, phone, email);
    }

    return jsonResponse({ ok: true, lead_id: data.lead_id });

  } catch (err) {
    console.error('doPost zlyhal: ' + err + '\n' + (err.stack || ''));
    return jsonResponse({ ok: false, error: 'server' });
  }
}


/* ===========================================================================
   ZÁPIS DO HÁRKU
   =========================================================================== */

/**
 * Mapa „názov stĺpca → index (od 0)" prečítaná z prvého riadku hárku.
 * Vďaka nej zapisujeme podľa názvov, nie podľa poradia.
 */
function headerMap(sheet) {
  var sirka = sheet.getLastColumn();
  if (!sirka) return {};
  var hlavicka = sheet.getRange(1, 1, 1, sirka).getValues()[0];
  var mapa = {};
  for (var i = 0; i < hlavicka.length; i++) {
    var nazov = String(hlavicka[i]).trim();
    if (nazov) mapa[nazov] = i;
  }
  return mapa;
}

/** Zostaví riadok podľa hlavičky daného hárku a pripojí ho. */
function appendByHeader(sheet, hodnoty) {
  var mapa = headerMap(sheet);
  var sirka = Math.max(sheet.getLastColumn(), 1);
  var riadok = new Array(sirka).fill('');

  Object.keys(hodnoty).forEach(function (key) {
    if (mapa[key] === undefined) return;   // stĺpec v hárku nie je – preskočíme
    riadok[mapa[key]] = hodnoty[key];
  });

  sheet.appendRow(riadok);
}

function appendLead(data, name, phone, email) {
  var teraz = new Date();
  var datum = Utilities.formatDate(teraz, CONFIG.TIMEZONE, 'd.M.yyyy');
  var cas = Utilities.formatDate(teraz, CONFIG.TIMEZONE, 'HH:mm');

  /* --- Karta pre personál --- */
  appendByHeader(getSheet(CONFIG.SHEET_NAME), {
    datum: datum,
    cas: cas,
    meno: name,
    /* Apostrof pred číslom – inak si Sheets z +421… urobí číslo a zahodí plus */
    telefon: "'" + phone,
    email: email,
    zaujem: popisZaujmu(data),
    status: 'CREATED'
  });

  /* --- Skrytá technická karta --- */
  if (!CONFIG.KEEP_TECH_SHEET) return;

  var tech = {
    datum: datum,
    cas: cas,
    telefon: "'" + phone,
    lead_id: data.lead_id || '',
    pokracovanie: data.lead_path || '',
    infuzia: data.infusion || '',
    booking_click_at: '',
    zlava: data.discount || '',
    lp_variant: data.lp_variant || '',
    consent_ads: data.consent_ads || '',
    page_url: data.page_url || '',
    referrer: data.referrer || '',
    user_agent: data.user_agent || ''
  };
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
   'gclid', 'gbraid', 'wbraid', 'fbclid', 'fbc', 'fbp'].forEach(function (key) {
    tech[key] = data[key] || '';
  });

  appendByHeader(getSheet(CONFIG.TECH_SHEET_NAME), tech);
}

/**
 * Čo chce človek riešiť – zlúči zaškrtnuté chipy a vybranú infúziu
 * do jedného čitateľného textu pre recepciu.
 */
function popisZaujmu(data) {
  var casti = (data.interest || []).slice();
  if (data.infusion) casti.push('infúzia: ' + data.infusion);
  if (data.lead_path === 'call') casti.push('chce zavolať');
  return casti.join(', ');
}

function getSheet(nazov) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nazov);
  if (!sheet) throw new Error('Karta "' + nazov + '" neexistuje. Spusti setupSheet().');
  return sheet;
}


/**
 * Zapíše čas kliku na rezerváciu k riadku s daným lead_id (technická karta).
 * Keď je čas už vyplnený, neprepisuje ho (počíta sa prvý klik).
 */
function handleBookingClick(leadId) {
  if (!leadId || !CONFIG.KEEP_TECH_SHEET) return jsonResponse({ ok: true });

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet(CONFIG.TECH_SHEET_NAME);
    var mapa = headerMap(sheet);
    if (mapa.lead_id === undefined || mapa.booking_click_at === undefined) {
      console.warn('Chýba stĺpec lead_id alebo booking_click_at – spusti setupSheet()');
      return jsonResponse({ ok: true });
    }

    var poslednyRiadok = sheet.getLastRow();
    if (poslednyRiadok < 2) return jsonResponse({ ok: true });

    var idcka = sheet.getRange(2, mapa.lead_id + 1, poslednyRiadok - 1, 1).getValues();
    for (var i = idcka.length - 1; i >= 0; i--) {    // od konca: nové leady sú dole
      if (String(idcka[i][0]) !== String(leadId)) continue;

      var bunka = sheet.getRange(i + 2, mapa.booking_click_at + 1);
      if (!bunka.getValue()) {
        bunka.setValue(Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'd.M.yyyy HH:mm'));
      }
      return jsonResponse({ ok: true, lead_id: leadId });
    }

    console.log('booking_click pre neznáme lead_id: ' + leadId);
    return jsonResponse({ ok: true });
  } finally {
    lock.releaseLock();
  }
}


/* ===========================================================================
   UPOZORNENIE RECEPCII
   =========================================================================== */

function sprava(data, name, phone, email) {
  var cesta = CESTY[data.lead_path] || 'neuvedené';
  var zaujem = (data.interest || []).join(', ') || 'neuvedené';
  var sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();

  return {
    /* Pri „zavolajte mi" dáme do predmetu výzvu – recepcia musí konať */
    subject: data.lead_path === 'call'
      ? '📞 ZAVOLAŤ: ' + name
      : 'Nový lead z LP: ' + name + ' – ' + cesta,
    body:
      'Nový lead z landing page\n\n' +
      'Meno:                ' + name + '\n' +
      'Telefón:             ' + phone + '\n' +
      'E-mail:              ' + email + '\n' +
      'Ako chce pokračovať: ' + cesta + '\n' +
      'Vybraná infúzia:     ' + (data.infusion || 'neuvedená') + '\n' +
      'Záujem:              ' + zaujem + '\n\n' +
      'Hárok s leadmi: ' + sheetUrl + '\n'
  };
}

/**
 * Pošle upozornenie recepcii.
 *
 * Chybu zachytíme, aby zlyhaný e-mail nezhodil už uložený lead – ale
 * zapíšeme ju do Script Properties, nech ju vieš pozrieť cez
 * testNotification() aj dlho potom.
 */
function notifyReception(data, name, phone, email) {
  var s = sprava(data, name, phone, email);
  try {
    MailApp.sendEmail({ to: CONFIG.NOTIFY_EMAIL, subject: s.subject, body: s.body });
    PropertiesService.getScriptProperties().deleteProperty('POSLEDNA_CHYBA_MAILU');
  } catch (err) {
    console.error('Notifikácia sa neodoslala: ' + err);
    PropertiesService.getScriptProperties().setProperty(
      'POSLEDNA_CHYBA_MAILU',
      Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'd.M.yyyy HH:mm') + ' – ' + err
    );
  }
}


/* ===========================================================================
   DIAGNOSTIKA E-MAILOV
   Spusti ručne z editora, keď notifikácie nechodia.
   =========================================================================== */

function testNotification() {
  var props = PropertiesService.getScriptProperties();
  var poslednaChyba = props.getProperty('POSLEDNA_CHYBA_MAILU');

  console.log('--- Diagnostika notifikácií ---');
  console.log('SEND_NOTIFICATION: ' + CONFIG.SEND_NOTIFICATION);
  console.log('NOTIFY_EMAIL:      ' + CONFIG.NOTIFY_EMAIL);
  console.log('Zostávajúca kvóta: ' + MailApp.getRemainingDailyQuota() + ' e-mailov dnes');
  console.log('Posledná chyba pri odosielaní: ' + (poslednaChyba || 'žiadna'));

  /* Zámerne BEZ try/catch – keď chýba oprávnenie alebo je vyčerpaná kvóta,
     chceme vidieť celú chybu, nie ju schovať. */
  MailApp.sendEmail({
    to: CONFIG.NOTIFY_EMAIL,
    subject: 'TEST notifikácie z Recovery LP',
    body: 'Toto je testovací e-mail z Apps Scriptu.\n\n'
      + 'Ak ti prišiel, notifikácie fungujú. Ak si ho nenašiel, pozri '
      + 'priečinok Spam a filtre schránky.\n'
  });

  console.log('E-mail odoslaný na ' + CONFIG.NOTIFY_EMAIL + '. Skontroluj schránku aj spam.');
}


/* ===========================================================================
   VALIDÁCIA (rovnaké pravidlá ako v assets/js/form.js)
   =========================================================================== */

function normalizePhone(raw) {
  if (!raw) return null;
  var cleaned = String(raw).replace(/[\s\-(). ]/g, '');
  if (cleaned.indexOf('00') === 0) cleaned = '+' + cleaned.slice(2);

  var hasPlus = cleaned.charAt(0) === '+';
  var digits = cleaned.replace(/\D/g, '');
  if (!digits) return null;

  if (hasPlus) {
    if (digits.length < 8 || digits.length > 15) return null;
    return '+' + digits;
  }
  if (digits.charAt(0) === '0') {
    var rest = digits.slice(1);
    if (rest.length < 8 || rest.length > 9) return null;
    return '+421' + rest;
  }
  return null;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value));
}

function jsonResponse(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}


/* ===========================================================================
   PRÍPRAVA HÁRKU
   Spusti ručne z editora: vyber setupSheet a stlač Spustiť.
   Dá sa spúšťať opakovane – existujúce dáta neprepíše, len doplní, čo chýba.
   =========================================================================== */

/**
 * Starý hárok sa volal „LP leady". Premenujeme ho skôr, než s ním
 * čokoľvek urobíme – inak by vedľa neho vznikla nová prázdna karta
 * a dáta by ostali v tej starej.
 *
 * Volá sa zo setupSheet() aj zo simplifySheet(), takže na poradí
 * spúšťania nezáleží.
 */
function zjednotNazovKarty() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var stara = spreadsheet.getSheetByName('LP leady');
  if (!stara) return;

  var nova = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (nova && nova.getLastRow() <= 1) {
    /* Prázdnu kartu vytvoril predčasný setupSheet – zahodíme ju */
    spreadsheet.deleteSheet(nova);
    console.log('Odstránená prázdna karta "' + CONFIG.SHEET_NAME + '".');
  } else if (nova) {
    throw new Error('Existujú karty "LP leady" aj "' + CONFIG.SHEET_NAME
      + '" a obe majú dáta. Zlúč ich ručne a skús znova.');
  }

  stara.setName(CONFIG.SHEET_NAME);
  console.log('Karta "LP leady" premenovaná na "' + CONFIG.SHEET_NAME + '".');
}

function setupSheet() {
  zjednotNazovKarty();
  pripravHarok(CONFIG.SHEET_NAME, COLUMNS, false);

  if (CONFIG.KEEP_TECH_SHEET) {
    var tech = pripravHarok(CONFIG.TECH_SHEET_NAME, TECH_COLUMNS, true);
    tech.hideSheet();
  }

  console.log('Hotovo. Ak máš starý hárok s technickými stĺpcami, '
    + 'spusti ešte simplifySheet().');
}

/** Vytvorí kartu alebo do existujúcej doplní chýbajúce stĺpce. */
function pripravHarok(nazov, stlpce, jeTechnicka) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(nazov);
  var novy = !sheet;
  if (novy) sheet = spreadsheet.insertSheet(nazov);

  if (novy || sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, stlpce.length).setValues([stlpce]);
  } else {
    /* Dopĺňame len to, čo chýba – nikdy nemažeme, aby sa dáta nestratili */
    var mapa = headerMap(sheet);
    var pridane = [];

    stlpce.forEach(function (nazovStlpca, poradie) {
      if (mapa[nazovStlpca] !== undefined) return;

      var predchodca = poradie > 0 ? stlpce[poradie - 1] : null;
      var kam;
      if (predchodca && mapa[predchodca] !== undefined) {
        kam = mapa[predchodca] + 1;
        sheet.insertColumnAfter(mapa[predchodca] + 1);
      } else {
        kam = sheet.getLastColumn();
        sheet.insertColumnAfter(kam);
      }
      sheet.getRange(1, kam + 1).setValue(nazovStlpca);
      mapa = headerMap(sheet);
      pridane.push(nazovStlpca);
    });

    if (pridane.length) console.log(nazov + ' – doplnené stĺpce: ' + pridane.join(', '));
  }

  /* Vzhľad hlavičky */
  sheet.getRange(1, 1, 1, sheet.getLastColumn())
    .setFontWeight('bold')
    .setBackground(jeTechnicka ? '#6B7787' : '#142947')
    .setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);

  if (!jeTechnicka) nastavStatus(sheet);
  nastavSirky(sheet, jeTechnicka);

  SpreadsheetApp.flush();
  return sheet;
}

/** Rozbaľovací zoznam a farby pre stĺpec status. */
function nastavStatus(sheet) {
  var mapa = headerMap(sheet);
  if (mapa.status === undefined) return;

  var lastRow = Math.max(sheet.getMaxRows(), 1000);
  var rozsah = sheet.getRange(2, mapa.status + 1, lastRow - 1, 1);

  rozsah.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['CREATED', 'QUALIFIED', 'CONVERTED', 'DISQUALIFIED'], true)
      .setAllowInvalid(false)
      .build()
  );

  sheet.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('CONVERTED')
      .setBackground('#D6F0E4').setFontColor('#1E9E6A')
      .setRanges([rozsah]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('DISQUALIFIED')
      .setBackground('#EEF1F2').setFontColor('#6B7787')
      .setRanges([rozsah]).build()
  ]);
}

function nastavSirky(sheet, jeTechnicka) {
  var mapa = headerMap(sheet);
  var sirky = jeTechnicka
    ? [['datum', 90], ['cas', 60], ['telefon', 130], ['lead_id', 280]]
    : [['datum', 100], ['cas', 70], ['meno', 190], ['telefon', 140],
       ['email', 230], ['zaujem', 260], ['status', 140]];

  sirky.forEach(function (par) {
    if (mapa[par[0]] !== undefined) sheet.setColumnWidth(mapa[par[0]] + 1, par[1]);
  });
}


/* ===========================================================================
   ZJEDNODUŠENIE STARÉHO HÁRKU
   =========================================================================== */

/** yyyy-MM-dd → d.M.yyyy. Čokoľvek iné vráti nezmenené. */
function naDatum(hodnota) {
  var m = String(hodnota).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? Number(m[3]) + '.' + Number(m[2]) + '.' + m[1] : String(hodnota);
}

/**
 * Zoradí stĺpce podľa zadaného poradia.
 * Predpokladá, že hárok už obsahuje presne tieto stĺpce – volá sa až
 * po tom, ako sa prebytočné odstránili a chýbajúce doplnili.
 */
function zoradStlpce(sheet, stlpce) {
  var mapa = headerMap(sheet);
  var rovnako = stlpce.every(function (n, i) { return mapa[n] === i; });
  if (rovnako) return;

  var riadkov = Math.max(sheet.getLastRow(), 1);
  var data = sheet.getRange(1, 1, riadkov, sheet.getLastColumn()).getValues();

  var preusporiadane = data.map(function (r, index) {
    return stlpce.map(function (nazov) {
      if (index === 0) return nazov;                       // hlavička
      return mapa[nazov] !== undefined ? r[mapa[nazov]] : '';
    });
  });

  sheet.getRange(1, 1, preusporiadane.length, stlpce.length).setValues(preusporiadane);
  console.log('Stĺpce zoradené: ' + stlpce.join(', '));
}

/**
 * Prerobí starý hárok s dvadsiatimi stĺpcami na novú podobu.
 *
 * 1. Technické hodnoty existujúcich riadkov prekopíruje na skrytú kartu.
 * 2. Z karty pre personál odstráni stĺpce, ktoré tam už nepatria.
 *
 * Spúšťa sa RUČNE a len raz. Pred spustením si sprav kópiu hárku
 * (Súbor → Vytvoriť kópiu) – mazanie stĺpcov sa nedá vrátiť späť.
 */
function simplifySheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  zjednotNazovKarty();

  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    console.log('Žiadny hárok na zjednodušenie. Spusti setupSheet().');
    return;
  }

  var mapa = headerMap(sheet);
  var poslednyRiadok = sheet.getLastRow();

  /* --- 1. Technické údaje prehodíme na druhú kartu --------------------- */
  if (CONFIG.KEEP_TECH_SHEET && poslednyRiadok > 1) {
    var tech = spreadsheet.getSheetByName(CONFIG.TECH_SHEET_NAME);
    if (!tech) {
      tech = pripravHarok(CONFIG.TECH_SHEET_NAME, TECH_COLUMNS, true);
      tech.hideSheet();
    }
    if (tech.getLastRow() > 1) {
      console.log('Technická karta už má dáta – preskakujem kopírovanie.');
    } else {
      var vsetko = sheet.getRange(2, 1, poslednyRiadok - 1, sheet.getLastColumn()).getValues();
      var riadky = vsetko.map(function (r) {
        return TECH_COLUMNS.map(function (stlpec) {
          /* starý hárok mal created_at namiesto datum/cas */
          if (stlpec === 'datum' && mapa.datum === undefined && mapa.created_at !== undefined) {
            return naDatum(String(r[mapa.created_at]).split(' ')[0] || '');
          }
          if (stlpec === 'cas' && mapa.cas === undefined && mapa.created_at !== undefined) {
            return String(r[mapa.created_at]).split(' ')[1] || '';
          }
          return mapa[stlpec] !== undefined ? r[mapa[stlpec]] : '';
        });
      });
      if (riadky.length) {
        tech.getRange(2, 1, riadky.length, TECH_COLUMNS.length).setValues(riadky);
        console.log('Na technickú kartu prekopírovaných ' + riadky.length + ' riadkov.');
      }
    }
  }

  /* --- 2. Starý created_at rozdelíme na datum a cas --------------------
     Stĺpce datum a cas už môžu existovať prázdne, keď sa predtým spustil
     setupSheet. Preto sa neriadime tým, či existujú, ale tým, či sú
     v danom riadku vyplnené. */
  if (mapa.created_at !== undefined) {
    ['datum', 'cas'].forEach(function (nazov) {
      if (headerMap(sheet)[nazov] !== undefined) return;
      var kam = headerMap(sheet).created_at + 1;
      sheet.insertColumnAfter(kam);
      sheet.getRange(1, kam + 1).setValue(nazov);
    });
    mapa = headerMap(sheet);

    if (poslednyRiadok > 1) {
      var zdroj = sheet.getRange(2, mapa.created_at + 1, poslednyRiadok - 1, 1).getValues();
      var ciel = sheet.getRange(2, mapa.datum + 1, poslednyRiadok - 1, 1).getValues();
      var casCiel = sheet.getRange(2, mapa.cas + 1, poslednyRiadok - 1, 1).getValues();

      var doplnene = 0;
      for (var i = 0; i < zdroj.length; i++) {
        if (ciel[i][0] !== '' && ciel[i][0] != null) continue;   // už vyplnené
        var casti = String(zdroj[i][0]).split(' ');
        ciel[i][0] = naDatum(casti[0] || '');
        casCiel[i][0] = (casti[1] || '').slice(0, 5);
        doplnene++;
      }
      sheet.getRange(2, mapa.datum + 1, ciel.length, 1).setValues(ciel);
      sheet.getRange(2, mapa.cas + 1, casCiel.length, 1).setValues(casCiel);
      console.log('created_at rozdelený na datum a cas v ' + doplnene + ' riadkoch.');
    }
    mapa = headerMap(sheet);
  }

  /* --- 3. Zmažeme stĺpce, ktoré do karty pre personál nepatria --------- */
  var naZmazanie = Object.keys(headerMap(sheet)).filter(function (nazov) {
    return COLUMNS.indexOf(nazov) === -1;
  });

  /* Mažeme odzadu, nech sa indexy nepoposúvajú */
  naZmazanie
    .map(function (n) { return { nazov: n, index: headerMap(sheet)[n] }; })
    .sort(function (a, b) { return b.index - a.index; })
    .forEach(function (s) { sheet.deleteColumn(s.index + 1); });

  if (naZmazanie.length) console.log('Odstránené stĺpce: ' + naZmazanie.join(', '));

  /* --- 4. Doplníme, čo chýba, zoradíme a upravíme vzhľad --------------- */
  pripravHarok(CONFIG.SHEET_NAME, COLUMNS, false);
  zoradStlpce(getSheet(CONFIG.SHEET_NAME), COLUMNS);
  pripravHarok(CONFIG.SHEET_NAME, COLUMNS, false);   // overenie a formát po presune

  console.log('Hárok je zjednodušený. Karta pre personál má stĺpce: ' + COLUMNS.join(', '));
}
