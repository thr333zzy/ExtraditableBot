import { TextChannel } from 'discord.js';
import type { Player } from 'lavalink-client';
import type { BotClient } from '../../structures/BotClient';

export default {
  name: 'queueEnd',
  once: false,
  emitter: 'lavalink' as const,
  async execute(player: Player, client: BotClient) {
    const info = client.nowPlayingMessages.get(player.guildId);
    if (!info) return;

    const channel = client.channels.cache.get(info.channelId);
    if (!(channel instanceof TextChannel)) return;

    const message = await channel.messages.fetch(info.messageId).catch(() => undefined);
    if (message) {
      await message.edit({ content: '✅ Cola terminada. Me voy en 60s si no se agregan más canciones.', embeds: [], components: [] }).catch(() => undefined);
    }

    client.nowPlayingMessages.delete(player.guildId);
  },
};
