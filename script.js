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

// ---------- Megjelenítés ----------
function szurtLista() {
  var kereses = elem("kereses").value.toLowerCase();
  var kategoria = elem("kategoriaSzuro").value;
  var allapot = elem("allapotSzuro").value;
  var talalatok = [];

  for (var i = 0; i < eszkozok.length; i++) {
    var e = eszkozok[i];
    var szoveg = (e.nev + " " + e.azonosito + " " + e.kinel).toLowerCase();

    if (kereses !== "" && szoveg.indexOf(kereses) === -1) continue;
    if (kategoria !== "" && e.kategoria !== kategoria) continue;
    if (allapot === "lejart" && !lejartE(e)) continue;
    if (allapot !== "" && allapot !== "lejart" && e.allapot !== allapot) continue;

    talalatok.push(e);
  }
  return talalatok;
}

function tablaRajzolas() {
  var lista = szurtLista();
  var html = "";

  for (var i = 0; i < lista.length; i++) {
    var e = lista[i];
    var id = biztonsagos(e.azonosito);
    var lejart = lejartE(e);
    var hatarido = e.hatarido === "" ? "-" : biztonsagos(e.hatarido);
    if (lejart) {
      hatarido = '<span class="lejart-szoveg">' + hatarido + " (lejárt)</span>";
    }

    var kiadasGomb = "";
    if (e.allapot === "kiadva") {
      kiadasGomb = '<button type="button" data-muvelet="vissza" title="Az eszköz visszavétele" data-id="' + id + '">Visszavétel</button>';
    } else if (e.allapot === "elerheto") {
      kiadasGomb = '<button type="button" data-muvelet="kiad" title="Az eszköz kiadása" data-id="' + id + '">Kiadás</button>';
    }

    html += '<tr class="' + (lejart ? "lejart" : "") + '">';
    html += '<td data-cimke="Azonosító">' + id + "</td>";
    html += '<td data-cimke="Név">' + biztonsagos(e.nev) + "</td>";
    html += '<td data-cimke="Kategória">' + biztonsagos(e.kategoria) + "</td>";
    html += '<td data-cimke="Állapot"><span class="jelzo ' + e.allapot + '">' + ALLAPOT_NEVEK[e.allapot] + "</span></td>";
    html += '<td data-cimke="Kinél van">' + (e.kinel === "" ? "-" : biztonsagos(e.kinel)) + "</td>";
    html += '<td data-cimke="Határidő">' + hatarido + "</td>";
    html += '<td class="muveletek">' + kiadasGomb;
    html += '<button type="button" class="masodlagos" data-muvelet="elozmeny" title="Korábbi kiadások megtekintése" data-id="' + id + '">Előzmények</button>';
    html += '<button type="button" class="masodlagos" data-muvelet="szerkeszt" title="Az eszköz adatainak szerkesztése" data-id="' + id + '">Szerkesztés</button>';
    html += '<button type="button" class="veszelyes" data-muvelet="torol" title="Az eszköz törlése" data-id="' + id + '">Törlés</button>';
    html += "</td></tr>";
  }

  elem("tablaTest").innerHTML = html;
  elem("uresUzenet").hidden = lista.length > 0;
}

function statisztikaRajzolas() {
  var kint = 0;
  var lejart = 0;
  var hibas = 0;

  for (var i = 0; i < eszkozok.length; i++) {
    if (eszkozok[i].allapot === "kiadva") kint++;
    if (eszkozok[i].allapot === "hibas") hibas++;
    if (lejartE(eszkozok[i])) lejart++;
  }

  elem("statisztika").innerHTML =
    "<div><strong>" + eszkozok.length + "</strong><span>Összes eszköz</span></div>" +
    "<div><strong>" + kint + "</strong><span>Kint van</span></div>" +
    "<div><strong>" + lejart + "</strong><span>Lejárt kölcsönzés</span></div>" +
    "<div><strong>" + hibas + "</strong><span>Hibás</span></div>";
}

