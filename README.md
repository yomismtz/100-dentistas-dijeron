# 100 Dentistas Dijeron 🦷

Juego educativo Android basado en la presentación interactiva **100 Dentistas Dijeron**.

## Funciones

- 16 rondas de ortopedia/ortodoncia y funciones orales.
- Respuestas ocultas que se revelan al tocar.
- Banco de puntos por ronda.
- Marcador para dos equipos.
- Hasta tres errores por ronda.
- Sonidos de inicio, acierto y error tomados de la presentación original.
- Cambio de nombre de equipos.
- Deshacer la última asignación de puntos.
- Funciona sin conexión a Internet.

## Compilar

Requiere JDK 17, Android SDK 35 y Gradle 8.9.

```bash
gradle assembleDebug
```

El APK queda en `app/build/outputs/apk/debug/app-debug.apk`.

También puede compilarse desde **GitHub Actions**: cada push a `main` genera un artefacto `100-dentistas-dijeron-debug-apk`.
