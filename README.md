# ExtraditableBot 🎵

Bot de música profesional para Discord con soporte para **YouTube**, **Spotify** y **Apple Music**, slash commands completos y un embed "Now Playing" con botones interactivos.

## Arquitectura

- **Node.js + TypeScript + discord.js v14** para el bot.
- **[Lavalink](https://github.com/lavalink-devs/Lavalink)** (servidor de audio en Java, corre en Docker) hace el streaming real del audio.
- **[LavaSrc](https://github.com/topi314/LavaSrc)** (plugin de Lavalink) resuelve links/búsquedas de Spotify y Apple Music a metadata, que luego se reproduce vía YouTube (ni Spotify ni Apple Music permiten streaming directo del audio completo a bots de terceros — este es el enfoque estándar de la industria).
- **[youtube-source](https://github.com/lavalink-devs/youtube-source)** (plugin de Lavalink) reemplaza la fuente de YouTube nativa, que está deprecada.
- **[lavalink-client](https://github.com/Tomato6966/lavalink-client)** conecta el bot con el nodo de Lavalink y maneja la cola de reproducción.

## Prerequisitos

1. **Node.js 18+** (ya instalado si corriste `node -v`).
2. **Docker Desktop** — necesario para correr Lavalink sin instalar Java manualmente. Descárgalo de [docker.com](https://www.docker.com/products/docker-desktop/).
3. Una aplicación de bot de Discord (ver abajo).
4. (Opcional pero recomendado) Credenciales de Spotify para que `/play` funcione con links de Spotify.
5. (Opcional) Token del reproductor web de Apple Music para que `/play` funcione con links de Apple Music (gratis, ver sección Apple Music).

## 1. Crear la aplicación de Discord

1. Ve a [discord.com/developers/applications](https://discord.com/developers/applications) → **New Application**.
2. En **Bot**: copia el **Token** (botón "Reset Token" si es la primera vez) → va en `DISCORD_TOKEN`.
3. En **General Information**: copia el **Application ID** → va en `DISCORD_CLIENT_ID`.
4. En **Bot**, activa el intent **Server Members Intent** no es necesario, pero asegúrate de que **Message Content Intent** esté desactivado (no lo usamos).
5. En **OAuth2 → URL Generator**: marca `bot` y `applications.commands`, y en permisos marca `Connect`, `Speak`, `Send Messages`, `Embed Links`, `Use Slash Commands`. Copia la URL generada y ábrela para invitar el bot a tu servidor de pruebas.

> ⚠️ **Nunca compartas tu token en mensajes, capturas de pantalla, ni lo subas a git.** Si tu token se filtra alguna vez, resetéalo inmediatamente desde el Developer Portal.

## 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Rellena `.env` con:
- `DISCORD_TOKEN`, `DISCORD_CLIENT_ID` (paso 1).
- `DISCORD_GUILD_ID`: el ID de tu servidor de pruebas (clic derecho en el servidor con modo desarrollador activado → "Copiar ID"). Esto hace que los slash commands se registren al instante en ese servidor en vez de tardar ~1h globalmente.
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`: créalos gratis en [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) → **Create app** (no necesitas configurar Redirect URI para esto, solo copia el Client ID/Secret).
- Deja `LAVALINK_*` con los valores por defecto para desarrollo local.

### Limitación conocida: playlists de Spotify

Con `SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET`, las **canciones individuales y la búsqueda de Spotify funcionan perfecto**. Pero Spotify bloquea la lectura de **playlists** para credenciales de solo-app (error 401 "Valid user authentication required" al pegar un link de playlist — confirmado que es una restricción del lado de Spotify, no un bug de este bot). Arreglarlo de verdad requeriría correr un servicio proxy externo aparte (`customTokenEndpoint` de LavaSrc), que es frágil y se rompe cada vez que Spotify cambia su protección anti-scraping, así que no vale la pena la complejidad.

**Workaround:** para reproducir una playlist, busca esa misma playlist en YouTube o YouTube Music y pega ese link en `/play` — funciona sin restricciones.

La variable `SPOTIFY_SP_DC` en `.env` (cookie de sesión `sp_dc` de una cuenta de Spotify) queda configurada pero actualmente solo la usaría LavaSrc para la API de letras (lyrics), que este bot no expone todavía — no ayuda con las playlists.

### Apple Music

Apple Music está **activado** (`sources.applemusic: true` en `lavalink/application.yml`) y funciona con el token JWT público que usa el propio reproductor web de music.apple.com — **no necesitas cuenta de Apple ni de Apple Developer**.

Cómo obtener/renovar el token:

1. Abre [music.apple.com](https://music.apple.com) en el navegador.
2. Abre DevTools (F12) → pestaña **Network** → navega o reproduce algo.
3. Filtra por `amp-api` y copia el valor del header `authorization` de cualquier request (sin el prefijo `Bearer `). Es el JWT cuyo header decodificado dice `"kid":"WebPlayKid"`.
4. Pégalo en `.env` como `APPLE_MUSIC_MEDIA_API_TOKEN=` y reinicia Lavalink (`docker compose up -d --force-recreate lavalink`).

⚠️ Apple emite estos tokens con **~1 mes de validez**. Si los links de Apple Music empiezan a fallar con error, repite los pasos de arriba para renovarlo.

Nota: dentro del bundle JS de la página hay otro JWT (emisor con `"origin":"*.apple.com"`) que **no** funciona contra la API del catálogo (devuelve 401) — asegúrate de copiar el de `WebPlayKid` que aparece en los requests reales de Network.

La alternativa oficial (cuenta de Apple Developer de $99/año + private key de MusicKit con `keyID`/`teamID`/`musicKitKey`) también la soporta LavaSrc, pero no vale la pena para uso personal.

## 3. Levantar Lavalink

```bash
docker compose up -d lavalink
docker compose logs -f lavalink
```

Espera a ver `Lavalink is ready to accept connections.` en el log (Ctrl+C para dejar de seguir el log, el contenedor sigue corriendo).

## 4. Instalar dependencias y registrar los slash commands

```bash
npm install
npm run deploy-commands
```

## 5. Correr el bot

```bash
npm run dev
```

Deberías ver en la consola que el bot inició sesión y se conectó al nodo de Lavalink. Ya puedes usar `/play` en tu servidor de Discord.

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `/play <busqueda>` | Reproduce desde YouTube, Spotify o Apple Music (link o texto) |
| `/join` | Une el bot a tu canal de voz |
| `/leave` | Desconecta el bot |
| `/pause` / `/resume` | Pausa / reanuda |
| `/skip` | Salta a la siguiente canción |
| `/stop` | Detiene y vacía la cola |
| `/queue` | Muestra la cola (con botones de paginación) |
| `/nowplaying` | Muestra la canción actual |
| `/volume <0-100>` | Ajusta el volumen |
| `/loop <off\|track\|queue>` | Modo de repetición |
| `/remove <posicion>` | Elimina una canción de la cola |
| `/clear` | Vacía la cola |
| `/shuffle` | Mezcla la cola |
| `/seek <segundos>` | Salta a un punto de la canción |
| `/ping` | Latencia del bot |

Cada mensaje "Now Playing" incluye botones para pausar/reanudar, saltar, detener y ver la cola sin necesidad de escribir comandos.

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Corre el bot en modo desarrollo con recarga automática |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Corre la build compilada (`dist/index.js`) |
| `npm run deploy-commands` | Registra/actualiza los slash commands en Discord |
| `npm run lint` | Corre ESLint |
| `npm run format` | Formatea el código con Prettier |

## Estructura del proyecto

```
src/
  commands/music/    Slash commands de música
  commands/utility/  Comandos utilitarios (ping)
  events/client/     Eventos de discord.js (ready, interactionCreate, raw)
  events/lavalink/   Eventos del reproductor (trackStart, trackEnd, queueEnd, playerDisconnect)
  events/voice/      Auto-leave cuando el canal de voz queda vacío
  handlers/          Carga dinámica de comandos, eventos y botones
  structures/        BotClient, embeds y botones reutilizables
  utils/             Helpers (formato de duración, paginación, chequeos de voz)
  config/env.ts      Validación de variables de entorno
```
