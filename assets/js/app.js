/* ==========================================================================
   Recovery Clinic LP – app.js
   --------------------------------------------------------------------------
   Čo je tu hotové:
   - napĺňanie hodnôt z config.js (kontakty, odkazy, zľava, rok)
   - tieň hlavičky pri scrolle
   - varianty H1 podľa ?v= v URL
   - carousely na mobile (infúzie, recenzie) s bodkami
   - sticky lišta dole (mobil)
   - scroll na formulár + focus na prvé pole
   - jemné odkrývanie sekcií pri scrolle

   Ešte pribudne:
   - fáza 3: validácia a odoslanie formulára
   - fáza 4: zber atribúcie a dataLayer eventy

   Poznámka: triedy na animácie pridáva JavaScript, nie HTML. Keby JS zlyhal,
   obsah ostane normálne viditeľný.
   ========================================================================== */

(function () {
  'use strict';

  var CONFIG = window.RC_CONFIG || {};

  /** Variant stránky (a–e). Potrebuje ho fáza 4 pri odosielaní eventov. */
  var currentVariant = CONFIG.defaultVariant || 'a';


  /* ======================================================================
     Pomocníci
     ====================================================================== */

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setText(selector, value) {
    if (value === undefined || value === null) return;
    all(selector).forEach(function (el) { el.textContent = value; });
  }

  function setHref(selector, url) {
    if (!url) return;
    all(selector).forEach(function (el) { el.setAttribute('href', url); });
  }

  /** Používateľ si v systéme vypol animácie – rešpektujeme to. */
  function reduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function scrollBehavior() {
    return reduceMotion() ? 'auto' : 'smooth';
  }

  /** sessionStorage môže byť zakázaný (privátne okno) – nesmie zhodiť stránku. */
  function sessionSet(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (e) { /* ticho */ }
  }


  /* ======================================================================
     1. Hodnoty z configu do stránky
     Vďaka tomu sa kontakty, odkazy a percento zľavy menia na jednom mieste.
     ====================================================================== */

  function applyConfig() {
    if (CONFIG.discount && CONFIG.discount.percent) {
      setText('[data-discount]', CONFIG.discount.percent);
    }
    if (CONFIG.discount && CONFIG.discount.terms) {
      setText('[data-discount-terms]', CONFIG.discount.terms);
    }

    setText('[data-phone-display]', CONFIG.phoneDisplay);
    setText('[data-email]', CONFIG.email);
    setText('[data-hours]', CONFIG.hours);
    setText('[data-address]', CONFIG.address);

    if (CONFIG.phone) {
      setHref('[data-phone-link]', 'tel:' + CONFIG.phone);
      all('.header__phone-icon').forEach(function (el) {
        el.setAttribute('aria-label', 'Zavolať ' + (CONFIG.phoneDisplay || CONFIG.phone));
      });
    }
    if (CONFIG.email) setHref('[data-email-link]', 'mailto:' + CONFIG.email);

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

    setText('[data-year]', new Date().getFullYear());
  }


  /* ======================================================================
     2. Varianty H1 podľa ?v= v URL (message match s reklamou)

     ?v=a až ?v=e, definované v config.js. Neznámy alebo chýbajúci parameter
     = default. Bez JS ostane v HTML default variant „a".
     ====================================================================== */

  function initVariant() {
    var variants = CONFIG.variants || {};
    var requested = '';

    try {
      requested = (new URLSearchParams(window.location.search).get('v') || '').toLowerCase();
    } catch (e) { /* staršie prehliadače – ostane default */ }

    var key = Object.prototype.hasOwnProperty.call(variants, requested)
      ? requested
      : (CONFIG.defaultVariant || 'a');

    var variant = variants[key];
    if (!variant) return;

    currentVariant = key;
    sessionSet('lp_variant', key);

    /* H1 – <b> v configu znamená zvýraznenú (modrú) časť nadpisu */
    var h1 = document.querySelector('[data-h1]');
    if (h1 && variant.h1) {
      h1.innerHTML = variant.h1
        .replace(/<b>/g, '<span class="hl">')
        .replace(/<\/b>/g, '</span>');
    }

    /* Voliteľný vlastný podnadpis */
    var sub = document.querySelector('[data-sub]');
    if (sub && variant.sub) sub.textContent = variant.sub;

    /* Predvybraný chip vo formulári */
    if (variant.chip) {
      var chip = document.querySelector('.chip input[value="' + variant.chip + '"]');
      if (chip) chip.checked = true;
    }

    /* TODO (fáza 4): dataLayer.push({ event: 'lp_variant_view', … }) */
  }


  /* ======================================================================
     3. Tieň hlavičky po 8 px scrollu
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
     4. Carousel na mobile (infúzie, recenzie)

     Samotné posúvanie rieši CSS (scroll-snap). JavaScript len dopĺňa bodky,
     aby bolo vidno, koľko kariet ešte je. Na desktope je mriežka a bodky
     sú skryté cez CSS.
     ====================================================================== */

  function initCarousel(name) {
    var track = document.querySelector('[data-carousel="' + name + '"]');
    var dotsWrap = document.querySelector('[data-dots="' + name + '"]');
    if (!track || !dotsWrap) return;

    var slides = Array.prototype.slice.call(track.children);
    if (slides.length < 2) return;

    var dots = slides.map(function (slide, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Zobraziť ' + (i + 1) + '. z ' + slides.length);
      dot.addEventListener('click', function () {
        track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: scrollBehavior() });
      });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function setActive(index) {
      dots.forEach(function (dot, i) {
        if (i === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    /* Aktívnu bodku počítame z pozície posunu.
       (IntersectionObserver sa tu nehodí: keď je carousel len čiastočne
       vidno zvislo, klesne pomer prieniku a bodka by preskakovala.) */
    function updateActive() {
      var step = slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 1;
      if (step <= 0) return;
      var index = Math.round(track.scrollLeft / step);
      setActive(Math.max(0, Math.min(slides.length - 1, index)));
    }

    track.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive, { passive: true });
    updateActive();
  }


  /* ======================================================================
     5. Sticky lišta dole (len mobil)

     Zobraz: až keď CTA v hero zmiznú z obrazovky.
     Skry: keď je na obrazovke formulár alebo záverečná výzva – inak by lišta
           zakrývala tlačidlo Odoslať.
     ====================================================================== */

  function initStickyBar() {
    var bar = document.querySelector('[data-sticky-bar]');
    var heroCta = document.querySelector('.hero__cta');
    if (!bar || !heroCta || !('IntersectionObserver' in window)) return;

    var heroCtaVisible = true;
    var blockersVisible = 0;

    function update() {
      bar.classList.toggle('is-visible', !heroCtaVisible && blockersVisible === 0);
    }

    new IntersectionObserver(function (entries) {
      heroCtaVisible = entries[0].isIntersecting;
      update();
    }, { threshold: 0 }).observe(heroCta);

    var blockers = ['formular', 'zaver']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    if (blockers.length) {
      var seen = [];
      var blockerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var i = seen.indexOf(entry.target);
          if (entry.isIntersecting && i === -1) seen.push(entry.target);
          if (!entry.isIntersecting && i !== -1) seen.splice(i, 1);
        });
        blockersVisible = seen.length;
        update();
      }, { threshold: 0 });

      blockers.forEach(function (el) { blockerObserver.observe(el); });
    }

    update();
  }


  /* ======================================================================
     6. Tlačidlá „Poradiť s výberom" / „Chcem poradiť" → scroll na formulár

     Po dojazde presunieme focus na prvé pole. preventScroll zabráni tomu,
     aby prehliadač po focuse stránkou ešte raz poskočil.
     ====================================================================== */

  function initFormScroll() {
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-scroll-form]');
      if (!trigger) return;

      var form = document.getElementById('formular');
      var firstField = document.getElementById('f-name');
      if (!form) return;

      event.preventDefault();
      form.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });

      window.setTimeout(function () {
        if (firstField) firstField.focus({ preventScroll: true });
      }, reduceMotion() ? 0 : 600);
    });
  }


  /* ======================================================================
     7. Jemné odkrývanie sekcií (fade-up 12 px)

     Triedu pridáva JavaScript, takže bez JS ostane obsah viditeľný.
     Pri prefers-reduced-motion sa animácia vôbec nezapne.
     ====================================================================== */

  function initReveal() {
    if (reduceMotion() || !('IntersectionObserver' in window)) return;

    var targets = all('.section-head, .step, .card-infusion, .card-review, .card-usp, .choose-banner, .faq-item');
    if (!targets.length) return;

    targets.forEach(function (el) { el.classList.add('fade-up'); });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }


  /* ======================================================================
     Štart
     ====================================================================== */

  applyConfig();
  initVariant();
  initHeaderShadow();
  initCarousel('infuzie');
  initCarousel('recenzie');
  initStickyBar();
  initFormScroll();
  initReveal();

  if (CONFIG.debug) {
    console.log('[RC] variant:', currentVariant);
  }
})();
