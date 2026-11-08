// Scarica i film in sala oggi a Milano da MyMovies e li salva in data/programmazione.js.
// Uso:  node scripts/aggiorna-programmazione.mjs
// Da rilanciare ogni giorno (la programmazione cambia).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const FONTE = "https://www.mymovies.it/cinema/milano/";
const OUT = fileURLToPath(new URL("../data/programmazione.js", import.meta.url));
const CACHE = fileURLToPath(new URL("../data/wikidata-cache.json", import.meta.url));

// Nome su MyMovies -> id in data/cinema.js
const ALIAS = {
  "Anteo Palazzo del Cinema": "anteo",
  "CityLife Anteo": "citylife-anteo",
  "Cineteca Arlecchino": "arlecchino",
  "Cineteca Milano MIC": "mic",
  "Beltrade": "beltrade",
  "Arcobaleno Filmcenter": "arcobaleno",
  "Colosseo": "colosseo",
  "Eliseo": "eliseo",
  "Centrale": "centrale",
  "Uci Cinemas Bicocca": "uci-bicocca",
  "Gloria Notorious Cinemas": "gloria",
  "Ariosto spazioCinema": "ariosto",
  "Orfeo": "orfeo",
  "Mexico": "mexico",
  "Plinius Multisala": "plinius",
  "Palestrina": "palestrina",
  "Cinema Godard - Fondazione Prada": "godard",
  "Il Cinemino": "cinemino",
  "Ducale Multisala": "ducale",
  "CinéMagenta63 - Institut Francais Milano": "cinemagenta63",
  "iL Martinitt": "martinitt"
};

const decode = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'").replace(/&Igrave;/g, "Ì").replace(/&egrave;/g, "è")
  .replace(/&agrave;/g, "à").replace(/&ograve;/g, "ò").replace(/&ugrave;/g, "ù")
  .replace(/&eacute;/g, "é").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const res = await fetch(FONTE, {
  headers: { "User-Agent": "Mozilla/5.0 (Macintosh) CinemaMilanoFacile/0.1", "Accept-Language": "it-IT" }
});
if (!res.ok) throw new Error(`MyMovies ha risposto ${res.status}`);
const html = await res.text();

