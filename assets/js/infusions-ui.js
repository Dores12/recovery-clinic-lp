/* ==========================================================================
   Recovery Clinic LP – vykreslenie ponuky infúzií
   --------------------------------------------------------------------------
   Z dát v assets/js/infusions.js vykreslí:
   - 4 hlavné karty hore (na mobile carousel, na desktope mriežka)
   - rozbaliteľný zoznam všetkých infúzií s filtrami podľa kategórie

   Načítava sa PRED app.js, aby app.js našiel karty už hotové a vedel
   na ne napojiť bodky carouselu.

   Tlačidlo „Mám záujem" obsluhuje form.js – prenáša výber do formulára.
   ========================================================================== */

(function () {
  'use strict';

  var DATA = window.RC_INFUSIONS;
  if (!DATA || !DATA.zoznam) return;

  var zoznam = DATA.zoznam;
  var FILTER_VSETKY = 'Všetky';
  var aktivnyFilter = FILTER_VSETKY;


  /* ======================================================================
     Pomocníci
     ====================================================================== */

  /** Text z dátového súboru vkladáme cez innerHTML, preto ho ošetríme. */
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ----- Ceny po zľave ----------------------------------------------------
     Počítajú sa z discount.percent v config.js, nikdy sa nepíšu do dát.
     Vďaka tomu zmena zľavy prepočíta všetky ceny naraz. */

  var PERCENTO = ((window.RC_CONFIG || {}).discount || {}).percent || 0;

  /** '159 €' → 159 */
  function cenaCislo(text) {
    var cislo = parseFloat(String(text).replace(/[^\d.,]/g, '').replace(',', '.'));
    return isNaN(cislo) ? null : cislo;
  }

  /** 127.2 → '127,20 €' */
  function formatCeny(cislo) {
    return cislo.toFixed(2).replace('.', ',') + ' €';
  }

  /** Platí na túto infúziu zľava? Predvolene áno. */
  function maZlavu(infuzia) {
    return infuzia.zlavaPlati !== false && PERCENTO > 0;
  }

  /** Cena po zľave ako text, alebo null keď sa zľava neuplatní. */
  function cenaSoZlavou(infuzia) {
    if (!maZlavu(infuzia)) return null;
    var zaklad = cenaCislo(infuzia.cena);
    return zaklad === null ? null : formatCeny(zaklad * (1 - PERCENTO / 100));
  }

  /** Koľko na tejto infúzii ušetríte, v eurách. */
  function usporaCislo(infuzia) {
    if (!maZlavu(infuzia)) return null;
    var zaklad = cenaCislo(infuzia.cena);
    return zaklad === null ? null : zaklad * (PERCENTO / 100);
  }


  function sipka() {
    return '<svg class="ico" aria-hidden="true"><use href="#i-arrow-right"/></svg>';
  }

  /** Odkaz na kartách aj v zozname. Pripomína benefit, nie len akciu. */
  function odkazZaujem(infuzia, kratky) {
    return '<a class="link-arrow" href="#formular" data-interest data-item="'
      + escapeHtml(infuzia.nazov) + '">'
      + (kratky ? 'Chcem so zľavou ' : 'Chcem túto so zľavou ') + sipka() + '</a>';
  }


  /* ======================================================================
     1. Štyri hlavné karty
     ====================================================================== */

  function vykresliKarty() {
    var obal = document.querySelector('[data-main-cards]');
    if (!obal) return;

    var hlavne = zoznam
      .filter(function (i) { return i.hlavna; })
      .sort(function (a, b) { return a.hlavna - b.hlavna; });

    obal.innerHTML = hlavne.map(function (infuzia) {
      var objem = escapeHtml(infuzia.objem);
      if (infuzia.cenaPovodna) {
        objem += ' · bežne <s>' + escapeHtml(infuzia.cenaPovodna) + '</s>';
      }

      var zlavnena = cenaSoZlavou(infuzia);
      var cenaBlok = zlavnena
        ? '<span class="price price--discounted">'
          +   '<s>' + escapeHtml(infuzia.cena) + '</s>'
          +   '<b>' + zlavnena + '</b>'
          + '</span>'
        : '<span class="price">' + escapeHtml(infuzia.cena) + '</span>';

      var poznamka = zlavnena
        ? '<p class="card-infusion__note">so zľavou ' + PERCENTO + ' % na prvú infúziu</p>'
        : '';

      /* Najobľúbenejšia infúzia je zároveň najlacnejšia – pre nerozhodnutých
         je to bezpečná voľba a nízka bariéra prvej návštevy. */
      var odznak = infuzia.popular
        ? '<span class="card-infusion__badge">Najobľúbenejšia</span>'
        : '';
      var prvykrat = infuzia.popular && zlavnena
        ? '<p class="card-infusion__first">Prvýkrát? So zľavou len za ' + zlavnena + '.</p>'
        : '';

      var preKoho = infuzia.preKoho
        ? '<p class="card-infusion__for"><b>Pre koho:</b> ' + escapeHtml(infuzia.preKoho) + '</p>'
        : '';

      return ''
        + '<article class="card-infusion' + (infuzia.popular ? ' card-infusion--popular' : '') + '">'
        +   odznak
        +   '<div class="card-infusion__top">'
        +     '<span class="tag">' + escapeHtml(infuzia.kategoria) + '</span>'
        +     '<svg class="ico card-infusion__drop" aria-hidden="true"><use href="#i-droplet"/></svg>'
        +   '</div>'
        +   '<h3 class="card-infusion__name">' + escapeHtml(infuzia.nazov) + '</h3>'
        +   '<p class="body-s muted card-infusion__volume">' + objem + '</p>'
        +   '<p class="body-s card-infusion__desc">' + escapeHtml(infuzia.popis) + '</p>'
        +   preKoho
        +   prvykrat
        +   '<div class="card-infusion__foot">'
        +     '<span>' + cenaBlok + poznamka + '</span>'
        +     odkazZaujem(infuzia)
        +   '</div>'
        + '</article>';
    }).join('');
  }


  /* ======================================================================
     2. Filtre
     ====================================================================== */

  function vykresliFiltre() {
    var obal = document.querySelector('[data-filters]');
    if (!obal) return;

    var kategorie = [FILTER_VSETKY].concat(DATA.kategorie || []);

    obal.innerHTML = kategorie.map(function (kategoria) {
      var aktivna = kategoria === aktivnyFilter;
      return '<button type="button" aria-pressed="' + (aktivna ? 'true' : 'false')
        + '" data-filter="' + escapeHtml(kategoria) + '">' + escapeHtml(kategoria) + '</button>';
    }).join('');

    Array.prototype.forEach.call(obal.querySelectorAll('[data-filter]'), function (tlacidlo) {
      tlacidlo.addEventListener('click', function () {
        aktivnyFilter = tlacidlo.getAttribute('data-filter');
        vykresliFiltre();
        vykresliZoznam();
      });
    });

    posunNaAktivnyFilter(obal);
  }


  /* Pás filtrov sa na mobile posúva do strany. Keď filter zapne odkaz
     zo sekcie „Čo je IV terapia", aktívny čip býva mimo obrazovky –
     doposunieme ho, nech je vidieť, podľa čoho je zoznam zúžený. */
  function posunNaAktivnyFilter(obal) {
    var aktivny = obal.querySelector('[aria-pressed="true"]');
    if (!aktivny || obal.scrollWidth <= obal.clientWidth) return;

    var ciel = aktivny.offsetLeft - (obal.clientWidth - aktivny.offsetWidth) / 2;
    obal.scrollLeft = Math.max(0, ciel);
  }


  /* ======================================================================
     3. Zoznam všetkých infúzií
     ====================================================================== */

  function vykresliZoznam() {
    var obal = document.querySelector('[data-infusion-list]');
    if (!obal) return;

    var vybrane = aktivnyFilter === FILTER_VSETKY
      ? zoznam
      : zoznam.filter(function (i) { return i.kategoria === aktivnyFilter; });

    obal.innerHTML = vybrane.map(function (infuzia) {
      var zlavnena = cenaSoZlavou(infuzia);
      var cena;
      if (zlavnena) {
        cena = '<span class="infusion-row__price">' + zlavnena
          + '<s>' + escapeHtml(infuzia.cena) + '</s></span>';
      } else {
        cena = '<span class="infusion-row__price">' + escapeHtml(infuzia.cena);
        if (infuzia.cenaPovodna) cena += '<s>bežne ' + escapeHtml(infuzia.cenaPovodna) + '</s>';
        cena += '</span>';
      }

      return ''
        + '<div class="infusion-row">'
        +   '<div class="infusion-row__main">'
        +     '<div class="infusion-row__head">'
        +       '<h4>' + escapeHtml(infuzia.nazov) + '</h4>'
        +       '<span class="infusion-row__volume">' + escapeHtml(infuzia.objem) + '</span>'
        +     '</div>'
        +     '<p class="infusion-row__desc">' + escapeHtml(infuzia.popis) + '</p>'
        +   '</div>'
        +   '<div class="infusion-row__side">' + cena + odkazZaujem(infuzia, true) + '</div>'
        + '</div>';
    }).join('');
  }


  /* ======================================================================
     4. Rozbalenie a zbalenie ponuky
     ====================================================================== */

  /** Otvorí alebo zatvorí panel s celou ponukou. */
  function prepniPanel(otvorit) {
    var tlacidlo = document.querySelector('[data-infusions-toggle]');
    var panel = document.getElementById('vsetky-infuzie');
    var popis = document.querySelector('[data-infusions-toggle-label]');
    if (!tlacidlo || !panel || !popis) return;

    tlacidlo.setAttribute('aria-expanded', otvorit ? 'true' : 'false');
    panel.hidden = !otvorit;
    popis.textContent = otvorit
      ? 'Skryť ponuku'
      : 'Zobraziť všetky infúzie (' + zoznam.length + ')';
  }

  function initRozbalenie() {
    var tlacidlo = document.querySelector('[data-infusions-toggle]');
    if (!tlacidlo) return;

    prepniPanel(false);   // nastaví aj text tlačidla podľa počtu infúzií

    tlacidlo.addEventListener('click', function () {
      var otvorene = tlacidlo.getAttribute('aria-expanded') === 'true';
      prepniPanel(!otvorene);

      if (!otvorene) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'infusions_expand', lead_source: 'lp' });
      }
    });
  }


  /* ======================================================================
     5. Odkazy zo sekcie „Čo je IV terapia"

     Riadok kategórie otvorí ponuku, zapne príslušný filter a posunie
     na sekciu infúzií – človek rovno vidí, čo do tej kategórie patrí.
     ====================================================================== */

  function initOdkazyKategorii() {
    document.addEventListener('click', function (event) {
      var odkaz = event.target.closest('[data-category]');
      if (!odkaz) return;

      var kategoria = odkaz.getAttribute('data-category');
      if ((DATA.kategorie || []).indexOf(kategoria) === -1) return;

      event.preventDefault();

      aktivnyFilter = kategoria;
      prepniPanel(true);
      vykresliFiltre();
      vykresliZoznam();

      var sekcia = document.getElementById('infuzie');
      if (sekcia) {
        var plynule = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        sekcia.scrollIntoView({ behavior: plynule ? 'smooth' : 'auto', block: 'start' });
      }
    });
  }


  /* ======================================================================
     Štart
     ====================================================================== */

  /**
   * Doplní do hero najnižšiu cenu po zľave a rozpätie úspory.
   * Počíta sa z dát, nie natvrdo – po zmene cien sedí bez zásahu.
   */
  function dopInoCenyVHero() {
    var usspory = zoznam.map(usporaCislo).filter(function (u) { return u !== null; });
    var zlavnene = zoznam.map(function (i) {
      var z = cenaSoZlavou(i);
      return z === null ? null : cenaCislo(i.cena) * (1 - PERCENTO / 100);
    }).filter(function (c) { return c !== null; });

    if (zlavnene.length) {
      var najnizsia = formatCeny(Math.min.apply(null, zlavnene));
      Array.prototype.forEach.call(document.querySelectorAll('[data-min-discounted]'),
        function (el) { el.textContent = najnizsia; });
    }
    if (usspory.length) {
      var rozpatie = formatCeny(Math.min.apply(null, usspory)).replace(' €', '')
        + ' – ' + formatCeny(Math.max.apply(null, usspory));
      Array.prototype.forEach.call(document.querySelectorAll('[data-savings-range]'),
        function (el) { el.textContent = rozpatie; });
    }
  }

  vykresliKarty();
  dopInoCenyVHero();
  vykresliFiltre();
  vykresliZoznam();
  initRozbalenie();
  initOdkazyKategorii();
})();
