# Recovery Clinic LP: úpravy pre vyšší konverzný pomer

**Verzia 2.** Zapracované sú rozhodnutia klienta zo 16. 10. 2026.

**Stránka:** https://recoverybratislava.netlify.app/ (audit live verzie z 15. 10. 2026)

**Cieľ:** viac odoslaných formulárov a z nich viac rezervácií. Lead, ktorý si nerezervuje termín, nemá pre kliniku hodnotu.

**Postup:**
1. Daniel doplní otvorené údaje v [ZÁTVORKÁCH] (sekcia 16).
2. Zmeny zapracuje Claude Code podľa promptu v sekcii 17.

**Legenda**
- **[HRANATÉ ZÁTVORKY]** = údaj, ktorý ešte musí potvrdiť klinika. Kým ho nepotvrdí, prvok sa na webe nezobrazí. Vymyslené čísla na web nepatria.
- **⚠ Meta** = slovo alebo téma, ktorá môže zvýšiť riziko, že Meta zaradí pixel do zdravotnej kategórie.
- Dopad (vysoký / stredný / nízky) je môj odhad z praxe, nie nameraný údaj.

---

## 0. Zhrnutie

Základ stránky je dobrý. Ponuka je hneď hore, formulár je krátky, platí sa až na mieste a fotka kresla je reálna. Najväčšie rezervy sú v troch veciach:

1. **Ponuka je abstraktná.** „20 %“ si človek musí prepočítať sám. „Imunity Booster za 127,20 € namiesto 159 €“ je cena, ktorú si vie hneď predstaviť.
2. **Dôvera stojí na tvrdeniach, nie na dôkazoch.** „Overené recenzie“ je len slovo. Hodnotenie na Google s počtom recenzií a podpísané citácie sú dôkaz. Pri službe, kde vám niekto zavádza kanylu do žily, je dôvera najväčšia bariéra.
3. **Stránka si protirečí.**
   - Badge sľubuje zľavu „pre každého nového klienta“, hoci podľa klienta platí len po vyplnení formulára.
   - Krok 1 v časti „Ako to prebieha“ sľubuje, že si „rovno rezervujete online“, hoci rezervácia sa ukáže až po formulári.
   - Na stránke je rozbor krvi, o ktorom nie je isté, že ho klinika ponúka.

### Top 10 zmien podľa dopadu

| # | Zmena | Prečo | Dopad | Náročnosť |
|---|---|---|---|---|
| 1 | Zjednotiť texty o zľave: platí len po vyplnení formulára (badge, FAQ, `config.js`) | Rozpor oslabuje dôveru a berie dôvod vyplniť formulár | vysoký | minimálna |
| 2 | Ceny po zľave na kartách infúzií a v hero („so zľavou od 47,20 €“) | Konkrétna úspora v eurách predáva viac ako percento | vysoký | malá (JS) |
| 3 | Hodnotenie z Google, počet recenzií a podpísané citácie | Pri zdravotnej službe je dôvera hlavná brzda | vysoký | dodať údaje |
| 4 | Formulár: pomocné texty pri poliach a informačná veta namiesto povinného checkboxu | Menej obáv, menej krokov | vysoký | malá |
| 5 | Stav po odoslaní: presný ďalší krok (rovnaký e-mail v Apponiu, uložiť si naše číslo) | Tu sa lead mení na rezerváciu a tu sa stráca najviac ľudí | vysoký (na rezervácie) | malá |
| 6 | Vitamín C Max (najobľúbenejšia infúzia) medzi hlavné karty ako vstupná ponuka | Najlacnejšia a najpredávanejšia infúzia znižuje bariéru prvej návštevy | stredný | minimálna |
| 7 | „Otvorené aj cez víkend“ do hero a trust stripu | Silný praktický argument, ktorý dnes stránka nespomína | stredný | minimálna |
| 8 | Sticky CTA lišta na mobile a jeden text CTA na celej stránke | CTA je stále na dosah a pôsobí ako jedna akcia | stredný | malá |
| 9 | Preusporiadať FAQ a doplniť chýbajúce námietky | FAQ čítajú ľudia tesne pred rozhodnutím | stredný | malá |
| 10 | Odstrániť „bolí“ a „riešiť“ (⚠ Meta), rozbor krvi a opraviť honeypot „Firma“ | Riziko klasifikácie, nepotvrdený sľub a tichá strata leadov | stredný | malá |

---

## 1. Rozhodnutia klienta (16. 10. 2026)

| Téma | Rozhodnutie | Čo to znamená pre web |
|---|---|---|
| Zľava 20 % | len po vyplnení formulára | Nikde „pre každého nového klienta“. Opraviť `discount.terms` aj komentár v `config.js`. |
| Rozsah zľavy | všetky infúzie | Cena po zľave na každej karte. Úspora 11,80 – 39,80 € podľa infúzie. |
| Lehota | žiadna | O lehote sa nikde nepíše. |
| Darčekové poukážky | zľava neplatí | Uviesť vo FAQ. |
| Lekár | bez mena, nikde | Všade len „pod dohľadom lekára“. |
| Spätný hovor | bez sľubu času | Nikde „zavoláme do X hodín“. |
| E-mail so zľavou | Make kontroluje Sheet každé 2 hodiny | Stránka sľubuje e-mail „do 2 hodín“, nie skôr. |
| Rozbor krvi | nie je isté, či sa ponúka | Zo stránky odstrániť (krok 2 aj lounge), kým klinika nepotvrdí. |
| Najobľúbenejšia infúzia | Vitamín C (Max) | Odznak „Najobľúbenejšia“ a presun medzi 4 hlavné karty. |
| Checkbox súhlasu | nahradiť informačnou vetou | Sekcia 4.5. |
| FAQ | bez otázok o príprave a parkovaní, návšteva vo dvojici áno | Sekcia 10. |
| H1 challenger | ísť do testu | Fáza 2, test č. 1 (sekcia 15). |

