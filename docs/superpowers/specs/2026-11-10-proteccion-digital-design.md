# Protección digital 101: diseño

Fecha: 2026-11-10

## Intención

Página web para que el autor la comparta por link (WhatsApp) con familiares en Argentina, personas sin perfil técnico. Objetivo: protegerse de dos amenazas comunes:

1. **Ingeniería social**: llamadas o mensajes que engañan para obtener el código de WhatsApp, contraseñas, etc.
2. **Robo del celular**: el ladrón obliga a desbloquearlo o lo usa desbloqueado para sacar préstamos y transferir plata (Mercado Pago, bancos).

Caso que la motivó: a un familiar le hubiera servido tener el PIN de WhatsApp, 2FA en el mail y los links de bloqueo remoto a mano.

**El por qué que guía todo:** si es complicado, nadie lo hace. El mensaje es "hacé estas 2-3 cosas y ya estás más protegido", no "nunca vas a estar del todo seguro".

## Objetivos

- Que alguien sin experiencia complete las 3 tareas básicas en ~15 minutos desde el celular.
- Que en una emergencia (robo/estafa) encuentre qué hacer en segundos, incluso desde un celular prestado o una compu.
- Fácil de actualizar para el autor (editar y `git push`).

## No objetivos

- Cubrir todo lo posible sobre seguridad. Lo avanzado queda como opcional o afuera.
- Instrucciones por banco específico.
- Cuentas de usuario, backend, analytics.
- Abrir pantallas de Ajustes directamente desde la web: investigado, **no es posible** (ver "Links").

## Anti-objetivos (sería un fracaso aunque funcione)

- Que abrume: demasiado texto, demasiadas opciones, sin saber por dónde empezar.
- Tono alarmista o de culpa.
- Jerga técnica sin explicar ("2FA", "IMEI" sin aclaración).

## Audiencia y contexto de uso

- Familiares, Argentina, mayormente en el celular (Android mayoría, algunos iPhone).
- Lo recorren a su tiempo, solos, sin ayuda.
- Idioma: español rioplatense con voseo ("tocá", "abrí").

## Estructura y flujo (decidido con el autor, ver boceto `layout-v2.html`)

### Portada = checklist

1. **Botón rojo de emergencia** arriba de todo: "¿Te robaron el celu o te estafaron?" → pantalla de emergencia.
2. **"Empezá por acá"**: 3 tareas, ~15 min, con contador "X de 3 hechas". Cada tarea: título, tiempo estimado, botón "Hacerlo ahora →". Las hechas quedan en verde con ✓.
3. **"¿Querés un poco más?"**: tareas opcionales, mismo formato.
4. Aviso fijo: *"Nadie de un banco, Mercado Pago o WhatsApp te va a pedir un código por teléfono. Si te lo piden, cortá."*
5. Pie: "Revisado: <mes año>" (una fecha para toda la página, no por paso).

### Guía de tarea ("Hacerlo ahora")

- Un paso por pantalla, barra de progreso ("Paso 2 de 4"), Atrás / Siguiente, "← Volver a la lista" siempre visible.
- Selector Android / iPhone donde los pasos difieren. Se elige una vez y queda recordado. *(Mi decisión: detectar el sistema por user agent como valor inicial.)*
- Pasos en **texto corto**. Sin capturas por ahora (decidido con el autor); se pueden agregar después en WhatsApp y Mercado Pago, donde la pantalla es igual para todos.
- En Ajustes de Android, siempre ofrecer el atajo **"tocá la lupa 🔍 y escribí *<palabra>*"**, porque los menús cambian según la marca (Samsung, Motorola, Xiaomi).
- Cuando una tarea es web, botón con link directo a la pantalla exacta. Cuando es una app, botón "Abrir WhatsApp/Mercado Pago" si es viable (ver "Links") + pasos.

### Al terminar una tarea

- Pantalla "¡Listo! <qué ganaste en una frase>", se tilda sola, y ofrece "Seguir: <próxima pendiente> →" o "Volver a la lista". Al completar las 3: mensaje de felicitación y oferta de los opcionales.

### Tareas que no aplican *(mi decisión)*

- No hay botón "No aplica". Si algo no corresponde (p. ej. no usa Mercado Pago), la persona toca "¡Terminé!" y sigue; la tarea de Mercado Pago lo dice en el primer paso. No hay "Desmarcar": reabrir una tarea hecha muestra la misma guía y el último paso dice "Volver a la lista".
- Tarea 3 (Mercado Pago): bajar el límite de transferencias y cancelar la línea de crédito (irreversible, con aviso y opción de saltear). "Persona de confianza" pasó a opcional.

### Persistencia

- Progreso y sistema elegido en `localStorage`, solo en ese navegador. Si falla (navegación privada), la página funciona igual sin recordar.

## Contenido

### Empezá por acá (orden fijo)

1. **Bloqueo antirrobo del celular**
   - Android: "Bloqueo por detección de robo" (se bloquea si te lo arrancan de la mano) + "Bloqueo del dispositivo sin conexión". Incluir "Bloqueo remoto" si está disponible.
   - iPhone: "Protección de dispositivo robado".
   - Aclarar requisitos de versión mínima si aplican.
