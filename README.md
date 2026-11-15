# No te regalés

Sitio estático (HTML, CSS y JS vanilla, sin dependencias; un script de ~15 líneas arma `dist/`) con un checklist de 3 tareas de protección para celulares, opcionales y una página de emergencia (`/emergencia/`) que funciona sin JavaScript. Lo publicable se genera en `dist/` (no se commitea).

## Previsualizar

```bash
npm run build && python3 -m http.server 8000 -d dist
```

Abrí http://localhost:8000/

## Estructura

```
src/
  index.html, 404.html, emergencia/   páginas (usan <!--include ruta--> para armarse)
  tareas/*.html                       una tarea por archivo (el orden se define en index.html)
  partials/footer.html                footer y fecha "Revisado", una sola vez
  css/NN-*.css                        se concatenan por orden alfabético en style.css
  js/                                 app.js y logic.js (módulos nativos)
  public/                             favicon, og.png e imágenes, se copian tal cual
build.mjs                             src/ → dist/
```

## Editar contenido

Cada tarea es `src/tareas/<id>.html`; para agregar una, creá el archivo e incluilo en `src/index.html`. Si cambiás algo, actualizá "Revisado: <mes año>" en `src/partials/footer.html`. Mantené el marcado de las tareas: `app.js` y los tests lo leen.

## Vista previa al compartir (WhatsApp, redes)

Título, descripción e imagen salen de las etiquetas `og:*` del `<head>` de `src/index.html` y `src/emergencia/index.html`. La imagen es `src/public/og.png` (1200×630, PNG: WhatsApp no acepta SVG). Para cambiarla, editá `docs/og-image.svg` y regenerala:

```bash
chromium --headless --no-sandbox --hide-scrollbars --window-size=1200,630 \
  --screenshot=src/public/og.png file://$PWD/docs/og-image.svg
```

Si cambiás el tiempo de las tareas principales, actualizá "15 minutos" en la descripción y en el SVG. WhatsApp guarda la vista previa de cada link: para ver un cambio, compartí el link con un parámetro nuevo (`?v=2`).

## Tests

```bash
npm test
```

Requiere Node 20 o más nuevo.

## Publicar

**Cloudflare Pages:** conectá el repo, poné `npm run build` como build command y `dist` como output directory. Después conectá tu dominio propio (corto y fácil de tipear: en una emergencia hay que escribirlo en otro dispositivo).

**GitHub Pages (alternativa):** publicá `dist/` con GitHub Actions (ver `.github/workflows/pages.yml`: `npm run build`, `npm test` y sube `path: dist`).

`404.html` usa rutas absolutas (`/`, `/emergencia/`): asume dominio propio.

Antes de cada publicación, revisá `VERIFICAR.md`.