~~**Otvorené:** Sčítava sa 20 % s akciovou cenou Glutationu?~~ **Vyriešené 16. 10. 2026:** 139 € je bežná cena, žiadna akcia neprebieha. Zľava 20 % na Glutation platí, karta ukazuje 111,20 €.

> **Prečo je pravidlo „len cez formulár“ dobré pre konverziu:** formulár sa stáva jediným spôsobom, ako zľavu získať. To je najsilnejší motivátor na jeho vyplnenie. Zároveň Meta uvidí Lead pri každom, kto o zľavu stojí, a kampane sa učia na správnom signáli.
> **Over mimo LP:** WP web ani Apponio nesmú sľubovať 20 % všetkým novým klientom. Inak si ponuka bude protirečiť naprieč webmi.

---

## 2. Hero

### 2.1 Eyebrow
**Aktuálne:** „IV terapia · Bratislava, Prievozská 4/A“. Vo výstupe stránky sa text opakuje dvakrát, viac v sekcii 14.
**Nové:** „Vitamínové infúzie · Prievozská 4/A, Bratislava“
**Prečo:** „IV terapia“ je odborný pojem, ktorý studený traffic z Mety nemusí poznať. „Vitamínové infúzie“ povie hneď, čo to je.

### 2.2 H1 (variant a, predvolený)
**Kontrola (ostáva na webe):** „Dobite si **imunitu aj energiu** – pohodlne v kresle, pod dohľadom lekára“
**Challenger do testu (fáza 2):** „Vitamínová infúzia na podporu **imunity a energie** – prvá o 20 % lacnejšie“
**Prečo test:**
- Kontrola dobre spája výsledok, pohodlie a bezpečnosť, ale nehovorí, čo si človek kupuje, a nemá v sebe ponuku.
- Challenger stavia na zhode s reklamou (message match): kto klikol na „−20 %“, vidí to v prvej vete.

### 2.3 Podnadpis
**Aktuálne:** „Vitamínové IV infúzie v Bratislave. Nechajte nám kontakt a na prvú infúziu dostanete zľavu 20 % – termín si vyberiete online, alebo vám zavoláme a poradíme.“
**Nové:** „Vitamíny a minerály priamo do krvi, kým oddychujete v masážnom kresle pri Netflixe. Nechajte kontakt a ako nový klient získate na prvú infúziu zľavu 20 % – termín si vyberiete hneď online, alebo vám zavoláme.“
**Prečo:**
- Aktuálny podnadpis opakuje H1 a badge a popisuje proces. Nový dopĺňa, ako infúzia vyzerá: kreslo a Netflix sú to, čím sa líšite od „ambulancie s kvapkou“.
- Sloveso „získate“ hneď za „Nechajte kontakt“ drží pravidlo, že zľava je až po vyplnení formulára.

### 2.4 Badge
**Aktuálne:** „−20 % na prvú infúziu · pre každého nového klienta“
**Nové** (dva riadky):
- „−20 % na prvú infúziu“
- „ušetríte 11,80 – 39,80 € podľa infúzie“

**Prečo:**
- Suma v eurách je hmatateľnejšia ako percento.
- Rozpätie s dovetkom „podľa infúzie“ zabráni tomu, aby niekto čakal úsporu 39,80 € pri infúzii za 59 €.
- Zmizne „pre každého nového klienta“, čo bol rozpor s pravidlom zľavy.

### 2.5 Odrážky
**Aktuálne:**
- Školený zdravotnícky personál
- Masážne kreslo, Netflix a občerstvenie počas infúzie
- Infúzie od 59 € · platíte až na prevádzke

**Nové:**
- Infúziu podáva zdravotník pod dohľadom lekára
- So zľavou od 47,20 € · platíte až na mieste, nič vopred
- Masážne kreslo, Netflix a občerstvenie [v cene]
- Otvorené aj cez víkend · parkovanie pre klientov

**Prečo:**
- Cena po zľave hneď na začiatku ukotví očakávanie nízko. 47,20 € je cena Vitamínu C Max po zľave.
- „V cene“ odpovedá na nevyslovenú otázku „platím za to navyše?“. Kým to klinika nepotvrdí, ostáva pôvodné „počas infúzie“.
- Víkend: podľa `config.js` je otvorené So–Ne 9:00–15:00. Pre ľudí, ktorí pracujú cez týždeň, je to rozhodujúci argument.

### 2.6 Tlačidlá
**Aktuálne:** „Získať zľavu 20 %“, „Získať zľavu 20 % a termín“, „Pozrieť ponuku infúzií“, „alebo zavolajte“
**Nové:**
- primárne: **„Chcem zľavu 20 %“** (rovnaký text všade na stránke vrátane hlavičky)
- sekundárne: **„Pozrieť infúzie a ceny“**
- pod nimi: „alebo zavolajte +421 948 375 871 · Po–Pi 10–18, So–Ne 9–15“

