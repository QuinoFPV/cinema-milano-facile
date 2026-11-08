# Cinema Milano Facile

Sito statico per trovare film e cinema a Milano: film in sala oggi con orari, cinema per zona, metro, lingua originale e distanza.

Online su **https://quinofpv.github.io/cinema-milano-facile/**

## Aggiornare gli orari e pubblicarli

Un solo comando scarica gli orari di oggi e li pubblica sul sito online:

```bash
sh scripts/aggiorna-e-pubblica.sh
```

## Solo aggiornare gli orari (senza pubblicare)

Gli orari vengono da MyMovies (solo la giornata corrente). Va rilanciato ogni giorno:

```bash
node scripts/aggiorna-programmazione.mjs
```

Lo script riscrive `data/programmazione.js`. Case di produzione e luoghi delle riprese arrivano da Wikidata e restano in `data/wikidata-cache.json`: la prima volta servono alcuni minuti, poi vengono cercati solo i film nuovi. I cinema che MyMovies elenca ma che non sono in `data/cinema.js` compaiono comunque con gli orari, ma senza posizione sulla mappa: per aggiungerli, inseriscili in `data/cinema.js` e nella tabella `ALIAS` dello script.

## Vedere il sito

```bash
python3 -m http.server 8765
```

poi apri http://localhost:8765.

## Fonti

Orari, voti, trame e locandine: [MyMovies](https://www.mymovies.it). Produzione e luoghi delle riprese: [Wikidata](https://www.wikidata.org). Mappa: © [OpenStreetMap](https://www.openstreetmap.org/copyright).
