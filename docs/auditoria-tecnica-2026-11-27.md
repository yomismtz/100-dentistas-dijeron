# Auditoría técnica de la aplicación — 2026-11-27

## Alcance y estado

- Repositorio: `yomismtz/asi-los-dentistas-lo-dijeron`.
- Rama revisada: `chatgpt/recovery-2026-09-22`.
- Commit de referencia revisado: `738162cc69bebfe5664b4aaec27b0dfcc11767f0`.
- Compilación asociada al último commit: GitHub Actions run `46031384007`, finalizado con éxito.
- Se revisaron el manifiesto Android, configuración Gradle, `MainActivity.java`, `ClassroomWebSocketServer.java`, HTML principal, módulos JavaScript de juego/aula/investigación, validadores Python y workflow de compilación.
- Esta auditoría fue estática sobre el código de la rama. No se instaló el APK en un teléfono, no se ejecutó un emulador ni se realizó una prueba de penetración en una red real.
- No se modificó código de la aplicación, no se tocó `main` y no se hizo merge. Este archivo documenta hallazgos y prioridades.

## Resumen ejecutivo

La aplicación compila y los validadores incluidos en CI terminan correctamente. La arquitectura principal combina una WebView local con dos servidores TCP (HTTP y WebSocket) para el modo aula, además de almacenamiento local para partidas, resultados y configuración.

**No recomiendo usar todavía el modo aula para una evaluación académica de alto impacto ni recopilar datos de investigación como si la deduplicación de respuestas fuera una garantía.** Se encontraron debilidades de autenticación y transporte en la red local, y la batería de pruebas actual es principalmente estática. La partida individual sin conexión y la compilación pueden probarse, pero el modo multi-dispositivo requiere corregir y verificar los hallazgos prioritarios.

## Hallazgos

### H-01 — Servidores de aula expuestos a todas las interfaces de red
**Severidad: ALTA**

Evidencia:
- `MainActivity.java`: `new ServerSocket(port)` para el servidor HTTP local.
- `ClassroomWebSocketServer.java`: `new ServerSocket(port)` para WebSocket.
- Los servicios usan los puertos 8787 y 8788 y publican la dirección IPv4 local.

Un `ServerSocket(int)` sin dirección local explícita escucha en las interfaces disponibles. Esto amplía la superficie de exposición a cualquier dispositivo que alcance la red del teléfono, no únicamente a los celulares que participan en la actividad.

Impacto posible: lectura de estado del juego, envío de pulsaciones o respuestas no autorizadas, intentos contra el control docente y consumo de recursos del proceso.

Recomendación:
1. Vincular ambos sockets a la interfaz/dirección IPv4 de la red local seleccionada, no a todas las interfaces.
2. Requerir un token de sesión aleatorio para cada cliente y separar permisos de equipo, examen, referencia y docente.
3. Cerrar ambos servicios al salir del modo aula, no solo al destruir la Activity.
4. Documentar que el aula debe operar en una red controlada y sin invitados.

### H-02 — Examen individual sin autenticación robusta y deduplicación evadible
**Severidad: ALTA**

Evidencia:
- El endpoint HTTP `/api/exam` acepta respuestas sin PIN ni token.
- El WebSocket acepta clientes con `role=exam` sin autenticación.
- La clave de deduplicación se obtiene de `device`, valor enviado por el propio navegador.
- `LocalClassroomServer` y `ClassroomWebSocketServer` mantienen conjuntos `examSubmissions` independientes.

Impacto posible:
- Un cliente puede cambiar el identificador `device` y enviar más de una respuesta.
- Una respuesta puede aceptarse por HTTP y otra por WebSocket porque las listas de duplicados no se comparten.
- Un dispositivo ajeno a la actividad puede inyectar respuestas en la sesión.

La deduplicación actual evita algunos envíos repetidos desde el mismo navegador sin manipulación; no prueba una participación única por estudiante.

