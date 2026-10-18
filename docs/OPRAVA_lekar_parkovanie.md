# Oprava LP: bez zmienky o lekárovi a bez parkovania

**Rozhodnutie klienta (18. 10. 2026, spresnené)**
1. **Lekár sa na stránke nespomína nikde a v žiadnej podobe.** Patrí sem „lekár“, „lekársky“, „doktor“, „doktorka“ aj „MUDr.“.
2. **Dohľad zdravotníckeho personálu spomínať môžeme.** Povolené sú formulácie „pod dohľadom zdravotníckeho personálu“, „vyškolený zdravotnícky personál“ a „zdravotník“.
3. **Parkovanie sa nespomína nikde.** Je spoplatnené a nie je súčasťou služby.

**Prečo to opravujeme hneď:** tvrdenie, ktoré na prevádzke neplatí, je pri zdravotnej službe právne riziko pre kliniku. Pri parkovaní hrozí sklamanie presne vo chvíli, keď zákazník prvýkrát príde. Ak pri vchode platí za parkovisko, ktoré mu web sľúbil, dôvera v ostatné tvrdenia klesne skôr, než si sadne do kresla.

---

## 1. Čo nahradiť na živom webe

| # | Miesto | Aktuálny text | Nový text |
|---|---|---|---|
| 1 | H1 variant a (`config.js` → `variants.a.h1`) | Dobite si `<b>`imunitu aj energiu`</b>` – pohodlne v kresle, pod dohľadom lekára | Dobite si `<b>`imunitu aj energiu`</b>` – pohodlne v kresle, pod dohľadom zdravotníkov |
| 2 | Trust strip pod hero | Lekársky dohľad | Dohľad zdravotníckeho personálu |
| 3 | Trust strip pod hero | Parkovanie | Otvorené aj cez víkend |
| 4 | Trust strip pod formulárom | Lekársky dohľad | Poradenstvo so zdravotníkom zdarma |
| 5 | Trust strip pod formulárom | Parkovanie pre klientov | odstrániť |
| 6 | Lounge, karta „Lekársky tím“ | Lekársky tím – Infúziu podáva vyškolený zdravotník pod dohľadom lekára. | **Zdravotnícky tím** – Infúziu podáva vyškolený zdravotnícky personál a počas infúzie na vás dohliada. |
| 7 | Lounge, karta „Parkovanie“ | Parkovanie – Pohodlné parkovanie pre klientov kliniky. | **Platba až na mieste** – Vopred neplatíte nič, platíte až na prevádzke. |
| 8 | FAQ „Je IV terapia bezpečná?“ | Infúzie podáva vyškolený zdravotnícky personál pod dohľadom lekára. Pred podaním sa vás opýtame na zdravotný stav. | Infúzie podáva vyškolený zdravotnícky personál a počas infúzie na vás dohliada. Pred podaním sa vás opýtame na zdravotný stav a lieky, ktoré užívate. |
| 9 | FAQ „Potrebujem odporúčanie od lekára?“ | (otázka) | **Potrebujem na infúziu odporúčanie?** Odpoveď ostáva bez zmeny. |

**H1, bod 1:** „pod dohľadom zdravotníkov“ znamená to isté ako „pod dohľadom zdravotníckeho personálu“, ale je o 12 znakov kratšie. Na mobile to môže ušetriť jeden riadok nadpisu. Ak klient chce presne svoju formuláciu, použi „pod dohľadom zdravotníckeho personálu“.

**Prečo pri kartách nemažeme, ale nahrádzame:** mriežka v lounge má šesť kariet. S piatimi by vznikla diera v rozložení. „Platba až na mieste“ je overený fakt a zároveň odstraňuje riziko z pohľadu zákazníka.

**Recenzia „Zuzana“ ostáva bez zmeny** (rozhodnutie klienta). Slová „pani doktorka“ v nej sú citát zákazníčky, nie tvrdenie kliniky.

**Kde ešte hľadať:** `<title>`, meta description, `og:title`, `og:description`, alt texty obrázkov, JSON-LD (ak existuje), texty stavu po odoslaní vo `form.js`, `<noscript>`, `404.html` a komentáre v `config.js` aj `infusions.js`.

---

## 2. Čo ostáva bez zmeny

- „Zdravotník“, „vyškolený / školený zdravotnícky personál“
- „Pod dohľadom zdravotníckeho personálu“, „dohľad zdravotníckeho personálu“
- „Zdravotnícke zariadenie“