// Scansione lineare: ogni segnale aggiorna lo stato corrente (film -> cinema -> versione -> orario).
const RX = new RegExp([
  /GetVideo\(\d+, \d+, '[^']*', '(?<cover>https%3A[^']+)'/.source,
  /<img id="poster-\d+" alt="Locandina [^"]*"[^>]*src="(?<poster>[^"]+)"/.source,
  /<div class="schedine-titolo">\s*<a href="(?<filmUrl>[^"]+)" title="(?<film>[^"]+)"/.source,
  /consigliato_(?<cons>\w+)"><span>&nbsp;<strong>(?<monetro>[^<]+)<\/strong>/.source,
  /<div class="mm-line-height-130 schedine-lancio">(?<lancio>[\s\S]*?)<\/div>/.source,
  /<div class="mm-tiny">(?<fonteVoto>MYMOVIES\.IT|CRITICA|PUBBLICO) <strong>(?<voto>[^<]+)<\/strong>/.source,
  /film\/uscita\/[^"]*\?data=(?<uscita>\d{2}\/\d{2}\/\d{4})/.source,
  /Distribuzione <a[^>]*>(?<distrib>[^<]+)<\/a>/.source,
  /Un film di <a[^>]*>(?<regista>[^<]+)<\/a>\.?\s*(?:<span>Con (?<cast>[\s\S]*?)<\/span>)?/.source,
  /<div>\s*(?<sinossi>[^<]{15,700}?)\s*<span id="espandi\d+"/.source,
  /title="Programmazione del cinema (?<cinema>[^"]+) di Milano"/.source,
  /<div class="mm-medium" style="font-weight:400;">(?<versione>[^<]+)<\/div>/.source,
  /mm-weight-700">(?<ora>\d{1,2}:\d{2})</.source
].join("|"), "g");

const film = new Map();
const cinemaExtra = new Map();
let poster = null, cover = null, giudizio = null, cur = null, sala = null, vo = false;

// Giudizio sintetico di MyMovies (classe CSS "consigliato_xx")
const CONSIGLIATO = { asi: "Assolutamente sì", si: "Consigliato", ni: "Così così", no: "Non consigliato", ano: "Assolutamente no" };
const numero = (v) => { const n = parseFloat(String(v).replace(",", ".")); return Number.isFinite(n) ? n : null; };

for (const m of html.matchAll(RX)) {
  const g = m.groups;
  if (g.cover) cover = decodeURIComponent(g.cover);
  else if (g.poster) { poster = g.poster; giudizio = null; }
  else if (g.cons) giudizio = { media: numero(g.monetro), consiglio: CONSIGLIATO[g.cons] || null };
  else if (g.film) {
    const titolo = decode(g.film);
    const id = slug(titolo);
    cur = film.get(id) || {
      id, titolo, url: g.filmUrl, poster, genere: "", durata: null,
      // Locandina grande (420px) e immagine orizzontale del trailer, se esistono
      locandina: poster ? poster.replace(/\/imm(pg\d+)?\.jpg$/, "/locandina$1.jpg") : null,
      cover,
      lancio: "", sinossi: "", regista: "", cast: [],
      voti: { media: giudizio?.media ?? null, consiglio: giudizio?.consiglio ?? null, mymovies: null, critica: null, pubblico: null },
      spettacoli: []
    };
    film.set(id, cur);
    sala = null;
    cover = null;
  } else if (g.lancio && cur && !cur.genere) {
    const testo = decode(g.lancio);
    const gen = g.lancio.match(/title="Film [^"]*"[^>]*>([^<]+)<\/a>/);
    cur.genere = gen ? decode(gen[1]) : "";
    const dur = testo.match(/Durata (\d+) Minuti/i);
    cur.durata = dur ? +dur[1] : null;
    cur.lancio = decode(g.lancio.split("<a")[0]).replace(/\s+$/, "");
    cur.paesi = [...g.lancio.matchAll(/country=[^"]*"[^>]*>([^<]+)<\/a>/g)].map((x) => decode(x[1]));
  } else if (g.uscita && cur && !cur.uscita) {
    const [gg, mm, aaaa] = g.uscita.split("/");
    cur.uscita = `${aaaa}-${mm}-${gg}`; // data di uscita nelle sale italiane
  } else if (g.distrib && cur && !cur.distribuzione) {
    cur.distribuzione = decode(g.distrib);
  } else if (g.fonteVoto && cur) {
    const k = { "MYMOVIES.IT": "mymovies", CRITICA: "critica", PUBBLICO: "pubblico" }[g.fonteVoto];
    if (cur.voti[k] == null) cur.voti[k] = numero(g.voto);
  } else if (g.regista && cur && !cur.regista) {
    cur.regista = decode(g.regista);
    cur.cast = g.cast ? [...g.cast.matchAll(/>([^<]+)<\/a>/g)].map((x) => decode(x[1])).slice(0, 4) : [];
  } else if (g.sinossi && cur && !cur.sinossi) {
    cur.sinossi = decode(g.sinossi);
  } else if (g.cinema && cur) {
    const nome = decode(g.cinema);
    const id = ALIAS[nome] || slug(nome);
    if (!ALIAS[nome]) cinemaExtra.set(id, nome);
    sala = { cinema: id, orari: [], orariVO: [] };
    cur.spettacoli.push(sala);
    vo = false;
  } else if (g.versione) {
    vo = /originale/i.test(g.versione);
  } else if (g.ora && sala) {
    (vo ? sala.orariVO : sala.orari).push(g.ora.padStart(5, "0"));
  }
}

const elenco = [...film.values()]
  .map((f) => ({ ...f, spettacoli: f.spettacoli.filter((s) => s.orari.length || s.orariVO.length) }))
  .filter((f) => f.spettacoli.length)
  .sort((a, b) => b.spettacoli.length - a.spettacoli.length);

if (!elenco.length) throw new Error("Nessun film trovato: forse è cambiato il formato della pagina.");

await arricchisciDaWikidata(elenco);

const oggi = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
const dati = {
  data: oggi,
  aggiornato: new Date().toISOString(),
  fonte: FONTE,
  cinemaExtra: Object.fromEntries(cinemaExtra),
  film: elenco
};

await writeFile(OUT,
  "// Generato da scripts/aggiorna-programmazione.mjs — non modificare a mano.\n" +
  `window.PROGRAMMAZIONE = ${JSON.stringify(dati, null, 1)};\n`);

const spettacoli = elenco.reduce((n, f) => n + f.spettacoli.reduce((k, s) => k + s.orari.length + s.orariVO.length, 0), 0);
console.log(`OK ${oggi}: ${elenco.length} film, ${spettacoli} spettacoli. Cinema non in elenco: ${[...cinemaExtra.values()].join(", ") || "nessuno"}`);

// --- Produzione e luoghi delle riprese da Wikidata ---
// MyMovies non li riporta: li cerchiamo su Wikidata per titolo e anno.
// I risultati restano in data/wikidata-cache.json, così ogni giorno si cercano solo i film nuovi
// (quelli non trovati si ritentano dopo una settimana, quando le voci sono più complete).
async function arricchisciDaWikidata(film) {
  let cache = {};
  try { cache = JSON.parse(await readFile(CACHE, "utf8")); } catch {}
  const settimanaFa = Date.now() - 7 * 864e5;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function api(params, tentativi = 4) {
    await sleep(1500); // Wikidata limita le richieste troppo ravvicinate
    const r = await fetch("https://www.wikidata.org/w/api.php?" + new URLSearchParams({ format: "json", ...params }), {
      headers: { "User-Agent": "CinemaMilanoFacile/0.1 (progetto personale)" }
    });
    const testo = await r.text();
    try { return JSON.parse(testo); } catch {
      if (!tentativi) throw new Error("Wikidata non risponde");
      await sleep(10000);
      return api(params, tentativi - 1);
    }
  }

  const TIPI_FILM = ["Q11424", "Q24869", "Q202866", "Q93204", "Q506240", "Q226730"];
  async function cerca(f) {
    const anno = +((f.url.match(/\/film\/(\d{4})\//) || [])[1]);
    const ids = [];
    for (const lang of ["it", "en"]) {
      const s = await api({ action: "wbsearchentities", search: f.titolo, language: lang, uselang: lang, type: "item", limit: 7 });
      for (const x of s.search || []) if (!ids.includes(x.id)) ids.push(x.id);
    }
    if (!ids.length) return null;
    const e = await api({ action: "wbgetentities", ids: ids.join("|"), props: "claims" });
    const voce = Object.values(e.entities || {}).find((x) => {
      const tipi = (x.claims?.P31 || []).map((c) => c.mainsnak.datavalue?.value.id);
      const anni = (x.claims?.P577 || []).map((c) => +c.mainsnak.datavalue?.value.time.slice(1, 5));
      return tipi.some((q) => TIPI_FILM.includes(q)) && (!anno || anni.some((a) => Math.abs(a - anno) <= 1));
    });
    if (!voce) return null;
    const val = (p, max) => (voce.claims[p] || []).map((c) => c.mainsnak.datavalue?.value.id).filter(Boolean).slice(0, max);
    const paesi = val("P495", 4), produzione = val("P272", 4), girato = val("P915", 6);
    const tutti = [...new Set([...paesi, ...produzione, ...girato])];
    const nomi = tutti.length
      ? (await api({ action: "wbgetentities", ids: tutti.join("|"), props: "labels", languages: "it|en" })).entities
      : {};
    const nome = (q) => nomi[q]?.labels?.it?.value || nomi[q]?.labels?.en?.value || null;
    const lista = (qs) => qs.map(nome).filter(Boolean);
    return { wikidata: voce.id, paesi: lista(paesi), produzione: lista(produzione), girato: lista(girato) };
  }

  const SINONIMI = { usa: "stati uniti", "gran bretagna": "regno unito", uk: "regno unito" };
  const paese = (p) => SINONIMI[p.toLowerCase()] || p.toLowerCase();

  let nuovi = 0;
  for (const f of film) {
    let c = cache[f.url];
    if (!c || (c.nonTrovato && c.cercato < settimanaFa)) {
      try {
        const r = await cerca(f);
        c = cache[f.url] = r ? { ...r, cercato: Date.now() } : { nonTrovato: true, cercato: Date.now() };
        nuovi++;
        process.stdout.write(r ? "+" : ".");
      } catch (err) {
        console.warn(`\nWikidata: salto «${f.titolo}» (${err.message})`);
        continue;
      }
    }
    // Se i Paesi di MyMovies e Wikidata non hanno nulla in comune, probabilmente è un altro film con lo stesso titolo.
    if (c && !c.nonTrovato && f.paesi?.length && c.paesi?.length && !c.paesi.map(paese).some((p) => f.paesi.map(paese).includes(p))) {
      console.warn(`\nWikidata: scarto «${f.titolo}» (${c.wikidata}), Paesi diversi`);
      continue;
    }
    if (c && !c.nonTrovato) {
      f.wikidata = c.wikidata;
      f.produzione = c.produzione;
      f.girato = c.girato;
      if (!f.paesi?.length) f.paesi = c.paesi;
      f.paesiWikidata = c.paesi;
    }
  }
  if (nuovi) {
    await writeFile(CACHE, JSON.stringify(cache, null, 1));
    console.log(`\nWikidata: cercati ${nuovi} film.`);
  }
}
