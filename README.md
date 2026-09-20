# Así los Dentistas lo Dijeron 🦷🎤

Juego educativo Android de odontología para dos equipos, inspirado en la dinámica de concursos de respuestas populares.

## Sitio oficial

- Web: https://yomismtz.github.io/100-dentistas-dijeron/
- Política de privacidad: https://yomismtz.github.io/100-dentistas-dijeron/privacy.html
- Seguridad de datos: https://yomismtz.github.io/100-dentistas-dijeron/data-safety.html
- Términos de uso: https://yomismtz.github.io/100-dentistas-dijeron/terms.html

## Classroom Research v3.0.2

- 476 preguntas cargadas localmente, organizadas por 12 especialidades, dificultad y subtema.
- 8 rondas: 1–2 ×1, 3–4 ×2 y 5–8 ×3, con muerte súbita en caso de empate.
- Cronómetro de 30 segundos; lectura de la pregunta antes de iniciar el tiempo.
- Respuestas ocultas mientras la ronda está activa; las faltantes se revelan al cierre sin sumar puntos.
- Pulsadores de dos celulares y control docente por WebSocket local, con HTTP como respaldo y PIN docente.
- Autoguardado, recuperación de partidas e historial local; recupera también el estado de pausa y reinicia un careo interrumpido de forma neutral para ambos equipos.
- Exportación CSV, archivo compatible con Excel y tarjeta PNG del equipo campeón.
- Modo investigación con código anónimo y registro de versión/configuración.
- Pretest/postest con reactivos distintos emparejados por subtema y dificultad cuando es posible; cada postest queda enlazado al pretest que utilizó como plantilla.
- Reportes por grupo, especialidad y subtema; detección automática de reactivos que requieren revisión.
- Editor local de preguntas, respuestas, puntos, sinónimos, fuente, explicación, revisor, versión y estado editorial.
- Paquetes de clase por especialidad, dificultad y subtemas concretos.
- Dificultad programable por ronda y modo adaptativo compatible con paquetes.
- Ronda relámpago, reto final, Docente vs Salón, torneo con bracket completo y campeonato acumulado.
- Casos clínicos seriados e imágenes ampliables con presentación imagen/pregunta configurable.
- Banco multimedia offline con esquemas incluidos y opción de importar imágenes clínicas autorizadas desde el dispositivo.
- Mezclador independiente de música, narrador, efectos y aplausos; presentador Formal/Concurso/Divertido.
- Personajes vectoriales offline y tarjeta final exportable.
- Intro original completa de 28 segundos, de una sola reproducción, sin bucle.

## Contenido académico

Los puntos del tablero son ponderaciones lúdicas y no porcentajes obtenidos de una encuesta real de dentistas. El semáforo editorial distingue reactivos revisados de los que requieren revisión, pero el estado “verificado” depende de que el reactivo tenga fuente, fecha, revisor y versión registrados. La validación estructural automática no sustituye una revisión científica individual del contenido.

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

La edición 3.0.2 puede iniciar un servidor HTTP y WebSocket dentro de la red local para pulsadores de equipo, respuesta individual y control docente. Los teléfonos se conectan a la misma Wi‑Fi o hotspot del dispositivo anfitrión; no se requiere un servidor externo ni salida a Internet. El control docente está protegido por un PIN local y las respuestas correctas no se incluyen en el estado público de los equipos.

Android declara el permiso `INTERNET` porque este permiso también habilita sockets de red local. Esto no significa que las partidas se transmitan a Internet.
