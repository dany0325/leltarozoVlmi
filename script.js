// ---------- Adatok ----------
var KULCS = "leltar-adatok";

var eszkozok = [];
var szerkesztettId = null; // ha nem null, akkor szerkesztünk
var kiadandoId = null;     // melyik eszközt adjuk ki

var ALLAPOT_NEVEK = {
  elerheto: "Elérhető",
  kiadva: "Kiadva",
  hibas: "Hibás"
};

function mintaAdatok() {
  return [
    { azonosito: "LAP-001", nev: "Dell laptop", kategoria: "Laptop", allapot: "elerheto", kinel: "", hatarido: "", elozmenyek: [] },
    { azonosito: "PRJ-001", nev: "Epson projektor", kategoria: "Projektor", allapot: "hibas", kinel: "", hatarido: "", elozmenyek: [] },
    { azonosito: "LAB-001", nev: "Focilabda", kategoria: "Sporteszköz", allapot: "elerheto", kinel: "", hatarido: "", elozmenyek: [] }
  ];
}

function betoltes() {
  var szoveg = localStorage.getItem(KULCS);
  if (szoveg === null) {
    eszkozok = mintaAdatok();
    return;
  }
  try {
    eszkozok = JSON.parse(szoveg);
  } catch (hiba) {
    eszkozok = [];
  }
}

function mentes() {
  localStorage.setItem(KULCS, JSON.stringify(eszkozok));
}