function kategoriakFrissitese() {
  var kategoriak = [];
  for (var i = 0; i < eszkozok.length; i++) {
    if (kategoriak.indexOf(eszkozok[i].kategoria) === -1) {
      kategoriak.push(eszkozok[i].kategoria);
    }
  }

  var elozo = elem("kategoriaSzuro").value;
  var szuroHtml = '<option value="">Minden kategória</option>';
  var listaHtml = "";
  for (var j = 0; j < kategoriak.length; j++) {
    var k = biztonsagos(kategoriak[j]);
    szuroHtml += '<option value="' + k + '">' + k + "</option>";
    listaHtml += '<option value="' + k + '">';
  }
  elem("kategoriaSzuro").innerHTML = szuroHtml;
  elem("kategoriaSzuro").value = elozo;
  elem("kategoriaLista").innerHTML = listaHtml;
}

function mindentFrissit() {
  kategoriakFrissitese();
  statisztikaRajzolas();
  tablaRajzolas();
}

// ---------- Hozzáadás és szerkesztés ----------
function ujEszkozAblak() {
  szerkesztettId = null;
  elem("eszkozCim").textContent = "Új eszköz";
  elem("eszkozUrlap").reset();
  elem("eszkozHiba").textContent = "";
  elem("eszkozAblak").showModal();
}

function szerkesztesAblak(azonosito) {
  var e = eszkozKeresese(azonosito);
  szerkesztettId = azonosito;
  elem("eszkozCim").textContent = "Eszköz szerkesztése";
  elem("azonositoMezo").value = e.azonosito;
  elem("nevMezo").value = e.nev;
  elem("kategoriaMezo").value = e.kategoria;
  elem("allapotMezo").value = e.allapot;
  elem("eszkozHiba").textContent = "";
  elem("eszkozAblak").showModal();
}

function eszkozMentese(esemeny) {
  esemeny.preventDefault();

  var azonosito = elem("azonositoMezo").value.trim();
  var nev = elem("nevMezo").value.trim();
  var kategoria = elem("kategoriaMezo").value.trim();
  var allapot = elem("allapotMezo").value;
  var hiba = elem("eszkozHiba");

  if (azonosito === "" || nev === "" || kategoria === "") {
    hiba.textContent = "Az azonosító, a név és a kategória kötelező.";
    return;
  }

  var masik = eszkozKeresese(azonosito);
  if (masik !== null && azonosito !== szerkesztettId) {
    hiba.textContent = "Ez az azonosító már létezik: " + azonosito;
    return;
  }

  if (szerkesztettId === null) {
    if (allapot === "kiadva") {
      hiba.textContent = "Új eszköz nem lehet kiadva. Vedd fel elérhetőként, és használd a Kiadás gombot.";
      return;
    }
    eszkozok.push({ azonosito: azonosito, nev: nev, kategoria: kategoria, allapot: allapot, kinel: "", hatarido: "", elozmenyek: [] });
  } else {
    var e = eszkozKeresese(szerkesztettId);
    if (allapot === "kiadva" && e.kinel === "") {
      hiba.textContent = "Kiadáshoz használd a Kiadás gombot.";
      return;
    }
    if (allapot !== "kiadva" && e.allapot === "kiadva") {
      // kiadott eszköz állapotát átírták: a kölcsönzés lezárul
      lezarElozmeny(e);
      e.kinel = "";
      e.hatarido = "";
    }
    e.azonosito = azonosito;
    e.nev = nev;
    e.kategoria = kategoria;
    e.allapot = allapot;
  }

  mentes();
  elem("eszkozAblak").close();
  mindentFrissit();
}

function torles(azonosito) {
  if (confirm("Biztosan törlöd ezt az eszközt: " + azonosito + "?")) {
    var uj = [];
    for (var i = 0; i < eszkozok.length; i++) {
      if (eszkozok[i].azonosito !== azonosito) uj.push(eszkozok[i]);
    }
    eszkozok = uj;
    mentes();
    mindentFrissit();
  }
}

// ---------- Kiadás és visszavétel ----------
function kiadasAblak(azonosito) {
  kiadandoId = azonosito;
  elem("kiadasCim").textContent = "Kiadás: " + azonosito;
  elem("kiadasUrlap").reset();
  elem("hataridoMezo").min = ma();
  elem("kiadasHiba").textContent = "";
  elem("kiadasAblak").showModal();
}

