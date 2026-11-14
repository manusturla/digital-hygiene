// Arma dist/ desde src/: resuelve <!--include ruta-->, junta css/*.css y sella los assets con un hash.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8');
const css = readdirSync(new URL('src/css/', import.meta.url)).sort().map(f => read('src/css/' + f)).join('');
const js = readdirSync(new URL('src/js/', import.meta.url)).sort().map(f => read('src/js/' + f)).join('');
const v = createHash('md5').update(css + js).digest('hex').slice(0, 8);
const page = p => read('src/' + p).replace(/<!--include (\S+?)-->/g, (_, f) => read('src/' + f).trimEnd()).replaceAll('{{v}}', v);

rmSync(new URL('dist/', import.meta.url), { recursive: true, force: true });
mkdirSync(new URL('dist/emergencia/', import.meta.url), { recursive: true });
cpSync(new URL('src/public/', import.meta.url), new URL('dist/', import.meta.url), { recursive: true });
cpSync(new URL('src/js/', import.meta.url), new URL('dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('dist/style.css', import.meta.url), css);
for (const p of ['index.html', '404.html', 'emergencia/index.html']) writeFileSync(new URL('dist/' + p, import.meta.url), page(p));
