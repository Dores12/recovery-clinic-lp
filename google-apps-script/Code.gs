/**
 * Recovery Clinic LP – backend formulára
 * =============================================================================
 * Zapisuje leady z landing page do Google Sheetu a pošle upozornenie recepcii.
 *
 * Nasadenie krok za krokom: pozri README.md v tomto priečinku.
 *
 * Po vložení kódu spusti raz ručne funkciu setupSheet() – pripraví hárok,
 * hlavičku, rozbaľovací zoznam pre stĺpec status a farebné zvýraznenie.
 */


/* ===========================================================================
   NASTAVENIA – jediné miesto, ktoré treba meniť
   =========================================================================== */

var CONFIG = {
  /** Názov karty v Google Sheete. Musí sedieť s tým, čo vytvorí setupSheet(). */
  SHEET_NAME: 'LP leady',

  /** Komu chodí upozornenie na nový lead.
   *  Viac adries oddeľ čiarkou: 'recepcia@…, daniel@…' */
  NOTIFY_EMAIL: 'bratislava@recovery-clinic.sk',

  /** false = neposielať e-maily (hodí sa pri testovaní) */
  SEND_NOTIFICATION: true,

  /** Len informatívne – Apps Script beží ako „Ktokoľvek", pôvod sa nedá
   *  spoľahlivo overiť. Slúži na orientáciu v logoch. */
  ALLOWED_ORIGINS: ['https://TODO-domena.sk'],

  /** Rovnaký telefón alebo e-mail v tomto okne = duplicita, nezapíše sa. */
  DEDUPE_MINUTES: 10,

  /** Odoslanie rýchlejšie ako toto je takmer isto robot. */
  MIN_ELAPSED_MS: 2500,

  /** Časové pásmo pre stĺpec created_at. */
  TIMEZONE: 'Europe/Bratislava'
};

/**
 * Stĺpce hárku v poradí, v akom ich vytvorí setupSheet().
 *
 * Zápis sa NERIADI týmto poradím, ale názvami v hlavičke hárku – keď
 * niekto stĺpce presunie alebo pridá vlastný, nič sa nerozbije.
 * Keď sem pridáš nový stĺpec, spusti znova setupSheet(): doplní ho aj
 * do existujúceho hárku bez straty dát.
 */
var COLUMNS = [
  'created_at', 'lead_id', 'status', 'meno', 'telefon', 'email', 'zaujem',
  'pokracovanie', 'infuzia', 'booking_click_at',
  'zlava', 'lp_variant',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'gclid', 'gbraid', 'wbraid',
  'fbclid', 'fbc', 'fbp',
  'consent_ads', 'page_url', 'referrer', 'user_agent', 'poznamka_recepcie'
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
       Nezakladá lead, len doplní čas k existujúcemu riadku. */
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
  var hlavicka = sheet.getRange(1, 1, 1, sirka).getValues()[0];
  var mapa = {};
  for (var i = 0; i < hlavicka.length; i++) {
    var nazov = String(hlavicka[i]).trim();
    if (nazov) mapa[nazov] = i;
  }
  return mapa;
}

function appendLead(data, name, phone, email) {
  var sheet = getSheet();

  var row = {
    created_at: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss'),
    lead_id: data.lead_id || '',
    status: 'CREATED',
    meno: name,
    /* Apostrof pred číslom – inak si Sheets z +421… urobí číslo a zahodí plus */
    telefon: "'" + phone,
    email: email,
    zaujem: (data.interest || []).join(', '),
    pokracovanie: data.lead_path || '',
    infuzia: data.infusion || '',
    booking_click_at: '',
    zlava: data.discount || '',
    lp_variant: data.lp_variant || '',
    consent_ads: data.consent_ads || '',
    page_url: data.page_url || '',
    referrer: data.referrer || '',
    user_agent: data.user_agent || '',
    poznamka_recepcie: ''
  };

  /* Atribúcia – prázdny reťazec, ak parameter neprišiel */
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
   'gclid', 'gbraid', 'wbraid', 'fbclid', 'fbc', 'fbp'].forEach(function (key) {
    row[key] = data[key] || '';
  });

  /* Riadok skladáme podľa hlavičky hárku, nie podľa poradia v COLUMNS */
  var mapa = headerMap(sheet);
  var sirka = Math.max(sheet.getLastColumn(), COLUMNS.length);
  var riadok = new Array(sirka).fill('');

  Object.keys(row).forEach(function (key) {
    if (mapa[key] === undefined) return;   // stĺpec v hárku nie je – preskočíme
    riadok[mapa[key]] = row[key];
  });

  sheet.appendRow(riadok);
}


/**
 * Zapíše čas kliku na rezerváciu k riadku s daným lead_id.
 * Keď je čas už vyplnený, neprepisuje ho (počíta sa prvý klik).
 */
function handleBookingClick(leadId) {
  if (!leadId) return jsonResponse({ ok: true });

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet();
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
        bunka.setValue(Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss'));
      }
      return jsonResponse({ ok: true, lead_id: leadId });
    }

    /* Neznáme lead_id – nič nezapisujeme, ale ani nehlásime chybu */
    console.log('booking_click pre neznáme lead_id: ' + leadId);
    return jsonResponse({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    throw new Error('Karta "' + CONFIG.SHEET_NAME + '" neexistuje. Spusti setupSheet().');
  }
  return sheet;
}


