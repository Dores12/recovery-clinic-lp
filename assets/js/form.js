/* ==========================================================================
   Recovery Clinic LP – form.js
   --------------------------------------------------------------------------
   Validácia, zber atribúcie a odoslanie leadu do Google Sheetu.

   Dôležité pravidlá:
   - Konverzia sa meria AŽ po úspešnom zápise na serveri, nikdy po kliknutí.
   - Hodnoty chipov („Čo chcete riešiť?") sú citlivé údaje – idú výhradne
     do Google Sheetu. Nikdy do dataLayeru, nikdy do URL.
   - Ak je v config.js prázdny formEndpoint, formulár beží v testovacom
     režime: nič sa neodosiela a nad formulárom svieti žltý pruh.
   ========================================================================== */

(function () {
  'use strict';

  var CONFIG = window.RC_CONFIG || {};
  var form = document.getElementById('lead-form');
  if (!form) return;

  /* Čas od načítania stránky – server odmietne odoslanie rýchlejšie ako 2,5 s
     (človek toľko potrebuje, robot nie). */
  var loadedAt = Date.now();

  /* Beží práve odoslanie? Zablokované tlačidlo nestačí – formulár sa dá
     odoslať aj klávesom Enter v ktoromkoľvek poli. */
  var isSubmitting = false;

  var card = document.querySelector('[data-form-card]');
  var submitBtn = form.querySelector('[data-submit]');
  var submitLabel = form.querySelector('[data-submit-label]');
  var errorBox = form.querySelector('[data-error-box]');
  var statusLine = form.querySelector('[data-form-status]');

  var fields = {
    name: document.getElementById('f-name'),
    phone: document.getElementById('f-phone'),
    email: document.getElementById('f-email'),
    /* Voľba „Ako chcete pokračovať?" je skupina dvoch rádiobutonov.
       V fields držíme prvý z nich – naň smeruje focus a aria-describedby. */
    path: document.getElementById('p-online'),
    consent: document.getElementById('f-consent')
  };

  var pathRadios = Array.prototype.slice.call(form.querySelectorAll('input[name="lead_path"]'));

  /** Ktorú cestu si človek vybral: 'online', 'call' alebo prázdne. */
  function selectedPath() {
    var checked = form.querySelector('input[name="lead_path"]:checked');
    return checked ? checked.value : '';
  }


  /* ======================================================================
     1. Pomocníci
     ====================================================================== */

  function errorBoxFor(input) {
    var id = input.getAttribute('aria-describedby');
    return id ? document.getElementById(id) : null;
  }

  function showError(input, message) {
    /* Pri skupine rádiobutonov označíme obe možnosti, nielen prvú */
    var ciel = input === fields.path ? pathRadios : [input];
    ciel.forEach(function (el) { el.setAttribute('aria-invalid', 'true'); });
    var box = errorBoxFor(input);
    if (box) box.textContent = message;
  }

  function clearError(input) {
    var ciel = input === fields.path ? pathRadios : [input];
    ciel.forEach(function (el) { el.removeAttribute('aria-invalid'); });
    var box = errorBoxFor(input);
    if (box) box.textContent = '';
    removeSuggestion();
  }

  function readCookie(name) {
    var match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : '';
  }

  function makeLeadId() {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
      }
    } catch (e) { /* fallback nižšie */ }
    return 'lead-' + Date.now() + '-' + Math.floor(Math.random() * 1e9);
  }

  /** Push do dataLayeru. Tagy (GA4, Ads, Meta) nastaví Daniel v GTM. */
  function pushEvent(name, data) {
    window.dataLayer = window.dataLayer || [];
    var payload = { event: name, lead_source: 'lp' };
    for (var key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) payload[key] = data[key];
    }
    window.dataLayer.push(payload);
    if (CONFIG.debug) console.log('[RC] dataLayer →', payload);
  }


  /* ======================================================================
     2. Atribúcia – odkiaľ návštevník prišiel

     Hodnoty z URL si pamätáme v sessionStorage, aby sa nestratili, keď sa
     človek po stránke preklikáva. Posledná neprázdna hodnota vyhráva.
     ====================================================================== */

  var ATTRIB_KEYS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'gclid', 'gbraid', 'wbraid', 'fbclid'
  ];

  function captureAttribution() {
    var stored = {};
    try { stored = JSON.parse(window.sessionStorage.getItem('rc_attrib')) || {}; } catch (e) { /* ticho */ }

    var params;
    try { params = new URLSearchParams(window.location.search); } catch (e) { return stored; }

    ATTRIB_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) stored[key] = value;
    });

    /* Meta click ID → formát, ktorý očakáva Meta (fbc) */
    if (stored.fbclid && !stored.fbc) {
      stored.fbc = 'fb.1.' + Date.now() + '.' + stored.fbclid;
    }

    try { window.sessionStorage.setItem('rc_attrib', JSON.stringify(stored)); } catch (e) { /* ticho */ }
    return stored;
  }

  var attribution = captureAttribution();

  /** Používateľ si v systéme vypol animácie – rešpektujeme to. */
  function reduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Stav marketingového súhlasu v čase odoslania (zapisuje ho consent.js). */
  function consentAds() {
    try {
      var saved = JSON.parse(window.localStorage.getItem('rc_consent_v1'));
      return saved && saved.marketing ? 'granted' : 'denied';
    } catch (e) {
      return 'denied';
    }
  }


  /* ======================================================================
     3. Validácia

     Validujeme pri opustení poľa a pri odoslaní. Keď je pole raz označené
     ako chybné, kontrolujeme ho aj počas písania, nech chyba zmizne hneď
     po oprave.
     ====================================================================== */

  /** Meno – stačí nám, že tam niečo je. */
  function validateName() {
    var value = fields.name.value.trim();
    if (value.length < 2) {
      return { ok: false, message: 'Zadajte meno a priezvisko.' };
    }
    return { ok: true, value: value };
  }

  /**
   * Telefón – normalizujeme na medzinárodný tvar (+421…).
   * Prijmeme 09XX XXX XXX, +421…, 00421…, pevné linky aj zahraničné čísla.
   */
  function normalizePhone(raw) {
    var cleaned = String(raw).replace(/[\s\-(). ]/g, '');
    if (cleaned.indexOf('00') === 0) cleaned = '+' + cleaned.slice(2);

    var hasPlus = cleaned.charAt(0) === '+';
    var digits = cleaned.replace(/\D/g, '');
    if (!digits) return null;

    if (hasPlus) {
      /* Medzinárodné číslo: 8–15 číslic podľa E.164 */
      if (digits.length < 8 || digits.length > 15) return null;
      return '+' + digits;
    }

    if (digits.charAt(0) === '0') {
      /* Domáce číslo: po úvodnej nule 8–9 číslic (mobil aj pevná linka) */
      var rest = digits.slice(1);
      if (rest.length < 8 || rest.length > 9) return null;
      return '+421' + rest;
    }

    /* Číslo bez nuly a bez predvoľby je príliš neisté – radšej odmietneme */
    return null;
  }

  function validatePhone() {
    var normalized = normalizePhone(fields.phone.value);
    if (!normalized) {
      return { ok: false, message: 'Zadajte telefónne číslo v tvare 09XX XXX XXX.' };
    }
    return { ok: true, value: normalized };
  }

  /** Bežné preklepy v doménach – ponúkneme opravu jedným klikom. */
  var DOMAIN_TYPOS = {
    'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmil.com': 'gmail.com',
    'gnail.com': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.co': 'gmail.com',
    'gmail.con': 'gmail.com', 'gmaill.com': 'gmail.com',
    'azet.s': 'azet.sk', 'azet.ks': 'azet.sk', 'azet.com': 'azet.sk',
    'centrum.sj': 'centrum.sk', 'centrum.s': 'centrum.sk', 'centrun.sk': 'centrum.sk',
    'zoznam.s': 'zoznam.sk', 'zoznan.sk': 'zoznam.sk', 'zozman.sk': 'zoznam.sk',
    'post.s': 'post.sk', 'seznam.c': 'seznam.cz', 'seznam.sk': 'seznam.cz',
    'hotmai.com': 'hotmail.com', 'hotmail.co': 'hotmail.com',
    'outlok.com': 'outlook.com', 'yahoo.co': 'yahoo.com', 'icloud.co': 'icloud.com'
  };

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validateEmail() {
    var value = fields.email.value.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      return { ok: false, message: 'Skontrolujte e-mail – napr. jana@gmail.com.' };
    }
    return { ok: true, value: value };
  }

  /** Vráti opravený e-mail, ak je v doméne známy preklep. */
  function emailSuggestion(value) {
    var at = value.lastIndexOf('@');
    if (at === -1) return null;
    var domain = value.slice(at + 1);
    var fixed = DOMAIN_TYPOS[domain];
    return fixed ? value.slice(0, at + 1) + fixed : null;
  }

  function removeSuggestion() {
    var existing = form.querySelector('.field__suggest');
    if (existing) existing.remove();
  }

  function showSuggestion(corrected) {
    removeSuggestion();
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'field__suggest';
    button.textContent = 'Mysleli ste ' + corrected + '?';
    button.addEventListener('click', function () {
      fields.email.value = corrected;
      clearError(fields.email);
      fields.email.focus();
    });
    var box = errorBoxFor(fields.email);
    if (box && box.parentNode) box.parentNode.insertBefore(button, box.nextSibling);
  }

  function validatePath() {
    if (!selectedPath()) {
      return { ok: false, message: 'Vyberte, ako chcete pokračovať.' };
    }
    return { ok: true, value: selectedPath() };
  }

  function validateConsent() {
    if (!fields.consent.checked) {
      return { ok: false, message: 'Na odoslanie potrebujeme váš súhlas.' };
    }
    return { ok: true, value: true };
  }

  var VALIDATORS = {
    name: validateName,
    phone: validatePhone,
    email: validateEmail,
    path: validatePath,
    consent: validateConsent
  };

  /** Skontroluje jedno pole a vypíše/zmaže chybu. */
  function checkField(key) {
    var input = fields[key];
    var result = VALIDATORS[key]();

    if (result.ok) {
      clearError(input);
      /* E-mail je síce platný, ale doména vyzerá na preklep */
      if (key === 'email') {
        var corrected = emailSuggestion(result.value);
        if (corrected) showSuggestion(corrected);
      }
    } else {
      showError(input, result.message);
    }
    return result;
  }

  /** Text tlačidla sa mení podľa zvolenej cesty. */
  function submitLabelText() {
    var percent = (CONFIG.discount && CONFIG.discount.percent) || 20;
    var path = selectedPath();
    if (path === 'online') return 'Získať zľavu a vybrať termín';
    if (path === 'call') return 'Získať zľavu a konzultáciu';
    return 'Získať zľavu ' + percent + ' %';
  }

  function updateSubmitLabel() {
    if (submitLabel) submitLabel.textContent = submitLabelText();
  }

  /* Validácia pri opustení poľa; po prvej chybe aj počas písania */
  Object.keys(fields).forEach(function (key) {
    var input = fields[key];
    if (key === 'path') return;   // rádiobutony riešime nižšie

    var eventName = key === 'consent' ? 'change' : 'blur';
    input.addEventListener(eventName, function () { checkField(key); });

    if (key !== 'consent') {
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') checkField(key);
      });
    }
  });

  pathRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      checkField('path');
      updateSubmitLabel();
    });
  });
  updateSubmitLabel();


  /* ======================================================================
     4. Vybraná infúzia („Mám záujem" pri kartách a v zozname)

     Názov infúzie ide LEN do Google Sheetu. Do dataLayeru posielame
     samostatnú udalosť infusion_interest, nikdy nie do leadu.
     ====================================================================== */

  var infusionField = document.getElementById('f-infusion');
  var infusionTag = form.querySelector('[data-selected-infusion]');
  var infusionName = form.querySelector('[data-selected-infusion-name]');

  function setInfusion(nazov) {
    if (!infusionField) return;
    infusionField.value = nazov || '';
    if (!infusionTag || !infusionName) return;

    if (nazov) {
      infusionName.textContent = nazov;
      infusionTag.hidden = false;
    } else {
      infusionTag.hidden = true;
    }
  }

  /** Prvé prázdne povinné pole – tam dáme kurzor po skoku na formulár. */
  function firstEmptyField() {
    var poradie = [fields.name, fields.phone, fields.email];
    for (var i = 0; i < poradie.length; i++) {
      if (poradie[i] && !poradie[i].value.trim()) return poradie[i];
    }
    return fields.name;
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-interest]');
    if (!trigger) return;

    event.preventDefault();
    var nazov = trigger.getAttribute('data-item') || '';
    setInfusion(nazov);

    /* Chip podľa kategórie infúzie */
    var data = window.RC_INFUSIONS;
    if (data && data.zoznam) {
      var infuzia = null;
      for (var i = 0; i < data.zoznam.length; i++) {
        if (data.zoznam[i].nazov === nazov) { infuzia = data.zoznam[i]; break; }
      }
      var chipValue = infuzia && data.chipPodlaKategorie
        ? data.chipPodlaKategorie[infuzia.kategoria]
        : '';
      if (chipValue) {
        var chip = form.querySelector('.chip input[value="' + chipValue + '"]');
        if (chip) chip.checked = true;
      }
    }

    pushEvent('infusion_interest', { item_name: nazov });

    var cielovePole = firstEmptyField();
    form.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(function () {
      if (cielovePole) cielovePole.focus({ preventScroll: true });
    }, reduceMotion() ? 0 : 600);
  });

  if (infusionTag) {
    infusionTag.querySelector('[data-clear-infusion]').addEventListener('click', function () {
      setInfusion('');
      var cielovePole = firstEmptyField();
      if (cielovePole) cielovePole.focus({ preventScroll: true });
    });
  }


  /* ======================================================================
     5. Zostavenie payloadu
     ====================================================================== */

  function collectInterests() {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="interest"]:checked'))
      .map(function (input) { return input.value; });
  }

  function buildPayload(leadId, values) {
    var discount = CONFIG.discount || {};
    var payload = {
      lead_id: leadId,
      name: values.name,
      phone: values.phone,
      email: values.email,
      interest: collectInterests(),
      infusion: infusionField ? infusionField.value : '',
      lead_path: selectedPath(),
      discount: (discount.percent || 20) + ' % prvá infúzia',
      lp_variant: (function () {
        try { return window.sessionStorage.getItem('lp_variant') || CONFIG.defaultVariant || 'a'; }
        catch (e) { return CONFIG.defaultVariant || 'a'; }
      })(),
      consent_ads: consentAds(),
      page_url: window.location.href,
      referrer: document.referrer || '',
      user_agent: navigator.userAgent,
      company: form.querySelector('#f-company').value,   // honeypot
      elapsed_ms: Date.now() - loadedAt
    };

    /* Atribúcia – prázdny reťazec, ak parameter neprišiel */
    ATTRIB_KEYS.concat(['fbc']).forEach(function (key) {
      payload[key] = attribution[key] || '';
    });
    if (!payload.fbc) payload.fbc = readCookie('_fbc');
    payload.fbp = readCookie('_fbp');

    return payload;
  }


  /* ======================================================================
     6. Stavy tlačidla a chybový box
     ====================================================================== */

  function setBusy(busy) {
    if (busy) {
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.disabled = true;
      submitLabel.textContent = 'Odosielam…';
      var icon = submitBtn.querySelector('.ico');
      if (icon) {
        icon.hidden = true;
        var spinner = document.createElement('span');
        spinner.className = 'spinner';
        spinner.setAttribute('aria-hidden', 'true');
        submitBtn.appendChild(spinner);
      }
    } else {
      submitBtn.removeAttribute('aria-busy');
      submitBtn.disabled = false;
      submitLabel.textContent = submitLabelText();
      var oldSpinner = submitBtn.querySelector('.spinner');
      if (oldSpinner) oldSpinner.remove();
      var arrow = submitBtn.querySelector('.ico');
      if (arrow) arrow.hidden = false;
    }
  }

  function showSendError() {
    var phone = CONFIG.phone || '';
    var display = CONFIG.phoneDisplay || phone;
    errorBox.innerHTML = 'Formulár sa nepodarilo odoslať. Skúste to prosím znova alebo nám zavolajte na '
      + '<a href="tel:' + phone + '" data-track="phone_click" data-location="form_error">'
      + display + '</a>.';
    errorBox.hidden = false;
  }


  /* ======================================================================
     7. Stav Úspech – nahradí obsah karty
     ====================================================================== */

  function showSuccess(firstName, leadPath, leadId) {
    var percent = (CONFIG.discount && CONFIG.discount.percent) || 20;
    var booking = CONFIG.bookingUrl || '#';
    var sipka = '<svg class="ico" aria-hidden="true"><use href="#i-arrow-right"/></svg>';

    /* Poznámka je rovnaká pre obe cesty – bez nej by sme zľavu nevedeli priradiť */
    var poznamka = '<p class="body-s muted form-success__note">Pri rezervácii použite rovnaký '
      + 'e-mail alebo telefón, aby sme vám zľavu priradili. Zľavu uplatníte pri platbe '
      + 'na prevádzke.</p>';

    var telo;
    if (leadPath === 'online') {
      /* Človek si chce vybrať termín sám – rezervácia je hlavné tlačidlo */
      telo = ''
        + '<p class="body-m form-success__text">Zľavu ' + percent + ' % na prvú infúziu máte '
        +   'zapísanú. Teraz si vyberte termín, ktorý vám vyhovuje.</p>'
        + '<a class="btn btn--primary btn--block" href="' + booking + '" data-success-booking>'
        +   '<span>Vybrať termín v rezervácii</span>' + sipka
        + '</a>'
        + poznamka;
    } else {
      /* Človek chce, aby sme zavolali – rezervácia je len doplnková možnosť */
      telo = ''
        + '<p class="body-m form-success__text">Zdravotník sa vám ozve do 24 hodín. Zľavu '
        +   percent + ' % na prvú infúziu máte zapísanú – uplatníte ju pri platbe na prevádzke.</p>'
        + '<div class="form-success__divider"></div>'
        + '<p class="form-success__nudge">Nechcete čakať?</p>'
        + '<a class="btn btn--secondary btn--block" href="' + booking + '" data-success-booking>'
        +   '<span>Vybrať termín online</span>' + sipka
        + '</a>'
        + poznamka;
    }

    card.innerHTML =
      '<div class="form-success">' +
        '<div class="form-success__icon" aria-hidden="true">' +
          '<svg class="ico"><use href="#i-check"/></svg>' +
        '</div>' +
        '<h3 tabindex="-1" data-success-heading>Ďakujeme, ' + firstName + '!</h3>' +
        telo +
      '</div>';

    /* Focus na nadpis, nech čítačka oznámi zmenu. URL nemeníme – zdravotné
       údaje nesmú skončiť v adrese ani v pixeloch. */
    var heading = card.querySelector('[data-success-heading]');
    if (heading) heading.focus({ preventScroll: true });

    initSuccessBooking(leadPath, leadId);
  }

  /**
   * Klik na rezerváciu v stave Úspech.
   *
   * Okrem dataLayeru pošleme aj beacon na server, aby sa čas kliku zapísal
   * do Sheetu. sendBeacon prehliadač doručí, aj keď medzitým odídeme
   * zo stránky – bežný fetch by sa v tej chvíli zrušil.
   */
  function initSuccessBooking(leadPath, leadId) {
    var odkaz = card.querySelector('[data-success-booking]');
    if (!odkaz) return;

    odkaz.addEventListener('click', function () {
      pushEvent('booking_click', { link_location: 'success', lead_path: leadPath });

      if (!CONFIG.formEndpoint || !navigator.sendBeacon) return;
      try {
        navigator.sendBeacon(
          CONFIG.formEndpoint,
          new Blob([JSON.stringify({ action: 'booking_click', lead_id: leadId })],
                   { type: 'text/plain;charset=utf-8' })
        );
      } catch (e) {
        if (CONFIG.debug) console.warn('[RC] beacon sa nepodaril', e);
      }
    });
  }


  /* ======================================================================
     8. Odoslanie
     ====================================================================== */

  /** fetch s časovým limitom 12 s (AbortSignal.timeout nemajú staršie Safari). */
  function postLead(url, payload) {
    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, 12000);

    return fetch(url, {
      method: 'POST',
      /* Apps Script nepodporuje CORS preflight → posielame „simple request" */
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal
    }).then(function (response) {
      window.clearTimeout(timer);
      return response.json();
    }, function (error) {
      window.clearTimeout(timer);
      throw error;
    });
  }

  /**
   * Parametre udalosti generate_lead.
   * user_data (pre rozšírené konverzie Google Ads a Meta advanced matching)
   * posielame IBA pri marketingovom súhlase – bez neho by sme odosielali
   * osobné údaje do reklamných systémov bez právneho základu.
   */
  function leadEventData(leadId, payload, values, testMode) {
    var tracking = CONFIG.tracking || {};
    var data = {
      event_id: leadId,
      lp_variant: payload.lp_variant,
      lead_path: payload.lead_path,
      value: tracking.leadValue || 0,
      currency: tracking.currency || 'EUR'
    };

    if (payload.consent_ads === 'granted') {
      data.user_data = {
        email: values.email,
        phone_number: values.phone
      };
    }
    if (testMode) data.test_mode = true;

    return data;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (isSubmitting) return;
    errorBox.hidden = true;

    /* --- Validácia všetkých polí --- */
    var order = ['name', 'phone', 'email', 'path', 'consent'];
    var values = {};
    var firstInvalid = null;
    var errorCount = 0;

    order.forEach(function (key) {
      var result = checkField(key);
      if (result.ok) values[key] = result.value;
      else {
        errorCount++;
        if (!firstInvalid) firstInvalid = key;
      }
    });

    if (firstInvalid) {
      statusLine.textContent = errorCount === 1
        ? 'Formulár obsahuje 1 chybu. Skontrolujte zvýraznené pole.'
        : 'Formulár obsahuje ' + errorCount + ' chyby. Skontrolujte zvýraznené polia.';

      pushEvent('form_error', { error_type: 'validation', form_field: firstInvalid });

      var input = fields[firstInvalid];
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus({ preventScroll: true });
      return;
    }

    statusLine.textContent = '';

    /* --- Odoslanie --- */
    var leadId = makeLeadId();
    var payload = buildPayload(leadId, values);
    var endpoint = CONFIG.formEndpoint;
    isSubmitting = true;
    setBusy(true);

    /* Testovací režim – endpoint ešte nie je nasadený */
    if (!endpoint) {
      window.setTimeout(function () {
        pushEvent('generate_lead', leadEventData(leadId, payload, values, true));
        showSuccess(values.name.split(' ')[0], payload.lead_path, leadId);
      }, 800);
      return;
    }

    postLead(endpoint, payload).then(function (data) {
      if (!data || data.ok !== true) throw new Error('server');

      /* Konverziu hlásime až teraz – po úspešnom zápise do Sheetu */
      pushEvent('generate_lead', leadEventData(leadId, payload, values, false));

      showSuccess(values.name.split(' ')[0], payload.lead_path, leadId);
    }).catch(function (error) {
      isSubmitting = false;
      setBusy(false);
      showSendError();
      pushEvent('form_error', {
        error_type: error && error.message === 'server' ? 'server' : 'network'
      });
      if (CONFIG.debug) console.error('[RC] odoslanie zlyhalo', error);
    });
  });


  /* ======================================================================
     9. Testovací režim – žltý pruh nad formulárom
     ====================================================================== */

  if (!CONFIG.formEndpoint) {
    var banner = card.querySelector('[data-testmode]');
    if (banner) banner.hidden = false;
    if (CONFIG.debug) console.log('[RC] formulár beží v testovacom režime');
  }
})();
