# Carpeta de sonidos

Aquí se concentrarán los recursos de audio del juego. Los efectos sintetizados por código en `tvshow.js` y `audio-dynamics.js` no necesitan archivos de sonido: se generan en tiempo real.

## Archivos de audio existentes detectados

Estos archivos están referenciados actualmente desde `index.html`. Al reorganizarlos, actualizar también sus rutas en el HTML y comprobar que Android los incluya en el APK:

- `intro_full_original.wav` — introducción / inicio.
- `sonido principal.mp3` — música principal heredada.
- `primer strike.mp3` — primer strike.
- `segundo y tercer strike.mp3` — segundo y tercer strike.
- `faceoff_button.mp3` — careo / pulsador.
- `good.mp3` — respuesta correcta.
- `error.mp3` — respuesta incorrecta.

## Efectos que ya se generan por código

No son archivos faltantes; `tvshow.js` los sintetiza mediante Web Audio API:

- Careo: `ready`, `buzzerHit`, `tick`.
- Respuestas: `correct`, `topAnswer`, `buzz`.
- Rondas: `round`, `double`, `triple`, `steal`.
- Puntuación y cierre: `bank`, `review`, `applause`, `bigApplause`, `drumroll`, `fanfare`.
- Controles: `nav`, `undo`, `reset`, `startGame`, `muteOff`, `click`, `select`, `listen`.

## Efectos CC0 integrados mediante URL

Se añadieron cinco recursos CC0 de SFXMint. Se reproducen en línea; si falla la descarga o no hay conexión, el juego conserva el efecto sintetizado original como respaldo. **No están empaquetados localmente en el APK**, por lo que esta integración no equivale a una descarga offline.

| Evento | Archivo / recurso | Fuente |
|---|---|---|
| Respuesta correcta y respuesta popular | `game-show-win-02.mp3` | https://sfxmint.com/sounds/game-show-win-02 |
| Respuesta incorrecta / strike | `feedback-buzzer-13.mp3` | https://sfxmint.com/sounds/feedback-buzzer-13 |
| Redoble / desempate / anuncio | `drum-roll-09.mp3` | https://sfxmint.com/sounds/drum-roll-09 |
| Inicio y fanfarria | `trumpet-fanfare-07.mp3` | https://sfxmint.com/sounds/trumpet-fanfare-07 |
| Aplausos y victoria | `crowd-applause-01.mp3` | https://sfxmint.com/sounds/crowd-applause-01 |

Las páginas de origen declaran licencia **CC0 1.0**, uso comercial permitido y sin atribución obligatoria. Se conserva esta tabla como registro de procedencia.

## Lista de sonidos opcionales para buscar

Estos recursos pueden sustituir o enriquecer los efectos sintetizados. Mantenerlos libres de derechos o con licencia compatible con el proyecto.

- [ ] Música instrumental de fondo en bucle, con licencia CC0 y sin voces.
- [x] Redoble de tambores (integrado en línea; falta empaquetarlo localmente para uso sin conexión).
- [x] Fanfarrias de victoria e inicio de ronda (integradas en línea; falta empaquetarlas localmente).
- [x] Sonido de buzzer de concurso (integrado en línea; falta empaquetarlo localmente).
- [x] Campanilla de respuesta correcta (integrada en línea; falta empaquetarla localmente).
- [x] Sonido breve de respuesta incorrecta (integrado en línea; falta empaquetarlo localmente).
- [ ] Transición musical para ronda doble y triple.
- [ ] Efecto de oportunidad de robo.
- [ ] Sonido de puntuación / banco.
- [ ] Cuenta regresiva de los últimos cinco segundos (actualmente sintetizada por el juego).

## Convención de nombres sugerida

Usar nombres cortos, descriptivos, sin espacios ni acentos: `intro.wav`, `music-main.mp3`, `strike-1.mp3`, `strike-2-3.mp3`, `faceoff.mp3`, `correct.mp3`, `incorrect.mp3`, `applause.mp3`, `drumroll.mp3`, `fanfare.mp3`.

**Nota de reorganización:** esta carpeta queda preparada como destino e inventario. Los siete archivos existentes siguen en su ubicación actual hasta completar el traslado de los binarios y actualizar todas sus referencias; no se deben borrar ni mover manualmente antes de ese paso.