/* ===========================================================================
   UPOZORNENIE RECEPCII
   Zámerne bez click ID – do e-mailu patrí len to, čo recepcia potrebuje.
   =========================================================================== */

function notifyReception(data, name, phone, email) {
  try {
    var interest = (data.interest || []).join(', ') || 'neuvedené';
    var cesta = CESTY[data.lead_path] || 'neuvedené';
    var sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();

    /* Pri „zavolajte mi" dáme do predmetu výzvu – recepcia musí konať */
    var subject = data.lead_path === 'call'
      ? '📞 ZAVOLAŤ: ' + name
      : 'Nový lead z LP: ' + name + ' – ' + cesta;

    var body =
      'Nový lead z landing page\n\n' +
      'Meno:              ' + name + '\n' +
      'Telefón:           ' + phone + '\n' +
      'E-mail:            ' + email + '\n' +
      'Ako chce pokračovať: ' + cesta + '\n' +
      'Vybraná infúzia:   ' + (data.infusion || 'neuvedená') + '\n' +
      'Záujem:            ' + interest + '\n' +
      'Variant:           ' + (data.lp_variant || '-') + '\n' +
      'Zľava:             ' + (data.discount || '-') + '\n\n' +
      'Hárok s leadmi: ' + sheetUrl + '\n';

    MailApp.sendEmail({ to: CONFIG.NOTIFY_EMAIL, subject: subject, body: body });
  } catch (err) {
    /* Keď zlyhá e-mail, lead je už v hárku – nesmieme kvôli tomu vrátiť chybu */
    console.error('Notifikácia sa neodoslala: ' + err);
  }
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
   JEDNORAZOVÁ PRÍPRAVA HÁRKU
   Spusti ručne z editora: vyber setupSheet a stlač Spustiť.
   Dá sa spustiť aj opakovane – existujúce dáta neprepíše.
   =========================================================================== */

function setupSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  var novyHarok = !sheet;
  if (novyHarok) sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);

  if (novyHarok || sheet.getLastRow() === 0) {
    /* Prázdny hárok – zapíšeme celú hlavičku naraz */
    sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
  } else {
    /* Existujúci hárok – dopĺňame len to, čo chýba, aby sa dáta nestratili.
       Nový stĺpec vložíme hneď za jeho suseda z COLUMNS; keď ten v hárku
       nie je, pripojíme ho na koniec. */
    var mapa = headerMap(sheet);
    var pridane = [];

    COLUMNS.forEach(function (nazov, poradie) {
      if (mapa[nazov] !== undefined) return;

      var predchodca = poradie > 0 ? COLUMNS[poradie - 1] : null;
      var kam;
      if (predchodca && mapa[predchodca] !== undefined) {
        kam = mapa[predchodca] + 1;        // index (od 0) nového stĺpca
        sheet.insertColumnAfter(mapa[predchodca] + 1);
      } else {
        kam = sheet.getLastColumn();
        sheet.insertColumnAfter(kam);
      }
      sheet.getRange(1, kam + 1).setValue(nazov);
      mapa = headerMap(sheet);             // indexy sa posunuli, načítame znova
      pridane.push(nazov);
    });

    if (pridane.length) console.log('Doplnené stĺpce: ' + pridane.join(', '));
    else console.log('Hlavička je kompletná, nič sa nedopĺňalo.');
  }

  /* Vzhľad hlavičky */
  sheet.getRange(1, 1, 1, sheet.getLastColumn())
    .setFontWeight('bold')
    .setBackground('#142947')
    .setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);

  var mapaFinal = headerMap(sheet);
  var statusCol = mapaFinal.status + 1;
  var lastRow = Math.max(sheet.getMaxRows(), 1000);
  var statusRange = sheet.getRange(2, statusCol, lastRow - 1, 1);

  /* Rozbaľovací zoznam pre stav leadu – rovnaký proces, aký recepcia
     používa pri leadoch z Meta formulárov. */
  statusRange.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['CREATED', 'QUALIFIED', 'CONVERTED', 'DISQUALIFIED'], true)
      .setAllowInvalid(false)
      .build()
  );

  /* Farebné zvýraznenie: CONVERTED zelená, DISQUALIFIED sivá */
  sheet.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('CONVERTED')
      .setBackground('#D6F0E4').setFontColor('#1E9E6A')
      .setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('DISQUALIFIED')
      .setBackground('#EEF1F2').setFontColor('#6B7787')
      .setRanges([statusRange]).build()
  ]);

  /* Šírky najpoužívanejších stĺpcov, nech sa to dá čítať */
  [['created_at', 150], ['meno', 180], ['telefon', 140], ['email', 220],
   ['zaujem', 200], ['pokracovanie', 150], ['infuzia', 170],
   ['booking_click_at', 150], ['poznamka_recepcie', 280]].forEach(function (par) {
    if (mapaFinal[par[0]] !== undefined) sheet.setColumnWidth(mapaFinal[par[0]] + 1, par[1]);
  });

  SpreadsheetApp.flush();
  console.log('Hárok "' + CONFIG.SHEET_NAME + '" je pripravený.');
}
