# Sonidos de las paletas de aves

Coloca aquí un archivo MP3 por cada ave. El nombre debe coincidir exactamente:

- tucan.mp3
- guacamaya.mp3
- colibri.mp3
- flamingo.mp3
- cardenal.mp3
- martin.mp3
- pavo.mp3
- canario.mp3
- lechuza.mp3
- pinguino.mp3

Ruta completa: app/src/main/assets/bird-sounds/

Cada archivo se reproduce al seleccionar su paleta. Usa MP3, preferentemente mono o estéreo, 44.1 kHz, y evita espacios, acentos y mayúsculas en los nombres. Si falta un audio, la paleta cambia normalmente y simplemente no reproduce sonido.

Cada paleta define exactamente diez colores: primary, secondary, accent, background, surface, text, muted, border, success y danger. Para añadir otras aves, se agrega su paleta en palette.js y su audio con el mismo identificador.
