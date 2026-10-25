# CLAUDE.md

Sitio de **INERCIA.**, el estudio de diseño gráfico de Luisina en Tandil: catálogo de stickers,
cuadros musicales, tatuajes temporales y portfolio. Publicado en GitHub Pages. La diseñadora carga y
edita los stickers sola desde **Pages CMS** (pagescms.org), sin tocar código: todo lo que ella edita
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
index.html        # toda la estructura; las secciones fijas (cuadros, tatuajes, recitales, portfolio) se editan acá a mano
style.css         # estilos, numerados por sección
app.js            # dibuja el catálogo de stickers desde products.json; carruseles, visor de fotos, modal de pedido y nav mobile
products.json     # catálogo de stickers + lista de categorías. Es lo único que edita Pages CMS
.pages.yml        # el formulario que ve la diseñadora en Pages CMS
assets/           # imágenes; Pages CMS sube las fotos acá
.github/workflows/
  webp.yml               # al subir un JPG/PNG a assets/, genera el .webp y lo commitea
  validar-catalogo.yml   # falla si un sticker no "próximamente" no tiene foto o apunta a una que no existe
```

## Cómo funciona el catálogo

- `renderCatalogo()` en `app.js` recorre `categorias` de `products.json` en orden y, por cada una,
  filtra los `productos` con ese `categoria`. **Una categoría sin stickers no se muestra** (ni el
  chip ni la sección).
- Dentro de cada categoría, `orden` es la posición absoluta (1 = primera); los que no lo tienen
  conservan el orden del JSON y se corren. Ver `acomodar()`.
- `artista` solo tiene efecto en `sticker-artistas`: agrupa bajo un subtítulo.
- `stock: 0` saca el botón Comprar. `proximamente: true` muestra la tarjeta gris sin foto.
- Las tarjetas usan `<picture>` con el `.webp`; `conRespaldo()` cae al JPG/PNG original si el WebP
  todavía no existe.
- **Pedidos:** el botón Comprar abre un modal que envía por FormSubmit
  (`formsubmit.co/ajax/inerciadisenografico@gmail.com`, en `index.html`). No hay pago online.

### Categoría nueva de stickers

Siempre en dos lugares, con el mismo `id` (`sticker-xxx`):

1. `products.json` → `categorias`: `{ "id", "titulo" }`. El orden de esa lista es el orden en la web.
2. `.pages.yml` → opciones del campo `categoria`, para que aparezca en el desplegable.

Y actualizar la lista de categorías de la tabla del `README.md`.

## Convenciones

- **Copy en español rioplatense** (voseo: "Consultanos", "Escribinos"). Meses en minúscula
  ("11 de septiembre"). Las fechas de recitales van sin año.
- Títulos de secciones y categorías en Title Case ("Cuadros Musicales", "Planchas Personalizadas").
- Los links de consulta van a `https://instagram.com/inercia.design`.
- **Un mismo sticker en dos categorías se duplica en `products.json`** (pasa con las planchas LUX
  de Rosalía, en Artistas y en Planchas Personalizadas). Cada copia tiene su propio stock: no se
  sincronizan.
- Las secciones sin contenido todavía (Tatuajes Temporales) llevan "Próximamente." como tagline y
  el link de consulta.
- Recitales: los próximos van en `.events-grid`; los pasados en `.events-grid-past` con
  `event-card is-past`, el más reciente primero.
- **No editar `products.json` con formato distinto al que guarda Pages CMS** (2 espacios), para no
  ensuciar los diffs de sus commits.
- Los commits "via Pages CMS" son de la diseñadora: antes de trabajar, `git pull`.
- **Al editar archivos por script en Windows, leer y escribir como UTF-8 sin BOM.**

## Dónde quedó (25 de octubre de 2026)

- Se agregó la sección **Tatuajes Temporales** (vacía, "Próximamente."), el ítem en "¿Qué
  hacemos?" y el link "Tatuajes" en el menú.
- Rata Blanca pasó a "Ya estuvimos" (11 de septiembre). No hay recitales próximos: la grilla de
  próximos está vacía.
- "Lonas" sumado a la lista de otros trabajos del portfolio.
- Nueva categoría **Planchas Personalizadas** (`sticker-planchas`) con copias de las dos planchas
  LUX de Rosalía.

## Pendientes

| Qué | Hoy | Qué necesita |
|---|---|---|
| Recitales próximos | Grilla vacía; quedan título y texto | Decidir si se muestra un aviso ("Próximamente nuevas fechas") o se oculta mientras no haya |
| Planchas LUX en "Personalizadas" | Son un diseño fijo, no personalizado | Confirmar si quedan ahí |
| Stock duplicado | Las planchas LUX tienen stock en dos entradas | La diseñadora tiene que bajarlo en las dos al vender |
| `assets/slogan.png` | Hay un comentario en `index.html` pidiendo reemplazarlo por el archivo real | Confirmar que es el definitivo |