**Prečo:**
- Jedna akcia má mať jeden text.
- Tlačidlo v prvej osobe („Chcem…“) dopovedá vetu za návštevníka.
- „Ceny“ je silný magnet na klik.
- Hodiny pri telefóne znižujú obavu, že to nikto nezdvihne.

### 2.7 Varianty `?v=` (zhoda s reklamami)
`config.js` podporuje vlastný podnadpis (`sub`) pre každý variant. H1 všetkých variantov ostáva.

| v | Nový `sub` |
|---|---|
| a | text z 2.3 |
| b | „Vitamíny skupiny B, C a minerály v infúzii, kým oddychujete v masážnom kresle. Nechajte kontakt a prvú infúziu máte o 20 % lacnejšie.“ |
| c | „Sport Recovery za 71,20 € namiesto 89 € – so zľavou 20 % po vyplnení formulára. Horčík, minerály a hydratácia v masážnom kresle, otvorené aj cez víkend.“ |
| d | „Glutation teraz za 139 € namiesto 179 €. Chvíľa len pre vás v masážnom kresle.“ [Ak sa zľavy sčítavajú, doplniť cenu po ďalších 20 %.] |

> **Pozor pri textoch reklám:** Meta zakazuje v reklame tvrdiť alebo naznačovať niečo o stave konkrétneho človeka (pravidlo o osobných atribútoch). „Ráno bez energie?“ je na LP v poriadku, ale do reklamy ju neprenášaj. V reklame píš bez „vy/ste“, napr. „Vitamíny a minerály v infúzii – prvá o 20 % lacnejšie“.

---

## 3. Trust strip

**Aktuálne:** dva pásy, pod hero a pod formulárom, s takmer rovnakým obsahom.

**Nové: horný pás (dôkazy):**
- ★ [4,9] na Google · [NNN] recenzií
- Pod lekárskym dohľadom
- [NNNN+ podaných infúzií] alebo [Od roku RRRR] (voliteľné, ak to klinika chce zverejniť)
- Otvorené aj cez víkend

**Nové: dolný pás pri formulári (odstránenie rizika):**
- Platíte až na mieste, nič vopred
- [Termín zmeníte jedným telefonátom] (podľa storno podmienok)
- Poradenstvo so zdravotníkom zdarma
- Parkovanie pre klientov

**Prečo:**
- Horný pás má presvedčiť, že ide o profesionálov. Dolný pás stojí pri formulári a má odstrániť posledné „čo ak“.
- „Overené recenzie“ nahradiť formuláciou „Recenzie z Google“ s odkazom. EÚ smernica Omnibus vyžaduje pri tvrdení o overených recenziách vysvetliť, ako sa overujú. Odkaz na Google je jednoduchší a dôveryhodnejší.
- Ak je hodnotenie pod 4,5 alebo recenzií je menej ako približne 20, číslo nedávať, nechať len citácie.

---

## 4. Formulár

### 4.1 Nadpis a úvod
- **Badge:** „Zaberie to 30 sekúnd“
- **H2:** **„Zľava 20 % na prvú infúziu – stačí meno a kontakt“**
- **Namiesto úvodných viet tri mini kroky:**
  1. Vyplníte meno a kontakt.
  2. Zľavu vám zapíšeme na meno a pošleme potvrdenie e-mailom.
  3. Termín si vyberiete hneď online, alebo vám zavoláme a poradíme s výberom.

**Prečo:** Najväčšia brzda formulára je neistota, čo bude nasledovať. Keď človek vidí celý postup, vypĺňa ľahšie. „30 sekúnd“ je pravda: tri polia a jedna voľba.

### 4.2 Polia a pomocné texty
| Pole | Placeholder | Pomocný text pod poľom |
|---|---|---|
| Meno a priezvisko * | Jana Nováková | – |
| Telefón * | +421 9xx xxx xxx | „Len kvôli termínu. Nevoláme s ponukami.“ |
| E-mail * | jana@email.sk | „Sem vám pošleme potvrdenie zľavy.“ |

Keď je vybraté „Vyberiem si termín online“, pod e-mail pridať: **„Pri rezervácii použite rovnaký e-mail – podľa neho vám zľavu odrátame.“**

**Prečo:**
- Ľudia neradi dávajú telefón, lebo čakajú otravné hovory. Jedna veta to zmierni.
- Rovnaký e-mail v Apponiu je kľúčový pre recepciu (párovanie a zľava) aj pre meranie (status CONVERTED v Sheete).

### 4.3 „Ako chcete pokračovať?“
- **„Vyberiem si termín online“**, pod tým drobne: „voľné termíny uvidíte hneď po odoslaní“
- **„Zavolajte mi“**, pod tým drobne: „poradíme s výberom infúzie“

**Prečo:** Každá možnosť má povedať, čo človek dostane. Hodnoty rádií (`online`/`call`) sa nemenia, mení sa iba text. Čas hovoru sa nesľubuje.

### 4.4 Chipy záujmu
**Aktuálne:** „Čo chcete riešiť? (nepovinné)“ · Imunita / Únava a energia / Regenerácia po športe / Pleť a detox / Neviem, poraďte
**Nové:** **„Čo vás zaujíma? (nepovinné)“** · Imunita / Energia / Regenerácia po športe / Pleť a detox / Neviem, poraďte
**Prečo:**
- „Riešiť“ a „únava“ znejú ako problém alebo ťažkosť (⚠ Meta). „Zaujíma“ a „energia“ sú pozitívne.
- Hodnoty chipov (`imunita`, `unava`…) ostávajú, mení sa iba text.

