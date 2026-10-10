# Kit de documentación corporativa (LaTeX → PDF)

Carpeta **autocontenida y portátil**. Cópiala completa a cualquier proyecto
para producir PDFs con el mismo estilo corporativo. No necesitas LaTeX
instalado: todo se compila con Docker (imagen `texlive/texlive`).

## Llevar a otro proyecto

Copia la carpeta entera (incluye `assets/`, que es el fondo de membrete):

```bash
cp -r docs/_plantillas /ruta/a/otro-proyecto/docs/_plantillas
```

Eso es todo. No depende de nada del proyecto.

## Arranque rápido (3 pasos)

```bash
cd docs/_plantillas
cp plantilla_base.tex mi_documento.tex   # 1. copia y renombra
# 2. edita la portada y el cuerpo de mi_documento.tex
./compilar.sh mi_documento.tex           # 3. genera mi_documento.pdf
```

`compilar.sh` baja la imagen `texlive/texlive` una sola vez (queda cacheada en
Docker), compila con `latexmk -pdf` y limpia los archivos auxiliares.

> El PDF lo genera Docker como `root`; es normal. `compilar.sh` limpia los
> auxiliares. Si ves residuos con dueño root, bórralos con `sudo` o `docker run`.

## Qué hay en la carpeta

| Archivo | Qué es |
|---|---|
| `plantilla_base.tex` | Plantilla lista para copiar: preámbulo, macros y ejemplos. |
| `compilar.sh` | Compila cualquier `.tex` a PDF vía Docker. |
| `assets/plantilla_fondo.png` | Fondo/membrete corporativo de cada página. |
| `README.md` | Este archivo. |

> Para usar el fondo de **otra** marca: reemplaza `assets/plantilla_fondo.png`
> por tu propio fondo A4 (mismo nombre) y ajusta los colores en el preámbulo.

---

## Identidad visual

### Tipografía
- Texto: **Source Sans Pro** (`sourcesanspro`).
- Código: **Source Code Pro** (`sourcecodepro`).

### Colores (edítalos en el preámbulo de `plantilla_base.tex`)
| Nombre LaTeX | HEX | Uso |
|---|---|---|
| `noilblue` | `#1F71BD` | Azul principal: títulos, cabeceras de tabla, notas info. |
| `noildark` | `#14538C` | Azul oscuro: subtítulos, énfasis. |
| `mPut` | `#E65100` | Naranja: advertencias. |
| `termbg` | `#1E1E2E` | Fondo de cajas de código/terminal. |
| `termtitlebg` | `#2A2A3C` | Barra de título de la terminal. |
| `termtext` | `#C0CAF5` | Texto dentro de la terminal. |
| `tblhead` | `#1F71BD` | Cabecera de tablas. |
| `tblrow` | `#EAF2FB` | Fila alterna (zebra), opcional. |

### Página
- A4, márgenes amplios (top 3.9 / bottom 4.2 / lados 2.3 cm) para dejar aire al membrete.
- Secciones sin numerar. Fondo de membrete en **todas** las páginas.

---

## Componentes (ya definidos en `plantilla_base.tex`)

**Portada** — categoría (negro) → título (azul) → subtítulo (azul oscuro) →
resumen + tabla de versión/estatus.

**`\section{...}` / `\subsection{...}`** — títulos azules con regla inferior.

**Caja terminal** (3 puntitos, para archivos/URLs/comandos):
```latex
\begin{termbox}{etiqueta}
\begin{lstlisting}[style=plain]
comando o nombre de archivo
\end{lstlisting}
\end{termbox}
```

**Nota informativa** (azul) y **advertencia** (naranja):
```latex
\infonote{Título}{Contexto o ayuda para el lector.}
\warnnote{Título}{Algo que NO debe pasarse por alto.}
```

**Tabla de versiones**:
```latex
\changelogtable{%
1.0.0 & 01/01/2026 & Equipo & $\bullet$\ Versión inicial. \\}
```

**Tabla estándar** (cabecera azul):
```latex
\begin{tabularx}{\linewidth}{|>{\raggedright\arraybackslash}p{3.4cm}|>{\raggedright\arraybackslash}X|}
\hline
\rowcolor{tblhead}\textbf{\color{white}Campo} & \textbf{\color{white}Descripción}\\
\hline
Ejemplo & Valor. \\
\hline
\end{tabularx}
```
- `p{Ncm}` = ancho fijo; `X` = elástica. Celdas separadas por `&`, fin de fila `\\`.

**Listas**: `\begin{itemize}[leftmargin=1.2em,itemsep=2pt]` / `enumerate`.

---

## Reglas de LaTeX para no romper la compilación

- En texto normal, escapa: `&` → `\&`, `%` → `\%`, `$` → `\$`, `#` → `\#`,
  `_` → `\_`, `{` `}` → `\{` `\}`, `~` → `\textasciitilde{}`, `^` → `\textasciicircum{}`.
- Acentos: `\'a \'e \'i \'o \'u \~n` o UTF-8 directo (soportado).
- Código en línea: `\texttt{...}` (también escapa `_ & %` dentro).
- Salto dentro de celda: `\newline`. Viñeta manual: `$\bullet$\ texto`.
- Palabra larga que desborda: macro con cortes,
  `\newcommand{\x}{texto-\allowbreak con-\allowbreak cortes}`.

## Checklist documento nuevo

- [ ] Copiaste `plantilla_base.tex` con nombre nuevo.
- [ ] Editaste portada (categoría, título, subtítulo, resumen, estatus).
- [ ] Actualizaste **Control de versiones**.
- [ ] Cuerpo con `\section`, tablas, `termbox`, `infonote`, `warnnote`.
- [ ] Escapaste caracteres especiales.
- [ ] Compiló: `./compilar.sh mi_documento.tex` y revisaste el PDF.
