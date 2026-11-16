# CLAUDE.md

Sitio de **INERCIA.**, el estudio de diseño gráfico de Luisina en Tandil: catálogo de stickers,
tatuajes temporales y portfolio. Publicado en GitHub Pages. La diseñadora carga y
edita los stickers y los trabajos del portfolio sola desde **Pages CMS** (pagescms.org), sin tocar código: todo lo que ella edita
tiene que seguir siendo editable desde ahí.

**Para retomar el trabajo, leer primero "Dónde quedó" y "Pendientes".**

## Comandos

No hay build, dependencias, tests ni linter. Para verlo en local hace falta un servidor:
`index.html` abierto con doble clic (`file://`) no puede hacer `fetch` de `products.json` y la
sección de stickers queda vacía.

```bash
python -m http.server 8000   # http://localhost:8000
```

También sirve Live Server de VS Code o `npx serve`.

## Stack

HTML + CSS + JS planos, sin frameworks ni bundler.

```
index.html        # toda la estructura; los textos de las secciones, tatuajes y recitales se editan acá a mano
style.css         # estilos, numerados por sección
app.js            # dibuja stickers y trabajos desde products.json; carruseles, visor de fotos, modal de pedido y nav mobile
content/          # un JSON por sticker (stickers/), categoría (categorias/) y trabajo (trabajos/). Es lo único que edita Pages CMS
products.json     # GENERADO por scripts/armar-catalogo.js desde content/. No editar a mano
scripts/armar-catalogo.js  # valida content/ y arma products.json (correrlo en local tras tocar content/)
.pages.yml        # el formulario que ve la diseñadora en Pages CMS
assets/           # imágenes; Pages CMS sube las fotos acá
.github/workflows/
  webp.yml               # al subir un JPG/PNG a assets/, genera el .webp y lo commitea
  catalogo.yml           # corre armar-catalogo.js: valida (foto, categoría) y commitea products.json
```

## Cómo funciona el catálogo

- `renderCatalogo()` en `app.js` recorre `categorias` de `products.json` en orden y, por cada una,
  filtra los `productos` con ese `categoria`. **Una categoría sin stickers no se muestra** (ni el
  chip ni la sección).
- Dentro de cada categoría, `orden` es la posición absoluta (1 = primera); los que no lo tienen
  siguen el orden de nombre de archivo en content/stickers/ (migrados "001-...", nuevos "AAAAMMDD-...") y se corren. Ver `acomodar()`.
- `artista` solo tiene efecto en `sticker-artistas`: agrupa bajo un subtítulo.
- `stock: 0` saca el botón Comprar. `proximamente: true` muestra la tarjeta gris sin foto.
- Las tarjetas usan `<picture>` con el `.webp`; `conRespaldo()` cae al JPG/PNG original si el WebP
  todavía no existe.
- **Pedidos:** el botón Comprar abre un modal que envía por FormSubmit
  (`formsubmit.co/ajax/inerciadisenografico@gmail.com`, en `index.html`). No hay pago online.

### Categoría nueva de stickers

La diseñadora la crea sola en Pages CMS (colección Categorías: `titulo`, `id` `sticker-xxx`, `orden`). El desplegable del sticker es un campo `reference` a esa colección.

### Trabajos (portfolio)

- `content/trabajos/*.json` → `trabajos` en `products.json`. Campos: `titulo`, `seccion`
  (`identidad` | `flyers` | `otros`), `tipo` opcional (se muestra bajo el título), `imagen`, `alt`,
  `orden`, `proximamente`.
- `renderTrabajos()` llena cada `[data-trabajos="<seccion>"]` de `index.html` y completa con
  "Próximamente" hasta 3 tarjetas.
- Sección nueva de trabajos: agregar el valor en `SECCIONES` de `armar-catalogo.js`, en el select
  `seccion` de `.pages.yml` y un `<div class="product-grid" data-trabajos="...">` en `index.html`.


## Convenciones