### 4.5 Súhlas so spracovaním údajov (schválené)
**Aktuálne:** povinný checkbox „Súhlasím so spracovaním osobných údajov na účel spätného kontaktu. *“
**Nové:** checkbox odstrániť. Pod tlačidlo dať informačnú vetu (4.6) s odkazom na podmienky spracovania.
**Prečo:**
- Keď človek sám požiada o kontakt, údaje sa zvyčajne spracúvajú na základe predzmluvných vzťahov (čl. 6 ods. 1 písm. b GDPR), nie súhlasu.
- Povinný checkbox je krok navyše, ktorý ľudia na mobile prehliadnu a formulár im „nejde odoslať“.

### 4.6 Tlačidlo a text pod ním
**Dynamický text tlačidla:**
- nič nevybraté: „Chcem zľavu 20 %“
- online: „Chcem zľavu a vybrať termín →“
- call: „Chcem zľavu a zavolajte mi →“

**Pod tlačidlom:** „Nič neplatíte vopred. Údaje použijeme len na vybavenie zľavy a termínu. Viac o ochrane údajov“ (odkaz na `privacyUrl`). K tomu jedna krátka recenzia, napr. Zuzana K.: „Profesionálne, milé a ľudské.“

**Prečo:**
- Tlačidlo hovorí, čo sa stane po kliknutí.
- Text pod ním odpovedá na poslednú obavu (peniaze, údaje).
- Recenzia je sociálny dôkaz presne v momente rozhodovania.

---

## 5. Stav po odoslaní: tu sa lead mení na rezerváciu

### 5.1 Ak si človek vybral „online“
- **Nadpis:** „Hotovo, {meno}! Zľava 20 % je zapísaná na vaše meno.“
- **Text:** „Teraz si vyberte termín. Pri rezervácii zadajte rovnaký e-mail ({email}) – podľa neho vám zľavu odrátame pri platbe.“
- **Tlačidlo:** „Vybrať termín online →“
- **Pod ním:** „Potvrdenie zľavy vám príde e-mailom do 2 hodín. Radšej telefonicky? Zavolajte +421 948 375 871.“

### 5.2 Ak si človek vybral „zavolajte mi“
- **Nadpis:** „Ďakujeme, {meno}! Zľava 20 % je zapísaná na vaše meno.“
- **Text:** „Ozveme sa vám z čísla **+421 948 375 871**. Uložte si ho, aby ste hovor nezmeškali.“
- **Sekundárny odkaz:** „Nechcete čakať? Vyberte si termín online →“
- **Pod ním:** „Potvrdenie zľavy vám príde e-mailom do 2 hodín. Otváracie hodiny: Po–Pi 10–18, So–Ne 9–15.“

**Prečo:**
1. Oslovenie menom a „je zapísaná na vaše meno“ vyvolávajú pocit, že zľavu už človek má. Prísť o niečo, čo už máme, bolí viac než to nezískať (efekt vlastníctva).
2. Zopakovaný e-mail pomôže zadať v Apponiu rovnaké údaje a človek si všimne prípadný preklep.
3. „Do 2 hodín“ zodpovedá intervalu, v ktorom Make kontroluje Sheet. Keby stránka sľúbila „práve sme vám poslali“, človek by si myslel, že je chyba. Text sa berie z `config.js`, takže pri zmene intervalu sa upraví na jednom mieste.
4. Ľudia často nezdvíhajú neznáme čísla, takže „Uložte si ho“ priamo zvyšuje šancu, že sa recepcia dovolá.
5. Netrpezliví sa vďaka online odkazu nestratia, kým čakajú na hovor.

> **Poznámka k e-mailu:**
> - Oneskorenie 2 hodiny nie je problém. Kto rezervuje hneď, e-mail nepotrebuje. Kto nerezervoval, dostane ho neskôr ako pripomienku.
> - Ak by si chcel e-mail okamžite, dá sa poslať priamo z Apps Scriptu cez MailApp, rovnako ako notifikácia recepcii. Limit pri bežnom Gmail účte je 100 príjemcov denne a Make by na to už nebol potrebný. Rozhoduje, z ktorého účtu by e-mail odchádzal.

> **Pre recepciu, nie pre web:** na stránke žiadny čas spätného hovoru nesľubujeme. Interne však platí, že čím skôr, tým lepšie. Štúdia HBR (2011) ukázala, že firmy, ktoré kontaktovali lead do hodiny, mali výrazne vyššiu šancu ho kvalifikovať.

---

## 6. Ako to prebieha

**H2:** „Od prvého kontaktu po relax v kresle“ ostáva.

**Krok 1, aktuálne:** „Vyplníte krátky formulár alebo si rovno rezervujete termín online. Zaberie to minútu.“
**Nové:** „Nechajte kontakt – zaberie to 30 sekúnd. Zľavu vám zapíšeme na meno a termín si vyberiete hneď online, alebo vám zavoláme.“
**Prečo:** Na tejto stránke sa nedá rezervovať „rovno“, rezervácia je až po formulári.

**Krok 2, aktuálne:** „Zdravotník sa opýta, čo riešite, a odporučí vhodnú infúziu. Na želanie aj rozbor krvi z kvapky – výsledok do 12 minút.“
**Nové:** „Zdravotník sa s vami krátko porozpráva a odporučí infúziu, ktorá sa vám hodí.“
**Prečo:** Vypadne „riešite“ (⚠ Meta) aj rozbor krvi, ktorý klinika nepotvrdila. Sľub, ktorý na prevádzke neplatí, je horší ako žiadny sľub.

