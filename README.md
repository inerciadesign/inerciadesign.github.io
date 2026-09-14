# INERCIA. — sitio web

Sitio estático (HTML + CSS + JS, sin frameworks) publicado en GitHub Pages.

## Cómo cargar un sticker nuevo

No hace falta tocar código ni instalar nada.

1. Entrá a **[pagescms.org](https://pagescms.org)** y hacé login con tu cuenta de GitHub.
2. Elegí el repositorio del sitio.
3. Abrí **Catálogo de stickers → Stickers** y tocá el botón para agregar uno.
4. Completá los campos:

   | Campo | Qué poner |
   |---|---|
   | Nombre del diseño | Como querés que se lea en la web |
   | Categoría | Fútbol, F1, TV Argentina, Artistas o Varios |
   | Artista | Solo si elegiste Artistas. Agrupa los stickers bajo ese nombre |
   | Foto | Arrastrá el JPG o PNG. Se sube sola a `assets/` |
   | Descripción de la foto | Frase corta describiendo la imagen |
   | Precio | Solo el número, sin `$` ni puntos. Ej: `800` |
   | Unidades disponibles | Cuántas te quedan. Si ponés `0` desaparece el botón Comprar |
   | Posición en la fila | Opcional. El lugar que ocupa en su categoría: `1` primero, `3` tercero. Vacío = donde caiga |
   | Próximamente | Marcalo para mostrar la tarjeta gris sin foto |

5. Guardá.

Aproximadamente un minuto después el sticker ya está en la web. No hay que avisarle a nadie.

Si entrás al sitio y todavía lo ves como antes, es el caché del navegador: puede tardar hasta 10 minutos en soltarlo. Con `Ctrl + Shift + R` (o `Cmd + Shift + R` en Mac) lo ves al instante.

### Para cambiar un precio o el stock

Mismo lugar: abrí el sticker de la lista, cambiá el número, guardá.

### Para cambiar el orden en que aparecen

Hay dos formas.

**La fácil: arrastrar.** En la lista de stickers, cada fila tiene una manijita de puntitos a la izquierda. Arrastrala para mover el sticker de lugar y guardá.

**La otra: el campo "Posición en la fila".** El número es el lugar exacto que va a ocupar dentro de su categoría: `1` lo pone primero, `3` lo pone tercero.

- Los que **no** tengan número mantienen el orden en que están y se corren para dejar lugar.
- El número cuenta **por categoría**: el `1` de Fútbol y el `1` de Varios no compiten entre sí.
- Si ponés un número más grande que la cantidad de stickers de esa categoría, va al final.

No hace falta numerar todos: alcanza con numerar los que querés fijar adelante y dejar el resto vacío.

### Para borrar un sticker

Abrí la lista y eliminá el ítem. La foto queda guardada en `assets/` por si la querés usar después.

## Detalles técnicos

- **`products.json`** — el catálogo completo. Es lo único que edita el CMS.
- **`app.js`** — dibuja las tarjetas a partir de ese JSON, y maneja carruseles y modal de pedido.
- **`index.html`** — la estructura del sitio. La sección de stickers está vacía a propósito: la llena `app.js`.
- **`.pages.yml`** — define el formulario que ve PagesCMS.
- **`.github/workflows/webp.yml`** — al subir un JPG o PNG a `assets/`, genera el `.webp` y lo commitea solo.

Las tarjetas usan un `<picture>` que sirve el WebP. Ojo: el navegador elige el `<source>` por tipo de archivo, no por disponibilidad, así que un `.webp` faltante deja la imagen rota en vez de caer al original. Por eso `app.js` engancha un `onerror` que descarta el `<source>` y reintenta con el JPG — así una foto recién subida se ve aunque su WebP todavía no exista.

Dentro de cada categoría, `orden` es la posición absoluta que pide la tarjeta (1 = primera). Los que no lo declaran conservan el orden de `products.json` y se corren para dejar lugar. Ver `acomodar()` en `app.js`.

### Categorías nuevas

Agregar una categoría requiere dos pasos manuales:

1. En PagesCMS, sección **Categorías**: agregar `id` (ej: `sticker-musica`) y `titulo`.
2. En `.pages.yml`, agregar ese mismo `id` a la lista de opciones del campo `categoria`, para que aparezca en el desplegable.

El chip de navegación se genera solo, y la categoría solo aparece en la web si tiene al menos un sticker.

### Desarrollo local

`index.html` ya no se puede abrir con doble clic: el navegador bloquea la lectura de `products.json` desde `file://`. Levantá un servidor:

```bash
python -m http.server 8000
```

Y entrá a `http://localhost:8000`.