Jediná výnimka je recenzia „Zuzana“ so slovami „Pani doktorka so sestričkou…“. Ostáva na stránke bez zmeny.

---

## 3. Plánované texty sú už opravené

Dokumenty `CRO_navrhy_textov_LP.md` a `SEKCIA_co_je_IV_terapia.md` sú upravené podľa tohto rozhodnutia. Ak ich Claude Code ešte len zapracúva, berie už správne texty:

| Dokument | Miesto | Nový text |
|---|---|---|
| CRO, 2.2 | Kontrola H1 | Dobite si **imunitu aj energiu** – pohodlne v kresle, pod dohľadom zdravotníkov |
| CRO, 2.5 | Odrážky v hero | Pod dohľadom vyškoleného zdravotníckeho personálu · Otvorené aj cez víkend (bez parkovania) |
| CRO, 3 | Horný trust strip | Dohľad zdravotníckeho personálu |
| CRO, 3 | Dolný trust strip | Zdravotnícke zariadenie (namiesto parkovania) |
| CRO, 4.6 | Recenzia pod tlačidlom | Lenka M.: „Veľmi príjemné. Od príchodu cez veľmi dobrý servis až po super služby v masážnom kresle.“ |
| CRO, 8 | Lounge | Zdravotnícky tím, Platba až na mieste |
| CRO, 10 | FAQ č. 4 a 7 | bez lekára; otázka č. 7 „Potrebujem na infúziu odporúčanie?“ |
| CRO, 11 | Záverečná výzva | ✓ pod dohľadom zdravotníckeho personálu |
| SEKCIA, 3.1 | Poznámka „Úprimne“ | …Je to doplnok, ktorý vám podá vyškolený zdravotnícky personál v pohodlí masážneho kresla. |
| SEKCIA, 3.2 | Odkiaľ IV terapia pochádza | bez slova „lekár“ (pozri dokument) |

---

## 4. Mimo webu (pre Daniela)

- [x] **E-mail so zľavou v Make** (scenár „Recovery LP Email“): odrážka v časti „Čo vás u nás čaká“ je od 18. 10. „Pod dohľadom vyškoleného zdravotníckeho personálu“.
- [ ] **Reklamy v Mete:** skontroluj texty aj grafiky aktívnych reklám, či nespomínajú lekára alebo parkovanie. Reklama a stránka musia hovoriť to isté.

---

## 5. Prompt pre Claude Code

> Skopíruj tento súbor do repozitára ako `docs/OPRAVA_lekar_parkovanie.md`.

```
Pracuješ v repozitári Recovery Clinic LP (plain HTML/CSS/JS, Netlify).
Pracuj na vetve `dev`. Do `main` nemerguj, nasadenie schvaľuje Daniel.

ZADANIE
Oprav texty podľa docs/OPRAVA_lekar_parkovanie.md. Toto rozhodnutie klienta
má prednosť pred všetkými ostatnými dokumentmi v docs/.

PRAVIDLÁ
1. Lekár sa na stránke nespomína nikde a v žiadnej podobe:
   lekár, lekársky, doktor, doktorka, MUDr.
2. Dohľad zdravotníckeho personálu spomínať smieš
   („pod dohľadom zdravotníckeho personálu“, „zdravotník“).
3. Parkovanie sa nespomína nikde.
4. Nahraď texty presne podľa tabuľky v sekcii 1. Nové texty si nevymýšľaj.
5. Recenziu „Zuzana“ („Pani doktorka so sestričkou…“) nechaj bez zmeny.
   Je to citát zákazníčky a klient ho na stránke chce.
6. Prejdi aj miesta zo zoznamu „Kde ešte hľadať“ v sekcii 1.
7. Nemeň formulár, dataLayer eventy ani payload pre Apps Script.

KONTROLA
Spusti:
  grep -rniE "lekár|lekar|doktor|MUDr|parkov" index.html *.html assets/
Smie ostať jediný výskyt: recenzia „Zuzana“ („Pani doktorka so sestričkou…“).
Každý iný výskyt oprav a vypíš mi zoznam, čo si zmenil.

POSTUP
1. Najprv mi vypíš všetky nájdené výskyty a navrhované zmeny.
   Kým ti neodpíšem, nič neimplementuj.
2. Implementuj.
3. QA: screenshoty 375 px a 1440 px (hero, trust stripy, lounge, recenzie,
   FAQ) a výsledok grepu.
4. Commit na dev s popisom zmien.
```
