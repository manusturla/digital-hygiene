# Protección digital 101

Sitio estático (HTML, CSS y JS vanilla, sin build ni dependencias) con un checklist de 3 tareas de protección para celulares, opcionales y una página de emergencia (`/emergencia/`) que funciona sin JavaScript. Todo lo publicable está en `site/`.

## Previsualizar

```bash
python3 -m http.server 8000 -d site
```

Abrí http://localhost:8000/

## Editar contenido

Editá `site/index.html` y `site/emergencia/index.html`. Si cambiás algo, actualizá "Revisado: <mes año>" en **todas** las páginas (hay un test que exige que sean iguales). Mantené el marcado de las tareas: `app.js` y los tests lo leen.

## Tests

```bash
npm test
```

Requiere Node 20 o más nuevo.

## Publicar

**Cloudflare Pages:** conectá el repo, dejá el build command vacío y poné `site` como output directory. Después conectá tu dominio propio (corto y fácil de tipear: en una emergencia hay que escribirlo en otro dispositivo).

**GitHub Pages (alternativa):** publicá `site/` con GitHub Actions usando `actions/upload-pages-artifact` con `path: site` y `actions/deploy-pages`.

`404.html` usa rutas absolutas (`/`, `/emergencia/`): asume dominio propio.

Antes de cada publicación, revisá `VERIFICAR.md`.