- **Copy en español rioplatense** (voseo: "Consultanos", "Escribinos"). Meses en minúscula
  ("11 de septiembre"). Las fechas de recitales van sin año.
- Títulos de secciones y categorías en Title Case ("Tatuajes Temporales", "Planchas Personalizadas").
- Los links de consulta van a `https://instagram.com/inercia.design`.
- **Un mismo sticker en dos categorías se duplica en `content/stickers/`** (pasa con las planchas LUX
  de Rosalía, en Artistas y en Planchas Personalizadas). Cada copia tiene su propio stock: no se
  sincronizan.
- Las secciones sin contenido todavía (Tatuajes Temporales) llevan "Próximamente." como tagline y
  el link de consulta.
- Recitales: los próximos van en `.events-grid`; los pasados en `.events-grid-past` con
  `event-card is-past`, el más reciente primero.
- **Los JSON de `content/` van con 2 espacios**, como los guarda Pages CMS. `products.json` no se edita a mano.
- Los commits "via Pages CMS" son de la diseñadora: antes de trabajar, `git pull`.
- **Al editar archivos por script en Windows, leer y escribir como UTF-8 sin BOM.** En PowerShell 5,
  `Get-Content`/`Set-Content` sin `-Encoding utf8` rompen los acentos: usar Node o
  `[IO.File]::ReadAllText/WriteAllText` con `UTF8Encoding $false`.
- Las rutas de fotos pueden tener espacios y comas (las sube Pages CMS tal cual): en `srcset` se
  escapan (`crearFoto()`).
- La fuente se carga desde `@fontsource-variable/google-sans-flex/full.css` (todos los ejes): con
  `wght.css` el `'ROND' 100` del CSS no hace nada.

## Dónde quedó (16 de noviembre de 2026)

- **Catálogo migrado a un archivo por entrada** (`content/`), con `products.json` generado por
  la Action `catalogo.yml` (reemplaza a `validar-catalogo.yml`). Se perdió el arrastrar para
  reordenar: el orden es con "Posición en la fila".
- **Trabajos editables desde el CMS**: Identidad Visual, **Flyers** (sección nueva) y "También
  hacemos otras cosas". Todavía no hay ningún trabajo cargado: las tres muestran 3 "Próximamente".
- Orden de la página y del menú: Identidad Visual → Flyers → Stickers (+ Entrega) → Tatuajes →
  Y más. Recitales sigue en la página pero salió del menú.
- **Cuadros Musicales eliminado** (la foto `assets/cuadro-spinetta.*` quedó en el repo sin uso).
- Textos nuevos: presentación ("¡Hola! Soy Luisina :)"), Identidad Visual ("Tu idea, hecha
  identidad.") y Tatuajes ("Un detalle diferente para tu evento.", ya no "Próximamente.").
- Fuente redondeada (carga de todos los ejes).
- Revisado con Playwright (escritorio y celular): sin errores de consola ni de red.

## Pendientes

| Qué | Hoy | Qué necesita |
|---|---|---|
| Formulario de Pages CMS | Subido pero no probado en el panel | Confirmar que los desplegables de categoría (`reference`) y sección de trabajos muestran las opciones |
| Texto de Flyers | Lo escribió Claude ("Para que tu evento se haga ver.") | Que Luisina lo apruebe o mande el suyo |
| Trabajos | Ninguno cargado | Luisina carga sus identidades y flyers desde Trabajos |
| `assets/cuadro-spinetta.*` | Sin uso | Borrar si no se vuelve a usar |
| Recitales próximos | Grilla vacía; quedan título y texto | Decidir si se muestra un aviso ("Próximamente nuevas fechas") o se oculta mientras no haya |
| Planchas LUX en "Personalizadas" | Son un diseño fijo, no personalizado | Confirmar si quedan ahí |
| Stock duplicado | Las planchas LUX tienen stock en dos entradas | La diseñadora tiene que bajarlo en las dos al vender |
| `assets/slogan.png` | Hay un comentario en `index.html` pidiendo reemplazarlo por el archivo real | Confirmar que es el definitivo |
