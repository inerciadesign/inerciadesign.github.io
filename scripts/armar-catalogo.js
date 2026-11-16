const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const DIR_STICKERS = path.join(raiz, 'content', 'stickers');
const DIR_CATEGORIAS = path.join(raiz, 'content', 'categorias');
const SALIDA = path.join(raiz, 'products.json');

const CAMPOS_STICKER = ['nombre', 'categoria', 'artista', 'imagen', 'alt', 'precio', 'stock', 'orden', 'proximamente'];

function leerCarpeta(dir) {
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => ({ archivo: f, datos: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
}

function vacio(v) {
  return v === undefined || v === null || v === '';
}

function limpiar(obj, campos) {
  const out = {};
  for (const c of campos) if (!vacio(obj[c])) out[c] = obj[c];
  return out;
}

const errores = [];

const categorias = leerCarpeta(DIR_CATEGORIAS)
  .map(({ archivo, datos }, i) => ({ archivo, datos, pos: vacio(datos.orden) ? Infinity : Number(datos.orden), i }))
  .sort((a, b) => a.pos - b.pos || a.i - b.i)
  .map(({ archivo, datos }) => {
    if (vacio(datos.id) || vacio(datos.titulo)) errores.push(`La categoría ${archivo} no tiene ID o título.`);
    return { id: datos.id, titulo: datos.titulo };
  });

const ids = new Set(categorias.map((c) => c.id));

const productos = leerCarpeta(DIR_STICKERS).map(({ archivo, datos }) => {
  const p = limpiar(datos, CAMPOS_STICKER);
  const nombre = p.nombre || `(sin nombre, ${archivo})`;
  if (!ids.has(p.categoria)) errores.push(`"${nombre}" tiene una categoría que no existe: ${p.categoria || '(vacía)'}.`);
  if (!p.proximamente) {
    if (!p.imagen) errores.push(`"${nombre}" se quedó sin foto. Si todavía no tenés la imagen, marcalo como Próximamente.`);
    else if (!fs.existsSync(path.join(raiz, p.imagen))) errores.push(`"${nombre}" apunta a ${p.imagen}, que no existe en el repo.`);
  }
  return p;
});

const DIR_TRABAJOS = path.join(raiz, 'content', 'trabajos');
const CAMPOS_TRABAJO = ['titulo', 'seccion', 'tipo', 'imagen', 'alt', 'orden', 'proximamente'];
const SECCIONES = ['identidad', 'flyers', 'otros'];

const trabajos = (fs.existsSync(DIR_TRABAJOS) ? leerCarpeta(DIR_TRABAJOS) : []).map(({ archivo, datos }) => {
  const t = limpiar(datos, CAMPOS_TRABAJO);
  const titulo = t.titulo || `(sin título, ${archivo})`;
  if (!SECCIONES.includes(t.seccion)) errores.push(`El trabajo "${titulo}" tiene una sección que no existe: ${t.seccion || '(vacía)'}.`);
  if (!t.proximamente) {
    if (!t.imagen) errores.push(`El trabajo "${titulo}" se quedó sin foto. Si todavía no la tenés, marcalo como Próximamente.`);
    else if (!fs.existsSync(path.join(raiz, t.imagen))) errores.push(`El trabajo "${titulo}" apunta a ${t.imagen}, que no existe en el repo.`);
  }
  return t;
});

if (errores.length) {
  console.error('\nEl catálogo quedó roto:\n');
  for (const e of errores) console.error('  - ' + e);
  console.error('\nRevisá el último cambio en Pages CMS.\n');
  process.exit(1);
}

fs.writeFileSync(SALIDA, JSON.stringify({ productos, categorias, trabajos }, null, 2), 'utf8');
console.log(`${productos.length} stickers, ${categorias.length} categorías y ${trabajos.length} trabajos OK.`);
