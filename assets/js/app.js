/* ==========================================================================
   Recovery Clinic LP – app.js
   --------------------------------------------------------------------------
   FÁZA 1: napĺňanie hodnôt z config.js + tieň hlavičky pri scrolle.

   Ďalej pribudne:
   - fáza 2: varianty ?v=, carousely, sticky lišta, plynulý scroll, animácie
   - fáza 3: validácia a odoslanie formulára
   - fáza 4: zber atribúcie a dataLayer eventy
   ========================================================================== */

(function () {
  'use strict';

  var CONFIG = window.RC_CONFIG || {};

  /* ----- Pomocníci ----- */
  function all(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  /** Nastaví text všetkým prvkom, ktoré zodpovedajú selektoru. */
  function setText(selector, value) {
    if (value === undefined || value === null) return;
    all(selector).forEach(function (el) { el.textContent = value; });
  }

  /** Nastaví href všetkým prvkom. Ak je URL prázdna, odkaz nechá tak. */
  function setHref(selector, url) {
    if (!url) return;
    all(selector).forEach(function (el) { el.setAttribute('href', url); });
  }


  /* ======================================================================
     1. Hodnoty z configu do stránky
     Vďaka tomu sa kontakty, odkazy a percento zľavy menia na jednom mieste.
     ====================================================================== */

  function applyConfig() {
    /* Percento zľavy – <span data-discount>20</span> kdekoľvek v texte */
    if (CONFIG.discount && CONFIG.discount.percent) {
      setText('[data-discount]', CONFIG.discount.percent);
    }

    /* Podmienky zľavy pod formulárom */
    if (CONFIG.discount && CONFIG.discount.terms) {
      setText('[data-discount-terms]', CONFIG.discount.terms);
    }

    /* Kontakty */
    setText('[data-phone-display]', CONFIG.phoneDisplay);
    setText('[data-email]', CONFIG.email);
    setText('[data-hours]', CONFIG.hours);
    setText('[data-address]', CONFIG.address);

    if (CONFIG.phone) {
      setHref('[data-phone-link]', 'tel:' + CONFIG.phone);
      /* aria-label na okrúhlom tlačidle v hlavičke nech sedí s číslom */
      all('.header__phone-icon').forEach(function (el) {
        el.setAttribute('aria-label', 'Zavolať ' + (CONFIG.phoneDisplay || CONFIG.phone));
      });
    }
    if (CONFIG.email) setHref('[data-email-link]', 'mailto:' + CONFIG.email);

    /* Odkazy */
    setHref('[data-booking]', CONFIG.bookingUrl);
    setHref('[data-voucher]', CONFIG.voucherUrl);
    setHref('[data-maps]', CONFIG.mapsUrl);
    setHref('[data-privacy]', CONFIG.privacyUrl);
    setHref('[data-terms]', CONFIG.termsUrl);

    /* Odkaz na Google recenzie sa zobrazí, len ak je URL vyplnená */
    if (CONFIG.googleReviewsUrl) {
      setHref('[data-google-reviews]', CONFIG.googleReviewsUrl);
      all('[data-google-reviews-wrap]').forEach(function (el) { el.hidden = false; });
    }

    /* Aktuálny rok v pätičke */
    setText('[data-year]', new Date().getFullYear());
  }


  /* ======================================================================
     2. Tieň hlavičky po 8 px scrollu
     ====================================================================== */

  function initHeaderShadow() {
    var header = document.querySelector('.header');
    if (!header) return;

    function update() {
      header.classList.toggle('header--scrolled', window.scrollY > 8);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }


  /* ======================================================================
     Štart
     ====================================================================== */

  applyConfig();
  initHeaderShadow();

  if (CONFIG.debug) {
    console.log('[RC] config applied', CONFIG);
  }
})();