**Krok 3, aktuálne:** „…Počítajte približne s hodinou a pol.“
**Nové:** „…Celá návšteva trvá približne hodinu a pol – väčšinu z toho len oddychujete.“
**Prečo:** Fakt sa nemení, len sa správne zarámuje.

---

## 7. Infúzie

### 7.1 Cena po zľave priamo na karte
**Aktuálne:** „159 €“
**Nové:** ~~159 €~~ **127,20 €** a pod tým drobne „so zľavou 20 % na prvú infúziu“

| Infúzia | Cena | So zľavou 20 % | Ušetríte |
|---|---|---|---|
| Vitamín C Max | 59 € | 47,20 € | 11,80 € |
| Hangover | 79 € | 63,20 € | 15,80 € |
| Sport Recovery | 89 € | 71,20 € | 17,80 € |
| Virus Killer | 99 € | 79,20 € | 19,80 € |
| Glow Up | 99 € | 79,20 € | 19,80 € |
| Sport Recovery Max | 119 € | 95,20 € | 23,80 € |
| Life Elixir | 129 € | 103,20 € | 25,80 € |
| Glutation | 139 € (bežne 179 €) | [111,20 € len ak sa zľavy sčítavajú] | [27,80 €] |
| Imunity Booster | 159 € | 127,20 € | 31,80 € |
| Double glutation | 179 € | 143,20 € | 35,80 € |
| Multivitamín | 199 € | 159,20 € | 39,80 € |
| Detox | 199 € | 159,20 € | 39,80 € |

**Prečo:** Človek nemusí počítať a vidí, koľko ušetrí. Ceny sa počítajú v JS z `discount.percent`, nie natvrdo, aby sa pri zmene zľavy zmenili všade.

### 7.2 Vitamín C Max: najobľúbenejšia a vstupná infúzia
**Nové poradie hlavných kariet (`hlavna`):**
1. **Vitamín C Max**, s odznakom „Najobľúbenejšia“ a riadkom „Prvýkrát? So zľavou len za 47,20 €.“
2. Imunity Booster
3. Glutation
4. Sport Recovery

Virus Killer sa presúva do rozbaľovacieho zoznamu.

**Prečo:**
- Dvanásť možností je veľa. Odznak dáva nerozhodnutým bezpečnú voľbu „čo berú ostatní“.
- Pre človeka, ktorý infúziu nikdy neskúsil, je 150 € veľké riziko. Najlacnejšia infúzia znižuje bariéru prvej návštevy. Hodnota zákazníka rastie pri ďalších návštevách, o ktorých rozhoduje zážitok, nie prvá cena.
- Pre PPC je „Prvá infúzia od 47,20 €“ silný háčik aj do reklamy.

### 7.3 Tlačidlo na karte
**Aktuálne:** „Mám záujem →“
**Nové:** „Chcem túto so zľavou →“
Ak to tak ešte nie je, nad formulárom zobraziť „Vybraná infúzia: Imunity Booster ✕“.
**Prečo:** Tlačidlo pripomenie benefit a potvrdenie výberu dá istotu, že voľba „prešla“.

### 7.4 Riadok „Pre koho“ na hlavných kartách
- **Vitamín C Max:** „Pre koho: keď chcete IV terapiu vyskúšať alebo si rýchlo doplniť vitamín C.“
- **Imunity Booster:** „Pre koho: keď chcete cez jeseň a zimu podporiť obranyschopnosť.“
- **Glutation:** „Pre koho: keď chcete podporiť pleť a vitalitu zvnútra.“
- **Sport Recovery:** „Pre koho: po náročnom tréningu, zápase alebo pretekoch.“

**Prečo:** Zloženie („vitamíny skupiny B“) človek nevie vyhodnotiť. „Pre koho“ mu povie, či je to preňho.

---

## 8. Self-care lounge

**H2:** „Žiadna čakáreň. Chvíľa, ktorá patrí len vám.“ ostáva.

**Zmeny v kartách:**
- **Biochémia krvi z kvapky:** odstrániť a nahradiť kartou **„Otvorené aj cez víkend“** s textom „Po–Pi 10:00–18:00 · So–Ne 9:00–15:00“.
- **Oxygenoterapia:** doplniť [v cene / za príplatok X €]. Kým klinika nepotvrdí, text ostáva bez zmeny.
- Ostatné karty (Lekársky tím, kreslo, Netflix, parkovanie) bez zmeny.

**Prečo:** Nepotvrdenú službu nahradí overený a silný argument a mriežka ostane so šiestimi kartami.

---

## 9. Recenzie

**Aktuálne:** tri citácie, podpísané „Zuzana“, „Lenka“ a „Pčolinský“.

**Nové:**
- Jednotný formát mena: „Zuzana K.“, „Lenka M.“, „[Meno] P.“, k tomu „Google recenzia“ a ★★★★★.
- Nad citáciami súhrn „★ [4,9] z [NNN] recenzií na Google“ a odkaz (`googleReviewsUrl` v `config.js`).
- Pridať 2–3 ďalšie skutočné recenzie s konkrétnym detailom a aspoň jednu od muža alebo športovca (pre variant c).
- Jednu recenziu dať aj k formuláru (4.6).

**Prečo:** Iniciálka, zdroj a odkaz robia recenziu overiteľnou. Používať len skutočné recenzie.

