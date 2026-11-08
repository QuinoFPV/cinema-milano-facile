#!/bin/sh
# Scarica gli orari di oggi e pubblica il sito su GitHub Pages.
# Uso (dalla cartella cinema-milano-facile):  sh scripts/aggiorna-e-pubblica.sh
set -e
cd "$(dirname "$0")/.."
node scripts/aggiorna-programmazione.mjs
git add data/programmazione.js data/wikidata-cache.json
if git diff --cached --quiet; then
  echo "Nessuna novità da pubblicare."
else
  git commit -q -m "Orari del $(date +%d/%m/%Y)"
  git push -q
  echo "Pubblicato: tra un paio di minuti il sito online è aggiornato."
fi
