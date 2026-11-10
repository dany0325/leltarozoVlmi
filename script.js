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

// ---------- Segédfüggvények ----------
function ma() {
  return new Date().toISOString().slice(0, 10);
}

function biztonsagos(szoveg) {
  return String(szoveg)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function eszkozKeresese(azonosito) {
  for (var i = 0; i < eszkozok.length; i++) {
    if (eszkozok[i].azonosito === azonosito) {
      return eszkozok[i];
    }
  }
  return null;
}

function lejartE(eszkoz) {
  return eszkoz.allapot === "kiadva" && eszkoz.hatarido !== "" && eszkoz.hatarido < ma();
}

function elem(id) {
  return document.getElementById(id);
}