---

## 10. FAQ

**Nové poradie:** najprv peniaze a postup, potom obavy.

1. **Ako získam zľavu 20 %?**
   „Vyplňte formulár na tejto stránke – zľavu vám zapíšeme na meno a pošleme potvrdenie e-mailom. Pri rezervácii použite rovnaký e-mail alebo telefón a zľavu vám odrátame pri platbe na prevádzke. Platí na prvú infúziu a na všetky infúzie z ponuky. Na darčekové poukážky sa nevzťahuje.“
2. **Ako a kedy zaplatím?**
   „Až na prevádzke, vopred neplatíte nič.“ [Doplniť „Platiť môžete kartou aj v hotovosti“, ak to klinika potvrdí.]
3. **Je podanie infúzie nepríjemné?** (dnes „Bolí podanie infúzie?“, ⚠ Meta)
   „Pocítite len krátky vpich, podobne ako pri odbere krvi. Potom už len oddychujete v masážnom kresle.“
4. **Je IV terapia bezpečná?**
   „Infúzie podáva vyškolený zdravotnícky personál pod dohľadom lekára. Pred infúziou sa vás opýtame na zdravotný stav a lieky, ktoré užívate.“ [Doplniť „Ak by infúzia pre vás nebola vhodná, povieme vám to a nič neplatíte“, ak to klinika potvrdí.]
5. **Ako dlho návšteva trvá?**
   „Približne hodinu a pol vrátane krátkej konzultácie – väčšinu času oddychujete v masážnom kresle.“
6. **NOVÉ: Prečo infúzia, a nie vitamíny v tabletkách?**
   „Pri infúzii idú vitamíny a minerály priamo do krvi a neprechádzajú tráviacim traktom. Preto sa dajú podať aj dávky, ktoré by ste v tabletkách neprijali. Ktorá infúzia a dávka sa vám hodí, odporučí zdravotník.“ [Pred nasadením dať prečítať klinike.]
7. **Potrebujem odporúčanie od lekára?** Ostáva bez zmeny.
8. **NOVÉ: Môžeme prísť vo dvojici?**
   „Áno, pokojne prídite spolu. Zľavu 20 % získa každý, kto vyplní formulár, takže ho vyplňte každý zvlášť.“
9. **Môžem infúziu niekomu darovať?**
   „Áno. Ponúkame darčekové poukážky v hodnote 50 €, 100 € a 150 €. Viac vám povieme telefonicky alebo na prevádzke. Zľava 20 % sa na poukážky nevzťahuje.“

**Prečo:**
- FAQ otvárajú ľudia blízko rozhodnutia a najčastejšie hľadajú „koľko a ako“.
- „Tabletky vs. infúzia“ je najčastejšia skeptická otázka pri IV terapii.
- Otázka o dvojici zároveň nenápadne prináša ďalší lead.

> **Tip na sezónu:** od novembra zvýrazniť poukážky ako vianočný darček. To je samostatná kampaň, nie zmena LP.

---

## 11. Záverečná výzva

- **Eyebrow:** „Doprajte si chvíľu pre seba“
- **H2:** **„Vaša zľava 20 % na prvú infúziu čaká“**
- **Text:** „Vyplnenie trvá 30 sekúnd. Termín si vyberiete online, alebo vám zavoláme. Platíte až na mieste.“
- **Tri fajky:** ✓ pod dohľadom lekára ✓ masážne kreslo a Netflix ✓ otvorené aj cez víkend
- **Tlačidlá:** „Chcem zľavu 20 %“ · „Zavolať +421 948 375 871“

**Prečo:** Kto doscrolloval až sem, je o službe presvedčený a potrebuje postrčenie k akcii. Ponuka sa zopakuje a riziko sa odstráni. Emotívna veta ostáva ako eyebrow.

---

## 12. Mobil

- **Sticky lišta dole** (ak ešte nie je): „Chcem zľavu 20 %“ a ikona telefónu.
  - Objaví sa po odscrollovaní z hero a schová sa, keď je na obrazovke formulár.
  - Klik na telefón posiela rovnaký event ako ostatné telefónne odkazy.
- **Prvá obrazovka na 375 × 667 px:** eyebrow, H1, badge a primárne tlačidlo musia byť viditeľné bez scrollovania.
- **Polia:**
  - `type="tel"` a `type="email"`, `autocomplete="name"`/`"tel"`/`"email"`.
  - Písmo v poliach aspoň 16 px, inak iPhone pri kliknutí zoomuje.

---

## 13. Slovník kvôli Mete

| Nepoužívať | Použiť |
|---|---|
| bolí, bolesť | nepríjemné, krátky vpich |
| riešiť (problém), ťažkosti | zaujíma vás, potrebujete, očakávate |
| únava, vyčerpanie, stres | energia, vitalita, náročné obdobie |
| liečba, liečiť, vyliečiť, choroba, diagnóza | podpora, starostlivosť, doplnenie |
| chrípka, prechladnutie, viróza | imunita, obranyschopnosť |
| názvy 7 vyradených infúzií | „ďalšie infúzie vám odporučí zdravotník“ |
| „vyplaví toxíny“, „zaručene“, „okamžite“ | „na podporu…“, bez sľubu výsledku |

