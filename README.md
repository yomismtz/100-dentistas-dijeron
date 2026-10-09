# 100 Dentistas Dijeron 🦷🎤

Juego educativo Android de odontología para dos equipos, inspirado en la dinámica de concursos de respuestas populares.

## Sitio oficial

- Web: https://yomismtz.github.io/100-dentistas-dijeron/
- Política de privacidad: https://yomismtz.github.io/100-dentistas-dijeron/privacy.html
- Seguridad de datos: https://yomismtz.github.io/100-dentistas-dijeron/data-safety.html
- Términos de uso: https://yomismtz.github.io/100-dentistas-dijeron/terms.html

## Funciones actuales

- Base de 116 preguntas de distintas áreas de odontología.
- 8 preguntas aleatorias por partida, sin repetirse dentro de la misma partida.
- Multiplicador por ronda: ronda 1 ×1, ronda 2 ×2, y así sucesivamente hasta ronda 8 ×8.
- Respuestas ocultas, banco de puntos y marcador para dos equipos.
- Máximo de 3 strikes; al tercero cambia el control y puede activarse el robo.
- Cronómetro de 20 segundos por respuesta; durante los últimos 10 segundos suena una cuenta regresiva de tonos electrónicos tipo bits. Al agotarse el tiempo se registra un strike.
- Selección de nombres y personajes para los equipos.
- Celebración final con personaje ganador y trofeo.
- Sonidos de inicio, acierto y error.
- Funcionamiento local/offline en la versión actual.
- Banco principal de 116 preguntas: cada pregunta contiene de 4 a 7 respuestas válidas, con una única respuesta líder y puntos base que suman 100.

## Contenido académico

Los puntos del tablero son ponderaciones lúdicas: la respuesta con mayor puntuación se presenta como la más popular dentro de la dinámica del juego, pero el orden no procede de una encuesta real de dentistas. La validez clínica de las respuestas debe distinguirse de su posición en el tablero. Los criterios y las correcciones documentadas están en [`VALIDACION_PREGUNTAS.md`](VALIDACION_PREGUNTAS.md).

## Privacidad

La versión actual no requiere cuenta y no declara permisos sensibles como ubicación, cámara, contactos o micrófono. Las preferencias del juego se guardan localmente. La política deberá actualizarse antes de publicar cualquier versión que incorpore reconocimiento de voz, analítica, servicios en línea u otros tratamientos de datos.

## Compilar

Requiere JDK 17, Android SDK 35 y Gradle 8.9.

```bash
gradle assembleDebug
```

El APK queda en `app/build/outputs/apk/debug/app-debug.apk`.

También puede compilarse desde **GitHub Actions**. El workflow valida primero el banco de preguntas y después genera el artefacto `100-dentistas-dijeron-debug-apk`.
