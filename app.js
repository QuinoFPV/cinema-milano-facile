(function () {
  const cinema = window.CINEMA;
  const prog = window.PROGRAMMAZIONE || { film: [], cinemaExtra: {} };
  const perId = Object.fromEntries(cinema.map((c) => [c.id, c]));
  const filmPerId = Object.fromEntries(prog.film.map((f) => [f.id, f]));
  const STATO_INIZIALE = { vista: "film", categoria: "", ordina: "sale", q: "", zona: "", fascia: "", tipo: "", vo: false, mappa: false };
  const state = { ...STATO_INIZIALE, pos: null };

  const $ = (id) => document.getElementById(id);
  const enc = encodeURIComponent;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  // --- Icone (tracciati in stile Lucide) ---
  const ICONE = {
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    film: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 7.5h4M3 12h18M3 16.5h4M17 7.5h4M17 16.5h4"/>',
    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
    pin: '<path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    map: '<path d="M14.1 5.6a2 2 0 0 0 1.8 0l3.7-1.9A1 1 0 0 1 21 4.6v12.8a1 1 0 0 1-.6.9l-4.5 2.3a2 2 0 0 1-1.8 0l-4.2-2.1a2 2 0 0 0-1.8 0l-3.7 1.9A1 1 0 0 1 3 19.4V6.6a1 1 0 0 1 .6-.9l4.5-2.3a2 2 0 0 1 1.8 0z"/><path d="M15 5.8v15M9 3.2v15"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    star: '<path d="M11.5 2.3a.5.5 0 0 1 1 0l2.3 4.7a2.1 2.1 0 0 0 1.6 1.2l5.2.7a.5.5 0 0 1 .3.9l-3.7 3.6a2.1 2.1 0 0 0-.6 1.9l.9 5.1a.5.5 0 0 1-.8.6l-4.6-2.4a2.1 2.1 0 0 0-2 0l-4.6 2.4a.5.5 0 0 1-.8-.6l.9-5.1a2.1 2.1 0 0 0-.6-1.9L2.2 9.8a.5.5 0 0 1 .3-.9l5.2-.7a2.1 2.1 0 0 0 1.6-1.2z"/>',
    arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
    down: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>'
  };
  const icona = (n) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONE[n] || ""}</svg>`;
  const icone = (root) => root.querySelectorAll("[data-icon]").forEach((el) => (el.outerHTML = icona(el.dataset.icon)));
  icone(document);

  // Cinema presenti su MyMovies ma non in data/cinema.js: niente mappa, solo nome.
  const infoCinema = (id) => perId[id] || { id, nome: prog.cinemaExtra[id] || id, zona: "", metro: "", tag: [], indirizzo: "" };

  // --- Date e orari ---
  const oggi = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
  const live = prog.data === oggi; // gli orari sono di oggi: ha senso parlare di «passati» e «prossimi»
  const fmtData = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  const adesso = () => new Date().toLocaleTimeString("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" });
  const minuti = (h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };

  if (prog.data) {
    $("kicker").textContent = `${fmtData(prog.data)} · ${prog.film.length} film in sala`;
    if (!live) {
      $("avviso").hidden = false;
      $("avviso").textContent = `Attenzione: gli orari sono di ${fmtData(prog.data)}. Aggiornali con «node scripts/aggiorna-programmazione.mjs».`;
    }
  } else {
    $("avviso").hidden = false;
    $("avviso").textContent = "Orari non ancora scaricati: lancia «node scripts/aggiorna-programmazione.mjs».";
  }
  $("nota").innerHTML = `Orari, voti e trame da <a href="${esc(prog.fonte || "https://www.mymovies.it")}" target="_blank" rel="noopener">MyMovies</a>` +
    (prog.aggiornato ? `, aggiornati il ${new Date(prog.aggiornato).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })}` : "") +
    "; produzione e riprese da Wikidata. Gli orari possono cambiare: prima di uscire controlla sul sito del cinema. Posizioni sulla mappa indicative.";
  $("n-film").textContent = prog.film.length || "";
  $("n-film").hidden = !prog.film.length;
  $("n-cinema").textContent = cinema.length;

  // --- Filtri ---
  [...new Set(cinema.map((c) => c.zona))].sort().forEach((z) => $("zona").add(new Option(z, z)));
  Object.entries(window.TAG_LABEL).filter(([k]) => k !== "vo").forEach(([k, label]) => $("tipo").add(new Option(label, k)));

  $("q").addEventListener("input", (e) => { state.q = e.target.value; render(); });
  $("zona").addEventListener("change", (e) => { state.zona = e.target.value; render(); });
  $("fascia").addEventListener("change", (e) => { state.fascia = e.target.value; render(); });
  $("tipo").addEventListener("change", (e) => { state.tipo = e.target.value; render(); });
  $("ordina").addEventListener("change", (e) => { state.ordina = e.target.value; render(); });
  $("vo").addEventListener("click", () => { state.vo = !state.vo; $("vo").setAttribute("aria-pressed", state.vo); render(); });

  $("vicino").addEventListener("click", () => {
    if (!navigator.geolocation) return alert("Il browser non supporta la geolocalizzazione.");
    const etichetta = $("vicino").querySelector(".etichetta");
    etichetta.textContent = "Cerco…";
    navigator.geolocation.getCurrentPosition(
      (p) => {
        state.pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        etichetta.textContent = "Per distanza";
        $("vicino").setAttribute("aria-pressed", "true");
        if (map) {
          if (segnaposto) segnaposto.remove();
          segnaposto = L.circleMarker([state.pos.lat, state.pos.lng], { radius: 8, color: "#fff", weight: 2, fillColor: "#f4c04e", fillOpacity: 1 })
            .addTo(map).bindPopup("Sei qui");
        }
        setMappa(true);
        render();
      },
      () => { etichetta.textContent = "Vicino a me"; alert("Posizione non disponibile."); }
    );
  });

  // --- Tabs e home ---
  document.querySelectorAll("[role=tab]").forEach((b) => b.addEventListener("click", () => setVista(b.dataset.vista)));
  function setVista(v) {
    state.vista = v;
    $("ordina-wrap").hidden = v !== "film";
    $("categorie").hidden = v !== "film";
    document.querySelectorAll("[role=tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.vista === v));
    render();
  }

  $("home").addEventListener("click", (e) => {
    e.preventDefault();
    Object.assign(state, STATO_INIZIALE, { pos: null });
    $("q").value = "";
    ["zona", "fascia", "tipo", "ordina"].forEach((id) => ($(id).selectedIndex = 0));
    ["vo", "vicino"].forEach((id) => $(id).setAttribute("aria-pressed", "false"));
    $("vicino").querySelector(".etichetta").textContent = "Vicino a me";
    if (segnaposto) { segnaposto.remove(); segnaposto = null; }
    chiudiPannello();
    setMappa(false);
    disegnaCategorie();
    setVista("film");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // --- Ricerca testuale ---
  // Ignora maiuscole, accenti e punteggiatura; ogni parola cercata deve comparire
  // (anche come parte di una parola): «citta vivi» trova «La città dei vivi».
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
  const paroleCercate = () => norm(state.q).split(" ").filter(Boolean);
  function corrisponde(testo, parole) {
    if (!parole.length) return true;
    const t = norm(testo), unito = t.replace(/ /g, "");
    return parole.every((p) => t.includes(p) || unito.includes(p));
  }
  const testoFilm = (f) => [f.titolo, f.genere, f.regista, ...(f.cast || [])].join(" ");
  const testoCinema = (c) => `${c.nome} ${c.indirizzo} ${c.zona} ${c.metro}`;

  // --- Distanze ---
  function km(a, b) {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const dist = (c) => (state.pos && c.lat != null ? km(state.pos, c) : null);
  const fmtDist = (d) => (d == null ? "" : d < 1 ? Math.round(d * 1000) + " m" : d.toFixed(1).replace(".", ",") + " km");

  // --- Filtri su cinema e orari ---
  function orarioOk(h) {
    if (state.fascia === "ora") return !live || h >= adesso();
    if (state.fascia === "pomeriggio") return h < "18:00";
    if (state.fascia === "sera") return h >= "18:00";
    return true;
  }
  const cinemaOk = (c) => (!state.zona || c.zona === state.zona) && (!state.tipo || c.tag.includes(state.tipo));

  // Spettacoli di un film che passano i filtri (orari, zona, tipo di sala, lingua originale).
  function spettacoliFiltrati(f, { ignoraFiltri = false } = {}) {
    return f.spettacoli
      .map((s) => {
        const c = infoCinema(s.cinema);
        return {
          c, d: dist(c),
          orari: ignoraFiltri ? s.orari : state.vo ? [] : s.orari.filter(orarioOk),
          orariVO: ignoraFiltri ? s.orariVO : s.orariVO.filter(orarioOk)
        };
      })
      .filter((s) => (ignoraFiltri || cinemaOk(s.c)) && (s.orari.length || s.orariVO.length))
      .sort((a, b) => (a.d != null && b.d != null ? a.d - b.d : a.c.nome.localeCompare(b.c.nome, "it")));
  }

  // Il prossimo spettacolo tra quelli dati (a parità di orario, il cinema più vicino).
  function prossimoTra(sp) {
    const ora = adesso();
    let best = null;
    for (const s of sp) {
      for (const [h, vo] of [...s.orari.map((h) => [h, false]), ...s.orariVO.map((h) => [h, true])]) {
        if (live && h < ora) continue;
        if (!best || h < best.h || (h === best.h && s.d != null && (best.d == null || s.d < best.d))) best = { h, vo, c: s.c, d: s.d };
      }
    }
    return best;
  }
  function quando(h) {
    if (!live) return "";
    const m = minuti(h) - minuti(adesso());
    if (m <= 0) return "ora";
    if (m < 60) return `tra ${m} min`;
    if (m < 180) return `tra ${Math.floor(m / 60)} h ${m % 60 ? (m % 60) + " min" : ""}`.trim();
    return "";
  }

  // --- Linee della metro e dei mezzi, dal testo «M1 M3 Duomo · Tram 14» ---
  function fermate(testo) {
    if (!testo) return [];
    return testo.split("·").map((p) => p.trim()).filter(Boolean).map((parte) => {
      const t = parte.split(/\s+/), linee = [];
      let i = 0;
      while (i < t.length) {
        if (/^M[1-5]$/.test(t[i])) { linee.push({ classe: t[i].toLowerCase(), testo: t[i] }); i++; }
        else if (/^(Tram|Bus)$/.test(t[i]) && /^[\d/]+$/.test(t[i + 1] || "")) {
          linee.push({ classe: t[i].toLowerCase(), testo: `${t[i] === "Tram" ? "Tram" : "Bus"} ${t[i + 1]}` }); i += 2;
        } else break;
      }
      return { linee, nome: t.slice(i).join(" ") };
    });
  }
  const htmlFermate = (testo) => {
    const f = fermate(testo);
    return f.length ? `<div class="fermate">${f.map((x) => `<span class="fermata">${x.linee.map((l) => `<span class="linea ${l.classe}">${esc(l.testo)}</span>`).join("")}${x.nome ? " " + esc(x.nome) : ""}</span>`).join("")}</div>` : "";
  };

  // --- Voti ---
  const fmtVoto = (v) => v.toFixed(1).replace(".", ",");
  const stelle = (v, classe = "") => v == null
    ? `<span class="stelle-nd">n.d.</span>`
    : `<span class="stelle ${classe}" style="--v:${v}" role="img" aria-label="${fmtVoto(v)} stelle su 5">★★★★★</span>`;
  const CLASSE_CONSIGLIO = { "Assolutamente sì": "top", "Consigliato": "si", "Così così": "ni", "Non consigliato": "no", "Assolutamente no": "no" };
  const badgeConsiglio = (f) => f.voti?.consiglio ? `<span class="consiglio ${CLASSE_CONSIGLIO[f.voti.consiglio] || ""}">${esc(f.voti.consiglio)}</span>` : "";

  // --- Categorie «di secondo livello»: raggruppano i generi di MyMovies per umore ---
  const anno = (f) => +((f.url || "").match(/\/film\/(\d{4})\//) || [])[1] || null;
  const haGenere = (...g) => (f) => g.includes((f.genere || "").toLowerCase());
  const CATEGORIE = [
    { id: "nuovi", label: "Nuovi", ok: (f) => !!infoUscita(f)?.nuovo }, // usciti negli ultimi 7 giorni (o in uscita)
    { id: "imperdibili", label: "Imperdibili", ok: (f) => (f.voti?.media ?? 0) >= 3.5 || f.voti?.consiglio === "Assolutamente sì" },
    { id: "bambini", label: "Per bambini", ok: haGenere("animazione", "family", "famiglia") },
    { id: "tutti", label: "Per tutti", ok: haGenere("animazione", "family", "famiglia", "avventura", "fantastico", "musicale") },
    { id: "ride", label: "Si ride", ok: haGenere("commedia") },
    { id: "azione", label: "Azione", ok: haGenere("azione", "avventura", "fantascienza", "western", "guerra") },
    { id: "impegnato", label: "Impegnato", ok: haGenere("drammatico", "documentario", "biografico", "storico", "guerra", "politico") },
    { id: "brividi", label: "Brividi", ok: haGenere("horror", "thriller", "giallo", "noir", "poliziesco") },
    { id: "romantico", label: "Romantico", ok: haGenere("sentimentale", "romantico") },
    { id: "documentari", label: "Documentari", ok: haGenere("documentario") },
    { id: "classici", label: "Classici", ok: (f) => anno(f) != null && anno(f) <= 2000 }
  ];
  function disegnaCategorie() {
    $("categorie").innerHTML = CATEGORIE
      .map((c) => ({ ...c, n: prog.film.filter(c.ok).length }))
      .filter((c) => c.n)
      .map((c) => `<button type="button" class="cat" data-cat="${c.id}" aria-pressed="${state.categoria === c.id}">${c.label}<span>${c.n}</span></button>`)
      .join("");
    $("categorie").querySelectorAll(".cat").forEach((b) => b.addEventListener("click", () => {
      state.categoria = state.categoria === b.dataset.cat ? "" : b.dataset.cat;
      disegnaCategorie();
      render();
    }));
  }
  disegnaCategorie();
  const categoriaOk = (f) => !state.categoria || CATEGORIE.find((c) => c.id === state.categoria).ok(f);

  // --- Data di uscita in Italia ---
  function infoUscita(f) {
    if (!f.uscita) return null;
    const d = new Date(f.uscita + "T12:00:00");
    const giorni = Math.round((new Date(oggi + "T12:00:00") - d) / 864e5);
    const data = d.toLocaleDateString("it-IT", { day: "numeric", month: "short", ...(f.uscita.slice(0, 4) === oggi.slice(0, 4) ? {} : { year: "numeric" }) });
    const completa = d.toLocaleDateString("it-IT", { dateStyle: "long" });
    // Film di anni prima tornati in sala: la data è quella della riedizione
    const riedizione = anno(f) && anno(f) <= d.getFullYear() - 5;
    if (riedizione && giorni >= 0) return { breve: "Riedizione", lungo: `Di nuovo in sala dal ${data}`, nuovo: giorni <= 7, completa };
    if (giorni < 0) return { breve: `Esce il ${data}`, lungo: `Esce il ${data}`, nuovo: true, completa };
    if (giorni === 0) return { breve: "Esce oggi", lungo: "Esce oggi", nuovo: true, completa };
    if (giorni <= 7) return { breve: "Nuovo", lungo: `Nuovo · uscito il ${data}`, nuovo: true, completa };
    return { breve: `Dal ${data}`, lungo: `Uscito il ${data}`, nuovo: false, completa };
  }

  const ORDINE = {
    sale: (a, b) => b.sp.length - a.sp.length,
    prossimo: (a, b) => (a.pr?.h || "99") .localeCompare(b.pr?.h || "99"),
    voto: (a, b) => (b.f.voti?.media ?? -1) - (a.f.voti?.media ?? -1),
    critica: (a, b) => (b.f.voti?.critica ?? -1) - (a.f.voti?.critica ?? -1),
    pubblico: (a, b) => (b.f.voti?.pubblico ?? -1) - (a.f.voti?.pubblico ?? -1),
    uscita: (a, b) => (b.f.uscita || "").localeCompare(a.f.uscita || "")
  };

  const immagine = (f, classe = "") => f.locandina || f.poster
    ? `<img src="${esc(f.locandina || f.poster)}" data-piccola="${esc(f.poster || "")}" alt="" loading="lazy" class="${classe}" onerror="if(this.dataset.piccola&&this.src!==this.dataset.piccola){this.src=this.dataset.piccola}else{this.style.visibility='hidden'}">`
    : "";

  // Orari come biglietti: passati sbarrati, il prossimo evidenziato.
  function biglietti(s, prossimo) {
    const ora = adesso();
    const tutti = [...s.orari.map((h) => [h, false]), ...s.orariVO.map((h) => [h, true])].sort((a, b) => a[0].localeCompare(b[0]));
    return `<div class="orari">${tutti.map(([h, vo]) => {
      const cl = ["ora", vo ? "vo" : "", live && h < ora ? "passato" : "", prossimo && prossimo.h === h && prossimo.c.id === s.c.id ? "prossima" : ""].join(" ");
      return `<span class="${cl}"${vo ? ' title="Versione originale sottotitolata"' : ""}>${h}${vo ? " <small>VO</small>" : ""}</span>`;
    }).join("")}</div>`;
  }

  // --- Mappa (nascosta finché non serve) ---
  let map = null, segnaposto = null, idsSullaMappa = [];
  const markers = {};
  if (window.L) {
    map = L.map("map", { scrollWheelZoom: false, zoomControl: true }).setView([45.4705, 9.19], 12);
    // Mappa OpenStreetMap standard, scurita via CSS per il tema «Sala buia»
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: "&copy; OpenStreetMap"
    }).addTo(map);
    cinema.forEach((c) => {
      markers[c.id] = L.circleMarker([c.lat, c.lng], { radius: 7, color: "#fff", weight: 2, fillColor: "#e5383b", fillOpacity: 1 })
        .bindPopup(`<strong>${esc(c.nome)}</strong><br>${esc(c.indirizzo)}<br><button type="button" data-apri-cinema="${c.id}">Vedi la programmazione →</button>`);
    });
    map.on("popupopen", (e) => {
      const b = e.popup.getElement().querySelector("[data-apri-cinema]");
      if (b) b.addEventListener("click", () => apriCinema(b.dataset.apriCinema));
    });
  }
  function setMappa(aperta) {
    state.mappa = aperta;
    $("colonna-mappa").hidden = !aperta;
    document.querySelector(".layout").classList.toggle("con-mappa", aperta);
    $("mostra-mappa").setAttribute("aria-pressed", aperta);
    if (aperta && map) setTimeout(() => { map.invalidateSize(); mostraSullaMappa(idsSullaMappa); }, 0);
    pianifica();
  }
  $("mostra-mappa").addEventListener("click", () => setMappa(!state.mappa));
  function mostraSullaMappa(ids) {
    idsSullaMappa = ids;
    if (!map || !state.mappa) return;
    Object.values(markers).forEach((m) => m.remove());
    const pts = [];
    ids.forEach((id) => { if (markers[id]) { markers[id].addTo(map); pts.push(markers[id].getLatLng()); } });
    if (state.pos) pts.push([state.pos.lat, state.pos.lng]);
    if (pts.length) map.fitBounds(pts, { padding: [30, 30], maxZoom: 15 });
  }

  // --- Pannello laterale ---
  let ultimoFocus = null, idsLista = [];
  function apriPannello(html, idsMappa) {
    if ($("pannello").hidden) ultimoFocus = document.activeElement;
    $("pannello-corpo").innerHTML = html;
    icone($("pannello-corpo"));
    $("pannello").hidden = false;
    document.body.classList.add("bloccato");
    const drawer = $("pannello").querySelector(".drawer");
    drawer.scrollTop = 0;
    drawer.focus();
    if (idsMappa) mostraSullaMappa(idsMappa);
  }
  function chiudiPannello() {
    if ($("pannello").hidden) return;
    $("pannello").hidden = true;
    document.body.classList.remove("bloccato");
    mostraSullaMappa(idsLista);
    if (ultimoFocus && document.contains(ultimoFocus)) ultimoFocus.focus();
  }
  $("pannello").addEventListener("click", (e) => {
    if (e.target.closest("[data-chiudi]")) return chiudiPannello();
    const f = e.target.closest("[data-apri-film]");
    if (f) return apriFilm(f.dataset.apriFilm);
    const c = e.target.closest("[data-apri-cinema]");
    if (c) return apriCinema(c.dataset.apriCinema);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") chiudiPannello(); });

  function apriFilm(id) {
    const f = filmPerId[id];
    if (!f) return;
    let sp = spettacoliFiltrati(f), filtrato = true;
    if (!sp.length) { sp = spettacoliFiltrati(f, { ignoraFiltri: true }); filtrato = false; }
    const pr = prossimoTra(sp);
    const u = infoUscita(f);
    const v = f.voti || {};
    const voto = (etichetta, val) => `<div class="voto"><span class="voto-label">${etichetta}</span><div class="voto-val">${stelle(val, "sm")}<strong>${val != null ? fmtVoto(val) : ""}</strong></div></div>`;
    const produzione = [["Paese", f.paesi], ["Produzione", f.produzione], ["Distribuzione in Italia", f.distribuzione ? [f.distribuzione] : []], ["Girato a", f.girato]]
      .filter(([, x]) => x && x.length);
    const filtriAttivi = filtrato && (state.zona || state.fascia || state.tipo || state.vo);

    apriPannello(`
      <div class="d-testa">
        ${f.cover ? `<div class="d-cover" style="background-image:url('${esc(f.cover)}')"></div>` : ""}
        <div class="d-titolo${f.cover ? "" : " senza-cover"}">
          ${immagine(f)}
          <div>
            <h2 id="pannello-titolo">${esc(f.titolo)}</h2>
            <p class="meta">${[f.genere, f.durata ? f.durata + " min" : "", anno(f)].filter(Boolean).map(esc).join(" · ")}</p>
            <div class="badge-riga">
              ${stelle(v.media)}${v.media != null ? `<strong>${fmtVoto(v.media)}</strong>` : ""}
              ${badgeConsiglio(f)}
              ${u ? `<span class="badge${u.nuovo ? " nuovo" : ""}" title="Uscita nelle sale italiane: ${esc(u.completa)}">${esc(u.lungo)}</span>` : ""}
            </div>
          </div>
        </div>
      </div>
      <div class="d-corpo">
        ${f.sinossi ? `<p class="sinossi">${esc(f.sinossi)}</p>` : ""}
        ${f.lancio ? `<blockquote>«${esc(f.lancio)}»</blockquote>` : ""}
        ${f.regista ? `<p class="credits">Regia di <strong>${esc(f.regista)}</strong>${f.cast?.length ? ` · Con ${f.cast.map(esc).join(", ")}` : ""}</p>` : ""}
        <div class="voti">${voto("Redazione", v.mymovies)}${voto("Critica", v.critica)}${voto("Pubblico", v.pubblico)}</div>

        <h3>Dove e quando</h3>
        ${pr ? `<p class="prossimo">${icona("clock")}<span>Prossimo: <strong>${pr.h}</strong> · ${esc(pr.c.nome)}</span>${quando(pr.h) ? `<span class="tra">${quando(pr.h)}</span>` : ""}</p>` : live ? `<p class="prossimo finiti">${icona("clock")}Spettacoli di oggi finiti</p>` : ""}
        ${filtriAttivi ? `<p class="meta">Mostro solo le sale e gli orari che rispettano i filtri scelti.</p>` : ""}
        ${!filtrato ? `<p class="meta">Nessuna sala rispetta i filtri scelti: ecco tutte le proiezioni di oggi.</p>` : ""}
        ${sp.map((s) => `
          <div class="sala">
            <div class="sala-testa">
              <strong>${perId[s.c.id] ? `<a href="#" data-apri-cinema="${s.c.id}" style="font-size:inherit;color:inherit">${esc(s.c.nome)}</a>` : esc(s.c.nome)}</strong>
              <span>${s.d != null ? `<span class="dist">${fmtDist(s.d)}</span> ` : ""}${s.c.indirizzo ? `<a href="https://www.google.com/maps/search/?api=1&query=${enc(s.c.nome + ", " + s.c.indirizzo + ", Milano")}" target="_blank" rel="noopener">${icona("route")} Come arrivare</a>` : ""}</span>
            </div>
            ${htmlFermate(s.c.metro)}
            ${biglietti(s, pr)}
          </div>`).join("")}

        ${produzione.length ? `<h3>Produzione</h3>
          <dl class="produzione">${produzione.map(([k, x]) => `<div><dt>${k}</dt><dd>${x.map(esc).join(", ")}</dd></div>`).join("")}</dl>
          ${f.wikidata ? `<p class="fonte">Produzione e riprese: <a href="https://www.wikidata.org/wiki/${esc(f.wikidata)}" target="_blank" rel="noopener">Wikidata</a></p>` : ""}` : ""}
        <a class="link-esterno" href="${esc(f.url)}" target="_blank" rel="noopener">Trama completa e recensione su MyMovies ${icona("arrow")}</a>
      </div>`, sp.map((s) => s.c.id));
  }

  function filmDelCinema(id, { ignoraFiltri = false } = {}) {
    return prog.film.map((f) => {
      const s = f.spettacoli.find((x) => x.cinema === id);
      if (!s) return null;
      const r = {
        f, c: infoCinema(id),
        orari: ignoraFiltri ? s.orari : state.vo ? [] : s.orari.filter(orarioOk),
        orariVO: ignoraFiltri ? s.orariVO : s.orariVO.filter(orarioOk)
      };
      return r.orari.length || r.orariVO.length ? r : null;
    }).filter(Boolean);
  }

  function apriCinema(id) {
    const c = infoCinema(id);
    let films = filmDelCinema(id), filtrato = true;
    if (!films.length) { films = filmDelCinema(id, { ignoraFiltri: true }); filtrato = false; }
    films.sort((a, b) => (prossimoTra([a])?.h || "99").localeCompare(prossimoTra([b])?.h || "99"));
    const maps = `https://www.google.com/maps/search/?api=1&query=${enc(c.nome + ", " + c.indirizzo + ", Milano")}`;
    const d = dist(c);
    apriPannello(`
      <div class="d-corpo" style="padding-top:28px">
        <p class="eyebrow">${esc(c.zona)}</p>
        <h2 id="pannello-titolo" style="font-family:var(--serif);font-size:28px;margin:0 0 6px">${esc(c.nome)}</h2>
        <p class="meta" style="margin-bottom:8px">${esc(c.indirizzo)}${d != null ? ` · <span class="dist">${fmtDist(d)}</span>` : ""}</p>
        ${htmlFermate(c.metro)}
        <div class="tags" style="margin-top:10px">${c.tag.map((t) => `<span class="tag">${window.TAG_LABEL[t]}</span>`).join("")}</div>
        <div class="azioni">
          <a class="btn primario" href="${maps}" target="_blank" rel="noopener">${icona("route")} Come arrivare</a>
          ${c.sito ? `<a class="btn" href="${esc(c.sito)}" target="_blank" rel="noopener">Sito del cinema ${icona("arrow")}</a>` : ""}
        </div>
        <h3>${films.length ? `${films.length} film oggi` : "Oggi"}</h3>
        ${!filtrato && films.length ? `<p class="meta">Nessun film rispetta i filtri scelti: ecco tutta la programmazione di oggi.</p>` : ""}
        ${films.length ? films.map((r) => `
          <div class="film-riga">
            ${immagine(r.f)}
            <div>
              <button type="button" data-apri-film="${esc(r.f.id)}">${esc(r.f.titolo)}</button>
              <p class="meta">${[r.f.genere, r.f.durata ? r.f.durata + " min" : ""].filter(Boolean).map(esc).join(" · ")}${r.f.voti?.media != null ? ` · ★ ${fmtVoto(r.f.voti.media)}` : ""}</p>
              ${biglietti(r, prossimoTra([r]))}
            </div>
          </div>`).join("") : `<p class="meta">Nessun orario disponibile oggi su MyMovies.</p>`}
      </div>`, [id]);
  }

  // --- Avviso «altri N film più sotto» ---
  // Conta le schede non ancora viste per intero (comprese quelle tagliate dal bordo
  // o coperte dal pulsante stesso).
  const schedeSotto = () => [...document.querySelectorAll("#list > li:not(.empty)")]
    .filter((el) => el.getBoundingClientRect().bottom > innerHeight - 70);
  function aggiornaAltri() {
    const n = schedeSotto().length;
    $("altri").hidden = n === 0 || !$("pannello").hidden;
    if (n) $("altri").innerHTML = `${icona("down")} ${n === 1 ? "Ancora 1" : "Altri " + n} ${state.vista === "film" ? "film" : "cinema"} più sotto`;
  }
  $("altri").addEventListener("click", () => {
    const prossima = schedeSotto()[0];
    if (prossima) window.scrollTo({ top: prossima.getBoundingClientRect().top + scrollY - 200, behavior: "smooth" });
  });
  let attesa = null;
  function pianifica() { if (!attesa) attesa = requestAnimationFrame(() => { attesa = null; aggiornaAltri(); }); }
  window.addEventListener("scroll", pianifica, { passive: true });
  window.addEventListener("resize", pianifica);
  window.addEventListener("load", pianifica);
  if (document.fonts) document.fonts.ready.then(pianifica);
  new MutationObserver(pianifica).observe($("pannello"), { attributes: true, attributeFilter: ["hidden"] });

  // --- Render ---
  function render() {
    if (state.vista === "film") renderFilm(); else renderCinema();
    pianifica();
  }

  $("list").addEventListener("click", (e) => {
    const f = e.target.closest("[data-film]");
    if (f) return apriFilm(f.dataset.film);
    const c = e.target.closest("[data-cinema]");
    if (c) return apriCinema(c.dataset.cinema);
  });
  $("trovati").addEventListener("click", (e) => {
    const c = e.target.closest("[data-cinema]");
    if (c) apriCinema(c.dataset.cinema);
  });
  $("list").addEventListener("mouseover", (e) => {
    const c = e.target.closest("[data-cinema]");
    if (c && state.mappa && markers[c.dataset.cinema]) markers[c.dataset.cinema].openPopup();
  });

  function renderFilm() {
    $("list").className = "griglia";
    const parole = paroleCercate();
    // La ricerca vale sia per i film (titolo, regista, attori, genere) sia per i cinema
    // (nome, via, zona, fermata): se cerchi un cinema vedi i film che proietta oggi.
    const cinemaTrovati = parole.length ? cinema.filter((c) => corrisponde(testoCinema(c), parole)) : [];
    const risultati = prog.film
      .filter(categoriaOk)
      .map((f) => {
        let sp = spettacoliFiltrati(f);
        const perTitolo = corrisponde(testoFilm(f), parole);
        if (!perTitolo) sp = sp.filter((s) => corrisponde(testoCinema(s.c), parole));
        return { f, sp, pr: prossimoTra(sp), perTitolo };
      })
      .filter((r) => r.sp.length)
      .sort((a, b) => (b.perTitolo - a.perTitolo) || ORDINE[state.ordina](a, b)); // prima i film che corrispondono per titolo

    const soloCinema = parole.length && risultati.length && risultati.every((r) => !r.perTitolo);
    const nomi = cinemaTrovati.map((c) => c.nome);
    $("count").innerHTML = !prog.film.length ? ""
      : soloCinema && nomi.length === 1 ? `<strong>${risultati.length}</strong> film oggi · ${esc(nomi[0])}`
      : soloCinema ? `<strong>${risultati.length}</strong> film nei cinema trovati`
      : `<strong>${risultati.length}</strong> film in sala${state.fascia === "ora" ? " da adesso" : ""}`;

    // Scorciatoie ai cinema trovati (aprono il pannello con la loro programmazione)
    $("trovati").hidden = !cinemaTrovati.length;
    $("trovati").innerHTML = cinemaTrovati.length
      ? `<span>${cinemaTrovati.length === 1 ? "Cinema trovato" : "Cinema trovati"}:</span>` +
        cinemaTrovati.slice(0, 8).map((c) => `<button type="button" class="btn" data-cinema="${c.id}">${icona("ticket")}${esc(c.nome)}</button>`).join("") +
        (cinemaTrovati.length > 8 ? `<span>e altri ${cinemaTrovati.length - 8}</span>` : "")
      : "";

    if (!risultati.length) {
      const g = `https://www.google.com/search?q=${enc((state.q || "film") + " orari cinema Milano")}`;
      $("list").innerHTML = `<li class="empty">Nessun film con questi filtri.<br><a href="${g}" target="_blank" rel="noopener">Cerca «${esc(state.q || "film")}» su Google</a></li>`;
      mostraSullaMappa(idsLista = []);
      return;
    }

    $("list").innerHTML = risultati.map(({ f, sp, pr }) => {
      const u = infoUscita(f);
      const haVO = sp.some((s) => s.orariVO.length);
      const tra = pr && quando(pr.h);
      return `
        <li>
          <button type="button" class="film-card" data-film="${esc(f.id)}" aria-label="${esc(f.titolo)}: dettagli e orari">
            <div class="poster">
              ${immagine(f) || `<div class="noposter">${esc(f.titolo)}</div>`}
              ${u ? `<span class="pill uscita${u.nuovo ? " nuovo" : ""}" title="Uscita nelle sale italiane: ${esc(u.completa)}">${esc(u.breve)}</span>` : ""}
              ${haVO ? `<span class="pill vo-pill">VO</span>` : ""}
            </div>
            <div class="film-info">
              <h2>${esc(f.titolo)}</h2>
              <p class="meta">${[f.genere, f.durata ? f.durata + " min" : "", f.paesi?.length ? f.paesi.slice(0, 2).join(", ") : ""].filter(Boolean).map(esc).join(" · ")}</p>
              ${f.voti?.media != null || f.voti?.consiglio ? `<div class="giudizio">${stelle(f.voti?.media, "sm")}${f.voti?.media != null ? `<strong>${fmtVoto(f.voti.media)}</strong>` : ""}${badgeConsiglio(f)}</div>` : ""}
              ${f.sinossi || f.lancio ? `<p class="trama">${esc(f.sinossi || f.lancio)}</p>` : ""}
              ${f.regista ? `<p class="meta regia">Di <strong>${esc(f.regista)}</strong>${f.cast?.length ? ` · con ${f.cast.slice(0, 2).map(esc).join(", ")}` : ""}</p>` : ""}
              ${pr
                ? `<p class="prossimo">${icona("clock")}<strong>${pr.h}</strong><span class="dove">${esc(pr.c.nome)}</span>${tra ? `<span class="tra">${tra}</span>` : ""}</p>`
                : live ? `<p class="prossimo finiti">${icona("clock")}Finiti per oggi</p>` : ""}
              <p class="meta">${sp.length} cinema${sp[0]?.d != null ? ` · il più vicino a ${fmtDist(sp[0].d)}` : ""}</p>
            </div>
          </button>
        </li>`;
    }).join("");

    idsLista = [...new Set(risultati.flatMap((r) => r.sp.map((s) => s.c.id)))];
    if ($("pannello").hidden) mostraSullaMappa(idsLista);
  }

  function renderCinema() {
    $("list").className = "griglia cinema";
    $("trovati").hidden = true;
    const conProg = prog.film.length > 0;
    const parole = paroleCercate();
    // Se la ricerca non riguarda il cinema stesso, cerca tra i film che proietta oggi.
    const res = cinema.filter(cinemaOk).filter((c) => !state.vo || c.tag.includes("vo") || filmDelCinema(c.id).length).map((c) => {
      const film = conProg ? filmDelCinema(c.id) : [];
      if (corrisponde(testoCinema(c), parole)) return { ...c, d: dist(c), film, perFilm: false };
      const trovati = film.filter((r) => corrisponde(testoFilm(r.f), parole));
      return trovati.length ? { ...c, d: dist(c), film: trovati, perFilm: true } : null;
    }).filter(Boolean);

    res.sort((a, b) => (a.d != null ? a.d - b.d : a.nome.localeCompare(b.nome, "it")));

    const perFilm = res.length && res.every((c) => c.perFilm);
    $("count").innerHTML = perFilm ? `<strong>${res.length}</strong> cinema proiettano «${esc(state.q.trim())}» oggi` : `<strong>${res.length}</strong> cinema`;
    $("list").innerHTML = res.length ? res.map((c) => {
      const pr = prossimoTra(c.film);
      const oggiTxt = c.perFilm
        ? `Proietta <strong>${c.film.map((r) => esc(r.f.titolo)).join(", ")}</strong>: ${c.film.flatMap((r) => [...r.orari, ...r.orariVO]).sort().join(", ")}`
        : c.film.length
          ? `<strong>${c.film.length} film</strong> oggi${pr ? ` · prossimo alle <strong>${pr.h}</strong>${quando(pr.h) ? ` <span class="tra" style="color:var(--gold)">${quando(pr.h)}</span>` : ""}` : ""}`
          : "Nessun orario disponibile oggi";
      return `
        <li>
          <button type="button" class="cinema-card" data-cinema="${c.id}">
            <div class="riga"><h2>${esc(c.nome)}</h2>${c.d != null ? `<span class="dist">${fmtDist(c.d)}</span>` : ""}</div>
            <p class="meta">${esc(c.indirizzo)} · ${esc(c.zona)}</p>
            ${htmlFermate(c.metro)}
            <div class="tags">${c.tag.map((t) => `<span class="tag">${window.TAG_LABEL[t]}</span>`).join("")}</div>
            <p class="oggi">${oggiTxt}</p>
          </button>
        </li>`;
    }).join("") : `<li class="empty">Nessun cinema con questi filtri. Prova a toglierne qualcuno.</li>`;

    idsLista = res.map((c) => c.id);
    if ($("pannello").hidden) mostraSullaMappa(idsLista);
  }

  render();
})();