2. **PIN de WhatsApp** (verificación en dos pasos), con mail de recuperación.
3. **Mercado Pago**: bajar límite de transferencias y línea de crédito / préstamos disponibles.

### ¿Querés un poco más? (opcionales, en este orden)

1. No guardar contraseñas en el navegador del celular (y cómo borrar las guardadas).
2. Contraseñas distintas + frases de contraseña (concepto, sin herramientas).
3. Gestor de contraseñas (recomendar 1 opción gratuita, sin comparativas).
4. 2FA en el mail + códigos de respaldo impresos/anotados ("2FA sin celular": si te roban el celu, igual podés entrar). El autor lo dejó como opcional por ser más complejo.

### Emergencia ("Qué hacer ya", en orden, botones grandes)

1. **Bloqueá el celular a distancia**: links a Encontrar mi dispositivo (Google) y Buscar (iCloud). Aclarar que se puede desde otra compu o celular.
2. **Llamá a tu compañía** (Personal, Claro, Movistar) para bloquear la línea/chip, así no reciben tus códigos por SMS. Números de cada una.
3. **Mercado Pago**: cómo bloquear cuenta/tarjeta (concreto). **Bancos**: genérico, "llamá al número que figura al dorso de tu tarjeta".
4. **WhatsApp**: pedir desactivación por mail ("Perdido/robado: desactiven mi cuenta" + número) y avisar a tus contactos que no respondan pedidos de plata.
5. **Cambiá la contraseña del mail** desde otro dispositivo.
6. **Hacé la denuncia** y pedí el bloqueo del IMEI a la compañía (explicar IMEI en una línea).

### Mail: solo Gmail (decidido por el autor)

Todo lo relacionado con mail (mail de recuperación de WhatsApp, opcional 2FA + códigos de respaldo, emergencia "cambiá la contraseña") cubre **solo Gmail** por ahora. Sin selector de proveedor. Otros proveedores pueden sumarse más adelante.

### Verificación del contenido (obligatoria)

Todos los nombres de menús, pasos, números de teléfono, links y procedimientos (WhatsApp desactivación, MP, compañías, IMEI/denuncia) deben verificarse contra fuentes oficiales actuales al armar la página. Si algo no se puede verificar, se marca para que el autor lo confirme, no se inventa.

*(Mi decisión)* Lo no verificado va a un archivo aparte `VERIFICAR.md` (no visible en la página), con qué probar y dónde. **Nada sin verificar se publica** en tareas principales ni emergencia; los opcionales pueden salir con el dato dudoso omitido. Lo que solo se prueba en un celular real (botones "Abrir app", detección Android/iPhone, nombres de menús por marca) lo prueba el autor antes de publicar.

## Links: qué se puede y qué no (investigado)

- **No se puede** abrir pantallas de Ajustes desde la web. Android/Chrome solo abre actividades `BROWSABLE` (Ajustes no lo es); iOS `App-prefs:` no está documentado y se rompió en iOS 18. WhatsApp y Mercado Pago no tienen deep links públicos a pantallas de configuración.
- **Sí se puede**: links web directos (p. ej. `myaccount.google.com/signinoptions/two-step-verification`, `google.com/android/find`, `icloud.com/find`) y, posiblemente, abrir la app de WhatsApp/MP (a probar en un celular real; si no anda, se omite el botón).

## Restricciones técnicas

- Sitio estático: HTML + CSS + un poco de JS vanilla. Sin framework, sin build, sin dependencias.
- Hosting: Cloudflare Pages o GitHub Pages, deploy automático desde Git (el autor tiene ambos). No hostear en la compu del autor.
- **Dominio propio corto y fácil de tipear** (decidido por el autor: lo compra). Motivo: en una emergencia el link de WhatsApp está en el celular robado y hay que tipear la dirección en otro dispositivo.
- *(Mi decisión)* La emergencia es una **página aparte** con dirección tipeable (`/emergencia`), autosuficiente: sin JavaScript, sin depender del progreso guardado. Enlazada desde el botón rojo de la portada.
- Mobile-first y responsive; usable también en desktop.
- Accesible: letra grande (≥16px), buen contraste, botones grandes, funciona sin JS en lo esencial (al menos la emergencia y el contenido de las tareas legibles).
- Sin trackers ni recursos de terceros (es una página de seguridad).

## Decisiones mías (a revisar por el autor)

- Estilo visual: tranquilo, amable, nada alarmista salvo el botón rojo de emergencia.
- Nombre provisorio del sitio: "Protección digital 101".
- Detección de Android/iPhone por user agent como valor inicial del selector.
- Recomendación concreta de gestor de contraseñas: la elige el builder con criterio "gratis y simple" (p. ej. Bitwarden o el de Google), una sola.

## Queda para el builder

- Organización de archivos, diseño visual concreto, copy final de cada paso (respetando tono y brevedad).
- Cómo se representa cada tarea en el código (datos vs. HTML).