**Úprimne:** Meta nezverejňuje zoznam slov, podľa ktorých klasifikuje inzerentov. Klasifikácia sa týka hlavne typu biznisu, domény a dát, ktoré pixel posiela. Tento slovník je opatrnosť, nie istota. Rovnaká opatrnosť pomáha aj pri slovenských pravidlách reklamy na zdravotnú starostlivosť: nesľubovať výsledok.

---

## 14. Technické nálezy, ktoré ovplyvňujú konverziu

1. **Honeypot „Firma“ môže potichu zahadzovať skutočné leady.** Pole s názvom `company` vie Chrome alebo Safari automaticky vyplniť, ak má človek v profile uloženú firmu. Backend potom skutočný lead vyhodnotí ako spam.
   - Premenovať pole na neutrálny názov (`rc_hp`) a pridať `aria-hidden="true"`, `tabindex="-1"` a `autocomplete="off"`.
   - Spam zapisovať do samostatnej karty „Spam“, nikdy nie do „LP leady“. Inak by mu Make poslal e-mail so zľavou.
   - Prah `elapsed_ms` nastaviť najviac na približne 2 s.
2. **Preklepy v e-maile** (gmial.com, azet.cm…): pri preklepe nepríde potvrdenie zľavy a recepcia nespáruje rezerváciu. Stačí nápoveda „Mysleli ste …@gmail.com?“ pre bežné domény (gmail.com, azet.sk, centrum.sk, zoznam.sk, post.sk, icloud.com, outlook.com, hotmail.com, yahoo.com).
3. **Duplicitné texty v zdroji** (eyebrow a podnadpis): over, či ide o mobilnú a desktopovú verziu. Ak áno, neaktívna má mať `display:none`. Ak nie, odstrániť.
4. **canonical a og:url = TODO-domena.sk:** doplniť doménu, dovtedy aspoň netlify URL. `noindex` ponechať, pre PPC landing page je to v poriadku.
5. **`googleReviewsUrl` je prázdne,** takže odkaz na recenzie sa nezobrazuje.
6. **Rýchlosť:**
   - hero fotka vo WebP alebo AVIF s `fetchpriority="high"`,
   - LCP pod 2,5 s na mobile (PageSpeed Insights).

   Prehliadač vo vnútri aplikácie Facebook/Instagram je pomalší, takže každá sekunda navyše stojí konverzie.

---

## 15. Ako testovať

**Fáza 1, bez testu (hneď):** všetko zo sekcií 2–14 okrem challengera H1.
- Nasaď naraz a porovnaj dva týždne pred a dva týždne po.
- Sleduj tri čísla:
  - konverzný pomer LP = leady / relácie z platených zdrojov (GA4),
  - cenu za Lead v Mete,
  - **podiel leadov so statusom CONVERTED** v Sheete. To je najdôležitejšie číslo, lebo vyšší konverzný pomer s horšou kvalitou nie je výhra.

**Fáza 2, testy (jeden naraz):**
1. **H1:** kontrola vs. challenger (2.2). Schválené.
2. **Poradie formulára:** najprv voľba „online / zavolajte“ (ľahké kliknutie), potom kontakt. Prvý malý krok často zvýši počet dokončených formulárov.

**Pravidlá testu:**
- Rozdelenie 50/50 náhodne v JS. Variant uložiť do `localStorage`, aby sa človek pri návrate nedostal na inú verziu.
- Variant posielať do dataLayer a do Sheetu (napr. `lp_variant = a-h1b`).
- Test beží minimálne dva celé týždne, lebo víkendy sa správajú inak.
- Potrebný počet leadov na variant spočítať vopred v kalkulačke veľkosti vzorky (napr. Evan Miller, „Sample Size Calculator“). Pri malom trafficu sa oplatí testovať len zmeny, od ktorých čakáš +20 % a viac.
- Ak víťaz nemá aspoň 95 % istotu, ostáva kontrola.

---

## 16. Čo ešte potrebujem od kliniky

- [ ] Hodnotenie a počet recenzií na Google a odkaz na profil
- [ ] 2–3 ďalšie skutočné recenzie (s iniciálkou priezviska)
- [ ] Sú masážne kreslo, Netflix a občerstvenie v cene?
- [ ] Oxygenoterapia: v cene, alebo za koľko?
- [ ] Platba kartou aj v hotovosti?
- [ ] Podmienky zmeny alebo zrušenia termínu (pre trust strip)
- [ ] Ak infúzia nie je vhodná, klient neplatí?
- [ ] Prečítať odpoveď „Prečo infúzia, a nie tabletky“
- [ ] Ponúka sa rozbor krvi z kvapky? (Ak áno, môže sa vrátiť do kroku 2.)
- [ ] Voliteľné: počet podaných infúzií alebo rok otvorenia
- [ ] Overiť, že WP web ani Apponio nesľubujú 20 % všetkým novým klientom

---

## 17. Prompt pre Claude Code

> Skopíruj tento súbor do repozitára ako `docs/CRO_navrhy_textov_LP.md` a potom vlož prompt nižšie.

