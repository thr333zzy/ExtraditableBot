import type { Player, Track } from 'lavalink-client';

export default {
  name: 'trackEnd',
  once: false,
  emitter: 'lavalink' as const,
  async execute(player: Player, track: Track) {
    console.log(
      `[lavalink] Track terminado en guild ${player.guildId}: ${track?.info?.title ?? 'desconocido'}`,
    );
  },
};
