import type { Player } from 'lavalink-client';
import type { BotClient } from '../../structures/BotClient';

export default {
  name: 'queueEnd',
  once: false,
  emitter: 'lavalink' as const,
  // lavalink-client emite (player, track, payload) — el eventHandler añade `client` al final.
  async execute(player: Player, _track: unknown, _payload: unknown, client: BotClient) {
    const info = client.nowPlayingMessages.get(player.guildId);
    if (!info) return;

    const channel = client.channels.cache.get(info.channelId);
    if (!channel?.isSendable()) return;

    const message = await channel.messages.fetch(info.messageId).catch(() => undefined);
    if (message) {
      await message.edit({ content: '✅ Cola terminada. Me voy en 60s si no se agregan más canciones.', embeds: [], components: [] }).catch(() => undefined);
    }

    client.nowPlayingMessages.delete(player.guildId);
  },
};
