import type { Player } from 'lavalink-client';
import type { BotClient } from '../../structures/BotClient';

export default {
  name: 'playerDisconnect',
  once: false,
  emitter: 'lavalink' as const,
  async execute(player: Player, voiceChannelId: string, client: BotClient) {
    console.log(`[lavalink] Player desconectado del canal ${voiceChannelId} en guild ${player.guildId}`);
    client.nowPlayingMessages.delete(player.guildId);
  },
};
