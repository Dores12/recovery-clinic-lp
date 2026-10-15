/* ==========================================================================
   Recovery Clinic LP – ponuka infúzií
   --------------------------------------------------------------------------
   JEDINÝ ZDROJ cien a textov infúzií. Z tohto súboru sa vykreslia
   aj 4 hlavné karty, aj celý rozbaliteľný zoznam – nikde inde
   názvy ani ceny neprepisuj.

   Ako pridať infúziu: dopíš objekt do poľa nižšie. Poradie v poli určuje
   poradie v zozname. `hlavna: 1–4` znamená, že sa infúzia zobrazí aj hore
   medzi štyrmi kartami (číslo určuje poradie).

   POZOR – na tejto stránke beží Meta pixel, ktorý NIE JE v zdravotnej
   kategórii. Nepíš sem preto názvy ani popisy zdravotných ťažkostí
   a diagnóz; Meta by podľa nich mohla účet preklasifikovať. Klinika
   takéto infúzie ponúka, ale odporučí ich zdravotník pri konzultácii.
   Zoznam konkrétnych zakázaných výrazov je v docs/qa-checklist.md
   (tá sa na web nenahráva).

   TODO: overiť ceny v Apponiu (hlavne Double glutation).
   ========================================================================== */

window.RC_INFUSIONS = {

  /* Kategória → ktorý chip vo formulári sa predvyberie pri „Mám záujem".
     Prázdna hodnota = nepredvyberie sa nič. */
  chipPodlaKategorie: {
    'Imunita': 'imunita',
    'Energia': 'unava',
    'Beauty': 'beauty',
    'Šport': 'sport',
    'Po oslave': ''
  },

  /* Poradie filtrov nad zoznamom */
  kategorie: ['Imunita', 'Energia', 'Beauty', 'Šport', 'Po oslave'],

  zoznam: [
    {
      nazov: 'Imunity Booster',
      kategoria: 'Imunita',
      objem: '500 ml',
      popis: 'Vitamín C, glutatión a vitamíny skupiny B na podporu obranyschopnosti a regenerácie.',
      cena: '159 €',
      hlavna: 1
    },
    {
      nazov: 'Virus Killer',
      kategoria: 'Imunita',
      objem: '500 ml',
      popis: 'Vitamín C, vitamíny skupiny B a vápnik pre silnú imunitu a hydratáciu.',
      cena: '99 €',
      hlavna: 2
    },
    {
      nazov: 'Vitamín C Max',
      kategoria: 'Imunita',
      objem: '500 ml',
      popis: 'Vysoká dávka vitamínu C na podporu imunity a dodanie energie.',
      cena: '59 €'
    },
    {
      nazov: 'Life Elixir',
      kategoria: 'Energia',
      objem: '500 ml',
      popis: 'Vylepšený Myers koktejl: vitamín C, vitamíny B, A, D, E, K a minerály pre energiu a regeneráciu.',
      cena: '129 €'
    },
    {
      nazov: 'Multivitamín',
      kategoria: 'Energia',
      objem: '600 ml',
      popis: 'Vitamíny skupiny B, A, D, E, K a esenciálne tuky pre energiu a vitalitu.',
      cena: '199 €'
    },
    {
      nazov: 'Detox',
      kategoria: 'Energia',
      objem: '600 ml',
      popis: 'Glutatión, vitamín C a vitamíny A, D, E, K na podporu prirodzenej očisty organizmu.',
      cena: '199 €'
    },
    {
      nazov: 'Glutation',
      kategoria: 'Beauty',
      objem: '250 ml',
      popis: 'Antioxidant glutatión s vitamínom C pre vitalitu a zdravý vzhľad pleti.',
      cena: '139 €',
      cenaPovodna: '179 €',
      hlavna: 3
    },
    {
      nazov: 'Double glutation',
      kategoria: 'Beauty',
      objem: '500 ml',
      popis: 'Vyššia dávka glutatiónu s vitamínom C pre vitalitu a pleť.',
      cena: '179 €'
    },
    {
      nazov: 'Glow Up',
      kategoria: 'Beauty',
      objem: '750 ml',
      popis: 'Vitamín C a komplex vitamínov B vrátane biotínu pre žiarivú pleť a energiu.',
      cena: '99 €'
    },
    {
      nazov: 'Sport Recovery',
      kategoria: 'Šport',
      objem: '500 ml',
      popis: 'Horčík, minerály a hydratácia pre rýchlejšiu regeneráciu po výkone.',
      cena: '89 €',
      hlavna: 4
    },
    {
      nazov: 'Sport Recovery Max',
      kategoria: 'Šport',
      objem: '750 ml',
      popis: 'Vyššia dávka vitamínov, minerálov a elektrolytov po náročnom tréningu.',
      cena: '119 €'
    },
    {
      nazov: 'Hangover',
      kategoria: 'Po oslave',
      objem: '500 ml',
      popis: 'Tekutiny a vysoká dávka vitamínu C, keď sa po oslave potrebujete rýchlo postaviť na nohy.',
      cena: '79 €'
    }
  ]
};