Recomendación:
1. Emitir desde el anfitrión un token aleatorio de inscripción por alumno/dispositivo y validarlo en ambos transportes.
2. Mantener una única tabla de inscripciones y respuestas compartida por HTTP y WebSocket.
3. Asociar cada envío a un identificador de sesión y de pregunta/ronda generado por el servidor.
4. Rechazar envíos fuera de la ventana de respuesta y limitar tamaño/frecuencia.
5. Registrar intentos duplicados y rechazos sin almacenar más datos personales de los necesarios.

### H-03 — PIN docente de cuatro dígitos sin limitación de intentos
**Severidad: ALTA**

Evidencia:
- El PIN se genera con cuatro dígitos (`0000`–`9999`).
- Se comprueba en `/api/teacher-state`, `/api/cmd` y en el handshake WebSocket.
- No se observó bloqueo progresivo, límite de intentos ni caducidad de sesión.
- En el modo HTTP el PIN se envía como parámetro de consulta; la conexión local es HTTP sin cifrar.

Impacto posible: adivinación automatizada en la LAN y exposición del PIN a quien pueda observar el tráfico local.

Recomendación:
1. Sustituir el PIN corto por un token aleatorio de al menos 128 bits, generado por sesión.
2. Si se conserva un PIN para facilidad de uso, limitar intentos, introducir espera progresiva y regenerarlo al cerrar el aula.
3. Evitar enviar credenciales en URL; usar un intercambio autenticado en el cuerpo de una petición y una sesión temporal.
4. No presentar el PIN en una pantalla que pueda proyectarse; la advertencia actual depende del comportamiento del docente.

### H-04 — Tráfico HTTP/WebSocket sin cifrado
**Severidad: ALTA en redes compartidas; MEDIA en una red aislada y controlada**

Evidencia:
- `AndroidManifest.xml` establece `android:usesCleartextTraffic="true"`.
- Los clientes usan `http://` y `ws://`.
- El PIN y los comandos docentes pueden circular por esa red sin protección criptográfica.

Impacto posible: interceptación o modificación del tráfico por otro participante de la misma red. La documentación de Android advierte que el tráfico cleartext carece de confidencialidad, autenticidad e integridad.

Recomendación:
- Para un producto de uso general, diseñar transporte autenticado y cifrado.
- Si el modo offline conserva HTTP por compatibilidad, limitarlo a una red local aislada, con tokens por sesión y sin enviar información sensible.
- No mantener la excepción global sin justificarla. Evaluar una configuración de seguridad de red acotada a lo estrictamente necesario.

Referencia: Android Developers, “Cleartext communications” y “Network security configuration”:
- https://developer.android.com/privacy-and-security/risks/cleartext-communications
- https://developer.android.com/privacy-and-security/security-config

### H-05 — Posible agotamiento de recursos por conexiones TCP
**Severidad: MEDIA**

Evidencia:
- Ambos servidores crean un hilo por conexión entrante.
- No se observó un límite explícito de clientes concurrentes.
- No se observó `Socket.setSoTimeout` en la lectura de peticiones o frames.
- El servidor HTTP bloquea al leer la primera línea; WebSocket bloquea al completar cabeceras/frames.

Impacto posible: conexiones lentas o abiertas pueden mantener hilos y sockets ocupados; en una LAN hostil puede degradarse o bloquearse el modo aula.

Recomendación:
1. Definir timeout de lectura y escritura.
2. Limitar conexiones concurrentes y tamaño de mensajes.
3. Usar un executor acotado en lugar de crear hilos ilimitados.
4. Rechazar handshakes inválidos y cerrar clientes inactivos.

### H-06 — Superficie de ataque de WebView mayor de lo necesario
**Severidad: MEDIA; requiere confirmar navegación real**

Evidencia:
- JavaScript está habilitado y se expone `AndroidBridge` mediante `addJavascriptInterface`.
- `setAllowFileAccessFromFileURLs(true)` está habilitado.
- Se usa un `WebViewClient` sin una política explícita de navegación/origen.

