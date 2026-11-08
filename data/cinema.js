// Elenco dei cinema di Milano città.
// Coordinate approssimative: servono per la mappa e per ordinare per distanza.
// tag: "vo" = proiezioni in lingua originale, "essai" = d'essai / cineteca,
//      "multisala" = multisala commerciale, "imax" = sale premium (IMAX, 4DX…)
window.CINEMA = [
  {
    id: "anteo",
    nome: "Anteo Palazzo del Cinema",
    indirizzo: "Piazza XXV Aprile 8",
    zona: "Garibaldi / Porta Nuova",
    metro: "M2 Garibaldi FS · M2 Moscova",
    tag: ["vo", "essai"],
    sito: "https://www.spaziocinema.info",
    lat: 45.4802, lng: 9.1872
  },
  {
    id: "citylife-anteo",
    nome: "CityLife Anteo",
    indirizzo: "Piazza Tre Torri, CityLife Shopping District",
    zona: "CityLife / Fiera",
    metro: "M5 Tre Torri",
    tag: ["vo", "multisala"],
    sito: "https://www.spaziocinema.info",
    lat: 45.4777, lng: 9.1555
  },
  {
    id: "arlecchino",
    nome: "Cineteca Milano Arlecchino",
    indirizzo: "Via San Pietro all'Orto 9",
    zona: "Centro / San Babila",
    metro: "M1 San Babila",
    tag: ["vo", "essai"],
    sito: "https://www.cinetecamilano.it",
    lat: 45.4665, lng: 9.1972
  },
  {
    id: "mic",
    nome: "Cineteca Milano MIC",
    indirizzo: "Viale Fulvio Testi 121",
    zona: "Bicocca / Niguarda",
    metro: "M5 Bicocca",
    tag: ["essai"],
    sito: "https://www.cinetecamilano.it",
    lat: 45.5155, lng: 9.2115
  },
  {
    id: "beltrade",
    nome: "Cinema Beltrade",
    indirizzo: "Via Nino Oxilia 10",
    zona: "NoLo / Pasteur",
    metro: "M1 Pasteur",
    tag: ["vo", "essai"],
    sito: "https://www.cinemabeltrade.net",
    lat: 45.4925, lng: 9.2195
  },
  {
    id: "arcobaleno",
    nome: "Arcobaleno Film Center",
    indirizzo: "Viale Tunisia 11",
    zona: "Porta Venezia",
    metro: "M1 Porta Venezia",
    tag: ["vo"],
    lat: 45.4790, lng: 9.2050
  },
  {
    id: "colosseo",
    nome: "Cinema Colosseo",
    indirizzo: "Viale Monte Nero 84",
    zona: "Porta Romana / Viale Monte Nero",
    metro: "M3 Porta Romana · Tram 9",
    tag: ["multisala"],
    lat: 45.4570, lng: 9.2060
  },
  {
    id: "eliseo",
    nome: "Cinema Eliseo",
    indirizzo: "Via Torino 64",
    zona: "Centro / Duomo",
    metro: "M1 M3 Duomo",
    tag: ["multisala"],
    lat: 45.4605, lng: 9.1830
  },
  {
    id: "centrale",
    nome: "Cinema Centrale",
    indirizzo: "Via Torino 30",
    zona: "Centro / Duomo",
    metro: "M1 M3 Duomo",
    tag: ["essai"],
    lat: 45.4620, lng: 9.1860
  },
  {
    id: "odeon",
    nome: "The Space Cinema Odeon",
    indirizzo: "Via Santa Radegonda 8",
    zona: "Centro / Duomo",
    metro: "M1 M3 Duomo",
    tag: ["multisala", "vo"],
    sito: "https://www.thespacecinema.it",
    lat: 45.4655, lng: 9.1915
  },
  {
    id: "uci-bicocca",
    nome: "UCI Cinemas Bicocca",
    indirizzo: "Viale Sarca 336",
    zona: "Bicocca / Niguarda",
    metro: "M5 Bicocca · Tram 7",
    tag: ["multisala", "imax", "vo"],
    sito: "https://www.ucicinemas.it",
    lat: 45.5215, lng: 9.2160
  },
  {
    id: "gloria",
    nome: "Notorious Cinemas Gloria",
    indirizzo: "Corso Vercelli 18",
    zona: "Pagano / Corso Vercelli",
    metro: "M1 Conciliazione · M1 Pagano",
    tag: ["multisala"],
    sito: "https://www.notoriouscinemas.it",
    lat: 45.4672, lng: 9.1630
  },
  {
    id: "ariosto",
    nome: "Cinema Ariosto",
    indirizzo: "Via Ludovico Ariosto 16",
    zona: "Pagano / Corso Vercelli",
    metro: "M1 Conciliazione",
    tag: ["essai"],
    sito: "https://www.spaziocinema.info",
    lat: 45.4685, lng: 9.1685
  },
  {
    id: "orfeo",
    nome: "Cinema Orfeo",
    indirizzo: "Viale Coni Zugna 50",
    zona: "Navigli / Porta Genova",
    metro: "M2 Sant'Agostino · M2 Porta Genova",
    tag: ["multisala"],
    lat: 45.4570, lng: 9.1690
  },
  {
    id: "mexico",
    nome: "Cinema Mexico",
    indirizzo: "Via Savona 57",
    zona: "Navigli / Porta Genova",
    metro: "Tram 14 · M2 Porta Genova",
    tag: ["essai", "vo"],
    lat: 45.4520, lng: 9.1620
  },
  {
    id: "plinius",
    nome: "Cinema Plinius",
    indirizzo: "Viale Abruzzi 28",
    zona: "Città Studi / Loreto",
    metro: "M1 Lima · M1 M2 Loreto",
    tag: ["multisala"],
    lat: 45.4800, lng: 9.2140
  },
  {
    id: "palestrina",
    nome: "Cinema Palestrina",
    indirizzo: "Via Palestrina 7",
    zona: "Città Studi / Loreto",
    metro: "M1 M2 Loreto · M2 Caiazzo",
    tag: ["essai"],
    lat: 45.4835, lng: 9.2110
  },
  {
    id: "rosetum",
    nome: "Cinema Rosetum",
    indirizzo: "Via Pisanello 1",
    zona: "San Siro / Piazza Brescia",
    metro: "M1 Gambara · M1 Bande Nere",
    tag: ["essai"],
    lat: 45.4655, lng: 9.1425
  },
  {
    id: "godard",
    nome: "Cinema Godard – Fondazione Prada",
    indirizzo: "Largo Isarco 2",
    zona: "Porta Romana / Lodi",
    metro: "M3 Lodi TIBB",
    tag: ["essai", "vo"],
    sito: "https://www.fondazioneprada.org",
    lat: 45.4445, lng: 9.2045
  },
  {
    id: "cinemino",
    nome: "Cinemino",
    indirizzo: "Via Seneca 6",
    zona: "Porta Romana / Lodi",
    metro: "M3 Porta Romana",
    tag: ["essai", "vo"],
    lat: 45.4530, lng: 9.2080
  },
  {
    id: "ducale",
    nome: "Cinema Ducale",
    indirizzo: "Piazza Napoli 27",
    zona: "Navigli / Porta Genova",
    metro: "Tram 14 · Bus 90/91",
    tag: ["multisala"],
    lat: 45.4524, lng: 9.1546
  },
  {
    id: "cinemagenta63",
    nome: "CinéMagenta63 – Institut Français",
    indirizzo: "Corso Magenta 63",
    zona: "Centro / Magenta",
    metro: "M1 M2 Cadorna · M1 Conciliazione",
    tag: ["essai", "vo"],
    lat: 45.4656, lng: 9.1716
  },
  {
    id: "martinitt",
    nome: "Cinema Teatro iL Martinitt",
    indirizzo: "Via Riccardo Pitteri 58",
    zona: "Lambrate",
    metro: "M2 Lambrate",
    tag: ["essai"],
    lat: 45.4757, lng: 9.2482
  }
];

window.TAG_LABEL = {
  vo: "Lingua originale",
  essai: "D'essai / Cineteca",
  multisala: "Multisala",
  imax: "Sale premium"
};
