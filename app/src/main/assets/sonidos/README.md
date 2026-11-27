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

## Lista de sonidos opcionales para buscar

Estos recursos pueden sustituir o enriquecer los efectos sintetizados. Mantenerlos libres de derechos o con licencia compatible con el proyecto.

- [ ] Aplausos reales de público (cortos y largos).
- [ ] Redoble de tambores.
- [ ] Fanfarrias de victoria e inicio de ronda.
- [ ] Sonido de buzzer de concurso.
- [ ] Campanilla de respuesta correcta.
- [ ] Sonido breve de respuesta incorrecta.
- [ ] Transición musical para ronda doble y triple.
- [ ] Efecto de oportunidad de robo.
- [ ] Sonido de puntuación / banco.
- [ ] Cuenta regresiva de los últimos cinco segundos.

## Convención de nombres sugerida

Usar nombres cortos, descriptivos, sin espacios ni acentos: `intro.wav`, `music-main.mp3`, `strike-1.mp3`, `strike-2-3.mp3`, `faceoff.mp3`, `correct.mp3`, `incorrect.mp3`, `applause.mp3`, `drumroll.mp3`, `fanfare.mp3`.

**Nota de reorganización:** esta carpeta queda preparada como destino e inventario. Los siete archivos existentes siguen en su ubicación actual hasta completar el traslado de los binarios y actualizar todas sus referencias; no se deben borrar ni mover manualmente antes de ese paso.