Impacto posible: si en el futuro una página o frame no confiable llega a cargarse dentro de la WebView, el puente JavaScript nativo puede ampliar el impacto. La configuración de acceso entre URLs de archivo también merece restringirse.

Recomendación:
1. Permitir únicamente la carga de `file:///android_asset/` en la WebView.
2. Bloquear navegación HTTP/HTTPS dentro de la WebView y abrir enlaces externos mediante el navegador del sistema.
3. Desactivar `setAllowFileAccessFromFileURLs` si las pruebas confirman que no es necesario.
4. Mantener `setAllowUniversalAccessFromFileURLs(false)`.
5. Reducir los métodos expuestos en el puente y validar rangos, tamaño y estado de cada operación.

### H-07 — Datos académicos locales y política de respaldo/retención
**Severidad: MEDIA; depende del tipo de datos usados**

Evidencia:
- `allowBackup="true"` en el manifiesto.
- Los módulos de investigación guardan historial, grupos, nombres de equipos, puntuaciones, preguntas, fuentes y métricas en `localStorage`.
- Se conserva un historial de hasta 250 sesiones y existe exportación CSV/XLS.
- No se identificó en la portada un control visible que abra la política de privacidad: el código busca `privacyBtn`, pero el HTML revisado no contiene ese elemento.
- No se encontró en el flujo inspeccionado una función clara para borrar todo el historial de investigación.

Impacto posible: los datos pueden persistir más tiempo del esperado o formar parte de respaldos del dispositivo, según las reglas y versión de Android. En estudios con alumnos, los códigos, grupos y resultados deben tratarse con reglas explícitas de privacidad y retención.

Recomendación:
1. Definir si los datos deben incluirse en respaldos; si no, configurar reglas de backup/extracción o deshabilitar backup.
2. Añadir acceso visible a la política de privacidad.
3. Añadir acciones para borrar una sesión y borrar todo el historial, con confirmación.
4. Separar identificadores de investigación de nombres o datos identificables.
5. Documentar finalidad, consentimiento, periodo de retención y responsable del tratamiento.

### H-08 — Recuperación de partida puede restaurar el tiempo a 30 segundos tras un cero
**Severidad: MEDIA**

Evidencia:
- En `v3-core.js`, el snapshot usa `Number(timerRemaining)||v2TimerSeconds||30`.
- La restauración también usa `Number(s.timerRemaining)||30`.

El valor legítimo `0` se interpreta como ausencia de valor y se reemplaza por 30. Si la aplicación se interrumpe justo después de guardar el cero y antes de consolidar el strike, la recuperación puede devolver tiempo completo.

Recomendación:
- Distinguir ausencia de valor de cero con `Number.isFinite` o comprobación explícita de `null/undefined`.
- Al restaurar, resolver primero si el temporizador había expirado y si el strike ya fue registrado.
- Añadir pruebas de recuperación en 0, 1 y 30 segundos, tanto pausado como activo.

### H-09 — La validación CI no equivale a pruebas funcionales
**Severidad: MEDIA como brecha de aseguramiento**

Evidencia:
- `validate_questions.py` valida los archivos `questions*.json`, 476 preguntas, estructura de respuestas, ponderación y duplicados textuales normalizados.
- Ese script no recorre los 90 archivos `bank44_*.json` que también aparecen en `BANK_FILES`.
- `validate_ui_offline.py` y `validate_v3_features.py` comprueban principalmente la presencia de cadenas/código y estructura esperada.
- El workflow ejecuta `node --check`, smoke checks estáticos y compilación; no ejecuta pruebas de interacción en WebView, instrumentación Android ni pruebas de sockets multi-cliente.

Lo que sí está probado por CI: sintaxis JavaScript de los archivos enumerados, validadores estáticos, compilación `assembleDebug` y generación de `bundleRelease`.

