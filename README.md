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
   | Próximamente | Marcalo para mostrar la tarjeta gris sin foto |

5. Guardá.

Entre 1 y 2 minutos después el sticker ya está en la web. No hay que avisarle a nadie.

### Para cambiar un precio o el stock

Mismo lugar: abrí el sticker de la lista, cambiá el número, guardá.

### Para borrar un sticker

Abrí la lista y eliminá el ítem. La foto queda guardada en `assets/` por si la querés usar después.

## Detalles técnicos

- **`products.json`** — el catálogo completo. Es lo único que edita el CMS.
- **`app.js`** — dibuja las tarjetas a partir de ese JSON, y maneja carruseles y modal de pedido.
- **`index.html`** — la estructura del sitio. La sección de stickers está vacía a propósito: la llena `app.js`.
- **`.pages.yml`** — define el formulario que ve PagesCMS.
- **`.github/workflows/webp.yml`** — al subir un JPG o PNG a `assets/`, genera el `.webp` y lo commitea solo. Las tarjetas usan un `<picture>` que sirve el WebP y cae al original si no existe.

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