```
Pracuješ v repozitári Recovery Clinic LP (plain HTML/CSS/JS, Netlify).
Pracuj na vetve `dev`. Do `main` nemerguj, nasadenie schvaľuje Daniel.

ZADANIE
Zapracuj FÁZU 1 z dokumentu docs/CRO_navrhy_textov_LP.md (sekcie 2–14).
Rozhodnutia klienta v sekcii 1 majú prednosť pred všetkým ostatným.
Fázu 2 (A/B testy) zatiaľ nerob.

PRAVIDLÁ
1. Meníš len viditeľné texty a UX. NEMEŇ:
   - názvy polí formulára,
   - hodnoty rádií (online/call) a chipov (imunita, unava, sport, beauty…),
   - dataLayer eventy a ich parametre,
   - payload pre Apps Script.
   Sheet, Make aj meranie závisia od týchto hodnôt.
   Výnimky: honeypot (bod 7) a checkbox súhlasu (bod 6).
2. Zľava (sekcia 1):
   - platí len po vyplnení formulára, na všetky infúzie, bez lehoty,
     nie na darčekové poukážky,
   - v config.js oprav discount.terms aj komentár „POZOR: zľava platí pre
     KAŽDÉHO nového klienta…“ podľa tohto pravidla,
   - nikde na stránke nesmie ostať „pre každého nového klienta“.
3. Bez mena lekára a bez sľubu času spätného hovoru, nikde.
   Odstráň rozbor krvi z kroku 2 aj kartu „Biochémia krvi z kvapky“
   v lounge. Kartu nahraď kartou „Otvorené aj cez víkend“ (sekcia 8).
4. Údaje v [HRANATÝCH ZÁTVORKÁCH] nie sú potvrdené. Nič si nevymýšľaj.
   Pre každý taký údaj pridaj do config.js prázdnu položku.
   Prvok, ktorého hodnota je prázdna, sa nevykreslí, alebo ostane pôvodný
   text (rovnaký princíp ako dnes googleReviewsUrl). Položky:
   - googleRating, googleReviewCount
   - emailEta: 'do 2 hodín' – text v stave po odoslaní
   - extras: { oxygenPrice: '', includedInPrice: false,
     paymentMethods: '', rescheduleText: '', notSuitableNoCharge: false }
   - v infusions.js: voliteľné pole zlavaPlati (predvolene true;
     pre Glutation zatiaľ false), popular: true pre Vitamín C Max
   Voliteľné vety vo FAQ (2, 4) vykresli len pri vyplnenej hodnote.
5. Ceny po zľave počítaj v JS z discount.percent. Formát „127,20 €“
   (desatinná čiarka, dve desatinné miesta). Žiadne natvrdo písané ceny.
   Ak zlavaPlati === false, ukáž len cenu z dát (pri Glutatione
   „139 € (bežne 179 €)“) bez riadku so zľavou a bez ďalšej poznámky.
   Hlavné karty: hlavna 1 Vitamín C Max (odznak „Najobľúbenejšia“),
   2 Imunity Booster, 3 Glutation, 4 Sport Recovery.
   Virus Killer odober z hlavných kariet, ostáva v zozname.
6. Checkbox súhlasu odstráň a nahraď informačnou vetou pod tlačidlom
   s odkazom na privacyUrl (sekcia 4.6).
   POZOR: najprv over v app.js aj google-apps-script/Kód.gs, či backend
   pole súhlasu nevyžaduje alebo nevaliduje. Ak áno, uprav obe strany tak,
   aby formulár bez checkboxu prešiel a stĺpce v Sheete sa nezmenili.
7. Honeypot (sekcia 14, bod 1):
   - premenuj pole company na rc_hp, pridaj aria-hidden, tabindex=-1
     a autocomplete=off,
   - uprav aj Kód.gs: spam zapisuj do karty „Spam“ (vytvor ju,
     ak neexistuje), NIKDY nie do „LP leady“,
   - prah elapsed_ms nastav najviac na 2000 ms.
   V README napíš, že po zmene Kód.gs treba v Apps Scripte nasadiť
   novú verziu cez Deploy → Manage deployments → Edit → New version.
   URL /exec ostane rovnaká.
8. Meta: dodrž docs/qa-checklist.md a slovník zo sekcie 13.
   Na konci over grepom, že v index.html, assets/js/*.js ani v alt textoch
   nie je: bolí, bolesť, riešiť, riešite, liečba, diagnóza, chrípka,
   rozbor krvi, MUDr.
   Nesmú tam byť ani názvy vyradených infúzií.
9. Stav po odoslaní (sekcia 5):
   - oslovenie menom, zopakovaný e-mail, emailEta z configu,
   - pri ceste „call“ telefónne číslo s výzvou, nech si ho uloží,
     a sekundárny odkaz na online rezerváciu.
   Odkaz do Apponia ostáva len v tomto stave.
10. Nápoveda pri preklepoch v e-maile (sekcia 14, bod 2): vlastná malá
    funkcia, bez externej knižnice. Nesmie blokovať odoslanie.
11. Sticky CTA na mobile (sekcia 12), ak ešte neexistuje.
    Klik na telefón v lište posiela rovnaký phone_click event ako
    ostatné telefónne odkazy.

POSTUP
1. Najprv mi vypíš zoznam zmien po sekciách a otázky, ak je niečo nejasné.
   Kým ti neodpíšem, nič neimplementuj.
2. Implementuj.
3. QA:
   - screenshoty 375 px a 1440 px (hero, formulár, oba stavy po odoslaní,
     infúzie, lounge),
   - test formulára lokálne s prázdnym formEndpoint (testovací režim);
     produkčný endpoint netestuj a zmenu formEndpoint necommituj,
   - Lighthouse mobile,
   - grep zakázaných slov,
   - kontrola, že dataLayer eventy majú rovnaké názvy a parametre ako
     pred zmenou.
4. Commit na dev s popisom zmien. Pošli mi zoznam položiek v config.js,
   ktoré čakajú na údaje od kliniky.
```
