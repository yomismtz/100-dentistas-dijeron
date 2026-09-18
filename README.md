# 100 Dentistas Dijeron 🦷🎤

Juego educativo Android de odontología para dos equipos, inspirado en la dinámica de concursos de respuestas populares.

## Sitio oficial

- Web: https://yomismtz.github.io/100-dentistas-dijeron/
- Política de privacidad: https://yomismtz.github.io/100-dentistas-dijeron/privacy.html
- Seguridad de datos: https://yomismtz.github.io/100-dentistas-dijeron/data-safety.html
- Términos de uso: https://yomismtz.github.io/100-dentistas-dijeron/terms.html

## Funciones V2

- Base de 116 preguntas auditadas de distintas áreas de odontología.
- 6 preguntas por partida, con selección equilibrada por especialidades y menor repetición de preguntas recientes.
- Rondas 1–2 ×1, rondas 3–4 ×2 y rondas 5–6 ×3.
- Careo al inicio de cada ronda; el equipo ganador puede jugar o pasar.
- Respuesta por texto o por reconocimiento de voz del servicio instalado en Android.
- Coincidencia local de respuestas con normalización, variantes y similitud aproximada.
- Confirmación del docente cuando una respuesta es dudosa.
- Máximo de 3 strikes; al tercero cambia el control y puede activarse el robo.
- Cronómetro configurable de 10, 15 o 20 segundos; por defecto 10 s.
- Aviso sonoro en los últimos 3 segundos y strike automático al terminar el tiempo.
- Selección de nombres y personajes para los equipos.
- Reacciones visuales de personajes y mensajes del diente-locutor.
- Desempate mediante muerte súbita.
- Resultados por ronda y marcador final.
- Modo docente para pausar, revelar respuestas, corregir strikes, cambiar turno y consultar fuentes.
- Explicación y fuente de referencia desde cada pregunta.
- Modo estudio individual de 10 preguntas.
- Editor local e importación JSON de preguntas personalizadas del docente.
- Ajustes de accesibilidad: texto grande, reducción de animaciones, sonido y tiempo de respuesta.
- Validación automática del banco: cada pregunta debe tener 3–5 respuestas y sumar 100 puntos base.

## Contenido académico

Los puntos del tablero son ponderaciones lúdicas y no porcentajes obtenidos de una encuesta real de dentistas. La revisión científica y criterios del banco están documentados en [`VALIDACION_PREGUNTAS.md`](VALIDACION_PREGUNTAS.md).

## Privacidad

La aplicación no requiere cuenta, no integra publicidad ni analítica propia y no transmite partidas a servidores del proyecto. La función opcional de voz utiliza el servicio de reconocimiento instalado en Android; la app recibe el texto reconocido pero no almacena grabaciones de audio. Las preferencias, preguntas recientes y preguntas personalizadas se guardan localmente.

## Compilar

Requiere JDK 17, Android SDK 35 y Gradle 8.9.

```bash
gradle assembleDebug
```

El APK queda en `app/build/outputs/apk/debug/app-debug.apk`.

GitHub Actions valida el banco de preguntas y la sintaxis JavaScript antes de compilar el APK. Las ramas `chatgpt/**` también se compilan para pruebas sin sustituir automáticamente la versión estable de `main`.


## Aula offline

La edición 2.7 puede iniciar un servidor HTTP dentro de la red local para pulsadores de equipo, respuesta individual y control docente. Los teléfonos se conectan a la misma Wi‑Fi o hotspot del dispositivo anfitrión; no se requiere un servidor externo ni salida a Internet. El control docente está protegido por un PIN local y las respuestas correctas no se incluyen en el estado público de los equipos.

Android declara el permiso `INTERNET` porque este permiso también habilita sockets de red local. Esto no significa que las partidas se transmitan a Internet.
