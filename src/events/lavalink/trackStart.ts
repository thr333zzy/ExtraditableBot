import { TextChannel } from 'discord.js';
import type { Player, Track } from 'lavalink-client';
import type { BotClient } from '../../structures/BotClient';
import { nowPlayingEmbed } from '../../structures/musicEmbeds';
import { nowPlayingRow } from '../../structures/musicButtons';

export default {
  name: 'trackStart',
  once: false,
  emitter: 'lavalink' as const,
  async execute(player: Player, track: Track, client: BotClient) {
    const channel = client.channels.cache.get(player.textChannelId ?? '');
    if (!(channel instanceof TextChannel)) return;

    const previous = client.nowPlayingMessages.get(player.guildId);
    if (previous) {
      await channel.messages.delete(previous.messageId).catch(() => undefined);
    }

    const message = await channel
      .send({
        embeds: [nowPlayingEmbed(player, track)],
        components: [nowPlayingRow(player.guildId, player.paused)],
      })
      .catch(() => undefined);

    if (message) {
      client.nowPlayingMessages.set(player.guildId, {
        channelId: channel.id,
        messageId: message.id,
      });
    }
  },
};
