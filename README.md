# 100 Dentistas Dijeron 🦷🎤

Juego educativo Android de odontología para dos equipos, inspirado en la dinámica de concursos de respuestas populares.

## Sitio oficial

- Web: https://yomismtz.github.io/100-dentistas-dijeron/
- Política de privacidad: https://yomismtz.github.io/100-dentistas-dijeron/privacy.html
- Seguridad de datos: https://yomismtz.github.io/100-dentistas-dijeron/data-safety.html
- Términos de uso: https://yomismtz.github.io/100-dentistas-dijeron/terms.html

## Funciones actuales

- Base de 116 preguntas de distintas áreas de odontología.
- 6 preguntas aleatorias por partida, sin repetirse dentro de la misma partida.
- Rondas 1–2 ×1, rondas 3–4 ×2 y rondas 5–6 ×3.
- Respuestas ocultas, banco de puntos y marcador para dos equipos.
- Máximo de 3 strikes; al tercero cambia el control y puede activarse el robo.
- Cronómetro de 10 segundos por respuesta; al agotarse registra un strike.
- Selección de nombres y personajes para los equipos.
- Celebración final con personaje ganador y trofeo.
- Sonidos de inicio, acierto y error.
- Funcionamiento local/offline en la versión actual.
- Validación automática del banco: cada pregunta debe tener 3–5 respuestas y sumar 100 puntos base.

## Contenido académico

Los puntos del tablero son ponderaciones lúdicas y no porcentajes obtenidos de una encuesta real de dentistas. La revisión científica y criterios del banco están documentados en [`VALIDACION_PREGUNTAS.md`](VALIDACION_PREGUNTAS.md).

## Privacidad

La versión actual no requiere cuenta y no declara permisos sensibles como ubicación, cámara, contactos o micrófono. Las preferencias del juego se guardan localmente. La política deberá actualizarse antes de publicar cualquier versión que incorpore reconocimiento de voz, analítica, servicios en línea u otros tratamientos de datos.

## Compilar

Requiere JDK 17, Android SDK 35 y Gradle 8.9.

```bash
gradle assembleDebug
```

El APK queda en `app/build/outputs/apk/debug/app-debug.apk`.

También puede compilarse desde **GitHub Actions**. El workflow valida primero el banco de preguntas y después genera el artefacto `100-dentistas-dijeron-debug-apk`.