function kiadasRogzitese(esemeny) {
  esemeny.preventDefault();

  var kinek = elem("kinekMezo").value.trim();
  var hatarido = elem("hataridoMezo").value;

  if (kinek === "" || hatarido === "") {
    elem("kiadasHiba").textContent = "Add meg, ki viszi el, és mikorra hozza vissza.";
    return;
  }
  if (hatarido < ma()) {
    elem("kiadasHiba").textContent = "A határidő nem lehet a múltban.";
    return;
  }

  var e = eszkozKeresese(kiadandoId);
  e.allapot = "kiadva";
  e.kinel = kinek;
  e.hatarido = hatarido;
  e.elozmenyek.push({ kinek: kinek, kiadas: ma(), vissza: "" });

  mentes();
  elem("kiadasAblak").close();
  mindentFrissit();
}

function lezarElozmeny(e) {
  var utolso = e.elozmenyek[e.elozmenyek.length - 1];
  if (utolso && utolso.vissza === "") {
    utolso.vissza = ma();
  }
}

function visszavetel(azonosito) {
  var e = eszkozKeresese(azonosito);
  lezarElozmeny(e);
  e.allapot = "elerheto";
  e.kinel = "";
  e.hatarido = "";
  mentes();
  mindentFrissit();
}

function elozmenyAblak(azonosito) {
  var e = eszkozKeresese(azonosito);
  var html = "";
  for (var i = e.elozmenyek.length - 1; i >= 0; i--) {
    var sor = e.elozmenyek[i];
    var vissza = sor.vissza === "" ? "még nincs visszahozva" : "visszahozva: " + sor.vissza;
    html += "<li>" + biztonsagos(sor.kinek) + " - kiadva: " + sor.kiadas + ", " + vissza + "</li>";
  }
  if (html === "") html = "<li>Ez az eszköz még nem volt kiadva.</li>";

  elem("elozmenyCim").textContent = "Előzmények: " + azonosito;
  elem("elozmenyLista").innerHTML = html;
  elem("elozmenyAblak").showModal();
}

// ---------- Indítás ----------
function tablaKattintas(esemeny) {
  var gomb = esemeny.target.closest("button");
  if (!gomb) return;

  var muvelet = gomb.getAttribute("data-muvelet");
  var id = gomb.getAttribute("data-id");

  if (muvelet === "kiad") kiadasAblak(id);
  if (muvelet === "vissza") visszavetel(id);
  if (muvelet === "elozmeny") elozmenyAblak(id);
  if (muvelet === "szerkeszt") szerkesztesAblak(id);
  if (muvelet === "torol") torles(id);
}

function bezarasKattintas(esemeny) {
  var ablakId = esemeny.target.getAttribute("data-bezar");
  if (ablakId) elem(ablakId).close();
}

function hatterKattintas(esemeny) {
  var ablak = esemeny.target;
  if (ablak.tagName !== "DIALOG") return;

  var doboz = ablak.getBoundingClientRect();
  var kivul = esemeny.clientX < doboz.left || esemeny.clientX > doboz.right ||
              esemeny.clientY < doboz.top || esemeny.clientY > doboz.bottom;
  if (kivul) ablak.close();
}

function inditas() {
  betoltes();

  elem("ujGomb").addEventListener("click", ujEszkozAblak);
  elem("eszkozUrlap").addEventListener("submit", eszkozMentese);
  elem("kiadasUrlap").addEventListener("submit", kiadasRogzitese);
  elem("tablaTest").addEventListener("click", tablaKattintas);
  document.addEventListener("click", bezarasKattintas);
  document.addEventListener("mousedown", hatterKattintas);

  elem("kereses").addEventListener("input", tablaRajzolas);
  elem("kategoriaSzuro").addEventListener("change", tablaRajzolas);
  elem("allapotSzuro").addEventListener("change", tablaRajzolas);

  mindentFrissit();
}

inditas();
