/* ==========================================================================
   Recovery Clinic LP – consent.js
   --------------------------------------------------------------------------
   Cookie lišta a Consent Mode v2.

   Predvolený stav („všetko zakázané") nastavuje inline skript v <head>,
   ktorý beží ešte pred GTM. Tento súbor rieši už len lištu a to, čo sa
   stane po rozhodnutí návštevníka.

   Voľba sa ukladá do localStorage pod kľúčom rc_consent_v1 a platí 12
   mesiacov. Potom sa lišta zobrazí znova.

   Keby klient niekedy chcel certifikovanú CMP (Cookiebot, CookieYes),
   stačí vymeniť tento jeden súbor – zvyšok kódu na ňom nezávisí.
   ========================================================================== */

(function () {
  'use strict';

  var CONFIG = window.RC_CONFIG || {};
  var STORAGE_KEY = 'rc_consent_v1';
  var VALID_MONTHS = 12;

  var bar = document.querySelector('[data-cookie-bar]');
  if (!bar) return;

  var mainView = bar.querySelector('[data-cookie-main]');
  var settingsView = bar.querySelector('[data-cookie-settings]');
  var analyticsBox = bar.querySelector('[data-cookie-analytics]');
  var marketingBox = bar.querySelector('[data-cookie-marketing]');


  /* ======================================================================
     Uložená voľba
     ====================================================================== */

  function readStored() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (!saved || !saved.date) return null;

      /* Starší súhlas ako 12 mesiacov sa musí obnoviť */
      var expiresAt = new Date(saved.date);
      expiresAt.setMonth(expiresAt.getMonth() + VALID_MONTHS);
      if (expiresAt.getTime() < Date.now()) return null;

      return saved;
    } catch (e) {
      return null;
    }
  }

  function store(analytics, marketing) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        analytics: !!analytics,
        marketing: !!marketing,
        date: new Date().toISOString()
      }));
    } catch (e) { /* privátne okno – voľba platí aspoň pre túto návštevu */ }
  }


  /* ======================================================================
     Odovzdanie súhlasu do Google a do dataLayeru

     Poradie je dôležité: najprv consent update (aby ho GTM stihol zachytiť),
     až potom vlastná udalosť pre prípadné triggre.
     ====================================================================== */

  function applyConsent(analytics, marketing) {
    window.dataLayer = window.dataLayer || [];

    function gtag() { window.dataLayer.push(arguments); }

    gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied'
    });

    window.dataLayer.push({
      event: 'consent_update',
      lead_source: 'lp',
      consent_analytics: analytics ? 'granted' : 'denied',
      consent_marketing: marketing ? 'granted' : 'denied'
    });

    if (CONFIG.debug) {
      console.log('[RC] consent →', { analytics: analytics, marketing: marketing });
    }
  }

  function decide(analytics, marketing) {
    applyConsent(analytics, marketing);
    store(analytics, marketing);
    hideBar();
  }


  /* ======================================================================
     Zobrazenie a skrytie lišty
     ====================================================================== */

  /** Prvok, na ktorý sa vráti focus po zatvorení lišty. */
  var lastFocused = null;

  function showBar(openSettings) {
    lastFocused = document.activeElement;

    var saved = readStored();
    if (analyticsBox) analyticsBox.checked = saved ? !!saved.analytics : false;
    if (marketingBox) marketingBox.checked = saved ? !!saved.marketing : false;

    mainView.hidden = !!openSettings;
    settingsView.hidden = !openSettings;
    bar.hidden = false;

    var firstButton = (openSettings ? settingsView : mainView).querySelector('button');
    if (firstButton) firstButton.focus();
  }

  function hideBar() {
    bar.hidden = true;
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
      lastFocused = null;
    }
  }


  /* ======================================================================
     Obsluha tlačidiel
     ====================================================================== */

  bar.querySelector('[data-cookie-accept]').addEventListener('click', function () {
    decide(true, true);
  });

  bar.querySelector('[data-cookie-reject]').addEventListener('click', function () {
    decide(false, false);
  });

  bar.querySelector('[data-cookie-open-settings]').addEventListener('click', function () {
    mainView.hidden = true;
    settingsView.hidden = false;
    var save = settingsView.querySelector('[data-cookie-save]');
    if (save) save.focus();
  });

  bar.querySelector('[data-cookie-save]').addEventListener('click', function () {
    decide(analyticsBox && analyticsBox.checked, marketingBox && marketingBox.checked);
  });

  /* Escape zatvorí lištu bez rozhodnutia – predvolené „denied" ostáva */
  bar.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') hideBar();
  });

  /* Odkaz „Nastavenie cookies" v pätičke otvorí lištu znova */
  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-cookie-settings-button]');
    if (trigger) {
      event.preventDefault();
      showBar(true);
    }
  });


  /* ======================================================================
     Štart – lištu zobraz len tomu, kto ešte nerozhodol
     ====================================================================== */

  var stored = readStored();
  if (stored) {
    /* Inline skript v <head> už voľbu aplikoval, lištu neukazujeme */
    if (CONFIG.debug) console.log('[RC] uložený súhlas', stored);
  } else {
    showBar(false);
  }
})();
