# Para verificar antes de publicar

Cosas que solo se confirman en un celular real o que no tuvieron fuente oficial. Nada de esto está en las tareas principales ni en la emergencia.

## En celular real
- [ ] Botones "Abrir app": no hay botón `wa.me` ni `intent://` en el sitio (no se pudo confirmar que abran la app de WhatsApp). Probar y, si funcionan, agregarlos.
- [ ] Botones de Mercado Pago (links universales oficiales copiados de mercadopago.com.ar/seguridad: "Agregar personas de confianza" y "Revisar métodos de verificación"): probar en Android e iPhone con la app instalada, y en uno sin la app. Esperado: abren la pantalla correspondiente o piden iniciar sesión.
- [ ] Detección Android/iPhone: abrir el sitio en Android, iPhone, iPad y compu. Esperado: Android/iPhone/iPhone(iPad)/Android con selector visible.
- [ ] Nombres de menús en Samsung, Motorola y Xiaomi: "Protección ante robo", "Bloqueo por detección de robo", "Bloqueo de dispositivo sin conexión", "Bloqueo remoto". Probar la lupa con "Protección ante robo". La fuente de Google usa "Configuración > Google > Todos los servicios", y dice que algunos pasos solo andan en Android 10+; no indica versión de Play services.
- [ ] iPhone: ruta Configuración > Face ID y código > "Protección del dispositivo en caso de robo" (la fuente dice iOS 17.3+). Confirmar el nombre exacto en español de Argentina.
- [ ] WhatsApp: en la app de hoy, ¿pide PIN de 6 números o contraseña? (WhatsApp está pasando de PIN a contraseña.) Confirmar los textos "Tú" (iPhone), "Activar verificación en dos pasos", y qué hace "Confiar en este dispositivo" (el sitio no lo menciona).
- [ ] iPhone: confirmar que apagar "Autorrelleno de contraseñas y llaves de acceso" (Configuración > General > Autorrelleno y contraseñas) detiene el guardado; la fuente solo describe cómo activarlo.
- [ ] Bitwarden: textos en español de "Autocompletar" dentro de la app (la fuente está en inglés: Settings > Autofill).
- [ ] Gmail: los códigos de respaldo en el celu (la fuente describe la compu); el menú hoy puede decir "Seguridad" en vez de "Seguridad y acceso" (usado en el paso 5 de emergencia).
- [ ] Marcar `*910` desde un celu de otra compañía y desde un fijo (ENACOM dice "desde cualquier teléfono"). En la página va como texto, no como link `tel:`, porque `*` en `tel:` no es confiable.

## Sin fuente oficial (omitido del sitio)
- [ ] Mercado Pago: bajar el límite de transferencias o la línea de crédito/préstamos. No hay fuente oficial accesible (las páginas de ayuda dan 403 al consultar desde acá). Por eso la tarea 3 es "persona de confianza". Si existe en la app, evaluar sumarlo.
- [ ] Mercado Pago: ruta exacta en la app para persona de confianza (una nota de prensa dice Mi perfil > Seguridad > Persona de confianza, hasta 5 personas); el sitio usa el botón oficial en lugar de la ruta.
- [ ] Mercado Pago: bloquear tarjeta (débito/prepaga) y qué hace exactamente "Me robaron" (la ayuda oficial parece decir que cierra sesiones y desvincula dispositivos). Páginas de ayuda dan 403.
- [ ] Mercado Pago: si "Me robaron" (ato-complaint) funciona desde otro dispositivo sin tener la sesión abierta.
- [ ] Personal: número propio para bloquear línea (personal.com.ar no se pudo consultar; notas de prensa dicen *111 / 0800-444-0800). El sitio manda al *910 de ENACOM.
- [ ] Bancos: solo se dice "al dorso de tu tarjeta" (genérico a propósito).
- [ ] Dónde hacer la denuncia (comisaría u online): no se verificó un canal oficial; el sitio solo dice "hacé la denuncia policial".
- [ ] Android: versión mínima exacta de cada función (la fuente dice Android 10+ para algunos pasos y Android 15+ en un aviso general).

## Cambio respecto de la spec
- WhatsApp: la spec pedía "pedir desactivación por mail". La ayuda oficial dice que WhatsApp no puede desactivar la cuenta ni por mail ni desde otro dispositivo. La emergencia usa el procedimiento oficial (bloquear SIM, chip nuevo con el mismo número, volver a registrar).