Lo que no queda probado: que todos los botones y recorridos funcionen, que la sincronización sea correcta bajo concurrencia, que la deduplicación resista clientes múltiples, que la recuperación de partida preserve el estado y que la interfaz sea estable en distintos tamaños/dispositivos.

Recomendación:
1. Extender el validador de bancos a todos los archivos enumerados por `BANK_FILES`, o declarar y validar explícitamente qué bancos se usan en cada modo.
2. Añadir pruebas unitarias JavaScript para puntuación, temporizador, rondas, careo y restauración.
3. Añadir pruebas instrumentadas Android para WebView, permisos, ciclo de vida, TTS, importación/exportación.
4. Añadir pruebas de integración de HTTP/WebSocket: PIN incorrecto, token válido, duplicados cruzando transportes, desconexión, reconexión y concurrencia.
5. Añadir una prueba en emulador y una prueba manual en al menos un teléfono/tablet real.

### H-10 — Configuración de publicación incompleta
**Severidad: MEDIA para distribución; no bloquea la instalación del APK debug**

Evidencia:
- El workflow genera `assembleDebug` y `bundleRelease`.
- No se observa configuración de firma de publicación en `app/build.gradle`.
- El AAB generado no debe considerarse listo para subir a Play Console sin comprobar firma y configuración de claves.
- El nombre del paso del workflow dice “Set up Gradle 8.9”, pero instala Gradle 8.11.1.

Recomendación:
1. Configurar firma release con secretos protegidos de GitHub Actions; nunca almacenar keystore o contraseñas en el repositorio.
2. Verificar la firma del AAB y el APK release antes de distribuir.
3. Corregir el nombre del paso para reflejar Gradle 8.11.1.
4. Definir versionado y notas de versión para cada entrega.

## Aspectos correctos observados

- El manifiesto declara solo el permiso `INTERNET`; el selector de imágenes usa Storage Access Framework y no solicita acceso amplio a archivos.
- El proyecto usa `minSdk 23`, `targetSdk 36` y `compileSdk 36`.
- El WebSocket limita el tamaño declarado de los frames a 65,536 bytes.
- El estado público elimina respuestas, puntuaciones y metadatos editoriales antes de compartirlos con clientes no docentes.
- La referencia científica tiene un endpoint separado y una bandera de desbloqueo docente.
- El ciclo `onDestroy()` detiene los dos servidores y libera TextToSpeech.
- Las imágenes importadas tienen un límite de 8 MB y se procesan a un máximo de 1200 px en el módulo académico.
- El flujo de CI terminó correctamente en el run `46031384007`.

## Plan de corrección recomendado

### Antes de usar el aula con estudiantes
1. H-01: restringir interfaces y cerrar servicios fuera del modo aula.
2. H-02: corregir autenticación y deduplicación de respuestas.
3. H-03: reemplazar PIN débil o añadir protección efectiva contra intentos.
4. H-04: definir una estrategia de transporte seguro para redes compartidas.
5. H-05: añadir límites y timeouts de conexión.
6. H-07: resolver política de privacidad, backup y borrado de datos.

### Antes de considerar el software estable
7. H-06: endurecer WebView y el puente JavaScript.
8. H-08: corregir el cero del temporizador en snapshots.
9. H-09: añadir pruebas funcionales y de integración automatizadas.
10. H-10: completar firma y verificación de release.

## Dictamen

**Estado de compilación: APROBADO.**
**Estado de seguridad del modo aula: NO APROBADO para redes compartidas o evaluaciones sensibles hasta corregir H-01 a H-05.**
**Estado de pruebas funcionales: INSUFICIENTE; requiere emulador/dispositivo real.**
**Estado de publicación Play Store: NO LISTO hasta configurar y verificar firma release y completar revisión de privacidad.**

La compilación exitosa confirma que el código supera los controles actuales y produce artefactos. No demuestra por sí sola seguridad, estabilidad funcional ni validez de los datos de investigación.
