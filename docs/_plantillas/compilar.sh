#!/usr/bin/env bash
# Compila un .tex a PDF usando la imagen Docker texlive (no requiere LaTeX instalado en el host).
# Uso:   ./compilar.sh imagenes_productos_nomenclatura.tex
#        ./compilar.sh api_makers.tex
# La imagen texlive/texlive queda cacheada en Docker (se baja una sola vez).
set -e
cd "$(dirname "$0")"
TEX="${1:?Uso: ./compilar.sh archivo.tex}"
IMG="${TEX_IMAGE:-texlive/texlive:latest}"

docker run --rm -v "$PWD":/w -w /w "$IMG" \
  latexmk -pdf -interaction=nonstopmode -halt-on-error "$TEX"

# limpieza de auxiliares
docker run --rm -v "$PWD":/w -w /w "$IMG" latexmk -c "$TEX" >/dev/null 2>&1 || true
echo "OK -> ${TEX%.tex}.pdf"
