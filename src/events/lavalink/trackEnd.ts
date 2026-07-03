import type { Player, Track } from 'lavalink-client';

export default {
  name: 'trackEnd',
  once: false,
  emitter: 'lavalink' as const,
  // lavalink-client emite (player, track, payload) — el eventHandler añade `client` al final.
  async execute(player: Player, track: Track) {
    console.log(
      `[lavalink] Track terminado en guild ${player.guildId}: ${track?.info?.title ?? 'desconocido'}`,
    );
  },
};
